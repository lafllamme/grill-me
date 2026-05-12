import type { DebugRequestInfo, RoastDebug, RoastDebugLevel } from '~~/shared/roast/contracts'
import process from 'node:process'
import { consola } from 'consola'

function toBooleanFlag(value: string | undefined): boolean {
  if (!value)
    return false

  return value === '1' || value.toLowerCase() === 'true'
}

export const ENABLE_ROAST_DEBUG = toBooleanFlag(process.env.NUXT_ROAST_DEBUG)

export type RoastDebugReport = RoastDebug

/**
 * Creates a request-scoped debug object used across the roast pipeline.
 */
export function createDebugReport(username: string): RoastDebug {
  return {
    username,
    timingsMs: {},
    requests: [],
  }
}

/**
 * Adds one upstream request tracing entry to the debug report.
 */
export function pushDebugRequest(debug: RoastDebug | undefined, request: DebugRequestInfo): void {
  debug?.requests.push(request)
}

/**
 * Strips debug payload according to the requested verbosity.
 */
export function shapeDebugPayload(debug: RoastDebug | undefined, level: RoastDebugLevel): RoastDebug | undefined {
  if (!debug || level === 'off')
    return undefined

  if (level === 'full')
    return debug

  return {
    username: debug.username,
    promptVersion: debug.promptVersion,
    parserPath: debug.parserPath,
    fallbackReason: debug.fallbackReason,
    selectionSummary: debug.selectionSummary,
    intensityProfile: debug.intensityProfile,
    scoring: debug.scoring,
    timingsMs: debug.timingsMs,
    requests: debug.requests,
  }
}

/**
 * Logs an info line under a consistent server namespace.
 */
export function logServerInfo(scope: string, payload: Record<string, unknown>): void {
  if (!ENABLE_ROAST_DEBUG)
    return

  consola.info(`[server/roast/${scope}]`, payload)
}

/**
 * Logs verbose debug lines under a consistent server namespace.
 */
export function logServerDebug(scope: string, payload: Record<string, unknown>): void {
  if (!ENABLE_ROAST_DEBUG)
    return

  consola.info(`[server/roast/${scope}]`, payload)
}

/**
 * Logs an error line under a consistent server namespace.
 */
export function logServerError(scope: string, payload: Record<string, unknown>): void {
  consola.error(`[server/roast/${scope}]`, payload)
}
