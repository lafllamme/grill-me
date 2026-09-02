import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'

export interface WorkflowMetrics {
  workflowCommitCount: number
  workflowPatchCommitCount: number
  safetyPatchCommitRatio: number
  workflowAverageFilesPerCommit: number
  workflowMedianFilesPerCommit: number
  workflowP75FilesPerCommit: number
  workflowMessageQuality: number
  workflowConventionalMessageRatio: number
  workflowLargeCommitRatio: number
  workflowDeletionRatio: number
  messageQuality: number
  conventionalMessageRatio: number
  genericMessageRatio: number
  emptyMessageRatio: number
  largeCommitRatio: number
  clarityScopeSignal: number
}

export interface DashboardWorkflowScoreBreakdown {
  messageSignal: number
  medianScopeSignal: number
  p75ScopeSignal: number
  fileScopeSignal: number
  outlierSignal: number
  granularitySignal: number
  reviewSignal: number
  reviewEvidenceAvailable: boolean
  evidenceCap: number
  evidenceQuality: 'insufficient' | 'limited' | 'usable' | 'strong'
  rawScore: number
}

export interface WorkflowMessageScoringRules {
  emptyMessageScore: number
  defaultScore: number
  readableSubjectLength: number
  readableSubjectBonus: number
  detailedSubjectLength: number
  detailedSubjectBonus: number
  conventionalMessageBonus: number
  actionWordBonus: number
  genericMessagePenalty: number
  uppercaseMessagePenalty: number
}

export interface WorkflowEvidenceRules {
  minimumTotalCommits: number
  minimumPersonalCommits: number
  minimumPatchCommits: number
  usablePersonalCommits: number
  strongPersonalCommits: number
  limitedEvidenceCap: number
  usableEvidenceCap: number
  strongEvidenceCap: number
}

export interface WorkflowScopeRules {
  medianPercentile: number
  p75Percentile: number
  largeCommitSize: number
  largeCommitFiles: number
  relativeOutlierMultiplier: number
  medianScopeBaselineFiles: number
  medianScopePenaltyPerFile: number
  p75ScopeBaselineFiles: number
  p75ScopePenaltyPerFile: number
  maximumSignal: number
  clarityScopeBaselineFiles: number
  clarityScopePenaltyPerFile: number
  medianScopeWeight: number
  p75ScopeWeight: number
  fileScopeWeight: number
  outlierWeight: number
}

export interface WorkflowScoreWeights {
  message: number
  granularity: number
  review: number
  noReviewObservedWeight: number
}

export type WorkflowScoreInput = Pick<DashboardDerivedMetrics, | 'commitCount'
  | 'workflowCommitCount'
  | 'workflowPatchCommitCount'
  | 'workflowMessageQuality'
  | 'workflowConventionalMessageRatio'
  | 'workflowAverageFilesPerCommit'
  | 'workflowMedianFilesPerCommit'
  | 'workflowP75FilesPerCommit'
  | 'workflowLargeCommitRatio'
  | 'pullRequestCoverage'
  | 'mergeCommitRatio'>
