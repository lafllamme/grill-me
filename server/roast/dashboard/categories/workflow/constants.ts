import type { WorkflowEvidenceRules, WorkflowMessageScoringRules, WorkflowScopeRules, WorkflowScoreWeights } from './types'

export const WORKFLOW_SCORE_DEFAULT = 50

export const WORKFLOW_MESSAGE_SCORING = {
  emptyMessageScore: 15,
  defaultScore: 42,
  readableSubjectLength: 12,
  readableSubjectBonus: 16,
  detailedSubjectLength: 28,
  detailedSubjectBonus: 10,
  conventionalMessageBonus: 24,
  actionWordBonus: 8,
  genericMessagePenalty: 28,
  uppercaseMessagePenalty: 8,
} as const satisfies WorkflowMessageScoringRules

export const WORKFLOW_EVIDENCE_RULES = {
  minimumTotalCommits: 3,
  minimumPersonalCommits: 3,
  minimumPatchCommits: 3,
  usablePersonalCommits: 6,
  strongPersonalCommits: 10,
  limitedEvidenceCap: 84,
  usableEvidenceCap: 89,
  strongEvidenceCap: 95,
} as const satisfies WorkflowEvidenceRules

export const WORKFLOW_SCOPE_RULES = {
  medianPercentile: 50,
  p75Percentile: 75,
  largeCommitSize: 500,
  largeCommitFiles: 15,
  relativeOutlierMultiplier: 4,
  medianScopeBaselineFiles: 2,
  medianScopePenaltyPerFile: 5,
  p75ScopeBaselineFiles: 4,
  p75ScopePenaltyPerFile: 3,
  maximumSignal: 100,
  clarityScopeBaselineFiles: 1,
  clarityScopePenaltyPerFile: 7,
  medianScopeWeight: 0.65,
  p75ScopeWeight: 0.35,
  fileScopeWeight: 0.75,
  outlierWeight: 0.25,
} as const satisfies WorkflowScopeRules

export const WORKFLOW_SCORE_WEIGHTS = {
  message: 0.45,
  granularity: 0.40,
  review: 0.15,
  noReviewObservedWeight: 0.85,
} as const satisfies WorkflowScoreWeights
