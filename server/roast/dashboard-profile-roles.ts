import type { DashboardProfileScores } from './dashboard-profile-scoring'

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

interface RoleRule {
  role: Exclude<DashboardProfileRole, 'Unclassified'>
  matches: (scores: DashboardProfileScores) => boolean
}

const minimumRoleCommits = 3

const atLeast = (value: number, threshold: number): boolean => value >= threshold
const atMost = (value: number, threshold: number): boolean => value <= threshold
const inRange = (value: number, minimum: number, maximum: number): boolean => value >= minimum && value <= maximum
const allAxes = (scores: DashboardProfileScores, predicate: (value: number) => boolean): boolean => Object.values(scores).every(predicate)

const roleRules: readonly RoleRule[] = [
  { role: 'Ungrillable', matches: scores => allAxes(scores, value => atLeast(value, 75)) },
  { role: 'Edge-Case Sheriff', matches: scores => atLeast(scores.safety, 85) && atLeast(scores.clarity, 65) && atLeast(scores.workflow, 60) && atLeast(scores.complexity, 60) && atLeast(scores.context, 60) },
  { role: 'Human Compiler', matches: scores => atLeast(scores.clarity, 85) && atLeast(scores.safety, 60) && atLeast(scores.workflow, 60) && atLeast(scores.complexity, 65) && atLeast(scores.context, 65) },
  { role: 'Dependency Detective', matches: scores => atLeast(scores.complexity, 85) && atLeast(scores.clarity, 70) && atLeast(scores.safety, 65) && atLeast(scores.workflow, 60) && atLeast(scores.context, 60) },
  { role: 'Git Gardener', matches: scores => atLeast(scores.workflow, 85) && atLeast(scores.clarity, 70) && atLeast(scores.safety, 60) && atLeast(scores.complexity, 60) && atLeast(scores.context, 60) },
  { role: 'Freddy Spaghetti', matches: scores => inRange(scores.clarity, 40, 60) && atLeast(scores.safety, 65) && atLeast(scores.workflow, 65) && atLeast(scores.complexity, 60) && atLeast(scores.context, 65) },
  { role: 'Risk Runner', matches: scores => inRange(scores.safety, 40, 60) && atLeast(scores.clarity, 65) && atLeast(scores.workflow, 65) && atLeast(scores.complexity, 65) && atLeast(scores.context, 65) },
  { role: 'Careful Squasher', matches: scores => inRange(scores.workflow, 40, 60) && atLeast(scores.clarity, 70) && atLeast(scores.safety, 70) && atLeast(scores.complexity, 60) && atLeast(scores.context, 70) },
  { role: 'Wrapper Addict', matches: scores => inRange(scores.complexity, 40, 60) && atLeast(scores.clarity, 65) && atLeast(scores.safety, 65) && atLeast(scores.workflow, 65) && atLeast(scores.context, 65) },
  { role: 'Docs Dodger', matches: scores => atMost(scores.context, 50) && atLeast(scores.clarity, 65) && atLeast(scores.safety, 65) && atLeast(scores.workflow, 65) && atLeast(scores.complexity, 65) },
  { role: 'Brain Dumper', matches: scores => atMost(scores.clarity, 35) && atLeast(scores.safety, 55) && atLeast(scores.workflow, 55) && atLeast(scores.complexity, 55) && atLeast(scores.context, 55) },
  { role: 'Finger Crosser', matches: scores => atMost(scores.safety, 35) && atLeast(scores.clarity, 55) && atLeast(scores.workflow, 55) && atLeast(scores.complexity, 55) && atLeast(scores.context, 55) },
  { role: 'Big-Bang Committer', matches: scores => atMost(scores.workflow, 35) && atLeast(scores.clarity, 55) && atLeast(scores.safety, 55) && atLeast(scores.complexity, 55) && atLeast(scores.context, 55) },
  { role: 'Merge Conflict Magician', matches: scores => atMost(scores.complexity, 35) && atLeast(scores.clarity, 55) && atLeast(scores.safety, 55) && atLeast(scores.workflow, 55) && atLeast(scores.context, 55) },
  { role: 'README Houdini', matches: scores => atMost(scores.context, 35) && atLeast(scores.clarity, 55) && atLeast(scores.safety, 55) && atLeast(scores.workflow, 55) && atLeast(scores.complexity, 55) },
  { role: 'Vibe Coder', matches: scores => Object.values(scores).filter(value => atMost(value, 45)).length >= 3 },
]

function hasRoleEvidence(input: { commitCount: number, hasPatchEvidence: boolean }): boolean {
  return input.commitCount >= minimumRoleCommits && input.hasPatchEvidence
}

/**
 * Resolves the role matrix without forcing a sparse or weak GitHub sample into
 * a roast label. All matching rules remain visible as candidates; the stable
 * rule order supplies the primary label.
 */
export function resolveDashboardProfileRole(input: {
  scores: DashboardProfileScores
  commitCount: number
  hasPatchEvidence: boolean
}): DashboardRoleClassification {
  if (!hasRoleEvidence(input)) {
    return {
      primary: 'Unclassified',
      candidates: [],
      status: 'unclassified',
      reason: 'insufficient-evidence',
    }
  }

  const candidates = roleRules
    .filter(rule => rule.matches(input.scores))
    .map(rule => rule.role)

  if (!candidates.length) {
    return {
      primary: 'Unclassified',
      candidates: [],
      status: 'unclassified',
      reason: 'no-matrix-match',
    }
  }

  return {
    primary: candidates[0]!,
    candidates,
    status: 'classified',
  }
}
