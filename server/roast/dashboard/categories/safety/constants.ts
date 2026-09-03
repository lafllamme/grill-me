import type { DashboardAiSafetyAssessment } from '../../ai-review/types'
import type { SafetyMetricRules, SafetyScoringRules, SafetySelectionRules } from './types'

export const SAFETY_SCORE_DEFAULT = 50
export const SAFETY_AI_QUESTION = 'Do the changed lines introduce a concrete validation, auth, error-handling, secret, or dependency risk?'

export const SAFETY_SCORE_RULES = {
  insufficientScore: SAFETY_SCORE_DEFAULT,
  neutralScore: 70,
  maximumScore: 95,
  aiConfidenceThreshold: 70,
  patchCoverageBase: 0.5,
  patchCoverageScale: 0.5,
  deterministicDefenseWeight: 0.25,
  validationProcessWeight: 0.03,
  ciProcessWeight: 0.02,
  maximumProcessBonus: 5,
  maximumAiDefenseBonus: 8,
  aiDefenseSignalStep: 4,
  criticalRiskPenalty: 50,
} as const satisfies SafetyScoringRules

export const SAFETY_SEVERITY_PENALTIES: Record<DashboardAiSafetyAssessment['signals'][number]['severity'], number> = {
  low: 5,
  medium: 15,
  high: 30,
}

export const SAFETY_METRIC_RULES = {
  fileCoverageWeight: 0.6,
  lineCoverageWeight: 0.4,
} as const satisfies SafetyMetricRules

export const SAFETY_SELECTION_RULES = {
  safetyFileRelevanceWeight: 2,
  safetyPatchRelevanceWeight: 3,
  minimumRelevanceScore: 0,
  maximumSelectedCommits: 3,
  emptyMedianSize: 0,
} as const satisfies SafetySelectionRules
