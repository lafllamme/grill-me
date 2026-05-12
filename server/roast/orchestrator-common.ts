import type { RoastMeta, RoastResponse, RoastRuntimeOptions } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import type { RoastDebugReport } from './debug'
import type { BuiltPrompt, RoastPromptMode } from './prompt-builder'
import type { RoastScoringProfile } from './scoring'
import { createError } from 'h3'
import { ROAST_AI_TOKEN_BOUNDS } from '~~/shared/roast/contracts'
import { resolveRoastIntensityProfile } from '~~/shared/roast/intensity'
import { ENABLE_ROAST_DEBUG, logServerDebug, shapeDebugPayload } from './debug'
import { selectEvidence } from './evidence-selector'
import { createFallbackRoast } from './fallback'
import { collectGithubContext } from './github-collector'
import { parseRoastOutput } from './output-parser'
import { buildRoastPrompt } from './prompt-builder'
import { createRoastReceipt } from './receipt'
import { computeRoastMetrics, getDefaultRoastScoringInputs } from './scoring'
import { normalizeRoastTitle } from './title-normalizer'

export { ENABLE_ROAST_DEBUG } from './debug'

export interface RoastServiceEnv {
  cfAccountId?: string
  cfApiToken?: string
  cfAiModel?: string
  githubToken?: string
  roastReceiptSecret?: string
}

export interface RoastOrchestratorInput {
  requestId: string
  username: string
  runtime: RoastRuntimeOptions
  env: RoastServiceEnv
  includeDebugInResponse?: boolean
  debug: RoastDebugReport
  scoringProfile: RoastScoringProfile
}

export type RoastStatusPhase
  = | 'fetching_github'
    | 'selecting_evidence'
    | 'building_prompt'
    | 'calling_ai'
    | 'parsing_output'
    | 'finalizing'

export interface RoastSyncHooks {
  onStatus?: (phase: RoastStatusPhase, message: string) => Promise<void>
}

export interface PreparedRoastContext {
  meta: RoastMeta
  prompt: BuiltPrompt
  startedAt: number
  intensityProfile: RoastIntensityProfile
  effectiveAiMaxTokens: number
}

/**
 * Shapes the final roast response and applies debug-level filtering.
 *
 * @param requestId Request-scoped id used for receipt ownership.
 * @param source Response origin (`sync` or `stream`) embedded in receipt.
 * @param roastIntensity Effective roast intensity persisted in receipt.
 * @param receiptSecret Server secret used for HMAC signing.
 * @param username Target GitHub username.
 * @param title Canonical roast title.
 * @param roastLines Final roast lines.
 * @param feedback Final feedback bullets.
 * @param meta Aggregated roast meta counters.
 * @param debug Request scoped debug report.
 * @param runtime Runtime options controlling debug visibility.
 * @param scoringProfile Active deterministic scoring profile.
 * @param includeDebugInResponse Whether debug is exposed in response payload.
 * @returns RoastResponse
 */
export function createRoastResponse(
  requestId: string,
  source: 'sync' | 'stream',
  roastIntensity: number,
  receiptSecret: string,
  username: string,
  title: string,
  roastLines: string[],
  feedback: string[],
  meta: RoastMeta,
  debug: RoastOrchestratorInput['debug'],
  runtime: RoastRuntimeOptions,
  scoringProfile: RoastScoringProfile,
  includeDebugInResponse = true,
): RoastResponse {
  const resolvedReceiptSecret = receiptSecret.trim()
  if (!resolvedReceiptSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing roast receipt secret',
      data: { code: 'receipt_secret_missing' },
    })
  }

  const resolvedIntensityProfile = resolveRoastIntensityProfile(runtime.roastIntensity)
  const normalizedTitle = normalizeRoastTitle(title, {
    username,
    roastLines,
    meta,
    intensityProfile: resolvedIntensityProfile,
  })
  const resolvedTitle = normalizedTitle.title.trim() || roastLines[0] || 'Code Roast'
  const scoringInputs = getDefaultRoastScoringInputs({
    title: resolvedTitle,
    roastLines,
    feedback,
    meta,
    evidenceSummary: debug.selectionSummary,
    intensityProfile: resolvedIntensityProfile,
  })
  const metrics = computeRoastMetrics(scoringInputs, scoringProfile)

  if (debug.ai) {
    debug.ai.titleNormalized = normalizedTitle.normalized
    debug.ai.titleNormalizationReasons = normalizedTitle.reasons
  }
  debug.scoring = {
    metricVersion: scoringProfile.version,
    resolvedProfileVersion: scoringProfile.version,
    inputs: scoringInputs,
  }

  const receipt = createRoastReceipt(resolvedReceiptSecret, {
    requestId,
    username,
    title: resolvedTitle,
    roastLines,
    feedback,
    roast: roastLines.join(' '),
    meta,
    metrics,
    source,
    roastIntensity,
  })

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('receipt-issued', {
      requestId,
      username,
      source,
      roastIntensity,
      receiptLength: receipt.length,
    })
  }

  const response: RoastResponse = {
    username,
    title: resolvedTitle,
    roastLines,
    roast: roastLines.join(' '),
    feedback,
    meta,
    metrics,
    receipt,
  }

  const shapedDebug = shapeDebugPayload(debug, runtime.debugLevel)
  if (includeDebugInResponse && shapedDebug)
    response.debug = shapedDebug

  return response
}

