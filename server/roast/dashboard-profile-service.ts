import type { DashboardEvidence, DashboardProfileAssessment, DashboardProfileResponse, DashboardProfileStreamPhase } from '~~/shared/dashboard/contracts'
import type { DashboardAiReviewAssessment } from './dashboard-ai-scoring'
import type { GithubContext } from './github-collector'
import { assessDashboardProfileWithAi, toDashboardAiSafetyAssessment } from './dashboard-ai-scoring'
import { toDashboardEvidence } from './dashboard-profile-evidence'
import { scoreDashboardProfile } from './dashboard-profile-scoring'
import { collectDashboardGithubContext } from './github-collector'

export interface DashboardProfileAnalysisInput {
  username: string
  githubToken?: string
  cfAccountId?: string
  cfApiToken?: string
  cfAiModel?: string
  githubTimeoutMs: number
  aiTimeoutMs: number
  aiMaxTokens: number
}

export interface DashboardProfileAnalysisHooks {
  onStatus?: (phase: DashboardProfileStreamPhase, message: string) => void | Promise<void>
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

export async function runDashboardProfileAnalysis(
  input: DashboardProfileAnalysisInput,
  hooks?: DashboardProfileAnalysisHooks,
): Promise<DashboardProfileAnalysisResult> {
  const startedAt = Date.now()

  await hooks?.onStatus?.('collecting-github', 'Collecting public GitHub evidence...')
  const githubStartedAt = Date.now()
  const context = await collectDashboardGithubContext(input.username, input.githubToken, {
    githubTimeoutMs: input.githubTimeoutMs,
  })
  const githubDurationMs = Date.now() - githubStartedAt
  const evidence = toDashboardEvidence(context)
  await hooks?.onEvidence?.(evidence)

  await hooks?.onStatus?.('scoring', 'Calculating deterministic profile signals...')
  const deterministicAssessment = scoreDashboardProfile(context)
  await hooks?.onDeterministicScores?.(deterministicAssessment)

  await hooks?.onStatus?.('reviewing-ai', 'Reviewing selected patch evidence with AI...')
  const aiStartedAt = Date.now()
  const aiReview = await assessDashboardProfileWithAi({
    context,
    accountId: input.cfAccountId,
    apiToken: input.cfApiToken,
    model: input.cfAiModel,
    timeoutMs: input.aiTimeoutMs,
    maxTokens: input.aiMaxTokens,
  })
  const aiDurationMs = Date.now() - aiStartedAt
  const assessment = scoreDashboardProfile(context, toDashboardAiSafetyAssessment(aiReview), aiReview)

  await hooks?.onStatus?.('finalizing', 'Finalizing the dashboard profile...')

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
