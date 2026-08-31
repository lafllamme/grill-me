import type { DashboardAnalysisPhase, DashboardApiResponse } from '~/components/dashboard-explorer/types'
import { computed, onBeforeUnmount, ref } from 'vue'

function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object')
    return 'GitHub profile could not be analyzed.'

  const responseError = error as { data?: { message?: unknown }, statusMessage?: unknown }
  if (typeof responseError.data?.message === 'string')
    return responseError.data.message
  if (typeof responseError.statusMessage === 'string')
    return responseError.statusMessage
  return 'GitHub profile could not be analyzed.'
}

export function useDashboardAnalysis() {
  const githubUsername = ref('lafllamme')
  const assessment = ref<DashboardApiResponse['assessment'] | null>(null)
  const evidence = ref<DashboardApiResponse['evidence'] | null>(null)
  const phase = ref<DashboardAnalysisPhase>('idle')
  const errorMessage = ref('')
  const isLoading = computed(() => phase.value === 'collecting-github' || phase.value === 'scoring' || phase.value === 'reviewing-ai')
  let requestController: AbortController | undefined

  const reset = () => {
    requestController?.abort()
    requestController = undefined
    assessment.value = null
    evidence.value = null
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
    errorMessage.value = ''
    phase.value = 'collecting-github'

    try {
      const response = await $fetch<DashboardApiResponse>('/api/dashboard-profile', {
        method: 'POST',
        body: { username: normalizedUsername },
        signal: controller.signal,
      })
      assessment.value = response.assessment
      evidence.value = response.evidence
      phase.value = 'ready'
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
    phase,
    errorMessage,
    isLoading,
    analyze,
    reset,
  }
}
