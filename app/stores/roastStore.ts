export const useRoastStore = defineStore('roastStore', () => {
  const githubUsername = ref('')

  const trimmedUsername = computed(() => githubUsername.value.trim())
  const canSubmit = computed(() => trimmedUsername.value.length > 0)

  const setUsername = (value: string) => {
    githubUsername.value = value
  }

  const clearUsername = () => {
    githubUsername.value = ''
  }

  return {
    githubUsername,
    trimmedUsername,
    canSubmit,
    setUsername,
    clearUsername,
  }
})
