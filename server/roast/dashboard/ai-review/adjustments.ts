import type { DashboardProfileAxis } from '~~/shared/dashboard/contracts'
import type { GithubCommit } from '../../github-collector'
import type { DashboardAiReviewAssessment, DashboardAiReviewEvidence } from './types'
import { AI_REVIEW_RUNTIME_CONFIG } from './constants'

function isGroundedReviewEvidence(evidence: DashboardAiReviewEvidence, commits: readonly GithubCommit[]): boolean {
  return commits.some(commit => (
    (evidence.commitSha === commit.sha || commit.sha.startsWith(evidence.commitSha) || evidence.commitSha.startsWith(commit.sha))
    && commit.files.some(file => file.filename === evidence.filename)
  ))
}

/**
 * Lets the single AI review refine non-safety axes only after it has supplied
 * a high-confidence, grounded axis verdict with at least two patch references.
 * Safety remains governed by confirmed-risk penalties so semantic prose cannot
 * inflate or collapse that score.
 */
export function computeDashboardAiAdjustments(review: DashboardAiReviewAssessment | undefined, commits: readonly GithubCommit[]): Partial<Record<DashboardProfileAxis, number>> {
  if (!review || review.status !== 'assessed' || review.confidence < AI_REVIEW_RUNTIME_CONFIG.minimumReviewConfidence)
    return {}

  const adjustments: Partial<Record<DashboardProfileAxis, number>> = {}
  for (const axis of ['clarity', 'workflow', 'complexity', 'context'] as const) {
    const axisReview = review.axisReviews?.find(item => item.axis === axis)
    if (!axisReview || axisReview.confidence < AI_REVIEW_RUNTIME_CONFIG.minimumAxisConfidence || axisReview.verdict === 'supports' || axisReview.verdict === 'insufficient')
      continue

    const groundedEvidence = axisReview.evidence.filter(evidence => isGroundedReviewEvidence(evidence, commits))
    const distinctEvidence = new Set(groundedEvidence.map(evidence => `${evidence.commitSha}:${evidence.filename}`))
    if (distinctEvidence.size < AI_REVIEW_RUNTIME_CONFIG.minimumGroundedEvidence)
      continue

    if (axisReview.verdict === 'softens')
      adjustments[axis] = AI_REVIEW_RUNTIME_CONFIG.maximumAxisAdjustment
    if (axisReview.verdict === 'contradicts')
      adjustments[axis] = -AI_REVIEW_RUNTIME_CONFIG.maximumAxisAdjustment
  }

  return adjustments
}
