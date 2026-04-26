/**
 * Thin wrapper around nuxt-auth-utils user session composable.
 */
export function useAuthSession() {
  const { ready, loggedIn, user, fetch, clear } = useUserSession()
  const hasFetchedSession = useState<boolean>('auth-session-fetched', () => false)

  if (import.meta.client && !hasFetchedSession.value) {
    hasFetchedSession.value = true
    void fetch()
  }

  const login = async () => {
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
