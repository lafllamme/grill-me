import type { RoastDebug, RoastDebugLevel } from '~~/shared/roast/contracts'
import type { DashboardCommitRef, DashboardRepositorySamplingSummary, DashboardSamplingSummary } from './dashboard/shared/evidence-window'
import { createError } from 'h3'
import { ROAST_DEFAULTS, ROAST_LIMITS } from '~~/shared/roast/contracts'
import { commitRefKey, deriveDashboardEvidenceState, isIntegrationCommitRef, selectDashboardCandidateRefs } from './dashboard/shared/evidence-window'
import { ENABLE_ROAST_DEBUG, logServerDebug, pushDebugRequest } from './debug'

export interface GithubCommitFile {
  filename: string
  status: string
  additions: number
  deletions: number
  patch?: string
}

export interface GithubCommit {
  repo: string
  sha: string
  message: string
  additions: number
  deletions: number
  changedFiles: number
  files: GithubCommitFile[]
  committedAt?: string
  authorLogin?: string
  committerLogin?: string
  parentCount?: number
  isMerge?: boolean
  htmlUrl?: string
}

export interface GithubPullRequest {
  repo: string
  number?: number
  title: string
  url: string
  state: string
  authorLogin?: string
  mergedAt?: string
  reviewCount?: number
  reviewCommentCount?: number
  commentCount?: number
  changedFiles?: number
}

export interface GithubRepositoryEvidence {
  repo: string
  defaultBranch: string
  language?: string
  pushedAt?: string
  isFork: boolean
  isArchived: boolean
  size: number
  stars: number
  rootEntries: string[]
}

export interface GithubCheckSummary {
  repo: string
  sha: string
  total: number
  successful: number
  failed: number
  pending: number
}

export interface GithubCollectionSummary {
  mode: 'events' | 'dashboard'
  repositories: number
  candidateCommits: number
  enrichedCommits: number
  usablePatches: number
  associatedPullRequests: number
  checkSummaries: number
}

export interface GithubContext {
  username: string
  commits: GithubCommit[]
  prs: GithubPullRequest[]
  repositories?: GithubRepositoryEvidence[]
  checks?: GithubCheckSummary[]
  collection?: GithubCollectionSummary
  /** Internal collection ledger. It is intentionally omitted from public evidence. */
  sampling?: DashboardSamplingSummary
}

export type GithubCollectionProgressPhase = 'profile' | 'repositories' | 'history' | 'commits' | 'pull-requests' | 'checks'

export interface GithubCollectionProgress {
  phase: GithubCollectionProgressPhase
  context: GithubContext
}

export const DASHBOARD_GITHUB_LIMITS = {
  maxRepositories: 3,
  maxRepositoryCandidates: 5,
  maxHistoryCommitsPerRepository: 12,
  maxCandidateCommits: 30,
  maxDetailedCommits: 18,
  maxIntegrationDetails: 4,
  maxHistoryPagesPerRepository: 2,
  maxFallbackRepositories: 2,
  targetPersonalCommits: 12,
  minimumPersonalCommits: 3,
  minimumPersonalPatchCommits: 1,
  maxAssociatedPullRequestCommits: 6,
  maxPullRequests: 6,
  maxReviewRequests: 3,
  maxCheckRequests: 6,
  maxRootEntries: 80,
  maxFilesPerCommit: 8,
} as const

/**
 * Redacts likely secret patterns from patch snippets.
 */
function redactSecrets(value: string): string {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/(api[_-]?key|token|secret)\s*[:=]\s*['"]?[^'"\s]{8,}/gi, '$1=[REDACTED]')
    .replace(/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, '[REDACTED_KEY_BLOCK]')
}

/**
 * Keeps only a short, safe patch excerpt for prompt evidence.
 */
function trimPatch(patch?: string): string | undefined {
  if (!patch)
    return undefined

  const cleaned = redactSecrets(patch).trim()
  if (!cleaned)
    return undefined

  if (cleaned.length <= ROAST_LIMITS.maxPatchChars)
    return cleaned

  return `${cleaned.slice(0, ROAST_LIMITS.maxPatchChars)}\n...[truncated]`
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * Wraps fetch with abort timeout and normalized upstream timeout errors.
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  }
  catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({
        statusCode: 503,
        statusMessage: 'GitHub request timed out',
        data: {
          code: 'github_timeout',
        },
      })
    }

    throw error
  }
  finally {
    clearTimeout(timer)
  }
}

