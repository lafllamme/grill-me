import { neon } from '@neondatabase/serverless'
import { consola } from 'consola'

type SqlExecutor = (query: TemplateStringsArray, ...params: unknown[]) => Promise<unknown>

const sqlByUrl = new Map<string, SqlExecutor>()

export function getSqlExecutor(databaseUrl?: string): SqlExecutor | null {
  if (!databaseUrl)
    return null

  const cached = sqlByUrl.get(databaseUrl)
  if (cached)
    return cached

  const sql = neon(databaseUrl) as unknown as SqlExecutor
  sqlByUrl.set(databaseUrl, sql)
  return sql
}

/**
 * Runs a database query and returns `null` on failure.
 * Use for non-critical reads where graceful degradation is acceptable.
 */
export async function safeQuery<T>(
  databaseUrl: string | undefined,
  run: (sql: SqlExecutor) => Promise<T>,
): Promise<T | null> {
  const sql = getSqlExecutor(databaseUrl)
  if (!sql)
    return null

  try {
    return await run(sql)
  }
  catch (error) {
    consola.warn('[server/db/query-failed]', {
      message: (error as Error)?.message || 'Unknown database query error',
    })
    return null
  }
}
