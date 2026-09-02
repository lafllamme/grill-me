import type { DashboardProfileScores } from '~~/shared/dashboard/contracts'
import type { DashboardRoleRule, DashboardRoleThresholdConfig } from './types'
import { DASHBOARD_ROLE_THRESHOLDS } from './constants'

function matchesThreshold(value: number, threshold: { minimum?: number, maximum?: number }): boolean {
  return (threshold.minimum === undefined || value >= threshold.minimum)
    && (threshold.maximum === undefined || value <= threshold.maximum)
}

function matchesRole(scores: DashboardProfileScores, role: keyof typeof DASHBOARD_ROLE_THRESHOLDS): boolean {
  const threshold: DashboardRoleThresholdConfig = DASHBOARD_ROLE_THRESHOLDS[role]
  if (threshold.allAxesMinimum !== undefined && !Object.values(scores).every(value => value >= threshold.allAxesMinimum!))
    return false

  if (threshold.axes && !Object.entries(threshold.axes).every(([axis, axisThreshold]) => matchesThreshold(scores[axis as keyof DashboardProfileScores], axisThreshold!)))
    return false

  if (threshold.minimumLowScores !== undefined && threshold.lowScoreThreshold !== undefined) {
    const lowScoreCount = Object.values(scores).filter(value => value <= threshold.lowScoreThreshold!).length
    if (lowScoreCount < threshold.minimumLowScores)
      return false
  }

  return true
}

export const dashboardRoleRules: readonly DashboardRoleRule[] = [
  { role: 'Ungrillable', matches: scores => matchesRole(scores, 'Ungrillable') },
  { role: 'Edge-Case Sheriff', matches: scores => matchesRole(scores, 'Edge-Case Sheriff') },
  { role: 'Human Compiler', matches: scores => matchesRole(scores, 'Human Compiler') },
  { role: 'Dependency Detective', matches: scores => matchesRole(scores, 'Dependency Detective') },
  { role: 'Git Gardener', matches: scores => matchesRole(scores, 'Git Gardener') },
  { role: 'Freddy Spaghetti', matches: scores => matchesRole(scores, 'Freddy Spaghetti') },
  { role: 'Risk Runner', matches: scores => matchesRole(scores, 'Risk Runner') },
  { role: 'Careful Squasher', matches: scores => matchesRole(scores, 'Careful Squasher') },
  { role: 'Wrapper Addict', matches: scores => matchesRole(scores, 'Wrapper Addict') },
  { role: 'Docs Dodger', matches: scores => matchesRole(scores, 'Docs Dodger') },
  { role: 'Brain Dumper', matches: scores => matchesRole(scores, 'Brain Dumper') },
  { role: 'Finger Crosser', matches: scores => matchesRole(scores, 'Finger Crosser') },
  { role: 'Big-Bang Committer', matches: scores => matchesRole(scores, 'Big-Bang Committer') },
  { role: 'Merge Conflict Magician', matches: scores => matchesRole(scores, 'Merge Conflict Magician') },
  { role: 'README Houdini', matches: scores => matchesRole(scores, 'README Houdini') },
  { role: 'Vibe Coder', matches: scores => matchesRole(scores, 'Vibe Coder') },
]
