import type { GithubCommit } from '../../github-collector'
import type { DashboardPatchSelection } from '../patch-selection'
import type { DashboardAiAxisReview, DashboardAiReviewAssessment, DashboardAiReviewEvidence, DashboardAiReviewFinding, DashboardAiSafetyAssessment, DashboardSafetyCategory, DashboardSafetySignal } from './types'
import { AI_REVIEW_RUNTIME_CONFIG } from './constants'

export function hasKnownCommitSha(signalSha: string, commits: readonly GithubCommit[]): boolean {
  return commits.some(commit => signalSha === commit.sha || commit.sha.startsWith(signalSha) || signalSha.startsWith(commit.sha))
}

export function isGroundedFinding(finding: DashboardAiReviewFinding, selection: DashboardPatchSelection): boolean {
  return selection.files.some(file => (
    (finding.commitSha === file.commitSha || file.commitSha.startsWith(finding.commitSha) || finding.commitSha.startsWith(file.commitSha))
    && finding.filename === file.filename
  ))
}

export function isGroundedAxisReviewEvidence(evidence: DashboardAiReviewEvidence, selection: DashboardPatchSelection): boolean {
  return selection.files.some(file => (
    (evidence.commitSha === file.commitSha || file.commitSha.startsWith(evidence.commitSha) || evidence.commitSha.startsWith(file.commitSha))
    && evidence.filename === file.filename
  ))
}

export function normalizeAxisReviewEvidence(axisReview: DashboardAiAxisReview, selection: DashboardPatchSelection): DashboardAiAxisReview | null {
  const evidence = axisReview.evidence.filter(item => isGroundedAxisReviewEvidence(item, selection))
  const distinctEvidence = new Set(evidence.map(item => `${item.commitSha}:${item.filename}`))
  const minimumEvidence = axisReview.verdict === 'supports'
    ? AI_REVIEW_RUNTIME_CONFIG.minimumSupportsEvidence
    : axisReview.verdict === 'insufficient'
      ? AI_REVIEW_RUNTIME_CONFIG.minimumInsufficientEvidence
      : AI_REVIEW_RUNTIME_CONFIG.minimumGroundedEvidence

  if (distinctEvidence.size < minimumEvidence)
    return null

  return { ...axisReview, evidence }
}

export function toDashboardAiSafetyAssessment(review: DashboardAiReviewAssessment): DashboardAiSafetyAssessment {
  const signals: DashboardSafetySignal[] = review.findings
    .filter((finding): finding is DashboardAiReviewFinding & { category: DashboardSafetyCategory } => finding.axis === 'safety' && Boolean(finding.category))
    .map(finding => ({
      category: finding.category,
      verdict: finding.verdict === 'positive' ? 'safe' : finding.verdict === 'negative' ? 'risk' : 'unclear',
      impact: finding.impact,
      severity: finding.severity,
      commitSha: finding.commitSha,
      filename: finding.filename,
      evidence: finding.evidence,
    }))

  return {
    confidence: review.confidence,
    signals,
    status: review.status,
    ...(review.diagnostic ? { diagnostic: review.diagnostic === 'missing-findings-or-invalid-json' ? 'missing-signals-or-invalid-json' : review.diagnostic } : {}),
    ...(review.responsePath ? { responsePath: review.responsePath } : {}),
    ...(review.responseShape ? { responseShape: review.responseShape } : {}),
  }
}
