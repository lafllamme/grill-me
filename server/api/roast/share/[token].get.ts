import { createError } from 'h3'
import { roastShareResolveResponseSchema } from '~~/shared/roast/contracts'
import { resolveRoastDatabaseError } from '../../../roast/db-error'
import { logServerInfo } from '../../../roast/debug'
import { getRoastShareByToken } from '../../../roast/leaderboard-repository'

/**
 * Resolves one temporary share token to an unofficial roast snapshot payload.
 *
 * Returns:
 * - `400` when token is missing
 * - `404` when token does not exist or is expired
 * - mapped setup errors (e.g. missing DB schema) via stable error codes
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getRouterParam(event, 'token')?.trim()

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Share token is required',
      data: { code: 'share_token_missing' },
    })
  }

  let shared = null
  try {
    shared = await getRoastShareByToken(config.databaseUrl || undefined, token)
  }
  catch (error) {
    const mappedError = resolveRoastDatabaseError(error)
    if (mappedError) {
      throw createError({
        statusCode: mappedError.statusCode,
        statusMessage: mappedError.statusMessage,
        data: { code: mappedError.code },
      })
    }
    throw error
  }

  if (!shared) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Share not found or expired',
      data: { code: 'share_not_found' },
    })
  }

  logServerInfo('share-resolved', {
    token,
    username: shared.data.username,
    expiresAt: shared.expiresAt,
  })

  return roastShareResolveResponseSchema.parse(shared)
})
