export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session.user
  const login = typeof user?.login === 'string' ? user.login : null
  const githubId = typeof user?.githubId === 'string' ? user.githubId : null
  const avatarUrl = typeof user?.avatarUrl === 'string' ? user.avatarUrl : null

  return {
    loggedIn: Boolean(login && githubId),
    user: login && githubId
      ? {
          githubId,
          login,
          avatarUrl,
        }
      : null,
  }
})
