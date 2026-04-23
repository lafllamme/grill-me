import type { RoastErrorResponse, RoastMeta, RoastResponse, RoastRuntimeOptions, RoastStreamEvent } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import type { RoastDebugReport } from './debug'
import type { BuiltPrompt, RoastPromptMode } from './prompt-builder'
import { createError } from 'h3'
import { ROAST_AI_TOKEN_BOUNDS } from '~~/shared/roast/contracts'
import { resolveRoastIntensityProfile } from '~~/shared/roast/intensity'
import { runAiStream, runAiSync } from './ai-client'
import { logServerDebug, shapeDebugPayload } from './debug'
import { selectEvidence } from './evidence-selector'
import { createFallbackRoast } from './fallback'
import { collectGithubContext } from './github-collector'
import { extractModelText, normalizeRoastParts, parseRoastOutput } from './output-parser'
import { buildRoastPrompt, PROMPT_VERSION } from './prompt-builder'

const ENABLE_ROAST_DEBUG = import.meta.dev && true

export interface RoastServiceEnv {
  cfAccountId?: string
  cfApiToken?: string
  cfAiModel?: string
  githubToken?: string
}

export interface RoastOrchestratorInput {
  requestId: string
  username: string
  runtime: RoastRuntimeOptions
  env: RoastServiceEnv
  includeDebugInResponse?: boolean
  debug: RoastDebugReport
}

type RoastStatusPhase
  = | 'fetching_github'
    | 'selecting_evidence'
    | 'building_prompt'
    | 'calling_ai'
    | 'parsing_output'
    | 'finalizing'

interface RoastSyncHooks {
  onStatus?: (phase: RoastStatusPhase, message: string) => Promise<void>
}

interface PreparedRoastContext {
  meta: RoastMeta
  prompt: BuiltPrompt
  startedAt: number
  intensityProfile: RoastIntensityProfile
  effectiveAiMaxTokens: number
}

/**
 * Canonical API error body used by both sync and stream handlers.
 */
export function toErrorBody(code: string, message: string): RoastErrorResponse {
  return {
    error: {
      code,
      message,
    },
  }
}

function createResponse(
  username: string,
  title: string,
  roastLines: string[],
  feedback: string[],
  meta: RoastMeta,
  debug: RoastOrchestratorInput['debug'],
  runtime: RoastRuntimeOptions,
  includeDebugInResponse = true,
): RoastResponse {
  const resolvedTitle = title.trim() || roastLines[0] || 'Code Roast'
  const response: RoastResponse = {
    username,
    title: resolvedTitle,
    roastLines,
    roast: roastLines.join(' '),
    feedback,
    meta,
  }

  const shapedDebug = shapeDebugPayload(debug, runtime.debugLevel)
  if (includeDebugInResponse && shapedDebug)
    response.debug = shapedDebug

  return response
}

async function emitStatus(hooks: RoastSyncHooks | undefined, phase: RoastStatusPhase, message: string): Promise<void> {
  await hooks?.onStatus?.(phase, message)
}

function resolveEffectiveAiMaxTokens(intensityProfile: RoastIntensityProfile): number {
  return Math.max(
    ROAST_AI_TOKEN_BOUNDS.min,
    Math.min(ROAST_AI_TOKEN_BOUNDS.max, intensityProfile.aiMaxTokens),
  )
}

const FEEDBACK_BULLET_REGEX = /^[-*•\d.)]\s+/

function normalizeFeedbackLine(value: string): string {
  return value.replace(/^[-*•\d.)\s]+/, '').trim()
}

function normalizeFeedbackForStream(feedback: string[]): string[] {
  return feedback
    .map((item) => {
      const trimmed = item.trim()
      if (!trimmed || /^FEEDBACK:\s*$/i.test(trimmed))
        return ''
      return FEEDBACK_BULLET_REGEX.test(trimmed)
        ? normalizeFeedbackLine(trimmed)
        : trimmed
    })
    .filter(Boolean)
}

