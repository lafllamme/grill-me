import type { DashboardProfileStreamEvent, DashboardProfileStreamGithubProgressEvent } from '~~/shared/dashboard/contracts'
import type { DashboardAnalysisPhase, DashboardApiResponse } from '~/components/dashboard-explorer/types'
import { computed, onBeforeUnmount, ref } from 'vue'
import { createDashboardTrace, resolveDashboardTraceLevel } from '~~/shared/dashboard/trace'
import { requestDashboardProfileStream } from '~/utils/dashboard-api'

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object')
    return 'GitHub profile could not be analyzed.'

  const responseError = error as { data?: { message?: unknown }, message?: unknown, statusMessage?: unknown }
  if (typeof responseError.data?.message === 'string')
    return responseError.data.message
  if (typeof responseError.statusMessage === 'string')
    return responseError.statusMessage
  if (typeof responseError.message === 'string')
    return responseError.message
  return 'GitHub profile could not be analyzed.'
}

export function useDashboardAnalysis() {
  const runtimeConfig = useRuntimeConfig()
  const githubUsername = ref('lafllamme')
  const assessment = ref<DashboardApiResponse['assessment'] | null>(null)
  const evidence = ref<DashboardApiResponse['evidence'] | null>(null)
  const githubProgress = ref<DashboardProfileStreamGithubProgressEvent | null>(null)
  const phase = ref<DashboardAnalysisPhase>('idle')
  const errorMessage = ref('')
  const isLoading = computed(() => phase.value === 'collecting-github' || phase.value === 'scoring' || phase.value === 'reviewing-ai' || phase.value === 'finalizing')
  let requestController: AbortController | undefined

  const reset = () => {
    requestController?.abort()
    requestController = undefined
    assessment.value = null
    evidence.value = null
    githubProgress.value = null
    errorMessage.value = ''
    phase.value = 'idle'
  }

  const analyze = async (username = githubUsername.value) => {
    const normalizedUsername = username.trim()
    if (!normalizedUsername)
      return

    requestController?.abort()
    const controller = new AbortController()
    requestController = controller
    githubUsername.value = normalizedUsername
    assessment.value = null
    evidence.value = null
    githubProgress.value = null
    errorMessage.value = ''
    phase.value = 'collecting-github'
    const trace = createDashboardTrace({
      requestId: `client-${Date.now()}`,
      username: normalizedUsername,
      source: 'client',
      level: resolveDashboardTraceLevel(runtimeConfig.public.dashboardTraceLevel),
    })
    trace.log('ui', 'stream-start')

    try {
      let hasCompleted = false
      const handleStreamEvent = (event: DashboardProfileStreamEvent): void => {
        if (event.type === 'status') {
          phase.value = event.phase
          trace.log('ui', 'stream-event', { type: event.type, phase: event.phase, message: event.message })
          return
        }

        if (event.type === 'evidence') {
          evidence.value = event.evidence
          trace.log('ui', 'stream-event', {
            type: event.type,
            commitCount: event.evidence.commits.length,
            pullRequestCount: event.evidence.pullRequests.length,
          })
          return
        }

        if (event.type === 'github_progress') {
          githubProgress.value = event
          trace.log('github', 'progress', { phase: event.phase, ...event.counts })
          return
        }

        if (event.type === 'deterministic_scores') {
          // Keep the dashboard coherent while the AI review is still in
          // flight. The deterministic assessment is useful server-side and
          // remains part of the stream contract, but rendering it here makes
          // the user see a score that changes again when `done` arrives.
          phase.value = 'reviewing-ai'
          trace.log('ui', 'stream-event', { type: event.type, overallScore: event.assessment.overallScore })
          return
        }

        if (event.type === 'done') {
          assessment.value = event.data.assessment
          evidence.value = event.data.evidence
          phase.value = 'ready'
          hasCompleted = true
          trace.log('ui', 'stream-complete', {
            overallScore: event.data.assessment.overallScore,
            grade: event.data.assessment.grade,
            role: event.data.assessment.role,
          })
          return
        }

        if (event.type === 'error') {
          trace.log('ui', 'stream-error', { code: event.error.code, message: event.error.message })
          throw new Error(event.error.message)
        }
      }

      await requestDashboardProfileStream(normalizedUsername, handleStreamEvent, controller.signal)
      if (!hasCompleted)
        throw new Error('Dashboard analysis ended before a final profile was returned.')
    }
    catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError')
        return
      errorMessage.value = getErrorMessage(error)
      phase.value = 'error'
    }
    finally {
      if (requestController === controller)
        requestController = undefined
    }
  }

  onBeforeUnmount(() => requestController?.abort())

  return {
    githubUsername,
    assessment,
    evidence,
    githubProgress,
    phase,
    errorMessage,
    isLoading,
    analyze,
    reset,
  }
}
