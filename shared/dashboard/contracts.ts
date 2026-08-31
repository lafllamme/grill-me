export type DashboardProfileAxis = 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'

export interface DashboardProfileScores {
  clarity: number
  safety: number
  workflow: number
  complexity: number
  context: number
}

export interface DashboardDerivedMetrics {
  commitCount: number
  pullRequestCount: number
  additions: number
  deletions: number
  changedFiles: number
  averageCommitSize: number
  medianCommitSize: number
  largestCommitSize: number
  p90CommitSize: number
  activeDays: number
  spanDays: number
  commitsPer30Days: number
  averageFilesPerCommit: number
  workflowCommitCount: number
  workflowAverageFilesPerCommit: number
  workflowMessageQuality: number
  workflowConventionalMessageRatio: number
  workflowLargeCommitRatio: number
  clarityScopeSignal: number
  contextDocumentationSignal: number
  complexityScopeSignal: number
  complexityOutlierSignal: number
  complexityChurnSignal: number
  messageQuality: number
  conventionalMessageRatio: number
  genericMessageRatio: number
  emptyMessageRatio: number
  documentationFileRatio: number
  testFileRatio: number
  ciFileRatio: number
  validationFileRatio: number
  pullRequestCoverage: number
  deletionRatio: number
  workflowDeletionRatio: number
  riskyFileRatio: number
  defensivePatchRatio: number
  riskyPatchRatio: number
  mergeCommitRatio: number
  largeCommitRatio: number
}

export type DashboardProfileRole
  = | 'Human Compiler'
    | 'Edge-Case Sheriff'
    | 'Dependency Detective'
    | 'Git Gardener'
    | 'Ungrillable'
    | 'Freddy Spaghetti'
    | 'Risk Runner'
    | 'Careful Squasher'
    | 'Wrapper Addict'
    | 'Docs Dodger'
    | 'Brain Dumper'
    | 'Finger Crosser'
    | 'Big-Bang Committer'
    | 'Merge Conflict Magician'
    | 'README Houdini'
    | 'Vibe Coder'
    | 'Unclassified'

export type DashboardProfileRoleStatus = 'classified' | 'unclassified'

export interface DashboardProfileAssessment {
  version: 'v1'
  username: string
  scores: DashboardProfileScores
  overallScore: number
  grade: string
  role: DashboardProfileRole
  roleCandidates: DashboardProfileRole[]
  roleStatus: DashboardProfileRoleStatus
  derivedMetrics: DashboardDerivedMetrics
  confidence: number
  aiSafety?: {
    confidence: number
    status: string
    signals: readonly {
      category: 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
      verdict: 'safe' | 'risk' | 'unclear'
      impact: 'introduced' | 'fixed' | 'unclear'
      severity: 'low' | 'medium' | 'high'
      commitSha: string
      evidence: string
    }[]
  }
  aiReview?: {
    confidence: number
    status: string
    selectedCommitCount: number
    patchCount: number
    patchChars: number
  }
  aiAdjustments: Partial<Record<DashboardProfileAxis, number>>
  evidenceWindow: {
    commitCount: number
    pullRequestCount: number
    source: 'github-public-activity' | 'github-repository-evidence'
    from?: string
    to?: string
  }
}

export interface DashboardEvidenceFile {
  filename: string
  status: string
  additions: number
  deletions: number
}

export interface DashboardEvidenceCommit {
  repo: string
  sha: string
  message: string
  additions: number
  deletions: number
  changedFiles: number
  committedAt?: string
  files: readonly DashboardEvidenceFile[]
}

export interface DashboardEvidence {
  commits: readonly DashboardEvidenceCommit[]
  pullRequests: readonly unknown[]
  repositories?: readonly unknown[]
  checks?: readonly unknown[]
  collection?: Record<string, unknown>
}

export interface DashboardProfileResponse {
  assessment: DashboardProfileAssessment
  evidence: DashboardEvidence
}
