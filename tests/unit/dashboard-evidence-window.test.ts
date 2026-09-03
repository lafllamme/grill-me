import type { DashboardCommitRef } from '../../server/roast/dashboard/shared/evidence-window'
import type { GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it, vi } from 'vitest'
import { deriveDashboardEvidenceState, orderAuthoredCommitRefs, selectDashboardCandidateRefs } from '../../server/roast/dashboard/shared/evidence-window'
import { collectDashboardGithubContext } from '../../server/roast/github-collector'

vi.mock('h3', () => ({
  createError: (input: Record<string, unknown>) => Object.assign(new Error(String(input.statusMessage ?? 'error')), input),
}), { virtual: true })

vi.mock('consola', () => ({
  consola: { info: vi.fn(), error: vi.fn(), debug: vi.fn() },
}), { virtual: true })

function ref(overrides: Partial<DashboardCommitRef> = {}): DashboardCommitRef {
  return {
    repo: 'owner/repo-a',
    sha: 'sha-default',
    message: 'feat: ship signal',
    committedAt: '2026-08-01T12:00:00Z',
    authorLogin: 'maintainer',
    committerLogin: 'maintainer',
    parentCount: 1,
    isMerge: false,
    ...overrides,
  }
}

function rawCommit(repo: string, index: number, options: { isMerge?: boolean, page?: number } = {}): Record<string, unknown> {
  const isMerge = options.isMerge ?? false
  const page = options.page ?? 1
  const sha = `${repo.replace('/', '-')}-${page}-${index}`
  return {
    sha,
    author: { login: 'maintainer' },
    committer: { login: 'maintainer' },
    commit: {
      message: isMerge ? `Merge branch release-${index}` : `feat: authored change ${index}`,
      author: { date: `2026-08-${String(Math.max(1, 20 - index)).padStart(2, '0')}T12:00:00Z` },
      committer: { date: `2026-08-${String(Math.max(1, 20 - index)).padStart(2, '0')}T12:00:00Z` },
    },
    parents: isMerge ? [{ sha: 'parent-a' }, { sha: 'parent-b' }] : [{ sha: 'parent-a' }],
  }
}

function jsonResponse(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

function createGithubFixture(options: { sparse?: boolean, secondPagePersonal?: boolean } = {}): {
  fetchMock: ReturnType<typeof vi.fn>
  repositories: string[]
} {
  const repositories = options.sparse
    ? ['owner/sparse']
    : ['owner/primary-a', 'owner/primary-b', 'owner/primary-c', 'owner/fallback']
  const history = new Map<string, Record<string, unknown>[][]>()

  for (const repository of repositories) {
    const isFallback = repository === 'owner/fallback'
    const isSparse = repository === 'owner/sparse'
    const firstPage = isFallback || isSparse
      ? Array.from({ length: isSparse ? 2 : 12 }, (_, index) => rawCommit(repository, index + 1))
      : Array.from({ length: 12 }, (_, index) => rawCommit(repository, index + 1, { isMerge: true }))
    history.set(repository, [
      firstPage,
      options.secondPagePersonal ? Array.from({ length: 4 }, (_, index) => rawCommit(repository, index + 1, { page: 2 })) : [],
    ])
  }

  const fetchMock = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
    const requestUrl = new URL(String(input))
    const path = requestUrl.pathname

    if (path === '/users/maintainer')
      return jsonResponse({ login: 'maintainer' })

    if (path === '/users/maintainer/repos') {
      return jsonResponse(repositories.map(repo => ({
        full_name: repo,
        default_branch: 'main',
        language: 'TypeScript',
        pushed_at: '2026-08-20T12:00:00Z',
        fork: false,
        archived: false,
        size: 100,
        stargazers_count: 10,
      })))
    }

    const historyMatch = path.match(/^\/repos\/(.+)\/commits$/)
    if (historyMatch && requestUrl.searchParams.has('author')) {
      const repository = historyMatch[1]!
      const page = Number(requestUrl.searchParams.get('page') ?? '1')
      return jsonResponse(history.get(repository)?.[page - 1] ?? [])
    }

    const detailsMatch = path.match(/^\/repos\/(.+)\/commits\/([^/]+)$/)
    if (detailsMatch) {
      const repository = detailsMatch[1]!
      const sha = detailsMatch[2]!
      const raw = history.get(repository)?.flat().find(commit => commit.sha === sha)
      if (!raw)
        return jsonResponse({ message: 'not found' }, 404)

      const isMerge = Array.isArray(raw.parents) && raw.parents.length > 1
      return jsonResponse({
        ...raw,
        html_url: `https://github.com/${repository}/commit/${sha}`,
        stats: { additions: isMerge ? 2 : 12, deletions: isMerge ? 1 : 4 },
        files: [{
          filename: isMerge ? 'docs/release.md' : 'src/profile.ts',
          status: 'modified',
          additions: isMerge ? 2 : 12,
          deletions: isMerge ? 1 : 4,
          patch: isMerge ? '+ release notes' : '+ const profileSignal = calculateSignal(input)',
        }],
      })
    }

    if (path.endsWith('/contents'))
      return jsonResponse([{ name: 'src', type: 'dir' }, { name: 'README.md', type: 'file' }])

    if (path.endsWith('/pulls'))
      return jsonResponse([])

    if (path.endsWith('/check-runs'))
      return jsonResponse({ total_count: 0, check_runs: [] })

    return jsonResponse({ message: 'unexpected fixture request' }, 404)
  })

  vi.stubGlobal('fetch', fetchMock)
  return { fetchMock, repositories }
}