/**
 * Fetches JSON from GitHub REST API with auth and baseline error mapping.
 */
async function getGithubJson(url: string, token: string | undefined, timeoutMs: number, debug: RoastDebug | undefined, stage: 'github_profile' | 'github_events' | 'github_repositories' | 'github_history' | 'github_repository' | 'github_commit' | 'github_pull_request' | 'github_checks'): Promise<any> {
  const startedAt = Date.now()
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'grill-me-app',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
    timeoutMs,
  )

  pushDebugRequest(debug, {
    stage,
    url,
    durationMs: Date.now() - startedAt,
    ok: response.ok,
    statusCode: response.status,
  })

  if (response.status === 404) {
    throw createError({
      statusCode: 404,
      statusMessage: 'GitHub user or resource not found',
      data: {
        code: 'github_not_found',
      },
    })
  }

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'GitHub upstream failed',
      data: {
        code: 'github_upstream_error',
      },
    })
  }

  return await response.json()
}

/**
 * Collects public user activity and enriches commit references with file-level evidence.
 */
export async function collectGithubContext(username: string, githubToken: string | undefined, options?: {
  githubTimeoutMs?: number
  debug?: RoastDebug
  debugLevel?: RoastDebugLevel
  maxCommitRefs?: number
}): Promise<GithubContext> {
  const githubTimeoutMs = options?.githubTimeoutMs ?? ROAST_DEFAULTS.githubTimeoutMs
  const debug = options?.debug
  const maxCommitRefs = options?.maxCommitRefs ?? ROAST_LIMITS.maxCommitRefs

  await getGithubJson(
    `https://api.github.com/users/${username}`,
    githubToken,
    githubTimeoutMs,
    debug,
    'github_profile',
  )

  const events = await getGithubJson(
    `https://api.github.com/users/${username}/events/public?per_page=${ROAST_LIMITS.eventsPerPage}`,
    githubToken,
    githubTimeoutMs,
    debug,
    'github_events',
  )

  const commitRefs = new Map<string, DashboardCommitRef>()
  const prs: GithubPullRequest[] = []

  let pushEventCount = 0
  let pullRequestEventCount = 0

  for (const event of Array.isArray(events) ? events : []) {
    if (event.type === 'PushEvent' && event.repo?.name) {
      pushEventCount += 1
      const repo = String(event.repo.name)

      const headSha = typeof event.payload?.head === 'string' ? String(event.payload.head) : ''
      if (headSha && !commitRefs.has(headSha)) {
        commitRefs.set(headSha, {
          repo,
          sha: headSha,
          message: '',
        })
      }

      if (Array.isArray(event.payload?.commits)) {
        for (const commit of event.payload.commits) {
          if (!commit?.sha)
            continue

          const sha = String(commit.sha)
          if (commitRefs.has(sha))
            continue

          commitRefs.set(sha, {
            repo,
            sha,
            message: String(commit.message || ''),
          })

          if (commitRefs.size >= maxCommitRefs)
            break
        }
      }
    }

    if (event.type === 'PullRequestEvent' && event.repo?.name && event.payload?.pull_request) {
      pullRequestEventCount += 1
      prs.push({
        repo: String(event.repo.name),
        title: String(event.payload.pull_request.title || 'Untitled PR'),
        url: String(event.payload.pull_request.html_url || ''),
        state: String(event.payload.pull_request.state || 'unknown'),
      })
    }

    if (commitRefs.size >= maxCommitRefs && prs.length >= ROAST_LIMITS.maxPrs)
      break
  }

  const candidateCommits = Array.from(commitRefs.values()).slice(0, maxCommitRefs)
  let commitEnrichmentSkipped = 0

  const enrichedCommits = await Promise.all(candidateCommits.map(async (commitRef) => {
    try {
      const details = await getGithubJson(
        `https://api.github.com/repos/${commitRef.repo}/commits/${commitRef.sha}`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_commit',
      )
      const files = Array.isArray(details.files) ? details.files : []

      const commit: GithubCommit = {
        repo: commitRef.repo,
        sha: commitRef.sha,
        message: String(commitRef.message || details.commit?.message || ''),
        additions: asNumber(details.stats?.additions),
        deletions: asNumber(details.stats?.deletions),
        changedFiles: asNumber(details.files?.length),
        files: files.slice(0, ROAST_LIMITS.maxFilesPerCommit).map((file: any) => ({
          filename: String(file.filename || 'unknown'),
          status: String(file.status || 'modified'),
          additions: asNumber(file.additions),
          deletions: asNumber(file.deletions),
          patch: trimPatch(typeof file.patch === 'string' ? file.patch : undefined),
        })),
        committedAt: typeof details.commit?.author?.date === 'string'
          ? details.commit.author.date
          : typeof details.commit?.committer?.date === 'string' ? details.commit.committer.date : undefined,
        authorLogin: typeof details.author?.login === 'string' ? details.author.login : undefined,
        committerLogin: typeof details.committer?.login === 'string' ? details.committer.login : undefined,
        parentCount: Array.isArray(details.parents) ? details.parents.length : undefined,
        isMerge: Array.isArray(details.parents) ? details.parents.length > 1 : undefined,
        htmlUrl: typeof details.html_url === 'string' ? details.html_url : undefined,
      }

      return commit
    }
    catch {
      commitEnrichmentSkipped += 1
      return null
    }
  }))

  const commits = enrichedCommits.filter((item): item is GithubCommit => Boolean(item))

  if (debug) {
    debug.github = {
      eventsCount: Array.isArray(events) ? events.length : 0,
      pushEventCount,
      pullRequestEventCount,
      commitRefsFound: commitRefs.size,
      commitCandidates: candidateCommits.length,
      configuredMaxCommitRefs: maxCommitRefs,
      commitEnriched: commits.length,
      commitEnrichmentSkipped,
      commitRefsSample: candidateCommits.slice(0, 5).map(commit => ({
        repo: commit.repo,
        sha: commit.sha.slice(0, 7),
      })),
      prSample: prs.slice(0, 3).map(pr => ({
        repo: pr.repo,
        title: pr.title,
        state: pr.state,
      })),
      contextSnapshot: {
        commits: commits.map(commit => ({
          repo: commit.repo,
          sha: commit.sha,
          message: commit.message,
          additions: commit.additions,
          deletions: commit.deletions,
          changedFiles: commit.changedFiles,
          files: commit.files,
        })),
        prs: prs.slice(0, ROAST_LIMITS.maxPrs),
      },
    }
  }

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('github-collector-summary', {
      username,
      eventsCount: Array.isArray(events) ? events.length : 0,
      configuredMaxCommitRefs: maxCommitRefs,
      commitCandidates: candidateCommits.length,
      commitEnriched: commits.length,
      commitEnrichmentSkipped,
      prCount: prs.length,
    })

    if (options?.debugLevel === 'full') {
      logServerDebug('github-collector-content', {
        username,
        commits,
        prs: prs.slice(0, ROAST_LIMITS.maxPrs),
      })
    }
  }

  return {
    username,
    commits,
    prs: prs.slice(0, ROAST_LIMITS.maxPrs),
    collection: {
      mode: 'events',
      repositories: 0,
      candidateCommits: candidateCommits.length,
      enrichedCommits: commits.length,
      usablePatches: commits.filter(commit => commit.files.some(file => Boolean(file.patch?.trim()))).length,
      associatedPullRequests: 0,
      checkSummaries: 0,
    },
  }
}

