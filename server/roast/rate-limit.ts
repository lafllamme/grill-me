import { createError } from 'h3'
import { ROAST_DEFAULTS } from '~~/shared/roast/contracts'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Enforces a simple in-memory IP based rate limit.
 */
export function checkRateLimit(ip: string, max = ROAST_DEFAULTS.rateLimitMax, windowMs = ROAST_DEFAULTS.rateLimitWindowMs): void {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests',
      data: {
        code: 'rate_limited',
      },
    })
  }

  entry.count += 1
}
