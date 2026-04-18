import { consola } from "consola"
import { createError } from "h3"
import {
    GITHUB_USERNAME_REGEX,
    ROAST_DEFAULTS,
    ROAST_LIMITS,
    type DebugRequestInfo,
    type RoastDebug,
    type RoastMeta,
    type RoastResponse,
} from "~~/shared/roast/contracts"

interface GithubFetchDebug {
  eventsCount: number
  pushEventCount: number
  pullRequestEventCount: number
  commitRefsFound: number
  commitCandidates: number
  commitEnriched: number
  commitEnrichmentSkipped: number
}

interface AiDebug {
  model: string
  maxTokens: number
  timeoutMs: number
  systemPrompt: string
  userPayload: {
    username: string
    commits: number
    prs: number
    payload: unknown
  }
  responsePreview: string
}

interface GithubCommitSummary {
  repo: string
  sha: string
  message: string
}

interface GithubCommitEnriched extends GithubCommitSummary {
  files: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
    patch?: string
  }>
  additions: number
  deletions: number
  changedFiles: number
}

interface GithubPrSummary {
  repo: string
  title: string
  url: string
  state: string
}

export interface GithubContext {
  username: string
  commits: GithubCommitEnriched[]
  prs: GithubPrSummary[]
}

const rateLimitStore = new Map<string, { count: number, resetAt: number }>()

/**
 * Creates a fresh debug report for one roast request.
 */
const createDebugReport = (username: string): RoastDebug => ({
  username,
  timingsMs: {},
  requests: [],
})

/**
 * Redacts common secret patterns from raw text before logging/prompting.
 */
const redactSecrets = (value: string): string => {
  return value
    .replace(/gh[pousr]_[A-Za-z0-9]{20,}/g, "[REDACTED_GITHUB_TOKEN]")
    .replace(/(api[_-]?key|token|secret)\s*[:=]\s*['\"]?[^'\"\s]{8,}/gi, "$1=[REDACTED]")
    .replace(/-----BEGIN [A-Z ]+-----[\s\S]*?-----END [A-Z ]+-----/g, "[REDACTED_KEY_BLOCK]")
}

/**
 * Reduces noisy patch content while preserving useful context for the model.
 */
const trimPatch = (patch?: string): string | undefined => {
  if (!patch)
    return undefined

  const cleaned = redactSecrets(patch).trim()
  if (!cleaned)
    return undefined

  return cleaned.length > ROAST_LIMITS.maxPatchChars ? `${cleaned.slice(0, ROAST_LIMITS.maxPatchChars)}\n...[truncated]` : cleaned
}

const asNumber = (value: unknown): number => {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

const pushDebugRequest = (debug: RoastDebug | undefined, request: DebugRequestInfo): void => {
  debug?.requests.push(request)
}

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs: number,
  timeoutCode: string,
  timeoutMessage: string,
  stage: "github" | "cloudflare_ai",
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
        statusMessage: timeoutMessage,
        data: {
          code: timeoutCode,
          stage,
        },
      })
    }
    throw error
  }
  finally {
    clearTimeout(timer)
  }
}

const withPromiseTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutCode: string,
  timeoutMessage: string,
  stage: "github" | "cloudflare_ai",
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(createError({
        statusCode: 503,
        statusMessage: timeoutMessage,
        data: {
          code: timeoutCode,
          stage,
        },
      }))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  }
  finally {
    if (timeoutId)
      clearTimeout(timeoutId)
  }
}

const getJson = async (url: string, token: string | undefined, timeoutMs: number): Promise<any> => {
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
    "github_timeout",
    "GitHub request timed out",
    "github",
  )

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

  return await withPromiseTimeout(
    response.json(),
    timeoutMs,
    "github_timeout",
    "GitHub response timed out",
    "github",
  )
}

/**
 * Validates and normalizes a GitHub username.
 */
export const validateGithubUsername = (value: string): string => {
  const trimmed = value.trim().replace(/^@/, "")
  if (!GITHUB_USERNAME_REGEX.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid GitHub username",
      data: {
        code: "invalid_username",
      },
    })
  }

  return trimmed
}

/**
 * Enforces a simple in-memory IP-based rate limit.
 */
