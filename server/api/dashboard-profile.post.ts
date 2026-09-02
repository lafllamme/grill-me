import { createError, getRequestIP, readBody } from 'h3'
import { validateGithubUsername } from '../roast/contracts-adapter'
import { runDashboardProfileAnalysis } from '../roast/dashboard-profile-service'
import { logServerDebug } from '../roast/debug'
import { checkRateLimit } from '../roast/rate-limit'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  const body = await readBody<{ username?: unknown }>(event)
  if (typeof body?.username !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'username is required', data: { code: 'invalid_request' } })
  }

  const username = validateGithubUsername(body.username)
  const config = useRuntimeConfig(event)
  checkRateLimit(getRequestIP(event, { xForwardedFor: true }) || 'unknown')
  const analysis = await runDashboardProfileAnalysis({
    username,
    githubToken: config.githubToken || undefined,
    cfAccountId: config.cfAccountId || undefined,
    cfApiToken: config.cfApiToken || undefined,
    cfAiModel: config.cfAiModel || undefined,
    githubTimeoutMs: Number(config.githubTimeoutMs) || 12_000,
    aiTimeoutMs: Number(config.cfAiTimeoutMs) || 30_000,
    aiMaxTokens: Number(config.cfAiMaxTokens) || 2200,
  })
  const { assessment, evidence } = analysis.response

  logServerDebug('dashboard-profile-summary', {
    username,
    durationMs: analysis.timingsMs.total || Date.now() - startedAt,
    githubDurationMs: analysis.timingsMs.github,
    aiDurationMs: analysis.timingsMs.ai,
    collection: analysis.context.collection,
    derivedMetrics: assessment.derivedMetrics,
    scores: assessment.scores,
    overallScore: assessment.overallScore,
    grade: assessment.grade,
    role: assessment.role,
    roleStatus: assessment.roleStatus,
    safetyAiDefenseBonus: assessment.safetyAiDefenseBonus,
    aiReview: {
      status: analysis.aiReview.status,
      confidence: analysis.aiReview.confidence,
      diagnostic: analysis.aiReview.diagnostic,
      parseWarnings: analysis.aiReview.parseWarnings ?? [],
      responsePath: analysis.aiReview.responsePath,
      responseShape: analysis.aiReview.responseShape,
      selectedCommitCount: analysis.aiReview.selectedCommitCount,
      patchCount: analysis.aiReview.patchCount,
      patchChars: analysis.aiReview.patchChars,
      findingCount: analysis.aiReview.findings.length,
    },
    acceptedSafetyRiskCount: assessment.aiSafety?.signals.filter(signal => signal.verdict === 'risk' && signal.impact === 'introduced').length ?? 0,
    acceptedSafetyDefenseCount: assessment.aiSafety?.signals.filter(signal => signal.verdict === 'safe' && (signal.impact === 'introduced' || signal.impact === 'fixed')).length ?? 0,
  })

  return { assessment, evidence }
})