function sameLogin(left: unknown, right: string): boolean {
  return typeof left === 'string' && left.toLowerCase() === right.toLowerCase()
}

function parseRepositoryEvidence(raw: any): GithubRepositoryEvidence | null {
  const repo = typeof raw?.full_name === 'string' ? raw.full_name : ''
  if (!repo)
    return null

  return {
    repo,
    defaultBranch: typeof raw.default_branch === 'string' ? raw.default_branch : 'HEAD',
    language: typeof raw.language === 'string' ? raw.language : undefined,
    pushedAt: typeof raw.pushed_at === 'string' ? raw.pushed_at : undefined,
    isFork: Boolean(raw.fork),
    isArchived: Boolean(raw.archived),
    size: asNumber(raw.size),
    stars: asNumber(raw.stargazers_count),
    rootEntries: [],
  }
}

function parseCommitRef(raw: any, repo: string, username: string): DashboardCommitRef | null {
  const sha = typeof raw?.sha === 'string' ? raw.sha : ''
  if (!sha)
    return null

  const authorLogin = typeof raw?.author?.login === 'string' ? raw.author.login : undefined
  const committerLogin = typeof raw?.committer?.login === 'string' ? raw.committer.login : undefined
  if (authorLogin && !sameLogin(authorLogin, username) && committerLogin && !sameLogin(committerLogin, username))
    return null

  const parents = Array.isArray(raw.parents) ? raw.parents.length : undefined
  return {
    repo,
    sha,
    message: typeof raw?.commit?.message === 'string' ? raw.commit.message : '',
    committedAt: typeof raw?.commit?.author?.date === 'string' ? raw.commit.author.date : undefined,
    authorLogin,
    committerLogin,
    parentCount: parents,
    isMerge: parents !== undefined ? parents > 1 : undefined,
  }
}

