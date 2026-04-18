import type {
  RoastDebugLevel,
  RoastErrorResponse,
  RoastResponse,
  RoastStreamEvent,
} from "~~/shared/roast/contracts"
import { consumeRoastSse } from "./roast-sse"

const DEFAULT_DEBUG_LEVEL: RoastDebugLevel = "minimal"

interface RoastRequestOptions {
  debugLevel?: RoastDebugLevel
}

/**
 * Extracts a user-facing error message from a roast API error response.
 */
const toRoastErrorMessage = (response: RoastErrorResponse): string => {
  return response.error?.message || "Roast request failed"
}

/**
 * Calls the sync roast endpoint and returns a normalized success payload.
 */
export const requestRoastSync = async (
  githubUsername: string,
  options?: RoastRequestOptions,
): Promise<RoastResponse> => {
  const debugLevel = options?.debugLevel ?? DEFAULT_DEBUG_LEVEL
  const response = await $fetch<RoastResponse | RoastErrorResponse>("/api/roast", {
    method: "POST",
    body: {
      githubUsername,
      debugLevel,
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
export const requestRoastStream = async (
  githubUsername: string,
  onEvent: (event: RoastStreamEvent) => void,
  signal: AbortSignal,
  options?: RoastRequestOptions,
): Promise<void> => {
  const debugLevel = options?.debugLevel ?? DEFAULT_DEBUG_LEVEL
  const response = await fetch("/api/roast/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      githubUsername,
      debugLevel,
    }),
    signal,
  })

  if (!response.ok)
    throw new Error(`Stream request failed (${response.status})`)

  await consumeRoastSse(response, onEvent)
}
