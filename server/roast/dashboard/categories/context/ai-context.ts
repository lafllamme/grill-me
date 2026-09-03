import type { ContextScoreInput } from './types'
import { CONTEXT_AI_QUESTION } from './constants'

export const contextQuestion = CONTEXT_AI_QUESTION

export function buildContextAiContext(metrics: ContextScoreInput) {
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
  }
}
