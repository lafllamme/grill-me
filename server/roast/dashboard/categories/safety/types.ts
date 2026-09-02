import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'
import type { DashboardAiSafetyAssessment } from '../../ai-review/types'

export type SafetyScoreInput = Pick<DashboardDerivedMetrics, 'safetySurfaceFileRatio' | 'safetySurfaceLineRatio' | 'safetyDefenseCoverage' | 'safetyPatchCommitRatio' | 'validationFileRatio' | 'ciFileRatio'>

export interface SafetyMetrics {
  safetySurfaceFileRatio: number
  safetySurfaceLineRatio: number
  safetyDefenseCoverage: number
}

export interface DashboardSafetyScoreBreakdown {
  evidenceStatus: 'insufficient' | 'neutral' | 'surface-observed'
  surfaceFileRatio: number
  surfaceLineRatio: number
  defenseCoverage: number
  deterministicDefenseBonus: number
  aiDefenseBonus: number
  processBonus: number
  riskPenalty: number
  rawScore: number
}

export interface SafetyScoringRules {
  insufficientScore: number
  neutralScore: number
  maximumScore: number
  aiConfidenceThreshold: number
  patchCoverageBase: number
  patchCoverageScale: number
  deterministicDefenseWeight: number
  validationProcessWeight: number
  ciProcessWeight: number
  maximumProcessBonus: number
  maximumAiDefenseBonus: number
  aiDefenseSignalStep: number
  criticalRiskPenalty: number
}

export interface SafetyMetricRules {
  fileCoverageWeight: number
  lineCoverageWeight: number
}

export interface SafetySelectionRules {
  safetyFileRelevanceWeight: number
  safetyPatchRelevanceWeight: number
  minimumRelevanceScore: number
  maximumSelectedCommits: number
  emptyMedianSize: number
}

export type { DashboardAiSafetyAssessment }
