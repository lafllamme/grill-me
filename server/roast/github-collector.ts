import { createError } from "h3"
import type { RoastDebug } from "~~/shared/roast/contracts"
import { ROAST_DEFAULTS, ROAST_LIMITS } from "~~/shared/roast/contracts"
import { pushDebugRequest } from "./debug"

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
}

export interface GithubPullRequest {
  repo: string
  title: string
  url: string
  state: string
}

export interface GithubContext {
  username: string
  commits: GithubCommit[]
  prs: GithubPullRequest[]
}

interface GithubCommitRef {
  repo: string
  sha: string
  message: string
}

/**
 * Redacts likely secret patterns from patch snippets.
 */
const redactSecrets = (value: string): string => {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/(api[_-]?key|token|secret)\s*[:=]\s*['\"]?[^'\"\s]{8,}/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, "[REDACTED_KEY_BLOCK]")
}

/**
 * Keeps only a short, safe patch excerpt for prompt evidence.
 */
const trimPatch = (patch?: string): string | undefined => {
  if (!patch)
    return undefined

  const cleaned = redactSecrets(patch).trim()
  if (!cleaned)
    return undefined

  if (cleaned.length <= ROAST_LIMITS.maxPatchChars)
    return cleaned

  return `${cleaned.slice(0, ROAST_LIMITS.maxPatchChars)}\n...[truncated]`
}

const asNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

/**
 * Wraps fetch with abort timeout and normalized upstream timeout errors.
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  }
  catch (error: any) {
    if (error?.name === "AbortError") {
      throw createError({
        statusCode: 503,
        statusMessage: "GitHub request timed out",
        data: {
          code: "github_timeout",
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
const getGithubJson = async (
  url: string,
  token: string | undefined,
  timeoutMs: number,
  debug: RoastDebug | undefined,
  stage: "github_profile" | "github_events" | "github_commit",
): Promise<any> => {
  const startedAt = Date.now()
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "grill-me-app",
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
      statusMessage: "GitHub user or resource not found",
      data: {
        code: "github_not_found",
      },
    })
  }

  if (!response.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: "GitHub upstream failed",
      data: {
        code: "github_upstream_error",
      },
    })
  }

  return await response.json()
}

/**
 * Collects public user activity and enriches commit references with file-level evidence.
 */
export const collectGithubContext = async (
  username: string,
  githubToken: string | undefined,
  options?: {
    githubTimeoutMs?: number
    debug?: RoastDebug
  },
): Promise<GithubContext> => {
  const githubTimeoutMs = options?.githubTimeoutMs ?? ROAST_DEFAULTS.githubTimeoutMs
  const debug = options?.debug

  await getGithubJson(
    `https://api.github.com/users/${username}`,
    githubToken,
    githubTimeoutMs,
    debug,
    "github_profile",
  )

  const events = await getGithubJson(
    `https://api.github.com/users/${username}/events/public?per_page=${ROAST_LIMITS.eventsPerPage}`,
    githubToken,
    githubTimeoutMs,
    debug,
    "github_events",
  )

  const commitRefs = new Map<string, GithubCommitRef>()
  const prs: GithubPullRequest[] = []

  let pushEventCount = 0
  let pullRequestEventCount = 0

  for (const event of Array.isArray(events) ? events : []) {
    if (event.type === "PushEvent" && event.repo?.name) {
      pushEventCount += 1
      const repo = String(event.repo.name)

      const headSha = typeof event.payload?.head === "string" ? String(event.payload.head) : ""
      if (headSha && !commitRefs.has(headSha)) {
        commitRefs.set(headSha, {
          repo,
          sha: headSha,
          message: "",
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
            message: String(commit.message || ""),
          })

          if (commitRefs.size >= ROAST_LIMITS.maxCommitRefs)
            break
        }
      }
    }

    if (event.type === "PullRequestEvent" && event.repo?.name && event.payload?.pull_request) {
      pullRequestEventCount += 1
      prs.push({
        repo: String(event.repo.name),
        title: String(event.payload.pull_request.title || "Untitled PR"),
        url: String(event.payload.pull_request.html_url || ""),
        state: String(event.payload.pull_request.state || "unknown"),
      })
    }

    if (commitRefs.size >= ROAST_LIMITS.maxCommitRefs && prs.length >= ROAST_LIMITS.maxPrs)
      break
  }

  const candidateCommits = Array.from(commitRefs.values()).slice(0, ROAST_LIMITS.maxCommitRefs)
  let commitEnrichmentSkipped = 0

  const enrichedCommits = await Promise.all(candidateCommits.map(async (commitRef) => {
    try {
      const details = await getGithubJson(
        `https://api.github.com/repos/${commitRef.repo}/commits/${commitRef.sha}`,
        githubToken,
        githubTimeoutMs,
        debug,
        "github_commit",
      )
      const files = Array.isArray(details.files) ? details.files : []

      const commit: GithubCommit = {
        repo: commitRef.repo,
        sha: commitRef.sha,
        message: String(commitRef.message || details.commit?.message || ""),
        additions: asNumber(details.stats?.additions),
        deletions: asNumber(details.stats?.deletions),
        changedFiles: asNumber(details.files?.length),
        files: files.slice(0, ROAST_LIMITS.maxFilesPerCommit).map((file: any) => ({
          filename: String(file.filename || "unknown"),
          status: String(file.status || "modified"),
          additions: asNumber(file.additions),
          deletions: asNumber(file.deletions),
          patch: trimPatch(typeof file.patch === "string" ? file.patch : undefined),
        })),
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
      commitEnriched: commits.length,
      commitEnrichmentSkipped,
    }
  }

  return {
    username,
    commits,
    prs: prs.slice(0, ROAST_LIMITS.maxPrs),
  }
}
