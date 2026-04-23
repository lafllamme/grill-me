import type {
  RoastDebugLevel,
  RoastResponse,
  RoastStreamDoneEvent,
  RoastStreamErrorEvent,
  RoastStreamEvent,
  RoastStreamFeedbackEvent,
  RoastStreamFeedbackItemEvent,
  RoastStreamTypingEvent,
  RoastStreamTypingRoastEvent,
} from '~~/shared/roast/contracts'
import { consola } from 'consola'
import { requestRoastStream, requestRoastSync } from '../utils/roast-api'

export type RoastResult = RoastResponse
const ENABLE_ROAST_DEBUG = import.meta.dev && true
const DEFAULT_CLIENT_DEBUG_LEVEL: RoastDebugLevel = import.meta.dev ? 'full' : 'minimal'

/**
 * Handles roast request state for both sync and stream endpoint modes.
 */
export function useRoast() {
  const result = useState<RoastResult | null>('roast-result', () => null)
  const pending = useState<boolean>('roast-pending', () => false)
  const error = useState<string | null>('roast-error', () => null)

  const isStreaming = useState<boolean>('roast-streaming', () => false)
  const streamStatus = useState<string[]>('roast-stream-status', () => [])
  const partialRoast = useState<string>('roast-partial-roast', () => '')
  const partialFeedback = useState<string[]>('roast-partial-feedback', () => [])
  const streamError = useState<string | null>('roast-stream-error', () => null)
  const streamMeta = useState<{ requestId: string, username: string } | null>('roast-stream-meta', () => null)
  const streamDebug = useState<Record<string, unknown> | null>('roast-stream-debug', () => null)

  const activeController = useState<AbortController | null>('roast-abort-controller', () => null)

  const resetStreamState = () => {
    isStreaming.value = false
    streamStatus.value = []
    partialRoast.value = ''
    partialFeedback.value = []
    streamError.value = null
    streamMeta.value = null
    streamDebug.value = null
  }

  const cancelRoast = () => {
    activeController.value?.abort()
    activeController.value = null
    pending.value = false
    isStreaming.value = false
    streamError.value = 'Request cancelled'
  }

  const roastUsernameSync = async (githubUsername: string, debugLevel?: RoastDebugLevel): Promise<void> => {
    result.value = await requestRoastSync(githubUsername, { debugLevel })
    partialRoast.value = result.value.roastLines.join('\n')
    partialFeedback.value = [...result.value.feedback]

    if (ENABLE_ROAST_DEBUG) {
      consola.info('[client/roast/sync]', {
        username: result.value.username,
        roastLength: result.value.roast.length,
        feedbackCount: result.value.feedback.length,
        parserPath: result.value.debug?.parserPath,
        fallbackReason: result.value.debug?.fallbackReason,
        selectionSummary: result.value.debug?.selectionSummary,
      })
    }
  }

  const roastUsernameStream = async (githubUsername: string, debugLevel?: RoastDebugLevel): Promise<void> => {
    const controller = new AbortController()
    activeController.value = controller

    await requestRoastStream(githubUsername, (event: RoastStreamEvent) => {
      if (event.type === 'meta') {
        const metaEvent = event
        streamMeta.value = {
          requestId: metaEvent.requestId,
          username: metaEvent.username,
        }
        if (ENABLE_ROAST_DEBUG)
          consola.info('[client/roast/stream-meta]', metaEvent)
        return
      }

      if (event.type === 'typing') {
        // Legacy compatibility for older server versions.
        const typingEvent = event as RoastStreamTypingEvent
        partialRoast.value = `${partialRoast.value}${typingEvent.chunk}`
        return
      }

      if (event.type === 'typing_roast') {
        const typingEvent = event as RoastStreamTypingRoastEvent
        partialRoast.value = `${partialRoast.value}${typingEvent.chunk}`
        return
      }

      if (event.type === 'status') {
        const line = `[${event.phase}] ${event.message}`
        streamStatus.value = [...streamStatus.value, line]
        if (ENABLE_ROAST_DEBUG) {
          consola.info('[client/roast/stream-status]', {
            phase: event.phase,
            message: event.message,
          })
        }
        return
      }

      if (event.type === 'feedback') {
        // Legacy compatibility for older server versions.
        const feedbackEvent = event as RoastStreamFeedbackEvent
        partialFeedback.value = [...feedbackEvent.feedback]
        return
      }

      if (event.type === 'feedback_item') {
        const feedbackEvent = event as RoastStreamFeedbackItemEvent
        partialFeedback.value = [...feedbackEvent.feedback]
        return
      }

      if (event.type === 'debug') {
        streamDebug.value = event.debug as unknown as Record<string, unknown>
        if (ENABLE_ROAST_DEBUG)
          consola.info('[client/roast/stream-debug]', event.debug)

        const debugPayload = event.debug as Record<string, unknown>
        const githubDebug = (debugPayload.github || null) as Record<string, unknown> | null
        const aiDebug = (debugPayload.ai || null) as Record<string, unknown> | null
        if (ENABLE_ROAST_DEBUG && githubDebug) {
          consola.info('[client/roast/github-context]', {
            username: event.debug.username,
            github: githubDebug,
          })
        }

        if (ENABLE_ROAST_DEBUG && aiDebug) {
          consola.info('[client/roast/ai-user-payload]', {
            username: event.debug.username,
            userPayload: aiDebug.userPayload,
          })
        }
        return
      }

      if (event.type === 'done') {
        const doneEvent = event as RoastStreamDoneEvent
        result.value = doneEvent.data
        if (!partialRoast.value.trim())
          partialRoast.value = doneEvent.data.roastLines.join('\n')
        const shouldHydrateFeedback = partialFeedback.value.length === 0
          || doneEvent.data.feedback.length > partialFeedback.value.length
        if (shouldHydrateFeedback)
          partialFeedback.value = [...doneEvent.data.feedback]

        streamDebug.value = doneEvent.data.debug as unknown as Record<string, unknown> || streamDebug.value

        if (ENABLE_ROAST_DEBUG) {
          const aiDebug = (doneEvent.data.debug?.ai || {}) as Record<string, unknown>
          const responseFullText = typeof aiDebug.responseFullText === 'string' ? aiDebug.responseFullText : ''
          consola.info('[client/roast/stream-done]', {
            username: doneEvent.data.username,
            roastLineCount: doneEvent.data.roastLines.length,
            feedbackCount: doneEvent.data.feedback.length,
            parserPath: doneEvent.data.debug?.parserPath,
            responseFullTextLength: responseFullText.length,
          })

          if (responseFullText) {
            consola.info('[client/roast/stream-final-raw-text]', {
              username: doneEvent.data.username,
              rawText: responseFullText,
            })
          }

          consola.info('[client/roast/final-parsed-output]', {
            username: doneEvent.data.username,
            roastLines: doneEvent.data.roastLines,
            feedback: doneEvent.data.feedback,
            meta: doneEvent.data.meta,
          })
        }
        return
      }

      if (event.type === 'error') {
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
      if (ENABLE_ROAST_DEBUG) {
        consola.info('[client/roast/request-start]', {
          username: trimmed,
          mode: 'stream',
          debugLevel: options?.debugLevel || DEFAULT_CLIENT_DEBUG_LEVEL,
        })
      }
      await roastUsernameStream(trimmed, options?.debugLevel)
    }
    catch (cause: any) {
      const message = cause?.message || 'Streaming roast failed'
      streamError.value = message
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-error]', { message, cause })

      try {
        await roastUsernameSync(trimmed, options?.debugLevel)
      }
      catch (fallbackCause: any) {
        const fallbackMessage = fallbackCause?.data?.error?.message
          || fallbackCause?.data?.message
          || fallbackCause?.message
          || 'Roast request failed'
        error.value = fallbackMessage
        if (ENABLE_ROAST_DEBUG)
          consola.info('[client/roast/sync-error]', { message: fallbackMessage, cause: fallbackCause })
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
    streamMeta,
    streamDebug,
    roastUsername,
    cancelRoast,
  }
}
