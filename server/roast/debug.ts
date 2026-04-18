import { consola } from "consola"
import type { DebugRequestInfo, RoastDebug, RoastDebugLevel } from "~~/shared/roast/contracts"

export type RoastDebugReport = RoastDebug

/**
 * Creates a request-scoped debug object used across the roast pipeline.
 */
export const createDebugReport = (username: string): RoastDebug => ({
  username,
  timingsMs: {},
  requests: [],
})

/**
 * Adds one upstream request tracing entry to the debug report.
 */
export const pushDebugRequest = (debug: RoastDebug | undefined, request: DebugRequestInfo): void => {
  debug?.requests.push(request)
}

/**
 * Strips debug payload according to the requested verbosity.
 */
export const shapeDebugPayload = (debug: RoastDebug | undefined, level: RoastDebugLevel): RoastDebug | undefined => {
  if (!debug || level === "off")
    return undefined

  if (level === "full")
    return debug

  return {
    username: debug.username,
    promptVersion: debug.promptVersion,
    parserPath: debug.parserPath,
    fallbackReason: debug.fallbackReason,
    selectionSummary: debug.selectionSummary,
    timingsMs: debug.timingsMs,
    requests: debug.requests,
  }
}

/**
 * Logs an info line under a consistent server namespace.
 */
export const logServerInfo = (scope: string, payload: Record<string, unknown>): void => {
  consola.info(`[server/roast/${scope}]`, payload)
}

/**
 * Logs an error line under a consistent server namespace.
 */
export const logServerError = (scope: string, payload: Record<string, unknown>): void => {
  consola.error(`[server/roast/${scope}]`, payload)
}
