import type { DashboardPatchSelectionRules } from './types'

export interface DashboardAiReviewLimits {
  maxCommits: number
  maxFiles: number
  maxPatchCharsPerFile: number
  maxTotalPatchChars: number
  maxOutputTokens: number
}

export const DASHBOARD_AI_REVIEW_LIMITS = {
  maxCommits: 3,
  maxFiles: 12,
  maxPatchCharsPerFile: 700,
  maxTotalPatchChars: 9000,
  maxOutputTokens: 3200,
} as const satisfies DashboardAiReviewLimits

export const DASHBOARD_PATCH_SELECTION_RULES = {
  minimumPatchLineLength: 1,
  safetyRelevanceWeight: 6,
  maximumRelevanceLines: 20,
  emptyMedianSize: 0,
} as const satisfies DashboardPatchSelectionRules