function enrichDashboardCommit(details: any, ref: DashboardCommitRef, username: string): GithubCommit | null {
  const authorLogin = typeof details?.author?.login === 'string' ? details.author.login : ref.authorLogin
  const committerLogin = typeof details?.committer?.login === 'string' ? details.committer.login : ref.committerLogin
  if (authorLogin && !sameLogin(authorLogin, username) && committerLogin && !sameLogin(committerLogin, username))
    return null

  const files = Array.isArray(details?.files) ? details.files : []
  const parentCount = Array.isArray(details?.parents) ? details.parents.length : ref.parentCount

  return {
    repo: ref.repo,
    sha: ref.sha,
    message: ref.message || String(details?.commit?.message || ''),
    additions: asNumber(details?.stats?.additions),
    deletions: asNumber(details?.stats?.deletions),
    changedFiles: files.length,
    files: files.slice(0, DASHBOARD_GITHUB_LIMITS.maxFilesPerCommit).map((file: any) => ({
      filename: String(file.filename || 'unknown'),
      status: String(file.status || 'modified'),
      additions: asNumber(file.additions),
      deletions: asNumber(file.deletions),
      patch: trimPatch(typeof file.patch === 'string' ? file.patch : undefined),
    })),
    committedAt: typeof details?.commit?.author?.date === 'string'
      ? details.commit.author.date
      : typeof details?.commit?.committer?.date === 'string' ? details.commit.committer.date : ref.committedAt,
    authorLogin,
    committerLogin,
    parentCount,
    isMerge: parentCount !== undefined ? parentCount > 1 : ref.isMerge,
    htmlUrl: typeof details?.html_url === 'string' ? details.html_url : undefined,
  }
}

function parsePullRequest(raw: any, repo: string): GithubPullRequest | null {
  const number = Number(raw?.number)
  const title = typeof raw?.title === 'string' ? raw.title : ''
  if (!Number.isInteger(number) || number < 1 || !title)
    return null

  return {
    repo,
    number,
    title,
    url: typeof raw.html_url === 'string' ? raw.html_url : '',
    state: typeof raw.state === 'string' ? raw.state : 'unknown',
    authorLogin: typeof raw.user?.login === 'string' ? raw.user.login : undefined,
    mergedAt: typeof raw.merged_at === 'string' ? raw.merged_at : undefined,
    reviewCommentCount: asNumber(raw.review_comments),
    commentCount: asNumber(raw.comments),
    changedFiles: asNumber(raw.changed_files),
  }
}

function parseCheckSummary(raw: any, repo: string, sha: string): GithubCheckSummary {
  const checks = Array.isArray(raw?.check_runs) ? raw.check_runs : []
  const successful = checks.filter((check: any) => check.conclusion === 'success').length
  const failed = checks.filter((check: any) => ['failure', 'timed_out', 'action_required', 'cancelled', 'startup_failure'].includes(check.conclusion)).length
  return {
    repo,
    sha,
    total: asNumber(raw?.total_count) || checks.length,
    successful,
    failed,
    pending: Math.max(0, checks.length - successful - failed),
  }
}

/**
 * Collects a bounded repository-first evidence pack for dashboard scoring.
 * Repository metadata is a sampling scope only; it is never a quality score.
 */