async function emitStructuredContent(
  response: RoastResponse,
  emit: (event: RoastStreamEvent) => Promise<void>,
): Promise<void> {
  await emit({
    type: 'roast_title',
    title: response.title,
  })

  const feedback = normalizeFeedbackForStream(response.feedback)
  const maxItems = Math.max(response.roastLines.length, feedback.length)
  for (let index = 0; index < maxItems; index += 1) {
    const roastLine = response.roastLines[index]
    if (roastLine) {
      await emit({
        type: 'roast_line',
        index,
        text: roastLine,
      })
    }

    const feedbackItem = feedback[index]
    if (feedbackItem) {
      await emit({
        type: 'feedback_item',
        index,
        text: feedbackItem,
      })
    }
  }
}

/**
 * Collects and prepares roast context before calling the model.
 */
async function prepareContext(input: RoastOrchestratorInput, mode: RoastPromptMode, hooks?: RoastSyncHooks): Promise<PreparedRoastContext | RoastResponse> {
  const startedAt = Date.now()
  const githubStartedAt = Date.now()
  const intensityProfile = resolveRoastIntensityProfile(input.runtime.roastIntensity)
  const effectiveAiMaxTokens = resolveEffectiveAiMaxTokens(intensityProfile)

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('intensity-resolved', {
      requestId: input.requestId,
      username: input.username,
      mode,
      level: intensityProfile.level,
      label: intensityProfile.label,
      maxCommitRefs: intensityProfile.maxCommitRefs,
      maxSelectedCommits: intensityProfile.maxSelectedCommits,
      maxPromptTotalFiles: intensityProfile.maxPromptTotalFiles,
      maxPromptTotalPatchChars: intensityProfile.maxPromptTotalPatchChars,
      aiMaxTokens: effectiveAiMaxTokens,
      temperatureDelta: intensityProfile.temperatureDelta,
    })
  }

  await emitStatus(hooks, 'fetching_github', 'Fetching GitHub activity and commit diffs...')
  const githubContext = await collectGithubContext(
    input.username,
    input.env.githubToken,
    {
      githubTimeoutMs: input.runtime.githubTimeoutMs,
      debug: input.debug,
      debugLevel: input.runtime.debugLevel,
      maxCommitRefs: intensityProfile.maxCommitRefs,
    },
  )

  input.debug.timingsMs.githubFetch = Date.now() - githubStartedAt

  await emitStatus(hooks, 'selecting_evidence', 'Scoring commits and selecting roast-worthy evidence...')
  const evidence = selectEvidence(githubContext, {
    maxCommitRefs: intensityProfile.maxCommitRefs,
    maxSelectedCommits: intensityProfile.maxSelectedCommits,
  })
  input.debug.selectionSummary = evidence.summary

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('evidence-selected', {
      requestId: input.requestId,
      username: input.username,
      mode,
      summary: evidence.summary,
    })
  }

  const meta: RoastMeta = {
    commitCount: githubContext.commits.length,
    prCount: githubContext.prs.length,
    selectedCommitCount: evidence.commits.length,
  }

  if (meta.commitCount === 0 && meta.prCount === 0) {
    const fallback = createFallbackRoast(input.username, meta, 'no_public_activity')
    input.debug.fallbackReason = 'no_public_activity'
    input.debug.timingsMs.total = Date.now() - startedAt

    return createResponse(
      fallback.username,
      fallback.roastLines[0] || 'No Public Activity',
      fallback.roastLines,
      fallback.feedback,
      fallback.meta,
      input.debug,
      input.runtime,
      input.includeDebugInResponse,
    )
  }

  await emitStatus(hooks, 'building_prompt', 'Preparing compact roast context for the model...')
  const prompt = buildRoastPrompt(
    evidence,
    input.runtime.variationMode,
    input.runtime.cfAiTemperature,
    intensityProfile,
    input.requestId,
    mode,
  )

  input.debug.promptVersion = prompt.promptVersion
  input.debug.intensityProfile = {
    level: intensityProfile.level,
    label: intensityProfile.label,
    maxCommitRefs: intensityProfile.maxCommitRefs,
    maxSelectedCommits: intensityProfile.maxSelectedCommits,
    maxPromptTotalFiles: intensityProfile.maxPromptTotalFiles,
    maxPromptTotalPatchChars: intensityProfile.maxPromptTotalPatchChars,
    aiMaxTokens: effectiveAiMaxTokens,
    temperatureDelta: intensityProfile.temperatureDelta,
    effectiveTemperature: prompt.effectiveTemperature,
  }

  if (ENABLE_ROAST_DEBUG) {
    const totalFiles = prompt.payload.commits.reduce((acc, commit) => acc + commit.files.length, 0)
    logServerDebug('prompt-payload-summary', {
      requestId: input.requestId,
      username: input.username,
      mode,
      promptVersion: prompt.promptVersion,
      commits: prompt.payload.commits.length,
      prs: prompt.payload.prs.length,
      files: totalFiles,
      variationMode: input.runtime.variationMode,
      roastIntensity: intensityProfile.level,
      roastIntensityLabel: intensityProfile.label,
      configuredPromptFileBudget: intensityProfile.maxPromptTotalFiles,
      configuredPromptPatchBudget: intensityProfile.maxPromptTotalPatchChars,
      aiMaxTokens: effectiveAiMaxTokens,
      effectiveTemperature: prompt.effectiveTemperature,
    })

    if (input.runtime.debugLevel === 'full') {
      logServerDebug('prompt-payload-content', {
        requestId: input.requestId,
        username: input.username,
        mode,
        payload: prompt.payload,
      })
    }
  }

  return {
    meta,
    prompt,
    startedAt,
    intensityProfile,
    effectiveAiMaxTokens,
  }
}

