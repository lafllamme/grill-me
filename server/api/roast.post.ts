import consola from "consola"
import { createError, getRequestIP, readBody, setResponseStatus } from "h3"
import {
  resolveRoastRuntimeOptions,
  roastRequestBodySchema,
} from "~~/shared/roast/contracts"
import {
  checkRateLimit,
  createDebugReport,
  fetchGithubContext,
  generateRoast,
  validateGithubUsername,
} from "../utils/roast"

/**
 * Canonical error envelope returned by this route.
 */
const errorBody = (code: string, message: string) => ({
  error: {
    code,
    message,
  },
})

const logInfo = (scope: string, payload: Record<string, unknown>): void => {
  consola.info(scope, payload)
}

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID().slice(0, 8)

  try {
    const rawBody = await readBody(event)
    const parsedBody = roastRequestBodySchema.safeParse(rawBody)
    if (!parsedBody.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "githubUsername is required",
        data: {
          code: "invalid_request",
          issues: parsedBody.error.issues,
        },
      })
    }
    const body = parsedBody.data

    const config = useRuntimeConfig(event)
    const username = validateGithubUsername(body.githubUsername)
    const runtimeOptions = resolveRoastRuntimeOptions(config, body.includeDebug)
    const debugReport = createDebugReport(username)
    const requestStartedAt = Date.now()

    const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown"
    checkRateLimit(clientIp)

    logInfo("[server/roast] request", {
      requestId,
      username,
      clientIp,
      includeDebug: runtimeOptions.includeDebug,
      hasCfAccountId: Boolean(config.cfAccountId),
      hasCfApiToken: Boolean(config.cfApiToken),
      hasGithubToken: Boolean(config.githubToken),
      model: config.cfAiModel,
    })

    const githubStartedAt = Date.now()
    const githubContext = await fetchGithubContext(username, config.githubToken || undefined, {
      githubTimeoutMs: runtimeOptions.githubTimeoutMs,
      debug: debugReport,
    })
    if (debugReport)
      debugReport.timingsMs.githubFetch = Date.now() - githubStartedAt

    logInfo("[server/roast/github] context", {
      requestId,
      username,
      commitCount: githubContext.commits.length,
      prCount: githubContext.prs.length,
      github: debugReport.github,
      requests: debugReport.requests.filter(request => request.stage.startsWith("github")),
    })

    const aiStartedAt = Date.now()
    const roastResult = await generateRoast(githubContext, {
      accountId: config.cfAccountId || undefined,
      apiToken: config.cfApiToken || undefined,
      model: config.cfAiModel || undefined,
      aiTimeoutMs: runtimeOptions.cfAiTimeoutMs,
      aiMaxTokens: runtimeOptions.cfAiMaxTokens,
      debug: debugReport,
    })
    if (debugReport) {
      debugReport.timingsMs.aiGenerate = Date.now() - aiStartedAt
      debugReport.timingsMs.total = Date.now() - requestStartedAt
    }

    logInfo("[server/roast/ai] input", {
      requestId,
      username,
      model: config.cfAiModel,
      prompt: debugReport.ai?.systemPrompt,
      payload: debugReport.ai?.userPayload?.payload,
    })

    logInfo("[server/roast/ai] output", {
      requestId,
      username,
      responsePreview: debugReport.ai?.responsePreview,
      requests: debugReport.requests.filter(request => request.stage === "cloudflare_ai"),
    })

    logInfo("[server/roast] success", {
      requestId,
      username,
      roastLength: roastResult.roast.length,
      feedbackCount: roastResult.feedback.length,
      timingsMs: debugReport.timingsMs,
    })

    logInfo("[server/roast] response-payload", {
      requestId,
      username,
      response: roastResult,
    })

    return roastResult
  }
  catch (error: any) {
    const statusCode = Number(error?.statusCode || 500)
    const statusMessage = String(error?.statusMessage || "Unexpected server error")
    const code = String(error?.data?.code || "internal_error")

    setResponseStatus(event, statusCode)

    consola.error("[server/roast] failed", {
      requestId,
      statusCode,
      statusMessage,
      code,
      details: error?.data,
      message: error?.message,
    })

    return errorBody(code, statusMessage)
  }
})
