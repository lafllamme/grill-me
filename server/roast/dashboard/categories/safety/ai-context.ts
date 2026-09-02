import type { SafetyScoreInput } from './types'

export const safetyQuestion = 'Do the changed lines introduce a concrete validation, auth, error-handling, secret, or dependency risk?'

export function buildSafetyAiContext(metrics: SafetyScoreInput) {
  return {
    surfaceFileRatio: metrics.safetySurfaceFileRatio,
    surfaceLineRatio: metrics.safetySurfaceLineRatio,
    defenseCoverage: metrics.safetyDefenseCoverage,
    patchCommitRatio: metrics.safetyPatchCommitRatio,
    validationFileRatio: metrics.validationFileRatio,
    ciFileRatio: metrics.ciFileRatio,
  }
}