async function finalizeFromRawText(input: RoastOrchestratorInput, context: PreparedRoastContext, rawText: string, parserPath: string, hooks?: RoastSyncHooks): Promise<RoastResponse> {
  if (!rawText.trim()) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Cloudflare AI returned empty output',
      data: {
        code: 'cloudflare_ai_empty_output',
        parserPath,
      },
    })
  }

  await emitStatus(hooks, 'parsing_output', 'Parsing model output and extracting roast lines...')
  const parsed = parseRoastOutput(rawText)
  input.debug.parserPath = `${parserPath}->${parsed.parserPath}`

  const normalized = normalizeRoastParts(parsed)
  if (normalized.roastLines.length === 0 || normalized.feedback.length === 0) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Cloudflare AI returned incomplete structured output',
      data: {
        code: 'cloudflare_ai_incomplete_output',
        parserPath: input.debug.parserPath,
      },
    })
  }

  await emitStatus(hooks, 'finalizing', 'Finalizing roast output...')
  input.debug.timingsMs.total = Date.now() - context.startedAt

  return createResponse(
    input.username,
    normalized.title,
    normalized.roastLines,
    normalized.feedback,
    context.meta,
    input.debug,
    input.runtime,
    input.includeDebugInResponse,
  )
}

/**
 * Runs full roast pipeline and returns one final JSON payload.
 */
