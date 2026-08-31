import type { GithubCommit, GithubCommitFile, GithubContext } from './github-collector'

export const DASHBOARD_AI_REVIEW_LIMITS = {
  maxCommits: 3,
  maxFiles: 12,
  maxPatchCharsPerFile: 700,
  maxTotalPatchChars: 9000,
  maxOutputTokens: 3200,
} as const

export type DashboardPatchSelectionReason
  = | 'latest'
    | 'largest'
    | 'safety-signal'

export interface DashboardPatchSelectionCommit {
  commit: GithubCommit
  reasons: DashboardPatchSelectionReason[]
}

export interface DashboardPatchSelectionFile {
  commitSha: string
  repo: string
  filename: string
  status: string
  patch: string
  reason: DashboardPatchSelectionReason
}

export interface DashboardPatchSelection {
  commits: DashboardPatchSelectionCommit[]
  files: DashboardPatchSelectionFile[]
  usablePatchCount: number
  totalPatchChars: number
}

const safetyFilePattern = /(?:^|\/)(?:auth|security|permission|permissions|secret|secrets|credential|database|db|payment|payments|validator|validation|schema|middleware|guards?)(?:\/|\.|$)|(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:dockerfile|jenkinsfile|azure-pipelines\.ya?ml)$/i
const safetyPatchPattern = /\b(?:eval|child_process|exec|spawn)\s*\(|\binnerHTML\s*=|dangerouslySetInnerHTML|\b(?:validate|sanitize|escape|authorize|permission|fallback|throw new|secret|token|password|api[_-]?key)\b/i
const generatedFilePattern = /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|\.nuxt)(?:\/|$)|(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|minified|generated)/i

function commitTimestamp(commit: GithubCommit): number {
  if (!commit.committedAt)
    return 0

  const timestamp = Date.parse(commit.committedAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function isMergeCommit(commit: GithubCommit): boolean {
  return commit.isMerge ?? (commit.parentCount !== undefined
    ? commit.parentCount > 1
    : /^merge\s/i.test(commit.message) || /\bmerge branch\b/i.test(commit.message))
}

function hasUsefulPatch(file: GithubCommitFile): boolean {
  if (!file.patch?.trim() || generatedFilePattern.test(file.filename))
    return false

  return file.patch
    .split('\n')
    .some(line => (line.startsWith('+') || line.startsWith('-')) && !line.startsWith('+++') && !line.startsWith('---') && line.length > 1)
}

function commitSize(commit: GithubCommit): number {
  return commit.additions + commit.deletions
}

function fileRelevance(file: GithubCommitFile, reason: DashboardPatchSelectionReason): number {
  const patch = file.patch ?? ''
  const lineCount = patch.split('\n').filter(line => line.startsWith('+') || line.startsWith('-')).length
  const safety = safetyFilePattern.test(file.filename) || safetyPatchPattern.test(patch) ? 6 : 0
  const reasonWeight = reason === 'safety-signal' ? safety : 0
  return reasonWeight + Math.min(lineCount, 20)
}

function addCommit(selected: Map<string, DashboardPatchSelectionCommit>, commit: GithubCommit | undefined, reason: DashboardPatchSelectionReason): void {
  if (!commit)
    return

  const existing = selected.get(commit.sha)
  if (existing) {
    if (!existing.reasons.includes(reason))
      existing.reasons.push(reason)
    return
  }

  if (selected.size < DASHBOARD_AI_REVIEW_LIMITS.maxCommits)
    selected.set(commit.sha, { commit, reasons: [reason] })
}

function selectBy(
  commits: readonly GithubCommit[],
  predicate: (commit: GithubCommit) => boolean,
  sort: (left: GithubCommit, right: GithubCommit) => number,
): GithubCommit | undefined {
  return commits.filter(predicate).sort(sort)[0]
}

/**
 * Selects a deterministic, stratified patch sample for one dashboard AI call.
 * It includes the latest, largest, and most safety-relevant authored commits
 * while excluding integration-only and generated-file patches from review.
 */
export function selectDashboardPatchEvidence(context: GithubContext): DashboardPatchSelection {
  const eligible = context.commits
    .filter(commit => !isMergeCommit(commit) && commit.files.some(hasUsefulPatch))
    .sort((left, right) => commitTimestamp(right) - commitTimestamp(left) || right.sha.localeCompare(left.sha))
  const selected = new Map<string, DashboardPatchSelectionCommit>()

  addCommit(selected, eligible[0], 'latest')

  addCommit(selected, selectBy(eligible, () => true, (left, right) => commitSize(right) - commitSize(left) || commitTimestamp(right) - commitTimestamp(left)), 'largest')
  addCommit(selected, selectBy(eligible, commit => commit.files.some(file => safetyFilePattern.test(file.filename) || safetyPatchPattern.test(file.patch ?? '')), (left, right) => commitTimestamp(right) - commitTimestamp(left) || commitSize(right) - commitSize(left)), 'safety-signal')

  const commits = Array.from(selected.values())
  const files: DashboardPatchSelectionFile[] = []
  let totalPatchChars = 0
  for (const selectedCommit of commits) {
    const reason = selectedCommit.reasons.find(item => item === 'safety-signal')
      ?? selectedCommit.reasons.find(item => item === 'largest')
      ?? 'latest'
    const candidateFiles = selectedCommit.commit.files
      .filter(hasUsefulPatch)
      .sort((left, right) => fileRelevance(right, reason) - fileRelevance(left, reason) || left.filename.localeCompare(right.filename))

    for (const file of candidateFiles) {
      if (files.length >= DASHBOARD_AI_REVIEW_LIMITS.maxFiles || totalPatchChars >= DASHBOARD_AI_REVIEW_LIMITS.maxTotalPatchChars)
        break

      const patch = file.patch!.slice(0, Math.min(DASHBOARD_AI_REVIEW_LIMITS.maxPatchCharsPerFile, DASHBOARD_AI_REVIEW_LIMITS.maxTotalPatchChars - totalPatchChars))
      if (!patch)
        continue

      files.push({
        commitSha: selectedCommit.commit.sha,
        repo: selectedCommit.commit.repo,
        filename: file.filename,
        status: file.status,
        patch,
        reason,
      })
      totalPatchChars += patch.length
    }
  }

  return {
    commits,
    files,
    usablePatchCount: eligible.length,
    totalPatchChars,
  }
}
