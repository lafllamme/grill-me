import { createError } from "h3"
import {
  type RoastErrorResponse,
  type RoastMeta,
  type RoastResponse,
  type RoastRuntimeOptions,
  type RoastStreamEvent,
} from "~~/shared/roast/contracts"
import { runAiStream, runAiSync } from "./ai-client"
import { shapeDebugPayload } from "./debug"
import type { RoastDebugReport } from "./debug"
import { selectEvidence } from "./evidence-selector"
import { createFallbackRoast } from "./fallback"
import { collectGithubContext } from "./github-collector"
import { extractModelText, normalizeRoastParts, parseRoastOutput } from "./output-parser"
import { PROMPT_VERSION, buildRoastPrompt, type BuiltPrompt, type RoastPromptMode } from "./prompt-builder"

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

type RoastStatusPhase =
  | "fetching_github"
  | "selecting_evidence"
  | "building_prompt"
  | "calling_ai"
  | "parsing_output"
  | "finalizing"

interface RoastSyncHooks {
  onStatus?: (phase: RoastStatusPhase, message: string) => Promise<void>
}

interface PreparedRoastContext {
  meta: RoastMeta
  prompt: BuiltPrompt
  startedAt: number
}

/**
 * Canonical API error body used by both sync and stream handlers.
 */
export const toErrorBody = (code: string, message: string): RoastErrorResponse => ({
  error: {
    code,
    message,
  },
})

const createResponse = (
  username: string,
  roastLines: string[],
  feedback: string[],
  meta: RoastMeta,
  debug: RoastOrchestratorInput["debug"],
  runtime: RoastRuntimeOptions,
  includeDebugInResponse = true,
): RoastResponse => {
  const response: RoastResponse = {
    username,
    roastLines,
    roast: roastLines.join(" "),
    feedback,
    meta,
  }

  const shapedDebug = shapeDebugPayload(debug, runtime.debugLevel)
  if (includeDebugInResponse && shapedDebug)
    response.debug = shapedDebug

  return response
}

const emitStatus = async (hooks: RoastSyncHooks | undefined, phase: RoastStatusPhase, message: string): Promise<void> => {
  await hooks?.onStatus?.(phase, message)
}

const FEEDBACK_DELIMITER_REGEX = /(?:^|\n)\s*FEEDBACK:\s*(?:\n|$)/i
const FEEDBACK_BULLET_REGEX = /^[-*•\d.)]\s+/

const normalizeFeedbackLine = (value: string): string => {
  return value.replace(/^[-*•\d.)\s]+/, "").trim()
}

interface StreamSegmenter {
  pushChunk: (chunk: string) => Promise<void>
  flush: () => Promise<void>
  feedbackItems: string[]
}

const createStreamSegmenter = (
  emit: (event: RoastStreamEvent) => Promise<void>,
): StreamSegmenter => {
  let mode: "roast" | "feedback" = "roast"
  let pending = ""
  const feedbackItems: string[] = []
  const delimiterTailReserve = 24

  const emitFeedbackFromLine = async (line: string): Promise<void> => {
    const trimmed = line.trim()
    if (!trimmed || /^FEEDBACK:\s*$/i.test(trimmed))
      return

    const normalized = FEEDBACK_BULLET_REGEX.test(trimmed)
      ? normalizeFeedbackLine(trimmed)
      : trimmed

    if (!normalized)
      return

    feedbackItems.push(normalized)
    await emit({
      type: "feedback_item",
      item: normalized,
      feedback: [...feedbackItems],
    })
  }

  const processFeedback = async (chunk: string, flush = false): Promise<void> => {
    const combined = pending + chunk
    const lines = combined.split("\n")
    pending = flush ? "" : (lines.pop() || "")

    for (const line of lines)
      await emitFeedbackFromLine(line)

    if (flush && pending.trim()) {
      await emitFeedbackFromLine(pending)
      pending = ""
    }
  }

  const processRoast = async (chunk: string, flush = false): Promise<void> => {
    const combined = pending + chunk
    const delimiterMatch = FEEDBACK_DELIMITER_REGEX.exec(combined)

    if (delimiterMatch) {
      const delimiterIndex = delimiterMatch.index
      const roastChunk = combined.slice(0, delimiterIndex)
      if (roastChunk)
        await emit({ type: "typing_roast", chunk: roastChunk })

      const feedbackStartIndex = delimiterIndex + delimiterMatch[0].length
      const feedbackChunk = combined.slice(feedbackStartIndex)
      mode = "feedback"
      pending = ""
      await processFeedback(feedbackChunk, flush)
      return
    }

    if (flush) {
      if (combined)
        await emit({ type: "typing_roast", chunk: combined })
      pending = ""
      return
    }

    if (combined.length <= delimiterTailReserve) {
      pending = combined
      return
    }

    const boundary = combined.length - delimiterTailReserve
    const roastChunk = combined.slice(0, boundary)
    pending = combined.slice(boundary)
    if (roastChunk)
      await emit({ type: "typing_roast", chunk: roastChunk })
  }

  return {
    feedbackItems,
    pushChunk: async (chunk: string) => {
      if (mode === "roast")
        await processRoast(chunk)
      else
        await processFeedback(chunk)
    },
    flush: async () => {
      if (mode === "roast")
        await processRoast("", true)
      else
        await processFeedback("", true)
    },
  }
}

