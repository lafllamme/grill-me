/**
 * Thin wrapper around nuxt-auth-utils user session composable.
 */
export function useAuthSession() {
  const { ready, loggedIn, user, fetch, clear, openInPopup } = useUserSession()

  const login = async () => {
    if (import.meta.client) {
      openInPopup('/auth/github')
      return
    }
    await navigateTo('/auth/github', { external: true })
  }

  const logout = async () => {
    await clear()
  }

  return {
    ready,
    loggedIn,
    user,
    fetch,
    login,
    logout,
  }
}
