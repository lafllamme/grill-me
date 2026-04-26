/**
 * Checks whether the authenticated GitHub login owns the roasted profile.
 *
 * @param sessionLogin GitHub login from the authenticated session.
 * @param roastUsername GitHub username targeted by the roast request.
 * @returns `true` when both logins match (case-insensitive).
 * @example
 * isSelfRoast('LaFllamme', 'lafllamme') // true
 */
export function isSelfRoast(sessionLogin: string, roastUsername: string): boolean {
  return sessionLogin.trim().toLowerCase() === roastUsername.trim().toLowerCase()
}
