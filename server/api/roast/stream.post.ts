import { getRequestIP, setResponseStatus } from "h3"
import type { RoastStreamEvent } from "~~/shared/roast/contracts"
import { parseRoastStreamRequest } from "../../roast/contracts-adapter"
import { createDebugReport, logServerError, logServerInfo } from "../../roast/debug"
import { runRoastStream, toErrorBody, toHandledError } from "../../roast/orchestrator"
import { checkRateLimit } from "../../roast/rate-limit"

/**
 * Streams roast progress events over SSE.
 */
export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID().slice(0, 8)

  let parsed: Awaited<ReturnType<typeof parseRoastStreamRequest>>
  try {
    parsed = await parseRoastStreamRequest(event)
  }
  catch (error) {
    const handled = toHandledError(error)
    setResponseStatus(event, handled.statusCode)
    return toErrorBody(handled.code, handled.statusMessage)
  }
  const config = useRuntimeConfig(event)
  const debug = createDebugReport(parsed.username)

  const clientIp = getRequestIP(event, { xForwardedFor: true }) || "unknown"
  try {
    checkRateLimit(clientIp)
  }
  catch (error) {
    const handled = toHandledError(error)
    setResponseStatus(event, handled.statusCode)
    return toErrorBody(handled.code, handled.statusMessage)
  }

  logServerInfo("stream-request", {
    requestId,
    username: parsed.username,
    clientIp,
    includeDebug: parsed.runtime.includeDebug,
    debugLevel: parsed.runtime.debugLevel,
    hasCfAccountId: Boolean(config.cfAccountId),
    hasCfApiToken: Boolean(config.cfApiToken),
    hasGithubToken: Boolean(config.githubToken),
    model: config.cfAiModel,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const writeEvent = (name: RoastStreamEvent["type"], payload: RoastStreamEvent): void => {
        const chunk = `event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`
        controller.enqueue(encoder.encode(chunk))
      }

      try {
        const finalPayload = await runRoastStream(
          {
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
          },
          async (payload) => {
            writeEvent(payload.type, payload)
          },
        )

        logServerInfo("stream-success", {
          requestId,
          username: parsed.username,
          roastLineCount: finalPayload.roastLines.length,
          feedbackCount: finalPayload.feedback.length,
          parserPath: finalPayload.debug?.parserPath,
          fallbackReason: finalPayload.debug?.fallbackReason,
          timingsMs: finalPayload.debug?.timingsMs,
        })
      }
      catch (error) {
        const handled = toHandledError(error)
        logServerError("stream-failed", {
          requestId,
          statusCode: handled.statusCode,
          statusMessage: handled.statusMessage,
          code: handled.code,
          details: handled.details,
        })
        writeEvent("error", {
          type: "error",
          error: toErrorBody(handled.code, handled.statusMessage).error,
        })
      }
      finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
})
