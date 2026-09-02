/**
 * Compatibility facade for the original flat dashboard scoring module.
 *
 * New code should import from `./dashboard`, while this path remains stable
 * for API handlers, tests, and downstream consumers during the migration.
 */
export { computeDashboardAiAdjustments } from './dashboard/ai-review/adjustments'
export { getDashboardClarityEvidenceCap, getDashboardClarityScoreBreakdown, scoreDashboardClarity } from './dashboard/categories/clarity'
export type { DashboardClarityScoreBreakdown } from './dashboard/categories/clarity'
export { scoreDashboardComplexity } from './dashboard/categories/complexity'
export type { DashboardComplexityScoreBreakdown } from './dashboard/categories/complexity'
export { getDashboardContextScoreBreakdown, scoreDashboardContext } from './dashboard/categories/context'
export type { DashboardContextScoreBreakdown } from './dashboard/categories/context'
export { confirmedDefensivePatchBonus, confirmedRiskPenalty, getDashboardSafetyScoreBreakdown, scoreDashboardSafety } from './dashboard/categories/safety'
export type { DashboardSafetyScoreBreakdown } from './dashboard/categories/safety'
export { getDashboardWorkflowEvidenceCap, getDashboardWorkflowScoreBreakdown, scoreCommitMessage, scoreDashboardWorkflow } from './dashboard/categories/workflow'
export type { DashboardWorkflowScoreBreakdown } from './dashboard/categories/workflow'
export { deriveDashboardMetrics, gradeForDashboardScore, scoreDashboardProfile } from './dashboard/profile-scoring'
export type { DashboardDerivedMetrics, DashboardProfileAssessment, DashboardProfileAxis, DashboardProfileScores } from './dashboard/profile-scoring'
