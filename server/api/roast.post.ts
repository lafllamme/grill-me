import { getRequestIP, setResponseStatus } from 'h3'
import { parseRoastRequest } from '../roast/contracts-adapter'
import { createDebugReport, logServerError, logServerInfo } from '../roast/debug'
import { runRoastSync, toErrorBody, toHandledError } from '../roast/orchestrator'
import { checkRateLimit } from '../roast/rate-limit'

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID().slice(0, 8)

  try {
    const parsed = await parseRoastRequest(event)
    const config = useRuntimeConfig(event)
    const debug = createDebugReport(parsed.username)

    const clientIp = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    checkRateLimit(clientIp)

    logServerInfo('request', {
      requestId,
      username: parsed.username,
      roastIntensity: parsed.runtime.roastIntensity,
      clientIp,
      includeDebug: parsed.runtime.includeDebug,
      debugLevel: parsed.runtime.debugLevel,
      hasCfAccountId: Boolean(config.cfAccountId),
      hasCfApiToken: Boolean(config.cfApiToken),
      hasGithubToken: Boolean(config.githubToken),
      model: config.cfAiModel,
    })

    const response = await runRoastSync({
      requestId,
      username: parsed.username,
      runtime: parsed.runtime,
      env: {
        cfAccountId: config.cfAccountId || undefined,
        cfApiToken: config.cfApiToken || undefined,
        cfAiModel: config.cfAiModel || undefined,
        githubToken: config.githubToken || undefined,
      },
      includeDebugInResponse: parsed.runtime.includeDebug,
      debug,
    })

    logServerInfo('success', {
      requestId,
      username: parsed.username,
      roastIntensity: parsed.runtime.roastIntensity,
      roastLineCount: response.roastLines.length,
      roastLength: response.roast.length,
      feedbackCount: response.feedback.length,
      parserPath: response.debug?.parserPath,
      fallbackReason: response.debug?.fallbackReason,
      selectionSummary: response.debug?.selectionSummary,
      timingsMs: response.debug?.timingsMs,
    })

    return response
  }
  catch (error) {
    const handled = toHandledError(error)
    setResponseStatus(event, handled.statusCode)

    logServerError('failed', {
      requestId,
      statusCode: handled.statusCode,
      statusMessage: handled.statusMessage,
      code: handled.code,
      details: handled.details,
    })

    return toErrorBody(handled.code, handled.statusMessage)
  }
})