export async function runRoastSync(input: RoastOrchestratorInput): Promise<RoastResponse> {
  const prepared = await prepareContext(input, 'sync')
  if ('roast' in prepared)
    return prepared

  await emitStatus(undefined, 'calling_ai', 'Calling Cloudflare Workers AI...')
  const aiStartedAt = Date.now()
  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('ai-effective-config', {
      requestId: input.requestId,
      username: input.username,
      maxTokens: prepared.effectiveAiMaxTokens,
      temperature: prepared.prompt.effectiveTemperature,
      topP: input.runtime.cfAiTopP,
      roastIntensity: prepared.intensityProfile.level,
      roastIntensityLabel: prepared.intensityProfile.label,
    })
  }

  const aiPayload = await runAiSync({
    accountId: input.env.cfAccountId,
    apiToken: input.env.cfApiToken,
    model: input.env.cfAiModel,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    maxTokens: prepared.effectiveAiMaxTokens,
    temperature: prepared.prompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: prepared.prompt.systemPrompt,
    userPrompt: JSON.stringify(prepared.prompt.payload),
    debug: input.debug,
  })

  input.debug.timingsMs.aiGenerate = Date.now() - aiStartedAt
  const extracted = extractModelText(aiPayload)
  input.debug.parserPath = extracted.parserPath

  input.debug.ai = {
    model: input.env.cfAiModel,
    maxTokens: prepared.effectiveAiMaxTokens,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    temperature: prepared.prompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: prepared.prompt.systemPrompt,
    userPayload: {
      username: prepared.prompt.payload.username,
      commits: prepared.prompt.payload.commits.length,
      prs: prepared.prompt.payload.prs.length,
      payload: prepared.prompt.payload,
    },
    responsePreview: extracted.rawText.slice(0, 1000),
  }

  if (ENABLE_ROAST_DEBUG && input.runtime.debugLevel === 'full') {
    logServerDebug('ai-user-payload', {
      requestId: input.requestId,
      username: input.username,
      payload: input.debug.ai.userPayload,
    })
  }

  return finalizeFromRawText(input, prepared, extracted.rawText, extracted.parserPath)
}

/**
 * Runs roast pipeline and emits SSE events for progressive UX.
 */
