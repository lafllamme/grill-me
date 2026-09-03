import type { ContextScoreInput, DashboardContextScoreBreakdown } from './types'
import { clamp } from '../../shared/math'
import { CONTEXT_AI_QUESTION, CONTEXT_EVIDENCE_RULES, CONTEXT_SCORE_BASELINE, CONTEXT_SCORE_DEFAULT, CONTEXT_SCORE_WEIGHTS } from './constants'

export const contextQuestion = CONTEXT_AI_QUESTION

export function scoreDashboardContext(metrics: ContextScoreInput): number {
  return getDashboardContextScoreBreakdown(metrics).rawScore
}

export function getDashboardContextScoreBreakdown(metrics: ContextScoreInput): DashboardContextScoreBreakdown {
  if (metrics.commitCount < CONTEXT_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < CONTEXT_EVIDENCE_RULES.minimumWorkflowCommits) {
    return {
      patchExplanationSignal: CONTEXT_SCORE_DEFAULT,
      orientationArtifactSignal: CONTEXT_SCORE_DEFAULT,
      commitContextSignal: CONTEXT_SCORE_DEFAULT,
      repositoryOrientationSignal: CONTEXT_SCORE_DEFAULT,
      handoffSignal: CONTEXT_SCORE_DEFAULT,
      patchExplanationEvidenceAvailable: false,
      orientationArtifactEvidenceAvailable: false,
      commitContextEvidenceAvailable: false,
      repositoryEvidenceAvailable: false,
      handoffEvidenceAvailable: false,
      rawScore: CONTEXT_SCORE_DEFAULT,
    }
  }

  const rawScore = clamp(
    CONTEXT_SCORE_BASELINE
    + (metrics.contextPatchExplanationSignal - CONTEXT_SCORE_DEFAULT) * CONTEXT_SCORE_WEIGHTS.patchExplanation
    + (metrics.contextOrientationArtifactSignal - CONTEXT_SCORE_DEFAULT) * CONTEXT_SCORE_WEIGHTS.orientationArtifact
    + (metrics.contextCommitSignal - CONTEXT_SCORE_DEFAULT) * CONTEXT_SCORE_WEIGHTS.commitContext
    + (metrics.contextRepositoryOrientationSignal - CONTEXT_SCORE_DEFAULT) * CONTEXT_SCORE_WEIGHTS.repositoryOrientation
    + (metrics.contextHandoffSignal - CONTEXT_SCORE_DEFAULT) * CONTEXT_SCORE_WEIGHTS.handoff,
  )

  return {
    patchExplanationSignal: metrics.contextPatchExplanationSignal,
    orientationArtifactSignal: metrics.contextOrientationArtifactSignal,
    commitContextSignal: metrics.contextCommitSignal,
    repositoryOrientationSignal: metrics.contextRepositoryOrientationSignal,
    handoffSignal: metrics.contextHandoffSignal,
    patchExplanationEvidenceAvailable: metrics.contextPatchExplanationEvidenceAvailable,
    orientationArtifactEvidenceAvailable: metrics.contextOrientationArtifactEvidenceAvailable,
    commitContextEvidenceAvailable: metrics.contextCommitEvidenceAvailable,
    repositoryEvidenceAvailable: metrics.contextRepositoryEvidenceAvailable,
    handoffEvidenceAvailable: metrics.contextHandoffEvidenceAvailable,
    rawScore,
  }
}
