import type { ContextCommitRules, ContextEvidenceRules, ContextScoreWeights, ContextSignalRules } from './types'

export const CONTEXT_SCORE_DEFAULT = 50
export const CONTEXT_SCORE_BASELINE = 70
export const CONTEXT_AI_QUESTION = 'Do the changed lines provide enough comments, documentation, examples, or explanatory intent to orient the next contributor?'

export const CONTEXT_SCORE_WEIGHTS = {
  patchExplanation: 0.30,
  orientationArtifact: 0.15,
  commitContext: 0.35,
  repositoryOrientation: 0.05,
  handoff: 0.05,
} as const satisfies ContextScoreWeights

export const CONTEXT_COMMIT_RULES = {
  minimumBodyCharacters: 20,
  minimumSubjectWords: 3,
  emptySubjectPenalty: 20,
  genericSubjectPenalty: 15,
  specificSubjectBonus: 15,
  meaningfulBodyBonus: 15,
  explicitContextBonus: 10,
} as const satisfies ContextCommitRules

export const CONTEXT_SIGNAL_RULES = {
  scoreBaseline: CONTEXT_SCORE_DEFAULT,
  maximumRatio: 1,
  maximumSignal: 100,
  maximumArtifactLift: 40,
  maximumRepositoryLift: 30,
  repositoryArtifactBonus: 8,
  handoffCoverageWeight: 0.20,
  reviewedPullRequestWeight: 20,
  readmeArtifactWeight: 1,
  docsArtifactWeight: 0.8,
  exampleArtifactWeight: 0.6,
} as const satisfies ContextSignalRules

export const CONTEXT_EVIDENCE_RULES = {
  minimumTotalCommits: 3,
  minimumWorkflowCommits: 3,
} as const satisfies ContextEvidenceRules
