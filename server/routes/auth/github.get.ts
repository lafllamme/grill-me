import { sendRedirect } from 'h3'

export default defineOAuthGitHubEventHandler({
  async onSuccess(event, { user }) {
    const login = user.login || user.name || ''
    const githubId = String(user.id || '')

    if (!login || !githubId)
      return sendRedirect(event, '/?auth=github_invalid_profile')

    await setUserSession(event, {
      user: {
        githubId,
        login,
        avatarUrl: user.avatar_url,
        name: user.name || undefined,
      },
      loggedInAt: new Date().toISOString(),
    })

    return sendRedirect(event, '/')
  },
  onError(event) {
    return sendRedirect(event, '/?auth=github_failed')
  },
})
