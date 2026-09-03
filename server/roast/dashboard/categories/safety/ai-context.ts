import type { SafetyScoreInput } from './types'
import { SAFETY_AI_QUESTION } from './constants'

export const safetyQuestion = SAFETY_AI_QUESTION

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