function assertDashboardContext(context: GithubContext): void {
  expect(context.sampling).toBeDefined()
  expect(context.collection?.candidateCommits).toBeLessThanOrEqual(30)
}

describe('dashboard evidence window', () => {
  it('keeps one authored ref per repository before recency fill', () => {
    const ordered = orderAuthoredCommitRefs([
      ref({ repo: 'owner/repo-a', sha: 'a-new', committedAt: '2026-08-04T12:00:00Z' }),
      ref({ repo: 'owner/repo-a', sha: 'a-old', committedAt: '2026-08-01T12:00:00Z' }),
      ref({ repo: 'owner/repo-b', sha: 'b-new', committedAt: '2026-08-03T12:00:00Z' }),
    ], ['owner/repo-a', 'owner/repo-b'])

    expect(ordered.map(item => item.sha)).toEqual(['a-new', 'b-new', 'a-old'])
  })

  it('prioritizes authored references over integration commits in the bounded candidate window', () => {
    const refs = [
      ...Array.from({ length: 4 }, (_, index) => ref({ sha: `merge-${index}`, isMerge: true, parentCount: 2, message: 'Merge pull request' })),
      ref({ sha: 'authored', isMerge: false, parentCount: 1 }),
    ]

    expect(selectDashboardCandidateRefs(refs, ['owner/repo-a'], 1).map(item => item.sha)).toEqual(['authored'])
  })

  it('marks a sparse account as limited history instead of substituting repository snapshot code', () => {
    expect(deriveDashboardEvidenceState({
      personalRefs: 2,
      personalWithPatch: 2,
      targetPersonalRefs: 12,
      minimumPersonalRefs: 3,
      minimumPersonalPatches: 1,
      backfilled: 0,
    })).toBe('limited-history')
  })

  it('backfills a merge-heavy maintainer from another owned repository', async () => {
    const { fetchMock } = createGithubFixture()

    const progress: string[] = []
    const context = await collectDashboardGithubContext('maintainer', undefined, {
      githubTimeoutMs: 1000,
      onProgress: ({ phase }) => {
        progress.push(phase)
      },
    })

    assertDashboardContext(context)
    expect(context.repositories?.map(repository => repository.repo)).toEqual([
      'owner/primary-a',
      'owner/primary-b',
      'owner/primary-c',
      'owner/fallback',
    ])
    expect(context.sampling).toMatchObject({
      candidateRefs: 30,
      integrationSkipped: 18,
      personalRefs: 12,
      detailsFetched: 16,
      personalWithPatch: 12,
      backfilled: 12,
      evidenceState: 'expanded-window',
    })
    expect(context.sampling?.perRepository['owner/fallback']).toMatchObject({
      candidateRefs: 12,
      personalRefs: 12,
      detailsFetched: 12,
      personalWithPatch: 12,
    })
    expect(context.commits.filter(commit => commit.isMerge !== true)).toHaveLength(12)
    expect(context.commits.filter(commit => commit.isMerge === true)).toHaveLength(4)
    expect(progress).toContain('history')
    expect(progress).toContain('commits')
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/repos/owner/fallback/commits?'))).toBe(true)
  })

  it('keeps a fresh sparse account limited even after a bounded second history page', async () => {
    createGithubFixture({ sparse: true })

    const context = await collectDashboardGithubContext('maintainer', undefined, { githubTimeoutMs: 1000 })

    assertDashboardContext(context)
    expect(context.sampling).toMatchObject({
      candidateRefs: 2,
      personalRefs: 2,
      detailsFetched: 2,
      personalWithPatch: 2,
      evidenceState: 'limited-history',
    })
    expect(context.commits).toHaveLength(2)
  })

  it('uses one bounded second history page when the active repository has more authored work', async () => {
    const { fetchMock } = createGithubFixture({ sparse: true, secondPagePersonal: true })

    const context = await collectDashboardGithubContext('maintainer', undefined, { githubTimeoutMs: 1000 })

    assertDashboardContext(context)
    expect(context.sampling).toMatchObject({
      candidateRefs: 6,
      personalRefs: 6,
      detailsFetched: 6,
      personalWithPatch: 6,
      backfilled: 4,
      evidenceState: 'expanded-window',
    })
    expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/repos/owner/sparse/commits?') && String(input).includes('page=2'))).toBe(true)
  })
})
