import type { RoastDebugLevel, RoastResponse, RoastStreamEvent } from '~~/shared/roast/contracts'
import { consola } from 'consola'
import { requestLeaderboardSubmit, requestRoastShare, requestRoastStream, requestRoastSync } from '../utils/roast-api'

export type RoastResult = RoastResponse

const ENABLE_ROAST_DEBUG = import.meta.dev && true
const DEFAULT_CLIENT_DEBUG_LEVEL: RoastDebugLevel = import.meta.dev ? 'full' : 'minimal'

interface RoastRequestOptions {
  debugLevel?: RoastDebugLevel
  roastIntensity?: number
}

interface StreamMeta {
  requestId: string
  username: string
}

/**
 * Client-side roast state and actions for sync + stream execution.
 *
 * @returns Reactive roast state and actions.
 * @example
 * const { roastUsername, partialRoastLines, partialFeedback } = useRoast()
 * await roastUsername('lafllamme', { roastIntensity: 4 })
 */
export function useRoast() {
  const result = useState<RoastResult | null>('roast-result', () => null)
  const pending = useState<boolean>('roast-pending', () => false)
  const error = useState<string | null>('roast-error', () => null)

  const isStreaming = useState<boolean>('roast-streaming', () => false)
  const streamStatus = useState<string[]>('roast-stream-status', () => [])
  const partialTitle = useState<string>('roast-partial-title', () => '')
  const partialRoastLines = useState<string[]>('roast-partial-roast-lines', () => [])
  const partialFeedback = useState<string[]>('roast-partial-feedback', () => [])
  const streamError = useState<string | null>('roast-stream-error', () => null)
  const streamMeta = useState<StreamMeta | null>('roast-stream-meta', () => null)
  const streamDebug = useState<Record<string, unknown> | null>('roast-stream-debug', () => null)

  const activeController = useState<AbortController | null>('roast-abort-controller', () => null)
  const sharePending = useState<boolean>('roast-share-pending', () => false)
  const lastShareUrl = useState<string | null>('roast-last-share-url', () => null)
  const submitPending = useState<boolean>('roast-submit-pending', () => false)
  const lastSubmitMessage = useState<string | null>('roast-last-submit-message', () => null)

  const resetStreamState = (): void => {
    isStreaming.value = false
    streamStatus.value = []
    partialTitle.value = ''
    partialRoastLines.value = []
    partialFeedback.value = []
    streamError.value = null
    streamMeta.value = null
    streamDebug.value = null
  }

  const setRoastLine = (index: number, text: string): void => {
    const next = [...partialRoastLines.value]
    next[index] = text
    partialRoastLines.value = next
  }

  const setFeedbackItem = (index: number, text: string): void => {
    const next = [...partialFeedback.value]
    next[index] = text
    partialFeedback.value = next.filter(Boolean)
  }

  const setFinalResult = (data: RoastResponse): void => {
    result.value = data
    partialTitle.value = data.title
    partialRoastLines.value = [...data.roastLines]
    partialFeedback.value = [...data.feedback]
    streamDebug.value = (data.debug as Record<string, unknown>) || streamDebug.value
  }

  const logDebugPayload = (payload: Record<string, unknown>): void => {
    if (!ENABLE_ROAST_DEBUG)
      return

    const githubDebug = (payload.github || null) as Record<string, unknown> | null
    const aiDebug = (payload.ai || null) as Record<string, unknown> | null
    const intensityProfile = (payload.intensityProfile || null) as Record<string, unknown> | null

    if (githubDebug) {
      const contextSnapshot = (githubDebug.contextSnapshot || null) as Record<string, unknown> | null
      consola.info('[client/roast/github-context]', {
        username: payload.username,
        github: githubDebug,
      })
      if (contextSnapshot) {
        consola.info('[client/roast/github-context-snapshot]', {
          username: payload.username,
          contextSnapshot,
        })
      }
    }

    if (aiDebug) {
      consola.info('[client/roast/ai-user-payload]', {
        username: payload.username,
        userPayload: aiDebug.userPayload,
      })
    }

    if (intensityProfile) {
      consola.info('[client/roast/intensity-profile]', {
        username: payload.username,
        intensityProfile,
      })
    }
  }

  const handleStreamEvent = (event: RoastStreamEvent): void => {
    if (event.type === 'meta') {
      streamMeta.value = {
        requestId: event.requestId,
        username: event.username,
      }
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-meta]', event)
      return
    }

    if (event.type === 'status') {
      streamStatus.value = [...streamStatus.value, `[${event.phase}] ${event.message}`]
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-status]', { phase: event.phase, message: event.message })
      return
    }

    if (event.type === 'roast_title') {
      partialTitle.value = event.title
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-roast-title]', event)
      return
    }

    if (event.type === 'roast_line') {
      setRoastLine(event.index, event.text)
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-roast-line]', event)
      return
    }

    if (event.type === 'feedback_item') {
      setFeedbackItem(event.index, event.text)
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-feedback-item]', event)
      return
    }

    if (event.type === 'debug') {
      const payload = event.debug as Record<string, unknown>
      streamDebug.value = payload
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-debug]', event.debug)
      logDebugPayload(payload)
      return
    }

    if (event.type === 'done') {
      setFinalResult(event.data)

      if (ENABLE_ROAST_DEBUG) {
        const aiDebug = (event.data.debug?.ai || {}) as Record<string, unknown>
        const responseFullText = typeof aiDebug.responseFullText === 'string' ? aiDebug.responseFullText : ''

        consola.info('[client/roast/stream-done]', {
          username: event.data.username,
          roastLineCount: event.data.roastLines.length,
          feedbackCount: event.data.feedback.length,
          parserPath: event.data.debug?.parserPath,
          responseFullTextLength: responseFullText.length,
        })

        if (responseFullText) {
          consola.info('[client/roast/stream-final-raw-text]', {
            username: event.data.username,
            rawText: responseFullText,
          })
        }

        consola.info('[client/roast/final-parsed-output]', {
          username: event.data.username,
          title: event.data.title,
          roastLines: event.data.roastLines,
          feedback: event.data.feedback,
          metrics: event.data.metrics,
          meta: event.data.meta,
        })
      }
      return
    }

    if (event.type === 'error')
      throw new Error(event.error.message)
  }

  const roastUsernameSync = async (githubUsername: string, options?: RoastRequestOptions): Promise<void> => {
    const response = await requestRoastSync(githubUsername, options)
    setFinalResult(response)

    if (ENABLE_ROAST_DEBUG) {
      consola.info('[client/roast/sync]', {
        username: response.username,
        roastLength: response.roast.length,
        feedbackCount: response.feedback.length,
        parserPath: response.debug?.parserPath,
        fallbackReason: response.debug?.fallbackReason,
        selectionSummary: response.debug?.selectionSummary,
      })
    }
  }

  const roastUsernameStream = async (githubUsername: string, options?: RoastRequestOptions): Promise<void> => {
    const controller = new AbortController()
    activeController.value = controller

    await requestRoastStream(
      githubUsername,
      handleStreamEvent,
      controller.signal,
      options,
    )
  }

  const cancelRoast = (): void => {
    activeController.value?.abort()
    activeController.value = null
    pending.value = false
    isStreaming.value = false
    streamError.value = 'Request cancelled'
  }

  const createShareLink = async (): Promise<string> => {
    if (!result.value?.receipt)
      throw new Error('No roast receipt available for sharing')

    sharePending.value = true
    lastShareUrl.value = null
    try {
      const payload = await requestRoastShare(result.value.receipt)
      lastShareUrl.value = payload.shareUrl
      if (ENABLE_ROAST_DEBUG) {
        consola.info('[client/roast/share-created]', {
          username: result.value.username,
          token: payload.token,
          shareUrl: payload.shareUrl,
          expiresAt: payload.expiresAt,
        })
      }
      return payload.shareUrl
    }
    finally {
      sharePending.value = false
    }
  }

  const submitToLeaderboard = async (): Promise<void> => {
    if (!result.value?.receipt)
      throw new Error('No roast receipt available for leaderboard submit')

    submitPending.value = true
    lastSubmitMessage.value = null
    try {
      const payload = await requestLeaderboardSubmit(result.value.receipt)
      lastSubmitMessage.value = `Submitted @${payload.username} at ${new Date(payload.submittedAt).toLocaleString()}`
      if (ENABLE_ROAST_DEBUG) {
        consola.info('[client/roast/official-submit]', {
          username: payload.username,
          submittedAt: payload.submittedAt,
        })
      }
    }
    finally {
      submitPending.value = false
    }
  }

  const roastUsername = async (githubUsername: string, options?: RoastRequestOptions): Promise<void> => {
    const trimmed = githubUsername.trim()
    if (!trimmed)
      return

    pending.value = true
    error.value = null
    resetStreamState()
    result.value = null
    lastShareUrl.value = null
    lastSubmitMessage.value = null

    try {
      isStreaming.value = true
      if (ENABLE_ROAST_DEBUG) {
        consola.info('[client/roast/request-start]', {
          username: trimmed,
          mode: 'stream',
          debugLevel: options?.debugLevel || DEFAULT_CLIENT_DEBUG_LEVEL,
          roastIntensity: options?.roastIntensity || 2,
        })
      }

      await roastUsernameStream(trimmed, options)
    }
    catch (cause: any) {
      const message = cause?.message || 'Streaming roast failed'
      streamError.value = message
      if (ENABLE_ROAST_DEBUG)
        consola.info('[client/roast/stream-error]', { message, cause })

      try {
        await roastUsernameSync(trimmed, options)
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
    partialTitle,
    partialRoastLines,
    streamStatus,
    partialFeedback,
    streamError,
    streamMeta,
    streamDebug,
    sharePending,
    lastShareUrl,
    submitPending,
    lastSubmitMessage,
    roastUsername,
    cancelRoast,
    createShareLink,
    submitToLeaderboard,
  }
}
