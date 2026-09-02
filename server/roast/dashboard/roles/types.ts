import type { DashboardProfileAxis, DashboardProfileScores } from '~~/shared/dashboard/contracts'

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
export type DashboardProfileRoleReason = 'insufficient-evidence' | 'no-matrix-match'

export interface DashboardRoleClassification {
  primary: DashboardProfileRole
  candidates: DashboardProfileRole[]
  status: DashboardProfileRoleStatus
  reason?: DashboardProfileRoleReason
}

export interface DashboardRoleRule {
  role: Exclude<DashboardProfileRole, 'Unclassified'>
  matches: (scores: DashboardProfileScores) => boolean
}

export interface DashboardRoleScoreRange {
  minimum?: number
  maximum?: number
}

export interface DashboardRoleThresholdConfig {
  allAxesMinimum?: number
  lowScoreThreshold?: number
  minimumLowScores?: number
  axes?: Partial<Record<DashboardProfileAxis, DashboardRoleScoreRange>>
}

export type DashboardRoleThresholds = Record<Exclude<DashboardProfileRole, 'Unclassified'>, DashboardRoleThresholdConfig>

export interface DashboardRoleEvidenceRules {
  minimumCommits: number
}
