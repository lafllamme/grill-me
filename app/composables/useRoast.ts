import type { RoastResponse } from "~~/shared/roast/contracts"
export type RoastResult = RoastResponse

interface RoastError {
  code: string
  message: string
}

interface RoastApiError {
  error?: RoastError
}

/**
 * Handles roast request state and API communication for the landing page.
 */
export const useRoast = () => {
  const result = useState<RoastResult | null>("roast-result", () => null)
  const pending = useState<boolean>("roast-pending", () => false)
  const error = useState<string | null>("roast-error", () => null)

  const roastUsername = async (githubUsername: string): Promise<void> => {
    const trimmed = githubUsername.trim()
    if (!trimmed)
      return

    pending.value = true
    error.value = null

    try {
      const response = await $fetch<RoastResult | RoastApiError>("/api/roast", {
        method: "POST",
        body: {
          githubUsername: trimmed,
          includeDebug: true,
        },
      })

      if ((response as RoastApiError).error) {
        const apiError = (response as RoastApiError).error
        throw new Error(apiError?.message || "Roast request failed")
      }

      result.value = response as RoastResult
      const debug = result.value.debug as any
      console.groupCollapsed(`[client/roast] ${result.value.username}`)
      console.info("[client/roast] response", result.value)
      console.info("[client/roast] timings", debug?.timingsMs)
      console.info("[client/server-debug] github", debug?.github)
      console.info("[client/server-debug] github-requests", (debug?.requests || []).filter((request: any) => String(request.stage || "").startsWith("github")))
      console.info("[client/server-debug] ai-input-payload", debug?.ai?.userPayload?.payload)
      console.info("[client/server-debug] ai-prompt", debug?.ai?.systemPrompt)
      console.info("[client/server-debug] ai-output-preview", debug?.ai?.responsePreview)
      console.groupEnd()
    }
    catch (cause: any) {
      const statusMessage = cause?.data?.error?.message || cause?.data?.message || cause?.message || "Roast request failed"
      error.value = statusMessage
      console.info("[client/roast/error]", {
        message: statusMessage,
        cause,
      })
    }
    finally {
      pending.value = false
    }
  }

  return {
    result,
    pending,
    error,
    roastUsername,
  }
}
