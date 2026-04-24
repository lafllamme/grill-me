import type { RoastErrorResponse } from '~~/shared/roast/contracts'

/**
 * Returns a stable error envelope consumed by both sync and stream API handlers.
 */
export function toErrorBody(code: string, message: string): RoastErrorResponse {
  return {
    error: {
      code,
      message,
    },
  }
}

/**
 * Converts unknown thrown values into a stable h3-compatible error tuple.
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
