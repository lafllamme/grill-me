import { createError, readBody } from 'h3'
import { validateGithubUsername } from '../roast/contracts-adapter'
import { assessDashboardProfileWithAi, toDashboardAiSafetyAssessment } from '../roast/dashboard-ai-scoring'
import { scoreDashboardProfile } from '../roast/dashboard-profile-scoring'
import { logServerDebug } from '../roast/debug'
import { collectDashboardGithubContext } from '../roast/github-collector'

export default defineEventHandler(async (event) => {
  const startedAt = Date.now()
  const body = await readBody<{ username?: unknown }>(event)
  if (typeof body?.username !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'username is required', data: { code: 'invalid_request' } })
  }

  const username = validateGithubUsername(body.username)
  const config = useRuntimeConfig(event)
  const githubStartedAt = Date.now()
  const context = await collectDashboardGithubContext(username, config.githubToken || undefined, {
    githubTimeoutMs: Number(config.githubTimeoutMs) || undefined,
  })
  const githubDurationMs = Date.now() - githubStartedAt
  const aiStartedAt = Date.now()
  const aiReview = await assessDashboardProfileWithAi({
    context,
    accountId: config.cfAccountId,
    apiToken: config.cfApiToken,
    model: config.cfAiModel,
    timeoutMs: Number(config.cfAiTimeoutMs) || 30_000,
    maxTokens: Number(config.cfAiMaxTokens) || 2200,
  })
  const aiDurationMs = Date.now() - aiStartedAt
  const aiSafety = toDashboardAiSafetyAssessment(aiReview)
  const assessment = scoreDashboardProfile(context, aiSafety, aiReview)

  logServerDebug('dashboard-profile-summary', {
    username,
    durationMs: Date.now() - startedAt,
    githubDurationMs,
    aiDurationMs,
    collection: context.collection,
    derivedMetrics: assessment.derivedMetrics,
    scores: assessment.scores,
    overallScore: assessment.overallScore,
    grade: assessment.grade,
    role: assessment.role,
    roleStatus: assessment.roleStatus,
    aiReview: {
      status: aiReview.status,
      confidence: aiReview.confidence,
      selectedCommitCount: aiReview.selectedCommitCount,
      patchCount: aiReview.patchCount,
      patchChars: aiReview.patchChars,
      findingCount: aiReview.findings.length,
    },
    acceptedSafetyRiskCount: aiSafety.signals.filter(signal => signal.verdict === 'risk' && signal.impact === 'introduced').length,
  })

  return {
    assessment,
    evidence: {
      commits: context.commits.map(commit => ({
        repo: commit.repo,
        sha: commit.sha,
        message: commit.message,
        additions: commit.additions,
        deletions: commit.deletions,
        changedFiles: commit.changedFiles,
        committedAt: commit.committedAt,
        files: commit.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
        })),
      })),
      pullRequests: context.prs,
      repositories: context.repositories ?? [],
      checks: context.checks ?? [],
      collection: context.collection,
    },
  }
})
