import { createError } from "h3"
import {
  type RoastErrorResponse,
  type RoastMeta,
  type RoastResponse,
  type RoastRuntimeOptions,
  type RoastStreamEvent,
} from "~~/shared/roast/contracts"
import { runAiSync } from "./ai-client"
import { shapeDebugPayload } from "./debug"
import type { RoastDebugReport } from "./debug"
import { selectEvidence } from "./evidence-selector"
import { createFallbackRoast } from "./fallback"
import { collectGithubContext } from "./github-collector"
import { extractModelText, normalizeRoastParts, parseRoastOutput } from "./output-parser"
import { PROMPT_VERSION, buildRoastPrompt } from "./prompt-builder"

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

/**
 * Runs full roast pipeline and returns one final JSON payload.
 */
export const runRoastSync = async (input: RoastOrchestratorInput): Promise<RoastResponse> => {
  const startedAt = Date.now()
  const githubStartedAt = Date.now()

  const githubContext = await collectGithubContext(
    input.username,
    input.env.githubToken,
    {
      githubTimeoutMs: input.runtime.githubTimeoutMs,
      debug: input.debug,
    },
  )

  input.debug.timingsMs.githubFetch = Date.now() - githubStartedAt

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

  const builtPrompt = buildRoastPrompt(
    evidence,
    input.runtime.variationMode,
    input.runtime.cfAiTemperature,
    input.requestId,
  )
  input.debug.promptVersion = builtPrompt.promptVersion

  const aiStartedAt = Date.now()
  const aiPayload = await runAiSync({
    accountId: input.env.cfAccountId,
    apiToken: input.env.cfApiToken,
    model: input.env.cfAiModel,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    maxTokens: input.runtime.cfAiMaxTokens,
    temperature: builtPrompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: builtPrompt.systemPrompt,
    userPrompt: JSON.stringify(builtPrompt.payload),
    debug: input.debug,
  })

  input.debug.timingsMs.aiGenerate = Date.now() - aiStartedAt

  const extracted = extractModelText(aiPayload)
  input.debug.parserPath = extracted.parserPath

  input.debug.ai = {
    model: input.env.cfAiModel,
    maxTokens: input.runtime.cfAiMaxTokens,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    temperature: builtPrompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: builtPrompt.systemPrompt,
    userPayload: {
      username: builtPrompt.payload.username,
      commits: builtPrompt.payload.commits.length,
      prs: builtPrompt.payload.prs.length,
      payload: builtPrompt.payload,
    },
    responsePreview: extracted.rawText.slice(0, 1000),
  }

  const fallbackReason = extracted.rawText.trim() ? "" : "empty_ai_response"
  if (fallbackReason) {
    throw createError({
      statusCode: 502,
      statusMessage: "Cloudflare AI returned empty output",
      data: {
        code: "cloudflare_ai_empty_output",
        parserPath: extracted.parserPath,
      },
    })
  }

  const parsed = parseRoastOutput(extracted.rawText)
  input.debug.parserPath = `${extracted.parserPath}->${parsed.parserPath}`
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

  input.debug.timingsMs.total = Date.now() - startedAt

  return createResponse(
    input.username,
    normalized.roastLines,
    normalized.feedback,
    meta,
    input.debug,
    input.runtime,
    input.includeDebugInResponse,
  )
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
  const finalPayload = await runRoastSync(input)
  const roastText = finalPayload.roastLines.join("\n")
  let roastSoFar = ""

  for (let index = 0; index < roastText.length; index += 96) {
    const chunk = roastText.slice(index, index + 96)
    roastSoFar += chunk
    await emit({
      type: "typing",
      chunk,
      roastSoFar,
    })
  }

  const feedbackItems: string[] = []
  for (const item of finalPayload.feedback) {
    feedbackItems.push(item)
    await emit({
      type: "feedback",
      item,
      feedback: [...feedbackItems],
    })
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
