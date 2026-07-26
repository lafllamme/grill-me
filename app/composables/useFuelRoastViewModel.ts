import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RoastMetrics, RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import { computed, toValue } from 'vue'

const FALLBACK_METRICS: RoastMetrics = {
  spaghettiIndex: 71,
  stinkScore: 78,
  egoDamage: 84,
  grade: 'C-',
  specialTitle: 'Abstraction Witness Protection',
}

const FALLBACK_EVIDENCE: RoastStreamEvidenceEvent = {
  type: 'evidence',
  commits: [
    {
      repo: 'lafllamme/grill-me',
      sha: '1c83407',
      message: 'feat: add evidence-aware roast reasoning preview',
      additions: 522,
      deletions: 101,
      changedFiles: 11,
      files: [
        { filename: 'app/components/rebrand/RebrandLiveRoastStage.vue', status: 'modified', additions: 17, deletions: 83 },
        { filename: 'app/components/rebrand/RebrandReasoning.vue', status: 'added', additions: 85, deletions: 0 },
        { filename: 'app/composables/useRoastReasoning.ts', status: 'added', additions: 98, deletions: 0 },
      ],
    },
    {
      repo: 'lafllamme/grill-me',
      sha: '73e2475',
      message: 'feat: stream evidence into roast generation',
      additions: 249,
      deletions: 38,
      changedFiles: 7,
      files: [
        { filename: 'server/roast/orchestrator-stream.ts', status: 'modified', additions: 104, deletions: 22 },
        { filename: 'shared/roast/contracts.ts', status: 'modified', additions: 48, deletions: 4 },
      ],
    },
    {
      repo: 'lafllamme/portfolio-app',
      sha: 'b164b7c',
      message: 'feat: add interactive homepage chapters',
      additions: 399,
      deletions: 264,
      changedFiles: 9,
      files: [
        { filename: 'app/pages/index.vue', status: 'modified', additions: 184, deletions: 147 },
        { filename: 'app/components/StickyTimeline.vue', status: 'added', additions: 96, deletions: 0 },
      ],
    },
  ],
  prs: [],
}

const FALLBACK_TITLE = 'Abstraction Witness Protection'
const FALLBACK_ROAST_LINES = [
  'You did not remove complexity. You gave it aliases and hoped nobody would check the imports.',
  'That helper wraps a one-line API so thoroughly it now needs onboarding documentation.',
  'Your component tree has the confidence of an architecture diagram and the boundaries of spilled soup.',
]
const FALLBACK_FEEDBACK = [
  'Delete pass-through wrappers that do not own state, policy, or transformation.',
  'Move repeated request-state handling into one typed composable with an explicit contract.',
  'Add one behavior-level test before the next abstraction gets a factory.',
]

interface FuelRoastViewModelInput {
  username: MaybeRefOrGetter<string>
  title: MaybeRefOrGetter<string>
  roastLines: MaybeRefOrGetter<string[]>
  feedback: MaybeRefOrGetter<string[]>
  statuses: MaybeRefOrGetter<string[]>
  evidence: MaybeRefOrGetter<RoastStreamEvidenceEvent | null>
  metrics: MaybeRefOrGetter<RoastMetrics | null>
  intensityLabel: MaybeRefOrGetter<string>
  isPending: MaybeRefOrGetter<boolean>
  isStreaming: MaybeRefOrGetter<boolean>
  error: MaybeRefOrGetter<string | null>
  isActive: MaybeRefOrGetter<boolean>
}

export function useFuelRoastViewModel(input: FuelRoastViewModelInput): ComputedRef<FuelRoastViewModel> {
  return computed(() => {
    const title = toValue(input.title)
    const roastLines = toValue(input.roastLines)
    const feedback = toValue(input.feedback)
    const evidence = toValue(input.evidence) ?? FALLBACK_EVIDENCE
    const metrics = toValue(input.metrics) ?? FALLBACK_METRICS
    const isLive = toValue(input.isPending) || toValue(input.isStreaming)
    const hasResult = Boolean(title || roastLines.length || feedback.length)
    const commits = evidence.commits
    const files = commits.flatMap(commit => commit.files.map(file => ({
      ...file,
      repo: commit.repo,
      sha: commit.sha,
    })))

    return {
      username: toValue(input.username) || 'lafllamme',
      title: title || FALLBACK_TITLE,
      roastLines: roastLines.length ? roastLines : FALLBACK_ROAST_LINES,
      feedback: feedback.length ? feedback : FALLBACK_FEEDBACK,
      statuses: toValue(input.statuses),
      evidence,
      commits,
      files,
      metrics,
      intensityLabel: toValue(input.intensityLabel),
      stateLabel: toValue(input.error)
        ? 'Interrupted'
        : isLive
          ? 'Live'
          : hasResult && toValue(input.isActive)
            ? 'Filed'
            : 'Ready',
      hasResult,
      isLive,
      diffLineCount: commits.reduce((total, commit) => total + commit.additions + commit.deletions, 0),
    }
  })
}
