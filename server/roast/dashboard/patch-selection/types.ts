import type { GithubCommit, GithubCommitFile } from '../../github-collector'

export type DashboardPatchSelectionReason = 'latest' | 'typical' | 'workflow-signal' | 'safety-signal'

export interface DashboardPatchSelectionCommit {
  commit: GithubCommit
  reasons: DashboardPatchSelectionReason[]
}

export interface DashboardPatchSelectionFile {
  commitSha: string
  repo: string
  filename: string
  status: string
  patch: string
  reason: DashboardPatchSelectionReason
}

export interface DashboardPatchSelection {
  commits: DashboardPatchSelectionCommit[]
  files: DashboardPatchSelectionFile[]
  usablePatchCount: number
  totalPatchChars: number
}

export interface DashboardPatchSelectionRules {
  minimumPatchLineLength: number
  safetyRelevanceWeight: number
  maximumRelevanceLines: number
  emptyMedianSize: number
}

export type { GithubCommitFile }
