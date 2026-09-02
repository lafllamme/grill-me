/**
 * Compatibility facade for the single dashboard AI review.
 *
 * The implementation now lives under `dashboard/ai-review` so prompt,
 * parsing, grounding, adjustment, and request concerns can evolve separately.
 */
export { computeDashboardAiAdjustments } from './dashboard/ai-review'
export { assessDashboardProfileWithAi, assessDashboardSafetyWithAi } from './dashboard/ai-review'
export { buildDashboardReviewPrompt, dashboardCategoryQuestions } from './dashboard/ai-review'
export { parseDashboardReview } from './dashboard/ai-review'
export { toDashboardAiSafetyAssessment } from './dashboard/ai-review'
export type { DashboardAiAxisReview, DashboardAiAxisReviewVerdict, DashboardAiReviewAssessment, DashboardAiReviewBaseline, DashboardAiReviewEvidence, DashboardAiReviewFinding, DashboardAiSafetyAssessment, DashboardReviewAxis, DashboardReviewSelection, DashboardReviewVerdict, DashboardSafetyCategory, DashboardSafetyImpact, DashboardSafetySeverity, DashboardSafetySignal, DashboardSafetyVerdict } from './dashboard/ai-review'
