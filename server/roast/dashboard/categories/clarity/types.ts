import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'

export interface ClaritySignal {
  signal: number
  evidenceAvailable: boolean
}

export interface DashboardClarityScoreBreakdown {
  messageSignal: number
  conventionalMessageRatio: number
  namingSignal: number
  structureSignal: number
  namingEvidenceAvailable: boolean
  structureEvidenceAvailable: boolean
  evidenceCap: number
  rawScore: number
}

export interface ClarityScoreWeights {
  message: number
  naming: number
  structure: number
}

export interface ClarityEvidenceRules {
  minimumTotalCommits: number
  minimumPersonalCommits: number
  minimumPatchCommits: number
  broadPersonalCommits: number
  limitedEvidenceCap: number
  broadEvidenceCap: number
}

export interface ClaritySignalRules {
  maximumSignal: number
  longLinePenalty: number
  deepIndentationPenalty: number
}

export type ClarityScoreInput = Pick<DashboardDerivedMetrics, 'commitCount' | 'workflowCommitCount' | 'workflowPatchCommitCount' | 'workflowMessageQuality' | 'workflowConventionalMessageRatio' | 'clarityNamingSignal' | 'clarityStructureSignal' | 'clarityNamingEvidenceAvailable' | 'clarityStructureEvidenceAvailable'>
