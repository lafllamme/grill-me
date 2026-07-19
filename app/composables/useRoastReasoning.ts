import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import type { RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'
import type { RebrandEvidenceReference, RebrandReasoningStep } from '~/components/rebrand/rebrand-reasoning.model'
import { computed, toValue } from 'vue'

interface NormalizedStatus {
  phase: string
  message: string
}

interface PhasePresentation {
  completedLabel?: string
  description: string
  icon: string
  label?: string
}

const PHASE_PRESENTATION: Record<string, PhasePresentation> = {
  fetching_github: {
    completedLabel: 'GitHub evidence collected',
    description: 'Opening the public activity feed and enriching commit references with file-level diffs.',
    icon: 'ph:github-logo',
    label: 'Fetching GitHub evidence',
  },
  selecting_evidence: {
    completedLabel: 'Roast-worthy evidence selected',
    description: 'Ranking code-heavy changes and separating useful evidence from dependency noise.',
    icon: 'ph:funnel',
    label: 'Selecting roast-worthy evidence',
  },
  building_prompt: {
    completedLabel: 'Roast context prepared',
    description: 'Packing commit messages, diff statistics, filenames, and safe patch excerpts for the reviewer.',
    icon: 'ph:brackets-curly',
    label: 'Preparing roast context',
  },
  calling_ai: {
    completedLabel: 'Roast drafted',
    description: 'Turning verified engineering decisions into technically defensible emotional damage.',
    icon: 'ph:sparkle',
    label: 'Building your roast',
  },
  parsing_output: {
    completedLabel: 'Structured verdict parsed',
    description: 'Reading the structured response as it arrives and releasing complete fields immediately.',
    icon: 'ph:code',
    label: 'Reading the structured verdict',
  },
  finalizing: {
    completedLabel: 'Verdict sealed',
    description: 'Calculating the verdict metadata and sealing the result receipt.',
    icon: 'ph:seal-check',
    label: 'Sealing the verdict',
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

function getAiActivities(evidence: RoastStreamEvidenceEvent | null): string[] {
  if (!evidence) {
    return [
      'Reviewing the selected public evidence',
      'Drafting an evidence-backed verdict',
    ]
  }

  const repositoryCount = new Set(evidence.commits.map(commit => commit.repo)).size
  const fileCount = evidence.commits.reduce((total, commit) => total + commit.files.length, 0)
  const activities = [
    `Reviewing ${evidence.commits.length} selected ${evidence.commits.length === 1 ? 'commit' : 'commits'}`,
  ]

  if (repositoryCount > 0)
    activities.push(`Comparing changes across ${repositoryCount} ${repositoryCount === 1 ? 'repository' : 'repositories'}`)

  if (fileCount > 0)
    activities.push(`Inspecting ${fileCount} prompt-relevant ${fileCount === 1 ? 'file' : 'files'}`)

  activities.push('Drafting an evidence-backed verdict')
  return activities
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
    const resolvedEvidence = toValue(evidence)
    const evidenceByPhase = mapEvidenceByPhase(resolvedEvidence)

    return normalizedStatuses.map((status, index) => {
      const presentation = PHASE_PRESENTATION[status.phase] ?? {
        description: 'Preparing the next verified stage of the roast.',
        icon: 'ph:circle-notch',
      }

      const stepStatus = index === latestIndex && hasActiveStep ? 'active' : 'complete'

      return {
        id: `${status.phase}-${index}`,
        phase: status.phase.replaceAll('_', ' '),
        label: stepStatus === 'complete'
          ? presentation.completedLabel ?? presentation.label ?? status.message
          : presentation.label ?? status.message,
        description: presentation.description,
        activities: status.phase === 'calling_ai' ? getAiActivities(resolvedEvidence) : [],
        icon: presentation.icon,
        status: stepStatus,
        evidence: evidenceByPhase[status.phase] ?? [],
      }
    })
  })
}
