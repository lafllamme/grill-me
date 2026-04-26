import { consola } from 'consola'
import { sendRedirect } from 'h3'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const login = user.login || user.name || ''
    const githubId = String(user.id || '')

    if (!login || !githubId)
      return sendRedirect(event, '/?auth=github_invalid_profile')

    try {
      await setUserSession(event, {
        user: {
          githubId,
          login,
          avatarUrl: user.avatar_url,
          name: user.name || undefined,
        },
        loggedInAt: new Date().toISOString(),
      })
    }
    catch (error) {
      consola.info('[server/auth/github-session-failed]', {
        message: (error as Error)?.message || 'Unknown session error',
      })
      return sendRedirect(event, '/?auth=github_session_failed')
    }

    return sendRedirect(event, '/')
  },
  onError(event, error) {
    const config = useRuntimeConfig(event)
    const clientId = config.oauth?.github?.clientId?.trim()
    const clientSecret = config.oauth?.github?.clientSecret?.trim()
    const authState = clientId && clientSecret ? 'github_failed' : 'github_not_configured'

    consola.info('[server/auth/github-oauth-failed]', {
      authState,
      hasClientId: Boolean(clientId),
      hasClientSecret: Boolean(clientSecret),
      message: (error as Error)?.message || 'Unknown oauth error',
    })

    return sendRedirect(event, `/?auth=${authState}`)
  },
})
