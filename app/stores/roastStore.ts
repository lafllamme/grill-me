export const useRoastStore = defineStore('roastStore', {
  state: () => ({
    githubUsername: '',
  }),
  getters: {
    trimmedUsername: state => state.githubUsername.trim(),
    canSubmit(): boolean {
      return this.trimmedUsername.length > 0
    },
  },
  actions: {
    setUsername(value: string) {
      this.githubUsername = value
    },
    clearUsername() {
      this.githubUsername = ''
    },
  },
})
