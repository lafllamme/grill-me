import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
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

function normalizeStatus(status: string): NormalizedStatus {
  const separatorIndex = status.indexOf('] ')
  const hasPhasePrefix = status.startsWith('[') && separatorIndex > 1

  return {
    phase: hasPhasePrefix ? status.slice(1, separatorIndex) : 'processing',
    message: hasPhasePrefix ? status.slice(separatorIndex + 2) : status,
  }
}

function compactLabel(value: string, maxLength = 42): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`
}

function mapEvidenceByPhase(evidence: RoastStreamEvidenceEvent | null): Record<string, RebrandEvidenceReference[]> {
  if (!evidence)
    return {}

  const repositories = [...new Set(evidence.commits.map(commit => commit.repo))]
  const commits = evidence.commits.slice(0, 3)
  const files = evidence.commits.flatMap(commit => commit.files).slice(0, 4)

  return {
    fetching_github: repositories.slice(0, 3).map(label => ({ kind: 'repository', label })),
    selecting_evidence: commits.map(commit => ({
      kind: 'commit',
      label: `${commit.sha} · ${compactLabel(commit.message, 34)}`,
    })),
    building_prompt: files.map(file => ({
      kind: 'file',
      label: compactLabel(file.filename),
    })),
  }
}

export function useRoastReasoning(
  statuses: MaybeRefOrGetter<string[]>,
  isActive: MaybeRefOrGetter<boolean>,
  evidence: MaybeRefOrGetter<RoastStreamEvidenceEvent | null>,
): ComputedRef<RebrandReasoningStep[]> {
  return computed(() => {
    const normalizedStatuses = toValue(statuses).map(normalizeStatus)
    const latestIndex = normalizedStatuses.length - 1
    const hasActiveStep = toValue(isActive)
    const evidenceByPhase = mapEvidenceByPhase(toValue(evidence))

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
        evidence: evidenceByPhase[status.phase] ?? [],
      }
    })
  })
}
