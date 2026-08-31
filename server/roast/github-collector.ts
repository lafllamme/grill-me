import type { RoastDebug, RoastDebugLevel } from '~~/shared/roast/contracts'
import { createError } from 'h3'
import { ROAST_DEFAULTS, ROAST_LIMITS } from '~~/shared/roast/contracts'
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
}

interface GithubCommitRef {
  repo: string
  sha: string
  message: string
  committedAt?: string
  authorLogin?: string
  committerLogin?: string
  parentCount?: number
  isMerge?: boolean
}

export const DASHBOARD_GITHUB_LIMITS = {
  maxRepositories: 3,
  maxRepositoryCandidates: 5,
  maxHistoryCommitsPerRepository: 12,
  maxCandidateCommits: 30,
  maxDetailedCommits: 18,
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

  const commitRefs = new Map<string, GithubCommitRef>()
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

function parseCommitRef(raw: any, repo: string, username: string): GithubCommitRef | null {
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

function enrichDashboardCommit(details: any, ref: GithubCommitRef, username: string): GithubCommit | null {
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

function commitTimestamp(value?: string): number {
  if (!value)
    return 0
  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

/**
 * Collects a bounded repository-first evidence pack for dashboard scoring.
 * Repository metadata is a sampling scope only; it is never a quality score.
 */
export async function collectDashboardGithubContext(username: string, githubToken: string | undefined, options?: {
  githubTimeoutMs?: number
  debug?: RoastDebug
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
  const repositoryResponse = await getGithubJson(
    `https://api.github.com/users/${encodeURIComponent(canonicalLogin)}/repos?type=owner&sort=pushed&direction=desc&per_page=${DASHBOARD_GITHUB_LIMITS.maxRepositoryCandidates}`,
    githubToken,
    githubTimeoutMs,
    debug,
    'github_repositories',
  )
  const rawRepositories = Array.isArray(repositoryResponse) ? repositoryResponse : []
  const selectedRawRepositories = rawRepositories
    .filter(repository => !repository?.fork && !repository?.archived)
    .slice(0, DASHBOARD_GITHUB_LIMITS.maxRepositories)
  const repositories = selectedRawRepositories
    .map(parseRepositoryEvidence)
    .filter((repository): repository is GithubRepositoryEvidence => Boolean(repository))

  const commitRefs = new Map<string, GithubCommitRef>()
  for (const repository of repositories) {
    const history = await getGithubJson(
      `https://api.github.com/repos/${repository.repo}/commits?author=${encodeURIComponent(canonicalLogin)}&per_page=${DASHBOARD_GITHUB_LIMITS.maxHistoryCommitsPerRepository}`,
      githubToken,
      githubTimeoutMs,
      debug,
      'github_history',
    )

    for (const rawCommit of Array.isArray(history) ? history : []) {
      const ref = parseCommitRef(rawCommit, repository.repo, canonicalLogin)
      if (ref)
        commitRefs.set(`${ref.repo}:${ref.sha}`, ref)
    }

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

  const candidateRefs = Array.from(commitRefs.values())
    .sort((left, right) => commitTimestamp(right.committedAt) - commitTimestamp(left.committedAt) || right.sha.localeCompare(left.sha))
    .slice(0, DASHBOARD_GITHUB_LIMITS.maxCandidateCommits)
  const commits: GithubCommit[] = []
  for (const ref of candidateRefs.slice(0, DASHBOARD_GITHUB_LIMITS.maxDetailedCommits)) {
    try {
      const details = await getGithubJson(
        `https://api.github.com/repos/${ref.repo}/commits/${ref.sha}`,
        githubToken,
        githubTimeoutMs,
        debug,
        'github_commit',
      )
      const commit = enrichDashboardCommit(details, ref, canonicalLogin)
      if (commit)
        commits.push(commit)
    }
    catch {
      continue
    }
  }

  const prsByKey = new Map<string, GithubPullRequest>()
  const checks: GithubCheckSummary[] = []
  for (const commit of commits.slice(0, DASHBOARD_GITHUB_LIMITS.maxAssociatedPullRequestCommits)) {
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

  for (const commit of commits.slice(0, DASHBOARD_GITHUB_LIMITS.maxCheckRequests)) {
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

  return {
    username: canonicalLogin,
    commits,
    prs,
    repositories,
    checks,
    collection: {
      mode: 'dashboard',
      repositories: repositories.length,
      candidateCommits: candidateRefs.length,
      enrichedCommits: commits.length,
      usablePatches: commits.filter(commit => commit.files.some(file => Boolean(file.patch?.trim()))).length,
      associatedPullRequests: prs.length,
      checkSummaries: checks.length,
    },
  }
}
