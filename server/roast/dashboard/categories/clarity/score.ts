import type { ClarityScoreInput, DashboardClarityScoreBreakdown } from './types'
import { clamp } from '../../shared/math'
import { CLARITY_EVIDENCE_RULES, CLARITY_SCORE_DEFAULT, CLARITY_SCORE_WEIGHTS } from './constants'

export function getDashboardClarityEvidenceCap(metrics: Pick<ClarityScoreInput, 'commitCount' | 'workflowCommitCount' | 'workflowPatchCommitCount'>): number {
  if (metrics.commitCount < CLARITY_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < CLARITY_EVIDENCE_RULES.minimumPersonalCommits) {
    return CLARITY_SCORE_DEFAULT
  }

  if (metrics.workflowPatchCommitCount < CLARITY_EVIDENCE_RULES.minimumPatchCommits
    || metrics.workflowCommitCount < CLARITY_EVIDENCE_RULES.broadPersonalCommits) {
    return CLARITY_EVIDENCE_RULES.limitedEvidenceCap
  }

  return CLARITY_EVIDENCE_RULES.broadEvidenceCap
}

export function scoreDashboardClarity(metrics: ClarityScoreInput): number {
  if (metrics.commitCount < CLARITY_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < CLARITY_EVIDENCE_RULES.minimumPersonalCommits) {
    return CLARITY_SCORE_DEFAULT
  }

  const rawScore = clamp(
    metrics.workflowMessageQuality * CLARITY_SCORE_WEIGHTS.message
    + metrics.clarityNamingSignal * CLARITY_SCORE_WEIGHTS.naming
    + metrics.clarityStructureSignal * CLARITY_SCORE_WEIGHTS.structure,
  )

  return Math.min(rawScore, getDashboardClarityEvidenceCap(metrics))
}

export function getDashboardClarityScoreBreakdown(metrics: ClarityScoreInput): DashboardClarityScoreBreakdown {
  if (metrics.commitCount < CLARITY_EVIDENCE_RULES.minimumTotalCommits
    || metrics.workflowCommitCount < CLARITY_EVIDENCE_RULES.minimumPersonalCommits) {
    return {
      messageSignal: CLARITY_SCORE_DEFAULT,
      conventionalMessageRatio: CLARITY_SCORE_DEFAULT,
      namingSignal: CLARITY_SCORE_DEFAULT,
      structureSignal: CLARITY_SCORE_DEFAULT,
      namingEvidenceAvailable: false,
      structureEvidenceAvailable: false,
      evidenceCap: CLARITY_SCORE_DEFAULT,
      rawScore: CLARITY_SCORE_DEFAULT,
    }
  }

  return {
    messageSignal: metrics.workflowMessageQuality,
    conventionalMessageRatio: metrics.workflowConventionalMessageRatio,
    namingSignal: metrics.clarityNamingSignal,
    structureSignal: metrics.clarityStructureSignal,
    namingEvidenceAvailable: metrics.clarityNamingEvidenceAvailable,
    structureEvidenceAvailable: metrics.clarityStructureEvidenceAvailable,
    evidenceCap: getDashboardClarityEvidenceCap(metrics),
    rawScore: scoreDashboardClarity(metrics),
  }
}
