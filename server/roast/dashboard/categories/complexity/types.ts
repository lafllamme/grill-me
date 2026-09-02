import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'

export interface ComplexityMetrics {
  effectiveFilesP75: number
  excludedFileRatio: number
  relativeOutlierRatio: number
  scopeSignal: number
  outlierSignal: number
  churnSignal: number
}

export interface DashboardComplexityScoreBreakdown extends ComplexityMetrics {
  rawScore: number
}

export interface ComplexityFileWeights {
  excluded: number
  test: number
  documentation: number
  runtime: number
}

export interface ComplexityScoringRules {
  percentile: number
  outlierEffectiveFiles: number
  scopeBaselineFiles: number
  scopePenaltyPerFile: number
  maximumScopePenalty: number
  deletionBaselineRatio: number
  deletionPenaltyPerPoint: number
  scopeWeight: number
  outlierWeight: number
  churnWeight: number
  maximumSignal: number
}

export interface ComplexityEvidenceRules {
  minimumTotalCommits: number
  minimumWorkflowCommits: number
}

export type ComplexityScoreInput = Pick<DashboardDerivedMetrics, | 'commitCount'
  | 'workflowCommitCount'
  | 'complexityEffectiveFilesP75'
  | 'complexityExcludedFileRatio'
  | 'complexityRelativeOutlierRatio'
  | 'complexityScopeSignal'
  | 'complexityOutlierSignal'
  | 'complexityChurnSignal'>
