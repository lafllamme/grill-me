import type { RoastIntensityValue } from '~/constants/roastIntensity'

export const useRoastStore = defineStore('roastStore', () => {
  const githubUsername = ref('')
  const roastIntensity = ref<RoastIntensityValue>(2)

  const trimmedUsername = computed(() => githubUsername.value.trim())
  const canSubmit = computed(() => trimmedUsername.value.length > 0)

  const setUsername = (value: string) => {
    githubUsername.value = value
  }

  const clearUsername = () => {
    githubUsername.value = ''
  }

  const setRoastIntensity = (value: number) => {
    roastIntensity.value = Math.min(4, Math.max(1, Math.round(Number(value) || 2))) as RoastIntensityValue
  }

  const resetRoastIntensity = () => {
    roastIntensity.value = 2
  }

  return {
    githubUsername,
    roastIntensity,
    trimmedUsername,
    canSubmit,
    setUsername,
    clearUsername,
    setRoastIntensity,
    resetRoastIntensity,
  }
})
