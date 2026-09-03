import type { DashboardEvidence, DashboardProfileAssessment, DashboardProfileResponse, DashboardProfileStreamPhase } from '~~/shared/dashboard/contracts'
import type { DashboardTrace } from '~~/shared/dashboard/trace'
import type { GithubCollectionProgress, GithubContext } from '../github-collector'
import type { DashboardAiReviewAssessment } from './ai-review'
import { collectDashboardGithubContext } from '../github-collector'
import { assessDashboardProfileWithAi, buildDashboardAiReviewBaseline, toDashboardAiSafetyAssessment } from './ai-review'
import { toDashboardEvidence } from './evidence'
import { scoreDashboardProfile } from './scoring'

export interface DashboardProfileAnalysisInput {
  username: string
  githubToken?: string
  cfAccountId?: string
  cfApiToken?: string
  cfAiModel?: string
  githubTimeoutMs: number
  aiTimeoutMs: number
  aiMaxTokens: number
  trace?: DashboardTrace
}

export interface DashboardProfileAnalysisHooks {
  onStatus?: (phase: DashboardProfileStreamPhase, message: string) => void | Promise<void>
  onGithubProgress?: (progress: GithubCollectionProgress) => void | Promise<void>
  onEvidence?: (evidence: DashboardEvidence) => void | Promise<void>
  onDeterministicScores?: (assessment: DashboardProfileAssessment) => void | Promise<void>
}

export interface DashboardProfileAnalysisResult {
  response: DashboardProfileResponse
  context: GithubContext
  aiReview: DashboardAiReviewAssessment
  timingsMs: {
    github: number
    ai: number
    total: number
  }
}

function patchCharacterCount(context: GithubContext): number {
  return context.commits.reduce((total, commit) => total + commit.files.reduce((fileTotal, file) => fileTotal + (file.patch?.length ?? 0), 0), 0)
}

function contextCounts(context: GithubContext): Record<string, number> {
  return {
    repositories: context.repositories?.length ?? 0,
    commits: context.commits.length,
    pullRequests: context.prs.length,
    checks: context.checks?.length ?? 0,
    patchCharacters: patchCharacterCount(context),
  }
}

export async function runDashboardProfileAnalysis(
  input: DashboardProfileAnalysisInput,
  hooks?: DashboardProfileAnalysisHooks,
): Promise<DashboardProfileAnalysisResult> {
  const startedAt = Date.now()
  const trace = input.trace

  trace?.log('grill', 'request-start', { githubTimeoutMs: input.githubTimeoutMs, aiTimeoutMs: input.aiTimeoutMs })
  await hooks?.onStatus?.('collecting-github', 'Collecting public GitHub evidence...')
  trace?.log('github', 'fetch-start')
  const githubStartedAt = Date.now()
  const context = await collectDashboardGithubContext(input.username, input.githubToken, {
    githubTimeoutMs: input.githubTimeoutMs,
    onProgress: (progress) => {
      trace?.log('github', 'progress', {
        phase: progress.phase,
        ...contextCounts(progress.context),
      })
      return hooks?.onGithubProgress?.(progress)
    },
  })
  const githubDurationMs = Date.now() - githubStartedAt
  trace?.log('github', 'collection-complete', {
    durationMs: githubDurationMs,
    ...contextCounts(context),
    collection: context.collection,
    commits: context.commits.map(commit => ({
      repo: commit.repo,
      sha: commit.sha,
      message: commit.message,
      additions: commit.additions,
      deletions: commit.deletions,
      changedFiles: commit.changedFiles,
      committedAt: commit.committedAt,
      isMerge: commit.isMerge,
    })),
  })
  const evidence = toDashboardEvidence(context)
  trace?.log('github', 'evidence-ready', {
    commitCount: evidence.commits.length,
    pullRequestCount: evidence.pullRequests.length,
    repositoryCount: evidence.repositories?.length ?? 0,
  })
  await hooks?.onEvidence?.(evidence)

  await hooks?.onStatus?.('scoring', 'Calculating deterministic profile signals...')
  const deterministicAssessment = scoreDashboardProfile(context)
  trace?.log('grill', 'scores-calculated', {
    scores: deterministicAssessment.scores,
    overallScore: deterministicAssessment.overallScore,
    grade: deterministicAssessment.grade,
    role: deterministicAssessment.role,
    metrics: deterministicAssessment.derivedMetrics,
  })
  await hooks?.onDeterministicScores?.(deterministicAssessment)
  const aiBaseline = buildDashboardAiReviewBaseline(deterministicAssessment.scores, deterministicAssessment.derivedMetrics)

  await hooks?.onStatus?.('reviewing-ai', 'Reviewing selected patch evidence with AI...')
  const aiStartedAt = Date.now()
  const aiReview = await assessDashboardProfileWithAi({
    context,
    baseline: aiBaseline,
    accountId: input.cfAccountId,
    apiToken: input.cfApiToken,
    model: input.cfAiModel,
    timeoutMs: input.aiTimeoutMs,
    maxTokens: input.aiMaxTokens,
    trace,
  })
  const aiDurationMs = Date.now() - aiStartedAt
  const assessment = scoreDashboardProfile(context, toDashboardAiSafetyAssessment(aiReview), aiReview)

  await hooks?.onStatus?.('finalizing', 'Finalizing the dashboard profile...')
  trace?.log('grill', 'finalized', {
    durationMs: Date.now() - startedAt,
    githubDurationMs,
    aiDurationMs,
    scores: assessment.scores,
    overallScore: assessment.overallScore,
    grade: assessment.grade,
    role: assessment.role,
    roleStatus: assessment.roleStatus,
  })

  return {
    response: { assessment, evidence },
    context,
    aiReview,
    timingsMs: {
      github: githubDurationMs,
      ai: aiDurationMs,
      total: Date.now() - startedAt,
    },
  }
}
