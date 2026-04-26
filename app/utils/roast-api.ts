import type {
  LeaderboardSubmitResponse,
  RoastDebugLevel,
  RoastErrorResponse,
  RoastResponse,
  RoastShareCreateResponse,
  RoastShareResolveResponse,
  RoastStreamEvent,
} from '~~/shared/roast/contracts'
import { consumeRoastSse } from './roast-sse'

const DEFAULT_DEBUG_LEVEL: RoastDebugLevel = import.meta.dev ? 'full' : 'minimal'

interface RoastRequestOptions {
  debugLevel?: RoastDebugLevel
  roastIntensity?: number
}

/**
 * Extracts a user-facing error message from a roast API error response.
 */
function toRoastErrorMessage(response: RoastErrorResponse): string {
  return response.error?.message || 'Roast request failed'
}

/**
 * Calls the sync roast endpoint and returns a normalized success payload.
 */
export async function requestRoastSync(githubUsername: string, options?: RoastRequestOptions): Promise<RoastResponse> {
  const debugLevel = options?.debugLevel ?? DEFAULT_DEBUG_LEVEL
  const roastIntensity = options?.roastIntensity ?? 2
  const response = await $fetch<RoastResponse | RoastErrorResponse>('/api/roast', {
    method: 'POST',
    body: {
      githubUsername,
      debugLevel,
      roastIntensity,
    },
  })

  if ((response as RoastErrorResponse).error) {
    const apiError = response as RoastErrorResponse
    throw new Error(toRoastErrorMessage(apiError))
  }

  return response as RoastResponse
}

/**
 * Calls the streaming roast endpoint and forwards every parsed SSE event.
 */
export async function requestRoastStream(githubUsername: string, onEvent: (event: RoastStreamEvent) => void, signal: AbortSignal, options?: RoastRequestOptions): Promise<void> {
  const debugLevel = options?.debugLevel ?? DEFAULT_DEBUG_LEVEL
  const roastIntensity = options?.roastIntensity ?? 2
  const response = await fetch('/api/roast/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      githubUsername,
      debugLevel,
      roastIntensity,
    }),
    signal,
  })

  if (!response.ok)
    throw new Error(`Stream request failed (${response.status})`)

  await consumeRoastSse(response, onEvent)
}

/**
 * Creates a temporary public share link for one roast receipt.
 */
export async function requestRoastShare(receipt: string): Promise<RoastShareCreateResponse> {
  return await $fetch<RoastShareCreateResponse>('/api/roast/share', {
    method: 'POST',
    body: { receipt },
  })
}

/**
 * Resolves one shared roast by public token.
 */
export async function requestRoastShareByToken(token: string): Promise<RoastShareResolveResponse> {
  return await $fetch<RoastShareResolveResponse>(`/api/roast/share/${encodeURIComponent(token)}`)
}

/**
 * Submits a verified self-roast to the official leaderboard.
 */
export async function requestLeaderboardSubmit(receipt: string): Promise<LeaderboardSubmitResponse> {
  return await $fetch<LeaderboardSubmitResponse>('/api/leaderboard/submit', {
    method: 'POST',
    body: { receipt },
  })
}
