import type { DashboardEvidence, DashboardProfileAssessment, DashboardProfileResponse, DashboardProfileStreamPhase } from '~~/shared/dashboard/contracts'
import type { DashboardAiReviewAssessment, DashboardAiReviewBaseline } from './dashboard-ai-scoring'
import type { GithubCollectionProgress, GithubContext } from './github-collector'
import { assessDashboardProfileWithAi, dashboardCategoryQuestions, toDashboardAiSafetyAssessment } from './dashboard-ai-scoring'
import { toDashboardEvidence } from './dashboard-profile-evidence'
import { getDashboardClarityScoreBreakdown, getDashboardContextScoreBreakdown, getDashboardWorkflowScoreBreakdown, scoreDashboardProfile } from './dashboard-profile-scoring'
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

export async function runDashboardProfileAnalysis(
  input: DashboardProfileAnalysisInput,
  hooks?: DashboardProfileAnalysisHooks,
): Promise<DashboardProfileAnalysisResult> {
  const startedAt = Date.now()

  await hooks?.onStatus?.('collecting-github', 'Collecting public GitHub evidence...')
  const githubStartedAt = Date.now()
  const context = await collectDashboardGithubContext(input.username, input.githubToken, {
    githubTimeoutMs: input.githubTimeoutMs,
    onProgress: progress => hooks?.onGithubProgress?.(progress),
  })
  const githubDurationMs = Date.now() - githubStartedAt
  const evidence = toDashboardEvidence(context)
  await hooks?.onEvidence?.(evidence)

  await hooks?.onStatus?.('scoring', 'Calculating deterministic profile signals...')
  const deterministicAssessment = scoreDashboardProfile(context)
  await hooks?.onDeterministicScores?.(deterministicAssessment)
  const workflowBreakdown = getDashboardWorkflowScoreBreakdown(deterministicAssessment.derivedMetrics)
  const clarityBreakdown = getDashboardClarityScoreBreakdown(deterministicAssessment.derivedMetrics)
  const contextBreakdown = getDashboardContextScoreBreakdown(deterministicAssessment.derivedMetrics)

  const aiBaseline: DashboardAiReviewBaseline = {
    scores: deterministicAssessment.scores,
    questions: dashboardCategoryQuestions,
    safety: {
      surfaceFileRatio: deterministicAssessment.derivedMetrics.safetySurfaceFileRatio,
      surfaceLineRatio: deterministicAssessment.derivedMetrics.safetySurfaceLineRatio,
      defenseCoverage: deterministicAssessment.derivedMetrics.safetyDefenseCoverage,
      patchCommitRatio: deterministicAssessment.derivedMetrics.safetyPatchCommitRatio,
      validationFileRatio: deterministicAssessment.derivedMetrics.validationFileRatio,
      ciFileRatio: deterministicAssessment.derivedMetrics.ciFileRatio,
    },
    clarity: {
      messageSignal: clarityBreakdown.messageSignal,
      conventionalMessageRatio: clarityBreakdown.conventionalMessageRatio,
      namingSignal: clarityBreakdown.namingSignal,
      structureSignal: clarityBreakdown.structureSignal,
      namingEvidenceAvailable: clarityBreakdown.namingEvidenceAvailable,
      structureEvidenceAvailable: clarityBreakdown.structureEvidenceAvailable,
    },
    workflow: {
      personalCommitCount: deterministicAssessment.derivedMetrics.workflowCommitCount,
      patchCommitCount: deterministicAssessment.derivedMetrics.workflowPatchCommitCount,
      messageQuality: workflowBreakdown.messageSignal,
      conventionalMessageRatio: deterministicAssessment.derivedMetrics.workflowConventionalMessageRatio,
      averageFilesPerCommit: deterministicAssessment.derivedMetrics.workflowAverageFilesPerCommit,
      medianFilesPerCommit: deterministicAssessment.derivedMetrics.workflowMedianFilesPerCommit,
      p75FilesPerCommit: deterministicAssessment.derivedMetrics.workflowP75FilesPerCommit,
      largeCommitRatio: deterministicAssessment.derivedMetrics.workflowLargeCommitRatio,
      medianScopeSignal: workflowBreakdown.medianScopeSignal,
      p75ScopeSignal: workflowBreakdown.p75ScopeSignal,
      fileScopeSignal: workflowBreakdown.fileScopeSignal,
      outlierSignal: workflowBreakdown.outlierSignal,
      granularitySignal: workflowBreakdown.granularitySignal,
      reviewSignal: workflowBreakdown.reviewSignal,
      reviewEvidenceAvailable: workflowBreakdown.reviewEvidenceAvailable,
      evidenceCap: workflowBreakdown.evidenceCap,
      evidenceQuality: workflowBreakdown.evidenceQuality,
      mergeCommitRatio: deterministicAssessment.derivedMetrics.mergeCommitRatio,
    },
    complexity: {
      effectiveFilesP75: deterministicAssessment.derivedMetrics.complexityEffectiveFilesP75,
      excludedFileRatio: deterministicAssessment.derivedMetrics.complexityExcludedFileRatio,
      relativeOutlierRatio: deterministicAssessment.derivedMetrics.complexityRelativeOutlierRatio,
      scopeSignal: deterministicAssessment.derivedMetrics.complexityScopeSignal,
      outlierSignal: deterministicAssessment.derivedMetrics.complexityOutlierSignal,
      churnSignal: deterministicAssessment.derivedMetrics.complexityChurnSignal,
    },
    context: {
      patchExplanationSignal: contextBreakdown.patchExplanationSignal,
      orientationArtifactSignal: contextBreakdown.orientationArtifactSignal,
      commitContextSignal: contextBreakdown.commitContextSignal,
      repositoryOrientationSignal: contextBreakdown.repositoryOrientationSignal,
      handoffSignal: contextBreakdown.handoffSignal,
      patchExplanationEvidenceAvailable: contextBreakdown.patchExplanationEvidenceAvailable,
      orientationArtifactEvidenceAvailable: contextBreakdown.orientationArtifactEvidenceAvailable,
      commitContextEvidenceAvailable: contextBreakdown.commitContextEvidenceAvailable,
      repositoryEvidenceAvailable: contextBreakdown.repositoryEvidenceAvailable,
      handoffEvidenceAvailable: contextBreakdown.handoffEvidenceAvailable,
    },
  }

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
