import type { DashboardProfileStreamEvent } from '~~/shared/dashboard/contracts'
import { randomUUID } from 'node:crypto'
import { getRequestIP, readBody, setResponseStatus } from 'h3'
import { createDashboardTrace, resolveDashboardTraceLevel } from '~~/shared/dashboard/trace'
import { validateGithubUsername } from '../../roast/contracts-adapter'
import { runDashboardProfileAnalysis } from '../../roast/dashboard'
import { createDashboardTraceFileSink } from '../../roast/dashboard/trace-file'
import { toErrorBody, toHandledError } from '../../roast/orchestrator'
import { checkRateLimit } from '../../roast/rate-limit'

const githubProgressMessages = {
  'profile': 'GitHub identity confirmed.',
  'repositories': 'Repository scope mapped.',
  'history': 'Personal commit history collected.',
  'commits': 'Commit evidence is ready for scoring.',
  'pull-requests': 'Review context attached.',
  'checks': 'GitHub evidence pass complete.',
} as const

export default defineEventHandler(async (event) => {
  const requestId = randomUUID().slice(0, 8)
  const body = await readBody<{ username?: unknown }>(event)

  if (typeof body?.username !== 'string') {
    setResponseStatus(event, 400)
    return toErrorBody('invalid_request', 'username is required')
  }

  let username: string
  try {
    username = validateGithubUsername(body.username)
    checkRateLimit(getRequestIP(event, { xForwardedFor: true }) || 'unknown')
  }
  catch (error) {
    const handled = toHandledError(error)
    setResponseStatus(event, handled.statusCode)
    return toErrorBody(handled.code, handled.statusMessage)
  }

  const config = useRuntimeConfig(event)
  const encoder = new TextEncoder()
  const traceLevel = resolveDashboardTraceLevel(config.dashboardTraceLevel)
  const traceFile = createDashboardTraceFileSink({
    directory: config.dashboardTraceFileDir,
    requestId,
    username,
    level: traceLevel,
  })
  const trace = createDashboardTrace({
    requestId,
    username,
    source: 'server',
    level: traceLevel,
    onRender: traceFile?.onRender,
  })

  const stream = new ReadableStream<Uint8Array>({
    start: async (controller) => {
      const writeEvent = (payload: DashboardProfileStreamEvent): void => {
        const chunk = `event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`
        controller.enqueue(encoder.encode(chunk))
      }

      try {
        writeEvent({ type: 'meta', requestId, username })
        const analysis = await runDashboardProfileAnalysis({
          username,
          githubToken: config.githubToken || undefined,
          cfAccountId: config.cfAccountId || undefined,
          cfApiToken: config.cfApiToken || undefined,
          cfAiModel: config.cfAiModel || undefined,
          githubTimeoutMs: Number(config.githubTimeoutMs) || 12_000,
          aiTimeoutMs: Number(config.cfAiTimeoutMs) || 30_000,
          aiMaxTokens: Number(config.cfAiMaxTokens) || 2200,
          trace,
        }, {
          onStatus: (phase, message) => writeEvent({ type: 'status', phase, message }),
          onGithubProgress: (progress) => {
            const collection = progress.context.collection
            writeEvent({
              type: 'github_progress',
              phase: progress.phase,
              message: githubProgressMessages[progress.phase],
              counts: {
                repositories: collection?.repositories ?? progress.context.repositories?.length ?? 0,
                candidateCommits: collection?.candidateCommits ?? 0,
                enrichedCommits: collection?.enrichedCommits ?? progress.context.commits.length,
                usablePatches: collection?.usablePatches ?? 0,
                associatedPullRequests: collection?.associatedPullRequests ?? progress.context.prs.length,
                checkSummaries: collection?.checkSummaries ?? progress.context.checks?.length ?? 0,
              },
            })
          },
          onEvidence: evidence => writeEvent({ type: 'evidence', evidence }),
          onDeterministicScores: assessment => writeEvent({ type: 'deterministic_scores', assessment }),
        })

        writeEvent({ type: 'done', data: analysis.response })
      }
      catch (error) {
        const handled = toHandledError(error)
        writeEvent({
          type: 'error',
          error: toErrorBody(handled.code, handled.statusMessage).error,
        })
      }
      finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
})
