import type { WorkflowScoreInput } from './types'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { WORKFLOW_AI_QUESTION } from './constants'
import { getDashboardWorkflowEvidenceCap, getDashboardWorkflowScoreBreakdown } from './score'

export const workflowQuestion = WORKFLOW_AI_QUESTION

export function buildWorkflowAiContext(metrics: WorkflowScoreInput) {
  const breakdown = getDashboardWorkflowScoreBreakdown(metrics)

  return {
    personalCommitCount: metrics.workflowCommitCount,
    patchCommitCount: metrics.workflowPatchCommitCount,
    messageQuality: metrics.workflowMessageQuality,
    conventionalMessageRatio: metrics.workflowConventionalMessageRatio ?? DASHBOARD_METRIC_RULES.emptyValue,
    averageFilesPerCommit: metrics.workflowAverageFilesPerCommit,
    medianFilesPerCommit: metrics.workflowMedianFilesPerCommit,
    p75FilesPerCommit: metrics.workflowP75FilesPerCommit,
    largeCommitRatio: metrics.workflowLargeCommitRatio,
    medianScopeSignal: breakdown.medianScopeSignal,
    p75ScopeSignal: breakdown.p75ScopeSignal,
    fileScopeSignal: breakdown.fileScopeSignal,
    outlierSignal: breakdown.outlierSignal,
    granularitySignal: breakdown.granularitySignal,
    reviewSignal: breakdown.reviewSignal,
    reviewEvidenceAvailable: breakdown.reviewEvidenceAvailable,
    evidenceCap: getDashboardWorkflowEvidenceCap(metrics),
    evidenceQuality: breakdown.evidenceQuality,
    mergeCommitRatio: metrics.mergeCommitRatio,
  }
}
