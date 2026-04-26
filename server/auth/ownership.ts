/**
 * True when the authenticated user is the same GitHub account as roast target.
 */
export function isSelfRoast(sessionLogin: string, roastUsername: string): boolean {
  return sessionLogin.trim().toLowerCase() === roastUsername.trim().toLowerCase()
}
