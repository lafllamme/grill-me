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
 */
export function extractApiErrorMessage(cause: unknown, fallback: string): string {
  if (!cause || typeof cause !== 'object')
    return fallback

  const err = cause as ApiErrorShape
  const message = err.data?.error?.message ?? err.data?.message ?? err.message

  return typeof message === 'string' && message.trim() ? message : fallback
}
