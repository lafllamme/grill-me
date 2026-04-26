interface ApiErrorDataShape {
  code?: unknown
  error?: {
    code?: unknown
    message?: unknown
  }
  message?: unknown
}

interface ApiErrorShape {
  data?: ApiErrorDataShape
  message?: unknown
}

/**
 * Extracts a stable API error code from h3/$fetch error payloads.
 *
 * @param cause Unknown thrown value from `$fetch` or route handlers.
 * @returns Error code when present; otherwise `null`.
 * @example
 * extractApiErrorCode({ data: { error: { code: 'database_not_configured' } } })
 * // => 'database_not_configured'
 */
export function extractApiErrorCode(cause: unknown): string | null {
  if (!cause || typeof cause !== 'object')
    return null

  const err = cause as ApiErrorShape
  const code = err.data?.error?.code ?? err.data?.code

  return typeof code === 'string' && code.trim() ? code : null
}

/**
 * Extracts a human-readable error message from common API error envelopes.
 *
 * @param cause Unknown thrown value from client API calls.
 * @param fallback Message returned when no structured message exists.
 * @returns Best-effort message string for UI surfaces.
 */
export function extractApiErrorMessage(cause: unknown, fallback: string): string {
  if (!cause || typeof cause !== 'object')
    return fallback

  const err = cause as ApiErrorShape
  const message = err.data?.error?.message ?? err.data?.message ?? err.message

  return typeof message === 'string' && message.trim() ? message : fallback
}
