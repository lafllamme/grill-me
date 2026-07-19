import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RebrandEvidenceReference, RebrandReasoningStep } from '~/components/rebrand/rebrand-reasoning.model'
import { computed, toValue } from 'vue'

interface NormalizedStatus {
  phase: string
  message: string
}

interface PhasePresentation {
  description: string
  icon: string
}

const PHASE_PRESENTATION: Record<string, PhasePresentation> = {
  fetching_github: {
    description: 'Opening the public activity feed and enriching commit references with file-level diffs.',
    icon: 'ph:github-logo',
  },
  selecting_evidence: {
    description: 'Ranking code-heavy changes and separating useful evidence from dependency noise.',
    icon: 'ph:funnel',
  },
  building_prompt: {
    description: 'Packing commit messages, diff statistics, filenames, and safe patch excerpts for the reviewer.',
    icon: 'ph:brackets-curly',
  },
  calling_ai: {
    description: 'Turning verified engineering decisions into technically defensible emotional damage.',
    icon: 'ph:sparkle',
  },
  parsing_output: {
    description: 'Reading the structured response as it arrives and releasing complete fields immediately.',
    icon: 'ph:code',
  },
  finalizing: {
    description: 'Calculating the verdict metadata and sealing the result receipt.',
    icon: 'ph:seal-check',
  },
}

const PREVIEW_EVIDENCE: Record<string, RebrandEvidenceReference[]> = {
  fetching_github: [
    { kind: 'repository', label: 'lafllamme/grill-me' },
    { kind: 'repository', label: 'public activity' },
  ],
  selecting_evidence: [
    { kind: 'commit', label: '24bf9bd' },
    { kind: 'commit', label: '6 commits ranked' },
  ],
  building_prompt: [
    { kind: 'file', label: 'RebrandLiveRoastStage.vue' },
    { kind: 'file', label: 'useRoastPreview.ts' },
  ],
  calling_ai: [
    { kind: 'prompt', label: 'grill-v3.2.0' },
    { kind: 'prompt', label: 'structured stream' },
  ],
}

function normalizeStatus(status: string): NormalizedStatus {
  const separatorIndex = status.indexOf('] ')
  const hasPhasePrefix = status.startsWith('[') && separatorIndex > 1

  return {
    phase: hasPhasePrefix ? status.slice(1, separatorIndex) : 'processing',
    message: hasPhasePrefix ? status.slice(separatorIndex + 2) : status,
  }
}

export function useRoastReasoning(
  statuses: MaybeRefOrGetter<string[]>,
  isActive: MaybeRefOrGetter<boolean>,
  isPreview: MaybeRefOrGetter<boolean>,
): ComputedRef<RebrandReasoningStep[]> {
  return computed(() => {
    const normalizedStatuses = toValue(statuses).map(normalizeStatus)
    const latestIndex = normalizedStatuses.length - 1
    const hasActiveStep = toValue(isActive)

    return normalizedStatuses.map((status, index) => {
      const presentation = PHASE_PRESENTATION[status.phase] ?? {
        description: 'Preparing the next verified stage of the roast.',
        icon: 'ph:circle-notch',
      }

      return {
        id: `${status.phase}-${index}`,
        phase: status.phase.replaceAll('_', ' '),
        label: status.message,
        description: presentation.description,
        icon: presentation.icon,
        status: index === latestIndex && hasActiveStep ? 'active' : 'complete',
        evidence: toValue(isPreview) ? PREVIEW_EVIDENCE[status.phase] ?? [] : [],
      }
    })
  })
}
