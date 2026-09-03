export type DashboardEvidenceState = 'sufficient' | 'expanded-window' | 'limited-history' | 'limited-patches'

export interface DashboardCommitRef {
  repo: string
  sha: string
  message: string
  committedAt?: string
  authorLogin?: string
  committerLogin?: string
  parentCount?: number
  isMerge?: boolean
}

export interface DashboardRepositorySamplingSummary {
  candidateRefs: number
  personalRefs: number
  detailsFetched: number
  personalWithPatch: number
}

export interface DashboardSamplingSummary {
  candidateRefs: number
  integrationSkipped: number
  personalRefs: number
  detailsFetched: number
  personalWithPatch: number
  backfilled: number
  aiSelected?: number
  aiSelectedFiles?: number
  evidenceState: DashboardEvidenceState
  perRepository: Record<string, DashboardRepositorySamplingSummary>
}

export function commitRefKey(ref: Pick<DashboardCommitRef, 'repo' | 'sha'>): string {
  return `${ref.repo}:${ref.sha}`
}

export function commitTimestamp(value?: string): number {
  if (!value)
    return 0

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function isIntegrationCommitRef(ref: DashboardCommitRef): boolean {
  return ref.isMerge ?? (ref.parentCount !== undefined
    ? ref.parentCount > 1
    : /^merge\s/i.test(ref.message) || /\bmerge branch\b/i.test(ref.message))
}

export function sortCommitRefs(refs: readonly DashboardCommitRef[]): DashboardCommitRef[] {
  return [...refs].sort((left, right) => commitTimestamp(right.committedAt) - commitTimestamp(left.committedAt) || right.sha.localeCompare(left.sha))
}

/**
 * Keeps one recent authored reference per repository before filling by recency.
 * This prevents a single busy repository from consuming the complete window.
 */
export function orderAuthoredCommitRefs(refs: readonly DashboardCommitRef[], repositoryOrder: readonly string[] = []): DashboardCommitRef[] {
  const authored = sortCommitRefs(refs.filter(ref => !isIntegrationCommitRef(ref)))
  const byRepository = new Map<string, DashboardCommitRef[]>()

  for (const ref of authored) {
    const repositoryRefs = byRepository.get(ref.repo) ?? []
    repositoryRefs.push(ref)
    byRepository.set(ref.repo, repositoryRefs)
  }

  const ordered: DashboardCommitRef[] = []
  const selected = new Set<string>()
  const repositories = [...new Set([...repositoryOrder, ...authored.map(ref => ref.repo)])]

  for (const repo of repositories) {
    const ref = byRepository.get(repo)?.[0]
    if (!ref)
      continue

    ordered.push(ref)
    selected.add(commitRefKey(ref))
  }

  for (const ref of authored) {
    if (!selected.has(commitRefKey(ref)))
      ordered.push(ref)
  }

  return ordered
}

export function selectDashboardCandidateRefs(refs: readonly DashboardCommitRef[], repositoryOrder: readonly string[], maximum: number): DashboardCommitRef[] {
  const authored = orderAuthoredCommitRefs(refs, repositoryOrder)
  const integrations = sortCommitRefs(refs.filter(isIntegrationCommitRef))
  return [...authored, ...integrations].slice(0, maximum)
}

export function deriveDashboardEvidenceState(input: {
  personalRefs: number
  personalWithPatch: number
  targetPersonalRefs: number
  minimumPersonalRefs: number
  minimumPersonalPatches: number
  backfilled: number
}): DashboardEvidenceState {
  if (input.personalRefs < input.minimumPersonalRefs)
    return 'limited-history'

  if (input.personalWithPatch < input.minimumPersonalPatches)
    return 'limited-patches'

  if (input.backfilled > 0 && input.personalRefs < input.targetPersonalRefs)
    return 'expanded-window'

  if (input.backfilled > 0)
    return 'expanded-window'

  return 'sufficient'
}
