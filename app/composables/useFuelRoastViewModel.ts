import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RoastMetrics, RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import { computed, toValue } from 'vue'

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
    const evidence = toValue(input.evidence)
    const metrics = toValue(input.metrics)
    const isLive = toValue(input.isPending) || toValue(input.isStreaming)
    const hasResult = Boolean(title || roastLines.length || feedback.length)
    const commits = evidence?.commits ?? []
    const files = commits.flatMap(commit => commit.files.map(file => ({
      ...file,
      repo: commit.repo,
      sha: commit.sha,
    })))

    return {
      username: toValue(input.username),
      title,
      roastLines,
      feedback,
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
