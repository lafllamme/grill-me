import type { ComplexityScoreInput, DashboardComplexityScoreBreakdown } from './types'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { clamp } from '../../shared/math'
import { COMPLEXITY_EVIDENCE_RULES, COMPLEXITY_SCORE_DEFAULT, COMPLEXITY_SCORING_RULES } from './constants'

export function getDashboardComplexityEvidenceCap(metrics: Pick<ComplexityScoreInput, 'commitCount' | 'workflowCommitCount'>): number {
  if (metrics.commitCount < COMPLEXITY_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < COMPLEXITY_EVIDENCE_RULES.minimumWorkflowCommits) {
    return COMPLEXITY_SCORE_DEFAULT
  }

  return metrics.workflowCommitCount < COMPLEXITY_EVIDENCE_RULES.limitedEvidenceCommitThreshold
    ? COMPLEXITY_EVIDENCE_RULES.limitedEvidenceCap
    : COMPLEXITY_EVIDENCE_RULES.broadEvidenceCap
}

export function scoreDashboardComplexity(metrics: ComplexityScoreInput): number {
  if (metrics.commitCount < COMPLEXITY_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < COMPLEXITY_EVIDENCE_RULES.minimumWorkflowCommits) {
    return COMPLEXITY_SCORE_DEFAULT
  }

  const rawScore = clamp(
    metrics.complexityScopeSignal * COMPLEXITY_SCORING_RULES.scopeWeight
    + metrics.complexityOutlierSignal * COMPLEXITY_SCORING_RULES.outlierWeight
    + metrics.complexityChurnSignal * COMPLEXITY_SCORING_RULES.churnWeight,
  )

  return Math.min(rawScore, getDashboardComplexityEvidenceCap(metrics))
}

export function getDashboardComplexityScoreBreakdown(metrics: ComplexityScoreInput): DashboardComplexityScoreBreakdown {
  return {
    effectiveFilesP75: metrics.complexityEffectiveFilesP75 ?? COMPLEXITY_SCORE_DEFAULT,
    excludedFileRatio: metrics.complexityExcludedFileRatio ?? DASHBOARD_METRIC_RULES.emptyValue,
    relativeOutlierRatio: metrics.complexityRelativeOutlierRatio ?? COMPLEXITY_SCORE_DEFAULT,
    scopeSignal: metrics.complexityScopeSignal,
    outlierSignal: metrics.complexityOutlierSignal,
    churnSignal: metrics.complexityChurnSignal,
    rawScore: scoreDashboardComplexity(metrics),
  }
}
