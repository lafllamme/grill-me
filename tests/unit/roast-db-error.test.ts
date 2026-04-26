import { describe, expect, it } from 'vitest'
import { resolveRoastDatabaseError } from '../../server/roast/db-error'

describe('roast db error mapping', () => {
  it('maps missing relation errors to typed setup error', () => {
    const mapped = resolveRoastDatabaseError({ code: '42P01' })

    expect(mapped?.statusCode).toBe(503)
    expect(mapped?.code).toBe('leaderboard_schema_missing')
  })

  it('returns null for non-schema errors', () => {
    const mapped = resolveRoastDatabaseError({ code: '23505' })
    expect(mapped).toBeNull()
  })
})
