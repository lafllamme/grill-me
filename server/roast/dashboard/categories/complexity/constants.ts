import type { ComplexityEvidenceRules, ComplexityFileWeights, ComplexityScoringRules } from './types'

export const COMPLEXITY_SCORE_DEFAULT = 50

export const COMPLEXITY_FILE_WEIGHTS = {
  excluded: 0,
  test: 0.5,
  documentation: 0.25,
  runtime: 1,
} as const satisfies ComplexityFileWeights

export const COMPLEXITY_SCORING_RULES = {
  percentile: 75,
  outlierEffectiveFiles: 12,
  scopeBaselineFiles: 2,
  scopePenaltyPerFile: 5,
  maximumScopePenalty: 60,
  deletionBaselineRatio: 50,
  deletionPenaltyPerPoint: 0.5,
  scopeWeight: 0.50,
  outlierWeight: 0.30,
  churnWeight: 0.20,
  maximumSignal: 100,
} as const satisfies ComplexityScoringRules

export const COMPLEXITY_EVIDENCE_RULES = {
  minimumTotalCommits: 3,
  minimumWorkflowCommits: 3,
} as const satisfies ComplexityEvidenceRules
