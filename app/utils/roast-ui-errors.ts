/**
 * Maps known roast setup error codes to actionable UI hints.
 *
 * @param code Stable API error code.
 * @returns User-facing setup hint or `null` when no setup guidance exists.
 */
export function getRoastSetupErrorMessage(code: string | null): string | null {
  if (code === 'leaderboard_schema_missing')
    return 'Setup required: run DB migration 002 (roast_share_and_official_entries).'

  if (code === 'database_not_configured')
    return 'Database is not configured. Set NUXT_DATABASE_URL before sharing/submitting.'

  return null
}