/**
 * Collects and prepares roast context before calling the model.
 */
const prepareContext = async (
  input: RoastOrchestratorInput,
  mode: RoastPromptMode,
  hooks?: RoastSyncHooks,
): Promise<PreparedRoastContext | RoastResponse> => {
  const startedAt = Date.now()
  const githubStartedAt = Date.now()

  await emitStatus(hooks, "fetching_github", "Fetching GitHub activity and commit diffs...")
  const githubContext = await collectGithubContext(
    input.username,
    input.env.githubToken,
    {
      githubTimeoutMs: input.runtime.githubTimeoutMs,
      debug: input.debug,
    },
  )

  input.debug.timingsMs.githubFetch = Date.now() - githubStartedAt

  await emitStatus(hooks, "selecting_evidence", "Scoring commits and selecting roast-worthy evidence...")
  const evidence = selectEvidence(githubContext)
  input.debug.selectionSummary = evidence.summary

  const meta: RoastMeta = {
    commitCount: githubContext.commits.length,
    prCount: githubContext.prs.length,
    selectedCommitCount: evidence.commits.length,
  }

  if (meta.commitCount === 0 && meta.prCount === 0) {
    const fallback = createFallbackRoast(input.username, meta, "no_public_activity")
    input.debug.fallbackReason = "no_public_activity"
    input.debug.timingsMs.total = Date.now() - startedAt

    return createResponse(
      fallback.username,
      fallback.roastLines,
      fallback.feedback,
      fallback.meta,
      input.debug,
      input.runtime,
      input.includeDebugInResponse,
    )
  }

  await emitStatus(hooks, "building_prompt", "Preparing compact roast context for the model...")
  const prompt = buildRoastPrompt(
    evidence,
    input.runtime.variationMode,
    input.runtime.cfAiTemperature,
    input.requestId,
    mode,
  )

  input.debug.promptVersion = prompt.promptVersion

  return {
    meta,
    prompt,
    startedAt,
  }
}

