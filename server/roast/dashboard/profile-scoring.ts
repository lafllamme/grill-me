import type { DashboardDerivedMetrics, DashboardProfileAssessment, DashboardProfileAxis, DashboardProfileScores } from '~~/shared/dashboard/contracts'
import type { DashboardAiReviewAssessment, DashboardAiSafetyAssessment } from './ai-review'
import { computeDashboardAiAdjustments } from './ai-review/adjustments'
import { getDashboardClarityEvidenceCap, scoreDashboardClarity } from './categories/clarity'
import { scoreDashboardComplexity } from './categories/complexity'
import { getDashboardContextScoreBreakdown, scoreDashboardContext } from './categories/context'
import { getDashboardSafetyScoreBreakdown } from './categories/safety'
import { getDashboardWorkflowEvidenceCap, scoreDashboardWorkflow } from './categories/workflow'
import { resolveDashboardProfileRole } from './roles'
import { DASHBOARD_SCORE_BOUNDS } from './shared/constants'
import { deriveDashboardMetrics } from './shared/metrics'

export type { DashboardDerivedMetrics, DashboardProfileAssessment, DashboardProfileAxis, DashboardProfileScores }

interface DashboardGradeBand {
  minimum: number
  grade: string
}

const DASHBOARD_PROFILE_SCORE_DEFAULT = 50

const DASHBOARD_PROFILE_AXIS_WEIGHTS = {
  clarity: 0.2,
  safety: 0.2,
  workflow: 0.2,
  complexity: 0.2,
  context: 0.2,
} as const satisfies Record<DashboardProfileAxis, number>

const DASHBOARD_PROFILE_GRADE_BANDS: readonly DashboardGradeBand[] = [
  { minimum: 90, grade: 'A' },
  { minimum: 85, grade: 'A-' },
  { minimum: 80, grade: 'B+' },
  { minimum: 75, grade: 'B' },
  { minimum: 70, grade: 'B-' },
  { minimum: 65, grade: 'C+' },
  { minimum: 60, grade: 'C' },
  { minimum: 55, grade: 'C-' },
  { minimum: 50, grade: 'D+' },
  { minimum: 45, grade: 'D' },
  { minimum: 40, grade: 'D-' },
  { minimum: 30, grade: 'E' },
  { minimum: 20, grade: 'E-' },
]

const DASHBOARD_PROFILE_CONFIDENCE_RULES = {
  baseline: 35,
  evidenceCountForMaximum: 18,
  evidenceContribution: 65,
} as const

const clamp = (value: number): number => Math.round(Math.min(DASHBOARD_SCORE_BOUNDS.maximum, Math.max(DASHBOARD_SCORE_BOUNDS.minimum, value)))

export function gradeForDashboardScore(score: number): string {
  return DASHBOARD_PROFILE_GRADE_BANDS.find(band => score >= band.minimum)?.grade ?? 'F'
}

export function scoreDashboardProfile(context: import('../github-collector').GithubContext, aiSafety?: DashboardAiSafetyAssessment, aiReview?: DashboardAiReviewAssessment): DashboardProfileAssessment {
  const metrics = deriveDashboardMetrics(context)
  const empty = metrics.commitCount === 0
  const aiAdjustments = computeDashboardAiAdjustments(aiReview, context.commits)
  const safetyBreakdown = getDashboardSafetyScoreBreakdown(metrics, context.commits, aiSafety)
  const scores: DashboardProfileScores = {
    clarity: scoreDashboardClarity(metrics),
    safety: safetyBreakdown.rawScore,
    workflow: scoreDashboardWorkflow(metrics),
    complexity: scoreDashboardComplexity(metrics),
    context: scoreDashboardContext(metrics),
  }

  if (empty) {
    scores.clarity = DASHBOARD_PROFILE_SCORE_DEFAULT
    scores.safety = DASHBOARD_PROFILE_SCORE_DEFAULT
    scores.workflow = DASHBOARD_PROFILE_SCORE_DEFAULT
    scores.complexity = DASHBOARD_PROFILE_SCORE_DEFAULT
    scores.context = DASHBOARD_PROFILE_SCORE_DEFAULT
  }

  for (const [axis, adjustment] of Object.entries(aiAdjustments) as [DashboardProfileAxis, number][]) {
    scores[axis] = clamp(scores[axis] + adjustment)
    if (axis === 'workflow')
      scores[axis] = Math.min(scores[axis], getDashboardWorkflowEvidenceCap(metrics))
    if (axis === 'clarity')
      scores[axis] = Math.min(scores[axis], getDashboardClarityEvidenceCap(metrics))
  }

  const overallScore = clamp(Object.entries(DASHBOARD_PROFILE_AXIS_WEIGHTS).reduce((sum, [axis, weight]) => sum + scores[axis as DashboardProfileAxis] * weight, 0))
  const evidenceCount = metrics.commitCount + metrics.pullRequestCount
  const confidence = clamp(
    DASHBOARD_PROFILE_CONFIDENCE_RULES.baseline
    + Math.min(evidenceCount / DASHBOARD_PROFILE_CONFIDENCE_RULES.evidenceCountForMaximum, 1) * DASHBOARD_PROFILE_CONFIDENCE_RULES.evidenceContribution,
  )
  const commitDates = context.commits.map(commit => commit.committedAt).filter((date): date is string => Boolean(date)).sort()
  const roleClassification = resolveDashboardProfileRole({
    scores,
    commitCount: metrics.commitCount,
    hasPatchEvidence: context.commits.some(commit => commit.files.some(file => Boolean(file.patch?.trim()))),
  })

  return {
    version: 'v2',
    username: context.username,
    scores,
    overallScore,
    grade: gradeForDashboardScore(overallScore),
    role: roleClassification.primary,
    roleCandidates: roleClassification.candidates,
    roleStatus: roleClassification.status,
    derivedMetrics: metrics,
    confidence,
    safetyAiDefenseBonus: Math.round(safetyBreakdown.aiDefenseBonus),
    ...(aiSafety ? { aiSafety } : {}),
    ...(aiReview ? { aiReview } : {}),
    aiAdjustments,
    evidenceWindow: {
      commitCount: metrics.commitCount,
      pullRequestCount: metrics.pullRequestCount,
      source: context.collection?.mode === 'dashboard' ? 'github-repository-evidence' : 'github-public-activity',
      ...(commitDates[0] ? { from: commitDates[0] } : {}),
      ...(commitDates.at(-1) ? { to: commitDates.at(-1) } : {}),
    },
  }
}

export { deriveDashboardMetrics, getDashboardContextScoreBreakdown }
