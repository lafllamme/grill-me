import { createError } from 'h3'
import { roastShareResolveResponseSchema } from '~~/shared/roast/contracts'
import { logServerInfo } from '../../../roast/debug'
import { getRoastShareByToken } from '../../../roast/leaderboard-repository'

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

  const shared = await getRoastShareByToken(config.databaseUrl || undefined, token)
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