/**
 * Emits a stream/sync status update when hooks are registered.
 */
export async function emitStatus(
  hooks: RoastSyncHooks | undefined,
  phase: RoastStatusPhase,
  message: string,
): Promise<void> {
  await hooks?.onStatus?.(phase, message)
}

export function logAiEffectiveConfig(input: RoastOrchestratorInput, context: PreparedRoastContext): void {
  if (!ENABLE_ROAST_DEBUG)
    return

  logServerDebug('ai-effective-config', {
    requestId: input.requestId,
    username: input.username,
    maxTokens: context.effectiveAiMaxTokens,
    temperature: context.prompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    roastIntensity: context.intensityProfile.level,
    roastIntensityLabel: context.intensityProfile.label,
  })
}

function resolveEffectiveAiMaxTokens(intensityProfile: RoastIntensityProfile): number {
  return Math.max(
    ROAST_AI_TOKEN_BOUNDS.min,
    Math.min(ROAST_AI_TOKEN_BOUNDS.max, intensityProfile.aiMaxTokens),
  )
}

/**
 * Collects GitHub context, selects evidence, builds prompt payload and prepares
 * runtime metadata for AI generation.
 *
 * @remarks
 * If the target account has no public activity, this function returns a fallback
 * roast response to short-circuit AI execution.
 */
export async function prepareRoastContext(
  input: RoastOrchestratorInput,
  mode: RoastPromptMode,
  hooks?: RoastSyncHooks,
): Promise<PreparedRoastContext | RoastResponse> {
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

    return createRoastResponse(
      input.requestId,
      mode,
      intensityProfile.level,
      input.env.roastReceiptSecret || '',
      fallback.username,
      fallback.roastLines[0] || 'No Public Activity',
      fallback.roastLines,
      fallback.feedback,
      fallback.meta,
      input.debug,
      input.runtime,
      input.scoringProfile,
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

/**
 * Validates and normalizes model raw text into canonical roast response fields.
 *
 * @throws h3Error `cloudflare_ai_empty_output`
 * @throws h3Error `cloudflare_ai_unparseable_output`
 * @throws h3Error `cloudflare_ai_incomplete_output`
 */
export async function finalizeFromRawText(
  input: RoastOrchestratorInput,
  context: PreparedRoastContext,
  rawText: string,
  parserPath: string,
  hooks?: RoastSyncHooks,
): Promise<RoastResponse> {
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

  if (parsed.parserPath === 'unparseable') {
    throw createError({
      statusCode: 502,
      statusMessage: 'Cloudflare AI returned unparseable structured output',
      data: {
        code: 'cloudflare_ai_unparseable_output',
        parserPath: input.debug.parserPath,
      },
    })
  }

  if (!parsed.title || parsed.roastLines.length === 0 || parsed.feedback.length === 0) {
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

  return createRoastResponse(
    input.requestId,
    context.prompt.mode,
    context.intensityProfile.level,
    input.env.roastReceiptSecret || '',
    input.username,
    parsed.title,
    parsed.roastLines,
    parsed.feedback,
    context.meta,
    input.debug,
    input.runtime,
    input.scoringProfile,
    input.includeDebugInResponse,
  )
}
