import { createError } from 'h3'
import { getLeaderboardUserDetail } from '../../roast/leaderboard-repository'

/**
 * Leaderboard user detail endpoint.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const username = getRouterParam(event, 'username')?.trim()

  if (!username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username is required',
    })
  }

  const detail = await getLeaderboardUserDetail(config.databaseUrl || undefined, username)
  if (!detail) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Leaderboard entry not found',
    })
  }

  return detail
})