export const checkRateLimit = (ip: string, max = ROAST_DEFAULTS.rateLimitMax, windowMs = ROAST_DEFAULTS.rateLimitWindowMs): void => {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs })
    return
  }

  if (entry.count >= max) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too many requests",
      data: {
        code: "rate_limited",
      },
    })
  }

  entry.count += 1
}

/**
 * Fetches and compacts publicly available GitHub activity for one user.
 */
export const fetchGithubContext = async (
  username: string,
  githubToken?: string,
  options?: {
    githubTimeoutMs?: number
    debug?: RoastDebug
  },
): Promise<GithubContext> => {
  const githubTimeoutMs = options?.githubTimeoutMs || ROAST_DEFAULTS.githubTimeoutMs
  const debug = options?.debug

  const profileUrl = `https://api.github.com/users/${username}`
  const profileStartedAt = Date.now()
  await getJson(profileUrl, githubToken, githubTimeoutMs)
  debug?.requests.push({
    stage: "github_profile",
    url: profileUrl,
    durationMs: Date.now() - profileStartedAt,
    ok: true,
    statusCode: 200,
  })

  const eventsUrl = `https://api.github.com/users/${username}/events/public?per_page=${ROAST_LIMITS.eventsPerPage}`
  const eventsStartedAt = Date.now()
  const events = await getJson(eventsUrl, githubToken, githubTimeoutMs)
  pushDebugRequest(debug, {
    stage: "github_events",
    url: eventsUrl,
    durationMs: Date.now() - eventsStartedAt,
    ok: true,
    statusCode: 200,
  })

  const commitRefs = new Map<string, GithubCommitSummary>()
  const prs: GithubPrSummary[] = []
  let pushEventCount = 0
  let pullRequestEventCount = 0

  for (const event of events as any[]) {
    if (event.type === "PushEvent" && event.repo?.name) {
      pushEventCount += 1
      const repo = String(event.repo.name)

      // Newer GitHub public events can omit payload.commits and only expose payload.head.
      const headSha = typeof event.payload?.head === "string" ? String(event.payload.head) : ""
      if (headSha && !commitRefs.has(headSha)) {
        commitRefs.set(headSha, {
          repo,
          sha: headSha,
          message: "",
        })
      }

      if (Array.isArray(event.payload?.commits)) {
        for (const commit of event.payload.commits as any[]) {
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

  const commitCandidates = Array.from(commitRefs.values()).slice(0, ROAST_LIMITS.maxCommitRefs)
  let commitEnrichmentSkipped = 0
  const enrichedCommits = await Promise.all(
    commitCandidates.map(async (commitRef) => {
      try {
        const commitUrl = `https://api.github.com/repos/${commitRef.repo}/commits/${commitRef.sha}`
        const commitStartedAt = Date.now()
        const details = await getJson(commitUrl, githubToken, githubTimeoutMs)
        pushDebugRequest(debug, {
          stage: "github_commit",
          url: commitUrl,
          durationMs: Date.now() - commitStartedAt,
          ok: true,
          statusCode: 200,
        })
        const files = Array.isArray(details.files) ? details.files : []

        return {
          ...commitRef,
          files: files.slice(0, ROAST_LIMITS.maxFilesPerCommit).map((file: any) => ({
            filename: String(file.filename || "unknown"),
            status: String(file.status || "modified"),
            additions: asNumber(file.additions),
            deletions: asNumber(file.deletions),
            patch: trimPatch(typeof file.patch === "string" ? file.patch : undefined),
          })),
          additions: asNumber(details.stats?.additions),
          deletions: asNumber(details.stats?.deletions),
          changedFiles: asNumber(details.files?.length),
        } as GithubCommitEnriched
      }
      catch (error: any) {
        commitEnrichmentSkipped += 1
        consola.info("[roast] commit enrichment skipped", {
          repo: commitRef.repo,
          sha: commitRef.sha,
          statusCode: error?.statusCode,
          message: error?.statusMessage || error?.message,
        })
        pushDebugRequest(debug, {
          stage: "github_commit",
          url: `https://api.github.com/repos/${commitRef.repo}/commits/${commitRef.sha}`,
          durationMs: 0,
          ok: false,
          statusCode: Number(error?.statusCode || 0) || undefined,
        })
        return null
      }
    }),
  )

  const commits = enrichedCommits.filter((commit): commit is GithubCommitEnriched => Boolean(commit))
  if (debug) {
    debug.github = {
      eventsCount: Array.isArray(events) ? events.length : 0,
      pushEventCount,
      pullRequestEventCount,
      commitRefsFound: commitRefs.size,
      commitCandidates: commitCandidates.length,
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

/**
 * Fallback roast used when no relevant public activity is found.
 */
const roastFallback = (username: string, meta: RoastMeta): RoastResponse => ({
  username,
  roast: `No juicy public activity for @${username} right now. Your commit history is either clean, hidden, or suspiciously absent.`,
  feedback: [
    "Push a few recent commits so the roast has real material.",
    "Open at least one PR with a meaningful diff, not just typo fixes.",
    "Use descriptive commit messages to make analysis less guessy.",
  ],
  meta,
})

/**
 * Parses model output and attempts to recover roast+feedback from imperfect JSON/text.
 */
const parseAiPayload = (raw: string): { roast: string, feedback: string[] } => {
  const decodeJsonString = (input: string): string => {
    try {
      return JSON.parse(`"${input}"`)
    }
    catch {
      return input
    }
  }

  const parseStructuredPayload = (candidate: string): { roast: string, feedback: string[] } | null => {
    try {
      const parsed = JSON.parse(candidate)
      const roast = typeof parsed.roast === "string" ? parsed.roast.trim() : ""
      const feedback = Array.isArray(parsed.feedback)
        ? parsed.feedback.filter((item: unknown) => typeof item === "string").map((item: string) => item.trim()).filter(Boolean)
        : []

      return roast ? { roast, feedback } : null
    }
    catch {
      return null
    }
  }

  const fencedCandidate = raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim()
  const balancedJsonCandidate = (() => {
    const first = raw.indexOf("{")
    const last = raw.lastIndexOf("}")
    if (first >= 0 && last > first)
      return raw.slice(first, last + 1).trim()
    return ""
  })()

  const directParsed = parseStructuredPayload(raw)
    || parseStructuredPayload(fencedCandidate)
    || (balancedJsonCandidate ? parseStructuredPayload(balancedJsonCandidate) : null)

  if (directParsed)
    return directParsed

  const roastMatch = raw.match(/"roast"\s*:\s*"((?:\\.|[^"\\])*)"/i)
  const feedbackMatch = raw.match(/"feedback"\s*:\s*\[((?:.|\n|\r)*?)\]/i)

  if (roastMatch) {
    const roast = decodeJsonString(roastMatch[1]).trim()
    const feedback = feedbackMatch
      ? [...feedbackMatch[1].matchAll(/"((?:\\.|[^"\\])*)"/g)]
          .map(match => decodeJsonString(match[1]).trim())
          .filter(Boolean)
      : []

    if (roast)
      return { roast, feedback }
  }

  const lines = raw.split("\n").map(line => line.trim()).filter(Boolean)
  const feedback = lines
    .filter(line => /^[-*•\d.\)]\s*/.test(line))
    .map(line => line.replace(/^[-*•\d.\)\s]+/, "").trim())
    .filter(Boolean)

  const roast = lines.filter(line => !/^[-*•\d.\)]\s*/.test(line)).join(" ").trim()

  return {
    roast: roast || "Your diff reads like a race condition won against readability.",
    feedback,
  }
}

/**
 * Generates roast text from compacted GitHub context using Cloudflare AI.
 */
export const generateRoast = async (context: GithubContext, env: {
  accountId?: string
  apiToken?: string
  model?: string
  aiTimeoutMs?: number
  aiMaxTokens?: number
  debug?: RoastDebug
}): Promise<RoastResponse> => {
  const aiTimeoutMs = env.aiTimeoutMs || ROAST_DEFAULTS.aiTimeoutMs
  const aiMaxTokens = env.aiMaxTokens || ROAST_DEFAULTS.aiMaxTokens
  const debug = env.debug

  const meta: RoastMeta = {
    commitCount: context.commits.length,
    prCount: context.prs.length,
  }

  if (meta.commitCount === 0 && meta.prCount === 0)
    return roastFallback(context.username, meta)

  if (!env.accountId || !env.apiToken || !env.model) {
    throw createError({
      statusCode: 503,
      statusMessage: "Cloudflare AI is not configured",
      data: {
        code: "cloudflare_ai_not_configured",
      },
    })
  }

  const promptPayload = {
    username: context.username,
    commits: context.commits.map(commit => ({
      repo: commit.repo,
      sha: commit.sha.slice(0, 7),
      message: redactSecrets(commit.message),
      additions: commit.additions,
      deletions: commit.deletions,
      changedFiles: commit.changedFiles,
      files: commit.files.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
        patch: file.patch,
      })),
    })),
    prs: context.prs,
  }
  const systemPrompt = [
    "You are a dry, technical code roast assistant.",
    "Return strict JSON only: {\"roast\":\"string\",\"feedback\":[\"string\",\"string\",\"string\"]}.",
    "No markdown. No code fences. No extra keys.",
    "Roast constraints: 90-140 words, technical, punchy, no personal attacks.",
    "Feedback constraints: exactly 3 actionable bullets, each <= 14 words.",
    "Attack code quality, architecture, commit hygiene, and test discipline only.",
    "Never expose or repeat secrets.",
  ].join(" ")

  const aiRequestUrl = `https://api.cloudflare.com/client/v4/accounts/${env.accountId}/ai/run/${env.model}`
  const aiStartedAt = Date.now()
  const response = await fetchWithTimeout(
    aiRequestUrl,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: JSON.stringify(promptPayload),
          },
        ],
        stream: false,
        max_tokens: aiMaxTokens,
        temperature: 0.35,
        top_p: 0.9,
      }),
    },
    aiTimeoutMs,
    "cloudflare_ai_timeout",
    "Cloudflare AI request timed out",
    "cloudflare_ai",
  )
  pushDebugRequest(debug, {
    stage: "cloudflare_ai",
    url: aiRequestUrl,
    durationMs: Date.now() - aiStartedAt,
    ok: response.ok,
    statusCode: response.status,
  })

  if (!response.ok) {
    throw createError({
      statusCode: response.status >= 500 ? 503 : 502,
      statusMessage: "Cloudflare AI upstream failed",
      data: {
        code: "cloudflare_ai_error",
      },
    })
  }

  const payload = await withPromiseTimeout(
    response.json() as Promise<any>,
    aiTimeoutMs,
    "cloudflare_ai_timeout",
    "Cloudflare AI response timed out",
    "cloudflare_ai",
  )
  const rawText = String(
    payload?.result?.response
    ?? payload?.result?.output_text
    ?? payload?.result?.text
    ?? "",
  )
  if (debug) {
    debug.ai = {
      model: env.model,
      maxTokens: aiMaxTokens,
      timeoutMs: aiTimeoutMs,
      systemPrompt,
      userPayload: {
        username: promptPayload.username,
        commits: promptPayload.commits.length,
        prs: promptPayload.prs.length,
        payload: promptPayload,
      },
      responsePreview: rawText.slice(0, ROAST_LIMITS.maxResponsePreviewChars),
    }
  }

  const parsed = parseAiPayload(rawText)
  const roastWordBudget = parsed.roast.split(/\s+/).filter(Boolean).slice(0, ROAST_LIMITS.maxRoastWords)
  const roast = roastWordBudget.join(" ").trim() || "Your diff reads like a race condition won against readability."

  const feedbackPool = parsed.feedback.length > 0
    ? parsed.feedback
    : [
        "Reduce churn by keeping commits focused on one concern.",
        "Use clearer naming in modified files to lower cognitive load.",
        "Add tests for high-risk changes before refactors.",
      ]

  const feedback = feedbackPool.slice(0, ROAST_LIMITS.maxFeedbackItems)
  while (feedback.length < ROAST_LIMITS.minFeedbackItems) {
    feedback.push("Ship smaller, reviewable diffs with explicit intent in each commit message.")
  }

  return {
    username: context.username,
    roast,
    feedback,
    meta,
    ...(debug ? { debug } : {}),
  }
}

export { createDebugReport }
