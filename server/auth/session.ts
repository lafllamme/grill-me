import { createError } from 'h3'

export interface GithubSessionUser {
  githubId: string
  login: string
  avatarUrl?: string
  name?: string
}

export interface GithubSession {
  user: GithubSessionUser
}

function toGithubSessionUser(value: unknown): GithubSessionUser | null {
  if (!value || typeof value !== 'object')
    return null

  const user = value as Record<string, unknown>
  const login = typeof user.login === 'string' ? user.login.trim() : ''
  const githubId = typeof user.githubId === 'string' ? user.githubId.trim() : ''
  if (!login || !githubId)
    return null

  return {
    githubId,
    login,
    avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : undefined,
    name: typeof user.name === 'string' ? user.name : undefined,
  }
}

export async function requireGithubSession(event: Parameters<typeof requireUserSession>[0]): Promise<GithubSession> {
  const session = await requireUserSession(event)
  const user = toGithubSessionUser(session.user)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'GitHub session required',
      data: { code: 'github_auth_required' },
    })
  }

  return { user }
}

export function isSelfRoast(sessionLogin: string, roastUsername: string): boolean {
  return sessionLogin.trim().toLowerCase() === roastUsername.trim().toLowerCase()
}