const finalizeFromRawText = async (
  input: RoastOrchestratorInput,
  context: PreparedRoastContext,
  rawText: string,
  parserPath: string,
  hooks?: RoastSyncHooks,
): Promise<RoastResponse> => {
  if (!rawText.trim()) {
    throw createError({
      statusCode: 502,
      statusMessage: "Cloudflare AI returned empty output",
      data: {
        code: "cloudflare_ai_empty_output",
        parserPath,
      },
    })
  }

  await emitStatus(hooks, "parsing_output", "Parsing model output and extracting roast lines...")
  const parsed = parseRoastOutput(rawText)
  input.debug.parserPath = `${parserPath}->${parsed.parserPath}`

  const normalized = normalizeRoastParts(parsed)
  if (normalized.roastLines.length === 0) {
    throw createError({
      statusCode: 502,
      statusMessage: "Cloudflare AI returned unparseable output",
      data: {
        code: "cloudflare_ai_unparseable_output",
        parserPath: input.debug.parserPath,
      },
    })
  }

  await emitStatus(hooks, "finalizing", "Finalizing roast output...")
  input.debug.timingsMs.total = Date.now() - context.startedAt

  return createResponse(
    input.username,
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
export const runRoastSync = async (input: RoastOrchestratorInput): Promise<RoastResponse> => {
  const prepared = await prepareContext(input, "sync")
  if ("roast" in prepared)
    return prepared

  await emitStatus(undefined, "calling_ai", "Calling Cloudflare Workers AI...")
  const aiStartedAt = Date.now()
  const aiPayload = await runAiSync({
    accountId: input.env.cfAccountId,
    apiToken: input.env.cfApiToken,
    model: input.env.cfAiModel,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    maxTokens: input.runtime.cfAiMaxTokens,
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
    maxTokens: input.runtime.cfAiMaxTokens,
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

  return finalizeFromRawText(input, prepared, extracted.rawText, extracted.parserPath)
}

/**
 * Runs roast pipeline and emits SSE events for progressive UX.
 */
export const runRoastStream = async (
  input: RoastOrchestratorInput,
  emit: (event: RoastStreamEvent) => Promise<void>,
): Promise<RoastResponse> => {
  await emit({
    type: "meta",
    requestId: input.requestId,
    username: input.username,
  })

  const statusHooks: RoastSyncHooks = {
    onStatus: async (phase, message) => {
      await emit({
        type: "status",
        phase,
        message,
      })
    },
  }

  const prepared = await prepareContext(input, "stream", statusHooks)
  const streamSegmenter = createStreamSegmenter(emit)
  if ("roast" in prepared) {
    for (const line of prepared.roastLines) {
      await emit({ type: "typing_roast", chunk: `${line}\n` })
    }

    const feedbackItems: string[] = []
    for (const item of prepared.feedback) {
      feedbackItems.push(item)
      await emit({ type: "feedback_item", item, feedback: [...feedbackItems] })
    }

    if (prepared.debug)
      await emit({ type: "debug", debug: prepared.debug })

    await emit({ type: "done", data: prepared })
    return prepared
  }

  await emitStatus(statusHooks, "calling_ai", "Calling Cloudflare Workers AI...")
  const aiStartedAt = Date.now()

  let rawText = ""
  let parserPath = "stream/chunks"
  let streamFailed = false

  try {
    const streamResult = await runAiStream(
      {
        accountId: input.env.cfAccountId,
        apiToken: input.env.cfApiToken,
        model: input.env.cfAiModel,
        timeoutMs: input.runtime.cfAiTimeoutMs,
        maxTokens: input.runtime.cfAiMaxTokens,
        temperature: prepared.prompt.effectiveTemperature,
        topP: input.runtime.cfAiTopP,
        systemPrompt: prepared.prompt.systemPrompt,
        userPrompt: JSON.stringify(prepared.prompt.payload),
        debug: input.debug,
      },
      async (chunk) => {
        rawText += chunk
        await streamSegmenter.pushChunk(chunk)
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
      maxTokens: input.runtime.cfAiMaxTokens,
      temperature: prepared.prompt.effectiveTemperature,
      topP: input.runtime.cfAiTopP,
      systemPrompt: prepared.prompt.systemPrompt,
      userPrompt: JSON.stringify(prepared.prompt.payload),
      debug: input.debug,
    })

    const extracted = extractModelText(fallbackPayload)
    parserPath = extracted.parserPath
    rawText = extracted.rawText
    if (rawText.trim()) {
      await streamSegmenter.pushChunk(rawText)
    }
  }

  await streamSegmenter.flush()

  input.debug.ai = {
    model: input.env.cfAiModel,
    maxTokens: input.runtime.cfAiMaxTokens,
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
  }

  const finalPayload = await finalizeFromRawText(input, prepared, rawText, parserPath, statusHooks)

  if (streamSegmenter.feedbackItems.length === 0) {
    const feedbackItems: string[] = []
    for (const item of finalPayload.feedback) {
      feedbackItems.push(item)
      await emit({ type: "feedback_item", item, feedback: [...feedbackItems] })
    }
  }

  if (finalPayload.debug)
    await emit({ type: "debug", debug: finalPayload.debug })

  await emit({ type: "done", data: finalPayload })
  return finalPayload
}

/**
 * Normalizes unknown thrown errors to h3 createError-compatible structure.
 */
export const toHandledError = (error: unknown): { statusCode: number, statusMessage: string, code: string, details?: unknown } => {
  const cause = error as any
  const statusCode = Number(cause?.statusCode || 500)
  const statusMessage = String(cause?.statusMessage || "Unexpected server error")
  const code = String(cause?.data?.code || "internal_error")

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
export const throwHandledError = (error: ReturnType<typeof toHandledError>): never => {
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