export async function runRoastStream(input: RoastOrchestratorInput, emit: (event: RoastStreamEvent) => Promise<void>): Promise<RoastResponse> {
  const streamCounters = {
    status: 0,
    roastTitle: 0,
    roastLine: 0,
    feedbackItem: 0,
    debug: 0,
    done: 0,
    error: 0,
  }

  const emitWithCounter = async (event: RoastStreamEvent): Promise<void> => {
    if (event.type === 'status')
      streamCounters.status += 1
    else if (event.type === 'roast_title')
      streamCounters.roastTitle += 1
    else if (event.type === 'roast_line')
      streamCounters.roastLine += 1
    else if (event.type === 'feedback_item')
      streamCounters.feedbackItem += 1
    else if (event.type === 'debug')
      streamCounters.debug += 1
    else if (event.type === 'done')
      streamCounters.done += 1
    else if (event.type === 'error')
      streamCounters.error += 1

    await emit(event)
  }

  await emitWithCounter({
    type: 'meta',
    requestId: input.requestId,
    username: input.username,
  })

  const statusHooks: RoastSyncHooks = {
    onStatus: async (phase, message) => {
      await emitWithCounter({
        type: 'status',
        phase,
        message,
      })
    },
  }

  const prepared = await prepareContext(input, 'stream', statusHooks)
  if ('roast' in prepared) {
    await emitStructuredContent(prepared, emitWithCounter)

    if (prepared.debug)
      await emitWithCounter({ type: 'debug', debug: prepared.debug })

    await emitWithCounter({ type: 'done', data: prepared })
    return prepared
  }

  await emitStatus(statusHooks, 'calling_ai', 'Calling Cloudflare Workers AI...')
  const aiStartedAt = Date.now()
  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('ai-effective-config', {
      requestId: input.requestId,
      username: input.username,
      maxTokens: prepared.effectiveAiMaxTokens,
      temperature: prepared.prompt.effectiveTemperature,
      topP: input.runtime.cfAiTopP,
      roastIntensity: prepared.intensityProfile.level,
      roastIntensityLabel: prepared.intensityProfile.label,
    })
  }

  let rawText = ''
  let parserPath = 'stream/chunks'
  let streamFailed = false

  try {
    const streamResult = await runAiStream(
      {
        accountId: input.env.cfAccountId,
        apiToken: input.env.cfApiToken,
        model: input.env.cfAiModel,
        timeoutMs: input.runtime.cfAiTimeoutMs,
        maxTokens: prepared.effectiveAiMaxTokens,
        temperature: prepared.prompt.effectiveTemperature,
        topP: input.runtime.cfAiTopP,
        systemPrompt: prepared.prompt.systemPrompt,
        userPrompt: JSON.stringify(prepared.prompt.payload),
        debug: input.debug,
      },
      async (chunk) => {
        rawText += chunk
      },
    )

    rawText = streamResult.rawText || rawText
  }
  catch {
    streamFailed = true
  }

  input.debug.timingsMs.aiGenerate = Date.now() - aiStartedAt

  if (streamFailed && rawText.trim().length === 0) {
    // Stream fallback to sync generation when no usable content was emitted.
    const fallbackPayload = await runAiSync({
      accountId: input.env.cfAccountId,
      apiToken: input.env.cfApiToken,
      model: input.env.cfAiModel,
      timeoutMs: input.runtime.cfAiTimeoutMs,
      maxTokens: prepared.effectiveAiMaxTokens,
      temperature: prepared.prompt.effectiveTemperature,
      topP: input.runtime.cfAiTopP,
      systemPrompt: prepared.prompt.systemPrompt,
      userPrompt: JSON.stringify(prepared.prompt.payload),
      debug: input.debug,
    })

    const extracted = extractModelText(fallbackPayload)
    parserPath = extracted.parserPath
    rawText = extracted.rawText
  }

  input.debug.ai = {
    model: input.env.cfAiModel,
    maxTokens: prepared.effectiveAiMaxTokens,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    temperature: prepared.prompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: prepared.prompt.systemPrompt,
    userPayload: {
      username: prepared.prompt.payload.username,
      commits: prepared.prompt.payload.commits.length,
      prs: prepared.prompt.payload.prs.length,
      payload: prepared.prompt.payload,
    },
    responsePreview: rawText.slice(0, 1000),
    ...(input.runtime.debugLevel === 'full' ? { responseFullText: rawText } : {}),
    streamCounters,
  }

  if (ENABLE_ROAST_DEBUG && input.runtime.debugLevel === 'full') {
    logServerDebug('ai-user-payload', {
      requestId: input.requestId,
      username: input.username,
      payload: input.debug.ai.userPayload,
    })
  }

  if (ENABLE_ROAST_DEBUG && input.runtime.debugLevel === 'full') {
    logServerDebug('stream-raw-output', {
      requestId: input.requestId,
      username: input.username,
      rawTextLength: rawText.length,
      rawText,
    })
  }

  const finalPayload = await finalizeFromRawText(input, prepared, rawText, parserPath, statusHooks)
  await emitStructuredContent(finalPayload, emitWithCounter)

  if (finalPayload.debug)
    await emitWithCounter({ type: 'debug', debug: finalPayload.debug })

  await emitWithCounter({ type: 'done', data: finalPayload })

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('stream-counters', {
      requestId: input.requestId,
      username: input.username,
      ...streamCounters,
    })
  }

  return finalPayload
}

/**
 * Normalizes unknown thrown errors to h3 createError-compatible structure.
 */
export function toHandledError(error: unknown): { statusCode: number, statusMessage: string, code: string, details?: unknown } {
  const cause = error as any
  const statusCode = Number(cause?.statusCode || 500)
  const statusMessage = String(cause?.statusMessage || 'Unexpected server error')
  const code = String(cause?.data?.code || 'internal_error')

  return {
    statusCode,
    statusMessage,
    code,
    details: cause?.data,
  }
}

/**
 * Throws a normalized h3 error from a handled error tuple.
 */
export function throwHandledError(error: ReturnType<typeof toHandledError>): never {
  throw createError({
    statusCode: error.statusCode,
    statusMessage: error.statusMessage,
    data: {
      code: error.code,
      details: error.details,
    },
  })
}

export { PROMPT_VERSION }
