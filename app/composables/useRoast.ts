import { consola } from "consola"
import type {
  RoastDebugLevel,
  RoastResponse,
  RoastStreamDoneEvent,
  RoastStreamErrorEvent,
  RoastStreamEvent,
  RoastStreamFeedbackEvent,
  RoastStreamTypingEvent,
} from "~~/shared/roast/contracts"
import { requestRoastStream, requestRoastSync } from "../utils/roast-api"

export type RoastResult = RoastResponse

/**
 * Handles roast request state for both sync and stream endpoint modes.
 */
export const useRoast = () => {
  const result = useState<RoastResult | null>("roast-result", () => null)
  const pending = useState<boolean>("roast-pending", () => false)
  const error = useState<string | null>("roast-error", () => null)

  const isStreaming = useState<boolean>("roast-streaming", () => false)
  const streamStatus = useState<string[]>("roast-stream-status", () => [])
  const partialRoast = useState<string>("roast-partial-roast", () => "")
  const partialFeedback = useState<string[]>("roast-partial-feedback", () => [])
  const streamError = useState<string | null>("roast-stream-error", () => null)

  const activeController = useState<AbortController | null>("roast-abort-controller", () => null)

  const splitLiveRoastAndFeedback = (value: string): { roastText: string, feedbackItems: string[] } => {
    const markerMatch = /(?:^|\n)\s*FEEDBACK:\s*/i.exec(value)
    if (!markerMatch) {
      return {
        roastText: value,
        feedbackItems: [],
      }
    }

    const markerIndex = markerMatch.index
    const roastText = value.slice(0, markerIndex).trimEnd()
    const feedbackText = value.slice(markerIndex).replace(/^[\s\S]*?FEEDBACK:\s*/i, "")
    const feedbackItems = feedbackText
      .split(/\n+/)
      .map(line => line.replace(/^[-*•\d.)\s]+/, "").trim())
      .filter(Boolean)

    return {
      roastText,
      feedbackItems,
    }
  }

  const resetStreamState = () => {
    isStreaming.value = false
    streamStatus.value = []
    partialRoast.value = ""
    partialFeedback.value = []
    streamError.value = null
  }

  const cancelRoast = () => {
    activeController.value?.abort()
    activeController.value = null
    pending.value = false
    isStreaming.value = false
    streamError.value = "Request cancelled"
  }

  const roastUsernameSync = async (githubUsername: string, debugLevel?: RoastDebugLevel): Promise<void> => {
    result.value = await requestRoastSync(githubUsername, { debugLevel })
    partialRoast.value = result.value.roastLines.join("\n")
    partialFeedback.value = [...result.value.feedback]

    consola.debug("[client/roast/sync]", {
      username: result.value.username,
      roastLength: result.value.roast.length,
      feedbackCount: result.value.feedback.length,
      parserPath: result.value.debug?.parserPath,
      fallbackReason: result.value.debug?.fallbackReason,
      selectionSummary: result.value.debug?.selectionSummary,
    })
  }

  const roastUsernameStream = async (githubUsername: string, debugLevel?: RoastDebugLevel): Promise<void> => {
    const controller = new AbortController()
    activeController.value = controller

    await requestRoastStream(githubUsername, (event: RoastStreamEvent) => {
      if (event.type === "meta") {
        const metaEvent = event
        consola.debug("[client/roast/stream-meta]", metaEvent)
        return
      }

      if (event.type === "typing") {
        const typingEvent = event as RoastStreamTypingEvent
        const combined = `${partialRoast.value}${typingEvent.chunk}`
        const separated = splitLiveRoastAndFeedback(combined)
        partialRoast.value = separated.roastText
        if (separated.feedbackItems.length > 0)
          partialFeedback.value = separated.feedbackItems
        return
      }

      if (event.type === "status") {
        const line = `[${event.phase}] ${event.message}`
        streamStatus.value = [...streamStatus.value, line]
        return
      }

      if (event.type === "feedback") {
        const feedbackEvent = event as RoastStreamFeedbackEvent
        partialFeedback.value = [...feedbackEvent.feedback]
        return
      }

      if (event.type === "debug") {
        consola.debug("[client/roast/stream-debug]", event.debug)
        return
      }

      if (event.type === "done") {
        const doneEvent = event as RoastStreamDoneEvent
        result.value = doneEvent.data
        if (!partialRoast.value.trim())
          partialRoast.value = doneEvent.data.roastLines.join("\n")
        if (partialFeedback.value.length === 0)
          partialFeedback.value = [...doneEvent.data.feedback]
        return
      }

      if (event.type === "error") {
        const errorEvent = event as RoastStreamErrorEvent
        throw new Error(errorEvent.error.message)
      }
    }, controller.signal, { debugLevel })
  }

  const roastUsername = async (githubUsername: string, options?: { debugLevel?: RoastDebugLevel }): Promise<void> => {
    const trimmed = githubUsername.trim()
    if (!trimmed)
      return

    pending.value = true
    error.value = null
    resetStreamState()
    result.value = null

    try {
      isStreaming.value = true
      await roastUsernameStream(trimmed, options?.debugLevel)
    }
    catch (cause: any) {
      const message = cause?.message || "Streaming roast failed"
      streamError.value = message
      consola.debug("[client/roast/stream-error]", { message, cause })

      try {
        await roastUsernameSync(trimmed, options?.debugLevel)
      }
      catch (fallbackCause: any) {
        const fallbackMessage = fallbackCause?.data?.error?.message
          || fallbackCause?.data?.message
          || fallbackCause?.message
          || "Roast request failed"
        error.value = fallbackMessage
        consola.debug("[client/roast/sync-error]", { message: fallbackMessage, cause: fallbackCause })
      }
    }
    finally {
      activeController.value = null
      pending.value = false
      isStreaming.value = false
    }
  }

  return {
    result,
    pending,
    error,
    isStreaming,
    partialRoast,
    streamStatus,
    partialFeedback,
    streamError,
    roastUsername,
    cancelRoast,
  }
}
