import { setResponseStatus } from 'h3'
import { leaderboardResponseSchema, leaderboardWindowSchema } from '~~/shared/roast/contracts'
import { getLeaderboard } from '../roast/leaderboard-repository'

/**
 * Leaderboard list endpoint.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const windowInput = typeof query.window === 'string' ? query.window : 'all'
  const parsedWindow = leaderboardWindowSchema.safeParse(windowInput)
  const window = parsedWindow.success ? parsedWindow.data : 'all'

  const limitInput = Number(query.limit || 50)
  const limit = Number.isFinite(limitInput) ? limitInput : 50
  const search = typeof query.search === 'string' ? query.search : undefined

  const payload = await getLeaderboard(config.databaseUrl || undefined, {
    window,
    limit,
    search,
  })

  if (!payload.items.length && !config.databaseUrl) {
    setResponseStatus(event, 200)
  }

  return leaderboardResponseSchema.parse(payload)
})
