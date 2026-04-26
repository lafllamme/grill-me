import type { LeaderboardResponse, LeaderboardWindow } from '~~/shared/roast/contracts'

/**
 * Client state + fetch orchestration for leaderboard listing.
 */
export function useLeaderboard() {
  const window = useState<LeaderboardWindow>('leaderboard-window', () => 'all')
  const search = useState<string>('leaderboard-search', () => '')
  const limit = useState<number>('leaderboard-limit', () => 25)

  const query = computed(() => ({
    window: window.value,
    limit: limit.value,
    ...(search.value.trim() ? { search: search.value.trim() } : {}),
  }))

  const { data, pending, error, refresh } = useFetch<LeaderboardResponse>('/api/leaderboard', {
    query,
    default: () => ({
      window: window.value,
      limit: limit.value,
      items: [],
    }),
    watch: [window, search, limit],
  })

  const setWindow = (value: LeaderboardWindow) => {
    window.value = value
  }

  return {
    window,
    search,
    limit,
    leaderboard: data,
    pending,
    error,
    refresh,
    setWindow,
  }
}