export async function collectDashboardGithubContext(username: string, githubToken: string | undefined, options?: {
  githubTimeoutMs?: number
  debug?: RoastDebug
  onProgress?: (progress: GithubCollectionProgress) => void | Promise<void>
}): Promise<GithubContext> {
  const githubTimeoutMs = options?.githubTimeoutMs ?? ROAST_DEFAULTS.githubTimeoutMs
  const debug = options?.debug
  const profile = await getGithubJson(
    `https://api.github.com/users/${username}`,
    githubToken,
    githubTimeoutMs,
    debug,
    'github_profile',
  )
  const canonicalLogin = typeof profile?.login === 'string' ? profile.login : username
  await options?.onProgress?.({
    phase: 'profile',
    context: {
      username: canonicalLogin,
      commits: [],
      prs: [],
      repositories: [],
      checks: [],
      collection: {
        mode: 'dashboard',
        repositories: 0,
        candidateCommits: 0,
        enrichedCommits: 0,
        usablePatches: 0,
        associatedPullRequests: 0,
        checkSummaries: 0,
      },
    },
  })
  const repositoryResponse = await getGithubJson(
    `https://api.github.com/users/${encodeURIComponent(canonicalLogin)}/repos?type=owner&sort=pushed&direction=desc&per_page=${DASHBOARD_GITHUB_LIMITS.maxRepositoryCandidates}`,
    githubToken,
    githubTimeoutMs,
    debug,
    'github_repositories',
  )
  const rawRepositories = Array.isArray(repositoryResponse) ? repositoryResponse : []
  const availableRawRepositories = rawRepositories
    .filter(repository => !repository?.fork && !repository?.archived)
    .slice(0, DASHBOARD_GITHUB_LIMITS.maxRepositoryCandidates)
  const availableRepositories = availableRawRepositories
    .map(parseRepositoryEvidence)
    .filter((repository): repository is GithubRepositoryEvidence => Boolean(repository))
  const repositories = availableRepositories.slice(0, DASHBOARD_GITHUB_LIMITS.maxRepositories)
  const fallbackRepositories = availableRepositories.slice(
    DASHBOARD_GITHUB_LIMITS.maxRepositories,
    DASHBOARD_GITHUB_LIMITS.maxRepositories + DASHBOARD_GITHUB_LIMITS.maxFallbackRepositories,
  )
  const repositoryOrder = (): string[] => repositories.map(repository => repository.repo)
  const commitRefs = new Map<string, DashboardCommitRef>()
  const historyPages = new Map<string, number>()
  const backfilledRefs = new Set<string>()
  const detailFetchedRefs = new Set<string>()
  const samplingByRepository = new Map<string, DashboardRepositorySamplingSummary>()
  const commits: GithubCommit[] = []
  let integrationDetails = 0

  const getRepositorySampling = (repo: string): DashboardRepositorySamplingSummary => {
    const existing = samplingByRepository.get(repo)
    if (existing)
      return existing

    const summary: DashboardRepositorySamplingSummary = {
      candidateRefs: 0,
      personalRefs: 0,
      detailsFetched: 0,
      personalWithPatch: 0,
    }
    samplingByRepository.set(repo, summary)
    return summary
  }

  const hasUsablePatch = (commit: GithubCommit): boolean => commit.files.some(file => Boolean(file.patch?.trim()))
  const isPersonalCommit = (commit: GithubCommit): boolean => !isIntegrationCommitRef({
    repo: commit.repo,
    sha: commit.sha,
    message: commit.message,
    parentCount: commit.parentCount,
    isMerge: commit.isMerge,
  })
  const currentCandidateRefs = (): DashboardCommitRef[] => selectDashboardCandidateRefs(
    Array.from(commitRefs.values()),
    repositoryOrder(),
    DASHBOARD_GITHUB_LIMITS.maxCandidateCommits,
  )
  const currentPersonalRefs = (): DashboardCommitRef[] => currentCandidateRefs().filter(ref => !isIntegrationCommitRef(ref))
  const currentPersonalCommits = (): GithubCommit[] => commits.filter(isPersonalCommit)
  const currentPersonalPatchCount = (): number => currentPersonalCommits().filter(hasUsablePatch).length
  const samplingSummary = (): DashboardSamplingSummary => {
    const candidates = currentCandidateRefs()
    const personalRefs = candidates.filter(ref => !isIntegrationCommitRef(ref)).length
    const personalWithPatch = currentPersonalPatchCount()
    const perRepository = Object.fromEntries(Array.from(samplingByRepository.entries()).map(([repo, summary]) => [repo, {
      ...summary,
      personalRefs: candidates.filter(ref => ref.repo === repo && !isIntegrationCommitRef(ref)).length,
    }]))
    return {
      candidateRefs: candidates.length,
      integrationSkipped: candidates.filter(isIntegrationCommitRef).length,
      personalRefs,
      detailsFetched: detailFetchedRefs.size,
      personalWithPatch,
      backfilled: backfilledRefs.size,
      evidenceState: deriveDashboardEvidenceState({
        personalRefs,
        personalWithPatch,
        targetPersonalRefs: DASHBOARD_GITHUB_LIMITS.targetPersonalCommits,
        minimumPersonalRefs: DASHBOARD_GITHUB_LIMITS.minimumPersonalCommits,
        minimumPersonalPatches: DASHBOARD_GITHUB_LIMITS.minimumPersonalPatchCommits,
        backfilled: backfilledRefs.size,
      }),
      perRepository,
    }
  }
  const collectionSummary = (pullRequests: readonly GithubPullRequest[] = [], checkSummaries: readonly GithubCheckSummary[] = []): GithubCollectionSummary => ({
    mode: 'dashboard',
    repositories: repositories.length,
    candidateCommits: currentCandidateRefs().length,
    enrichedCommits: commits.length,
    usablePatches: commits.filter(hasUsablePatch).length,
    associatedPullRequests: pullRequests.length,
    checkSummaries: checkSummaries.length,
  })
  const progressContext = (pullRequests: GithubPullRequest[] = [], checkSummaries: GithubCheckSummary[] = []): GithubContext => ({
    username: canonicalLogin,
    commits,
    prs: pullRequests,
    repositories,
    checks: checkSummaries,
    collection: collectionSummary(pullRequests, checkSummaries),
    sampling: samplingSummary(),
  })
  const emitProgress = async (phase: GithubCollectionProgressPhase, pullRequests: GithubPullRequest[] = [], checkSummaries: GithubCheckSummary[] = []): Promise<void> => {
    await options?.onProgress?.({ phase, context: progressContext(pullRequests, checkSummaries) })
  }
  const fetchRepositoryRoot = async (repository: GithubRepositoryEvidence): Promise<void> => {
    try {
      const rootContents = await getGithubJson(
        `https://api.github.com/repos/${repository.repo}/contents?ref=${encodeURIComponent(repository.defaultBranch)}`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_repository',
      )
      repository.rootEntries = (Array.isArray(rootContents) ? rootContents : [])
        .map(entry => typeof entry?.name === 'string' ? entry.name : '')
        .filter(Boolean)
        .slice(0, DASHBOARD_GITHUB_LIMITS.maxRootEntries)
    }
    catch {
      repository.rootEntries = []
    }
  }
  const fetchHistoryPage = async (repository: GithubRepositoryEvidence, page: number, isBackfill: boolean): Promise<void> => {
    const history = await getGithubJson(
      `https://api.github.com/repos/${repository.repo}/commits?author=${encodeURIComponent(canonicalLogin)}&per_page=${DASHBOARD_GITHUB_LIMITS.maxHistoryCommitsPerRepository}&page=${page}`,
      githubToken,
      githubTimeoutMs,
      debug,
      'github_history',
    )
    historyPages.set(repository.repo, Math.max(historyPages.get(repository.repo) ?? 0, page))
    const repositorySampling = getRepositorySampling(repository.repo)
    for (const rawCommit of Array.isArray(history) ? history : []) {
      const ref = parseCommitRef(rawCommit, repository.repo, canonicalLogin)
      if (!ref)
        continue

      const key = commitRefKey(ref)
      if (commitRefs.has(key))
        continue

      commitRefs.set(key, ref)
      repositorySampling.candidateRefs += 1
      if (isBackfill)
        backfilledRefs.add(key)
    }
  }
  const fetchCommitDetails = async (ref: DashboardCommitRef): Promise<void> => {
    const key = commitRefKey(ref)
    if (detailFetchedRefs.has(key) || detailFetchedRefs.size >= DASHBOARD_GITHUB_LIMITS.maxDetailedCommits)
      return

    detailFetchedRefs.add(key)
    getRepositorySampling(ref.repo).detailsFetched += 1
    try {
      const details = await getGithubJson(
        `https://api.github.com/repos/${ref.repo}/commits/${ref.sha}`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_commit',
      )
      const commit = enrichDashboardCommit(details, ref, canonicalLogin)
      if (!commit)
        return

      commits.push(commit)
      if (isPersonalCommit(commit) && hasUsablePatch(commit))
        getRepositorySampling(ref.repo).personalWithPatch += 1
    }
    catch {
      // A single inaccessible commit must not discard the rest of the evidence window.
    }
  }
  const enrichPersonalEvidence = async (): Promise<void> => {
    const refs = currentPersonalRefs()
    for (const ref of refs) {
      if (currentPersonalCommits().length >= DASHBOARD_GITHUB_LIMITS.targetPersonalCommits)
        break
      await fetchCommitDetails(ref)
    }
  }
  const needsMorePersonalEvidence = (): boolean => currentPersonalCommits().length < DASHBOARD_GITHUB_LIMITS.targetPersonalCommits

  await options?.onProgress?.({
    phase: 'repositories',
    context: progressContext(),
  })
  for (const repository of repositories) {
    await fetchHistoryPage(repository, 1, false)
    await fetchRepositoryRoot(repository)
  }

  await emitProgress('history')
  await enrichPersonalEvidence()

  for (const repository of fallbackRepositories) {
    if (!needsMorePersonalEvidence())
      break

    repositories.push(repository)
    await fetchHistoryPage(repository, 1, true)
    await fetchRepositoryRoot(repository)
    await emitProgress('repositories')
    await enrichPersonalEvidence()
  }

  if (needsMorePersonalEvidence()) {
    for (const repository of repositories) {
      if (!needsMorePersonalEvidence() || detailFetchedRefs.size >= DASHBOARD_GITHUB_LIMITS.maxDetailedCommits)
        break
      if ((historyPages.get(repository.repo) ?? 0) >= DASHBOARD_GITHUB_LIMITS.maxHistoryPagesPerRepository)
        continue

      try {
        await fetchHistoryPage(repository, 2, true)
      }
      catch {
        continue
      }
      await enrichPersonalEvidence()
    }
  }

  const candidateRefs = currentCandidateRefs()
  for (const ref of candidateRefs.filter(isIntegrationCommitRef)) {
    if (integrationDetails >= DASHBOARD_GITHUB_LIMITS.maxIntegrationDetails || detailFetchedRefs.size >= DASHBOARD_GITHUB_LIMITS.maxDetailedCommits)
      break
    integrationDetails += 1
    await fetchCommitDetails(ref)
  }

  await emitProgress('commits')

  const prsByKey = new Map<string, GithubPullRequest>()
  const checks: GithubCheckSummary[] = []
  for (const commit of currentPersonalCommits().slice(0, DASHBOARD_GITHUB_LIMITS.maxAssociatedPullRequestCommits)) {
    try {
      const associated = await getGithubJson(
        `https://api.github.com/repos/${commit.repo}/commits/${commit.sha}/pulls`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_pull_request',
      )
      for (const rawPullRequest of Array.isArray(associated) ? associated : []) {
        const pullRequest = parsePullRequest(rawPullRequest, commit.repo)
        if (pullRequest)
          prsByKey.set(`${pullRequest.repo}#${pullRequest.number}`, pullRequest)
      }
    }
    catch {
      continue
    }
  }

  const prs = Array.from(prsByKey.values()).slice(0, DASHBOARD_GITHUB_LIMITS.maxPullRequests)
  for (const pullRequest of prs.slice(0, DASHBOARD_GITHUB_LIMITS.maxReviewRequests)) {
    try {
      const reviews = await getGithubJson(
        `https://api.github.com/repos/${pullRequest.repo}/pulls/${pullRequest.number}/reviews?per_page=20`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_pull_request',
      )
      pullRequest.reviewCount = Array.isArray(reviews) ? reviews.length : 0
    }
    catch {
      pullRequest.reviewCount = 0
    }
  }

  await emitProgress('pull-requests', prs)

  for (const commit of currentPersonalCommits().slice(0, DASHBOARD_GITHUB_LIMITS.maxCheckRequests)) {
    try {
      const checkResponse = await getGithubJson(
        `https://api.github.com/repos/${commit.repo}/commits/${commit.sha}/check-runs?per_page=20`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_checks',
      )
      checks.push(parseCheckSummary(checkResponse, commit.repo, commit.sha))
    }
    catch {
      continue
    }
  }

  await emitProgress('checks', prs, checks)

  return {
    username: canonicalLogin,
    commits,
    prs,
    repositories,
    checks,
    collection: collectionSummary(prs, checks),
    sampling: samplingSummary(),
  }
}
