import type { DashboardProfileScores } from '~~/shared/dashboard/contracts'
import type { DashboardProfileRole, DashboardRoleClassification } from './types'
import { DASHBOARD_ROLE_EVIDENCE_RULES } from './constants'
import { dashboardRoleRules } from './matrix'

function hasRoleEvidence(input: { commitCount: number, hasPatchEvidence: boolean }): boolean {
  return input.commitCount >= DASHBOARD_ROLE_EVIDENCE_RULES.minimumCommits && input.hasPatchEvidence
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

  const candidates = dashboardRoleRules
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

export type { DashboardProfileRole }
