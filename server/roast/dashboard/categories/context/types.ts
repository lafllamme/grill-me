import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'

export interface ContextSignal {
  signal: number
  evidenceAvailable: boolean
}

export interface DashboardContextScoreBreakdown {
  patchExplanationSignal: number
  orientationArtifactSignal: number
  commitContextSignal: number
  repositoryOrientationSignal: number
  handoffSignal: number
  patchExplanationEvidenceAvailable: boolean
  orientationArtifactEvidenceAvailable: boolean
  commitContextEvidenceAvailable: boolean
  repositoryEvidenceAvailable: boolean
  handoffEvidenceAvailable: boolean
  rawScore: number
}

export interface ContextScoreWeights {
  patchExplanation: number
  orientationArtifact: number
  commitContext: number
  repositoryOrientation: number
  handoff: number
}

export interface ContextCommitRules {
  minimumBodyCharacters: number
  minimumSubjectWords: number
  emptySubjectPenalty: number
  genericSubjectPenalty: number
  specificSubjectBonus: number
  meaningfulBodyBonus: number
  explicitContextBonus: number
}

export interface ContextSignalRules {
  scoreBaseline: number
  maximumRatio: number
  maximumSignal: number
  maximumArtifactLift: number
  maximumRepositoryLift: number
  repositoryArtifactBonus: number
  handoffCoverageWeight: number
  reviewedPullRequestWeight: number
  readmeArtifactWeight: number
  docsArtifactWeight: number
  exampleArtifactWeight: number
}

export interface ContextEvidenceRules {
  minimumTotalCommits: number
  minimumWorkflowCommits: number
}

export type ContextScoreInput = Pick<DashboardDerivedMetrics, 'commitCount' | 'workflowCommitCount' | 'contextPatchExplanationSignal' | 'contextOrientationArtifactSignal' | 'contextCommitSignal' | 'contextRepositoryOrientationSignal' | 'contextHandoffSignal' | 'contextPatchExplanationEvidenceAvailable' | 'contextOrientationArtifactEvidenceAvailable' | 'contextCommitEvidenceAvailable' | 'contextRepositoryEvidenceAvailable' | 'contextHandoffEvidenceAvailable'>
