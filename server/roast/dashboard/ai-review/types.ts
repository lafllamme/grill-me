import type { DashboardPatchSelection } from '../patch-selection'

export type DashboardSafetyCategory = 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
export type DashboardSafetyVerdict = 'safe' | 'risk' | 'unclear'
export type DashboardSafetyImpact = 'introduced' | 'fixed' | 'unclear'
export type DashboardSafetySeverity = 'low' | 'medium' | 'high'

export interface DashboardSafetySignal {
  category: DashboardSafetyCategory
  verdict: DashboardSafetyVerdict
  impact: DashboardSafetyImpact
  severity: DashboardSafetySeverity
  commitSha: string
  filename?: string
  evidence: string
}

export interface DashboardAiSafetyAssessment {
  confidence: number
  signals: DashboardSafetySignal[]
  status: 'assessed' | 'not-configured' | 'no-evidence' | 'unavailable' | 'invalid-response'
  diagnostic?: 'empty-model-text' | 'missing-signals-or-invalid-json'
  responsePath?: string
  responseShape?: string[]
}

export type DashboardReviewAxis = 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'
export type DashboardReviewVerdict = 'positive' | 'mixed' | 'negative' | 'unclear'
export type DashboardAiAxisReviewVerdict = 'supports' | 'softens' | 'contradicts' | 'insufficient'

export interface DashboardAiReviewEvidence {
  commitSha: string
  filename: string
  observation: string
}

export interface DashboardAiAxisReview {
  axis: DashboardReviewAxis
  verdict: DashboardAiAxisReviewVerdict
  confidence: number
  summary: string
  evidence: DashboardAiReviewEvidence[]
}

export interface DashboardAiReviewBaseline {
  scores: Record<DashboardReviewAxis, number>
  questions: Record<DashboardReviewAxis, string>
  safety: {
    surfaceFileRatio: number
    surfaceLineRatio: number
    defenseCoverage: number
    patchCommitRatio: number
    validationFileRatio: number
    ciFileRatio: number
  }
  clarity: {
    messageSignal: number
    /** Diagnostic workflow context; not a Clarity score input. */
    conventionalMessageRatio: number
    namingSignal: number
    structureSignal: number
    namingEvidenceAvailable: boolean
    structureEvidenceAvailable: boolean
    evidenceCap: number
  }
  workflow: {
    personalCommitCount: number
    patchCommitCount: number
    messageQuality: number
    conventionalMessageRatio: number
    averageFilesPerCommit: number
    medianFilesPerCommit: number
    p75FilesPerCommit: number
    largeCommitRatio: number
    medianScopeSignal: number
    p75ScopeSignal: number
    fileScopeSignal: number
    outlierSignal: number
    granularitySignal: number
    reviewSignal: number
    reviewEvidenceAvailable: boolean
    evidenceCap: number
    evidenceQuality: 'insufficient' | 'limited' | 'usable' | 'strong'
    mergeCommitRatio: number
  }
  complexity: {
    effectiveFilesP75: number
    excludedFileRatio: number
    relativeOutlierRatio: number
    scopeSignal: number
    outlierSignal: number
    churnSignal: number
  }
  context: {
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
  }
}

export interface DashboardAiReviewFinding {
  axis: DashboardReviewAxis
  verdict: DashboardReviewVerdict
  impact: DashboardSafetyImpact
  severity: DashboardSafetySeverity
  commitSha: string
  filename: string
  evidence: string
  category?: DashboardSafetyCategory
}

export interface DashboardAiReviewAssessment {
  confidence: number
  findings: DashboardAiReviewFinding[]
  axisReviews?: DashboardAiAxisReview[]
  parseWarnings?: string[]
  status: 'assessed' | 'not-configured' | 'no-evidence' | 'unavailable' | 'invalid-response'
  diagnostic?: 'empty-model-text' | 'missing-findings-or-invalid-json'
  responsePath?: string
  responseShape?: string[]
  selectedCommitCount: number
  patchCount: number
  patchChars: number
}

export interface DashboardAiReviewParserLimits {
  maxCommitShaCharacters: number
  maxFilenameCharacters: number
  maxEvidenceCharacters: number
  maxSummaryCharacters: number
  maximumSafetySignals: number
  maximumResponseKeys: number
  maximumNestedResponseKeys: number
  maximumAxisEvidence: number
  maximumFindings: number
  maximumAxisReviews: number
  maximumWarningPenalty: number
  droppedWarningPenalty: number
  otherWarningPenalty: number
}

export interface DashboardAiReviewRuntimeConfig {
  fallbackConfidence: number
  standaloneMaxTokens: number
  temperature: number
  safetyTopP: number
  profileTopP: number
  minimumReviewConfidence: number
  minimumAxisConfidence: number
  minimumGroundedEvidence: number
  minimumSupportsEvidence: number
  minimumInsufficientEvidence: number
  maximumAxisAdjustment: number
}

export interface DashboardAiReviewPromptLimits {
  maximumRepositoryEntries: number
  maximumPullRequests: number
  maximumChecks: number
  shortCommitShaCharacters: number
  maximumSafetyCommits: number
  safetyPatternMatchWeight: number
  maximumCommitSubjectCharacters: number
  maximumPullRequestTitleCharacters: number
  maximumEvidenceCharacters: number
}

export type DashboardReviewSelection = DashboardPatchSelection
