import type { DashboardWorkflowScoreBreakdown, WorkflowScoreInput } from './types'
import { clamp } from '../../shared/math'
import { WORKFLOW_EVIDENCE_RULES, WORKFLOW_SCOPE_RULES, WORKFLOW_SCORE_DEFAULT, WORKFLOW_SCORE_WEIGHTS } from './constants'

export function getDashboardWorkflowEvidenceCap(metrics: Pick<WorkflowScoreInput, 'workflowCommitCount' | 'workflowPatchCommitCount'>): number {
  if (metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.minimumPersonalCommits)
    return WORKFLOW_SCORE_DEFAULT
  if (metrics.workflowPatchCommitCount < WORKFLOW_EVIDENCE_RULES.minimumPatchCommits
    || metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.usablePersonalCommits) {
    return WORKFLOW_EVIDENCE_RULES.limitedEvidenceCap
  }
  if (metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.strongPersonalCommits)
    return WORKFLOW_EVIDENCE_RULES.usableEvidenceCap
  return WORKFLOW_EVIDENCE_RULES.strongEvidenceCap
}

function getDashboardWorkflowEvidenceQuality(metrics: Pick<WorkflowScoreInput, 'workflowCommitCount' | 'workflowPatchCommitCount'>): DashboardWorkflowScoreBreakdown['evidenceQuality'] {
  if (metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.minimumPersonalCommits)
    return 'insufficient'
  if (metrics.workflowPatchCommitCount < WORKFLOW_EVIDENCE_RULES.minimumPatchCommits
    || metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.usablePersonalCommits) {
    return 'limited'
  }
  if (metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.strongPersonalCommits)
    return 'usable'
  return 'strong'
}

export function getDashboardWorkflowScoreBreakdown(metrics: WorkflowScoreInput): DashboardWorkflowScoreBreakdown {
  if (metrics.workflowCommitCount === 0) {
    return {
      messageSignal: WORKFLOW_SCORE_DEFAULT,
      medianScopeSignal: WORKFLOW_SCORE_DEFAULT,
      p75ScopeSignal: WORKFLOW_SCORE_DEFAULT,
      fileScopeSignal: WORKFLOW_SCORE_DEFAULT,
      outlierSignal: WORKFLOW_SCORE_DEFAULT,
      granularitySignal: WORKFLOW_SCORE_DEFAULT,
      reviewSignal: WORKFLOW_SCORE_DEFAULT,
      reviewEvidenceAvailable: false,
      evidenceCap: WORKFLOW_SCORE_DEFAULT,
      evidenceQuality: 'insufficient',
      rawScore: WORKFLOW_SCORE_DEFAULT,
    }
  }

  const medianScopeSignal = clamp(WORKFLOW_SCOPE_RULES.maximumSignal - Math.max(0, metrics.workflowMedianFilesPerCommit - WORKFLOW_SCOPE_RULES.medianScopeBaselineFiles) * WORKFLOW_SCOPE_RULES.medianScopePenaltyPerFile)
  const p75ScopeSignal = clamp(WORKFLOW_SCOPE_RULES.maximumSignal - Math.max(0, metrics.workflowP75FilesPerCommit - WORKFLOW_SCOPE_RULES.p75ScopeBaselineFiles) * WORKFLOW_SCOPE_RULES.p75ScopePenaltyPerFile)
  const fileScopeSignal = medianScopeSignal * WORKFLOW_SCOPE_RULES.medianScopeWeight + p75ScopeSignal * WORKFLOW_SCOPE_RULES.p75ScopeWeight
  const outlierSignal = WORKFLOW_SCOPE_RULES.maximumSignal - metrics.workflowLargeCommitRatio
  const reviewSignal = metrics.pullRequestCoverage > 0 ? metrics.pullRequestCoverage : WORKFLOW_SCORE_DEFAULT
  const reviewEvidenceAvailable = metrics.pullRequestCoverage > 0
  const granularitySignal = fileScopeSignal * WORKFLOW_SCOPE_RULES.fileScopeWeight + outlierSignal * WORKFLOW_SCOPE_RULES.outlierWeight
  const weightedSignals = metrics.workflowMessageQuality * WORKFLOW_SCORE_WEIGHTS.message
    + granularitySignal * WORKFLOW_SCORE_WEIGHTS.granularity
    + (reviewEvidenceAvailable ? reviewSignal * WORKFLOW_SCORE_WEIGHTS.review : 0)
  const observedWeight = reviewEvidenceAvailable ? 1 : WORKFLOW_SCORE_WEIGHTS.noReviewObservedWeight

  return {
    messageSignal: metrics.workflowMessageQuality,
    medianScopeSignal,
    p75ScopeSignal,
    fileScopeSignal,
    outlierSignal,
    granularitySignal,
    reviewSignal,
    reviewEvidenceAvailable,
    evidenceCap: getDashboardWorkflowEvidenceCap(metrics),
    evidenceQuality: getDashboardWorkflowEvidenceQuality(metrics),
    rawScore: clamp(weightedSignals / observedWeight),
  }
}

export function scoreDashboardWorkflow(metrics: WorkflowScoreInput): number {
  if (metrics.commitCount < WORKFLOW_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < WORKFLOW_EVIDENCE_RULES.minimumPersonalCommits) {
    return WORKFLOW_SCORE_DEFAULT
  }
  if (metrics.workflowCommitCount === 0)
    return WORKFLOW_SCORE_DEFAULT
  return Math.min(getDashboardWorkflowScoreBreakdown(metrics).rawScore, getDashboardWorkflowEvidenceCap(metrics))
}
