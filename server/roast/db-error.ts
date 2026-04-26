interface PgErrorLike {
  code?: unknown
  cause?: {
    code?: unknown
  }
}

function extractPgCode(error: unknown): string {
  if (!error || typeof error !== 'object')
    return ''

  const cause = error as PgErrorLike
  return String(cause.code || cause.cause?.code || '')
}

/**
 * Resolves low-level Postgres errors to stable roast API envelopes.
 */
export function resolveRoastDatabaseError(error: unknown): { statusCode: number, statusMessage: string, code: string } | null {
  const pgCode = extractPgCode(error)
  if (pgCode === '42P01') {
    return {
      statusCode: 503,
      statusMessage: 'Leaderboard schema missing. Run DB migration 002 (roast_share_and_official_entries).',
      code: 'leaderboard_schema_missing',
    }
  }

  return null
}
