import type { DashboardAiReviewParserLimits, DashboardAiReviewPromptLimits, DashboardAiReviewRuntimeConfig } from './types'

export const AI_REVIEW_PARSER_LIMITS = {
  maxCommitShaCharacters: 64,
  maxFilenameCharacters: 300,
  maxEvidenceCharacters: 300,
  maxSummaryCharacters: 360,
  maximumSafetySignals: 12,
  maximumResponseKeys: 12,
  maximumNestedResponseKeys: 8,
  maximumAxisEvidence: 4,
  maximumFindings: 12,
  maximumAxisReviews: 5,
  maximumWarningPenalty: 30,
  droppedWarningPenalty: 5,
  otherWarningPenalty: 10,
} as const satisfies DashboardAiReviewParserLimits

export const AI_REVIEW_RUNTIME_CONFIG = {
  fallbackConfidence: 0,
  standaloneMaxTokens: 1100,
  temperature: 0,
  safetyTopP: 0.9,
  profileTopP: 0.1,
  minimumReviewConfidence: 60,
  minimumAxisConfidence: 70,
  minimumGroundedEvidence: 2,
  minimumSupportsEvidence: 1,
  minimumInsufficientEvidence: 0,
  maximumAxisAdjustment: 4,
} as const satisfies DashboardAiReviewRuntimeConfig

export const AI_REVIEW_PROMPT_LIMITS = {
  maximumRepositoryEntries: 24,
  maximumPullRequests: 6,
  maximumChecks: 6,
  shortCommitShaCharacters: 7,
  maximumSafetyCommits: 3,
  safetyPatternMatchWeight: 1,
  maximumCommitSubjectCharacters: 180,
  maximumPullRequestTitleCharacters: 160,
  maximumEvidenceCharacters: 240,
} as const satisfies DashboardAiReviewPromptLimits
