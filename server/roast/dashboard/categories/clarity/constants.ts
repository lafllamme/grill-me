import type { ClarityEvidenceRules, ClarityScoreWeights, ClaritySignalRules } from './types'

export const CLARITY_SCORE_DEFAULT = 50

export const CLARITY_SCORE_WEIGHTS = {
  message: 0.35,
  naming: 0.30,
  structure: 0.35,
} as const satisfies ClarityScoreWeights

export const CLARITY_EVIDENCE_RULES = {
  minimumTotalCommits: 3,
  minimumPersonalCommits: 3,
  minimumPatchCommits: 3,
  broadPersonalCommits: 6,
  limitedEvidenceCap: 90,
  broadEvidenceCap: 95,
} as const satisfies ClarityEvidenceRules

export const CLARITY_SIGNAL_RULES = {
  maximumSignal: 100,
  longLinePenalty: 45,
  deepIndentationPenalty: 55,
} as const satisfies ClaritySignalRules
