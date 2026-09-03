import { randomUUID } from 'node:crypto'
import { createError, getRequestIP, readBody } from 'h3'
import { createDashboardTrace, resolveDashboardTraceLevel } from '~~/shared/dashboard/trace'
import { validateGithubUsername } from '../roast/contracts-adapter'
import { runDashboardProfileAnalysis } from '../roast/dashboard'
import { createDashboardTraceFileSink } from '../roast/dashboard/trace-file'
import { checkRateLimit } from '../roast/rate-limit'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown }>(event)
  if (typeof body?.username !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'username is required', data: { code: 'invalid_request' } })
  }

  const username = validateGithubUsername(body.username)
  const config = useRuntimeConfig(event)
  checkRateLimit(getRequestIP(event, { xForwardedFor: true }) || 'unknown')
  const requestId = randomUUID().slice(0, 8)
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
  })
  const { assessment, evidence } = analysis.response

  return { assessment, evidence }
})
