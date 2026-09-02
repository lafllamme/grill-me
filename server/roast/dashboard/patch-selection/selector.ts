import type { GithubCommit, GithubCommitFile, GithubContext } from '../../github-collector'
import type { DashboardPatchSelection, DashboardPatchSelectionReason } from './types'
import { safetyFilePattern, safetyPatchPattern, safetySurfaceFilePattern } from '../categories/safety'
import { commitSize, commitTimestamp, isMergeCommit } from '../shared/commits'
import { DASHBOARD_AI_REVIEW_LIMITS, DASHBOARD_PATCH_SELECTION_RULES } from './budget'
import { generatedFilePattern } from './patterns'

function hasUsefulPatch(file: GithubCommitFile): boolean {
  if (!file.patch?.trim() || generatedFilePattern.test(file.filename))
    return false

  return file.patch
    .split('\n')
    .some(line => (line.startsWith('+') || line.startsWith('-'))
      && !line.startsWith('+++')
      && !line.startsWith('---')
      && line.length > DASHBOARD_PATCH_SELECTION_RULES.minimumPatchLineLength)
}

function fileRelevance(file: GithubCommitFile, reason: DashboardPatchSelectionReason): number {
  const patch = file.patch ?? ''
  const lineCount = patch.split('\n').filter(line => line.startsWith('+') || line.startsWith('-')).length
  const safety = safetyFilePattern.test(file.filename) || safetySurfaceFilePattern.test(file.filename) || safetyPatchPattern.test(patch)
    ? DASHBOARD_PATCH_SELECTION_RULES.safetyRelevanceWeight
    : 0
  return (reason === 'safety-signal' ? safety : 0) + Math.min(lineCount, DASHBOARD_PATCH_SELECTION_RULES.maximumRelevanceLines)
}

function addCommit(selected: Map<string, { commit: GithubCommit, reasons: DashboardPatchSelectionReason[] }>, commit: GithubCommit | undefined, reason: DashboardPatchSelectionReason): void {
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

function selectBy(commits: readonly GithubCommit[], predicate: (commit: GithubCommit) => boolean, sort: (left: GithubCommit, right: GithubCommit) => number): GithubCommit | undefined {
  return commits.filter(predicate).sort(sort)[0]
}

/** Selects a deterministic, stratified patch sample for one dashboard AI call. */
export function selectDashboardPatchEvidence(context: GithubContext): DashboardPatchSelection {
  const eligible = context.commits
    .filter(commit => !isMergeCommit(commit) && commit.files.some(hasUsefulPatch))
    .sort((left, right) => commitTimestamp(right) - commitTimestamp(left) || right.sha.localeCompare(left.sha))
  const selected = new Map<string, { commit: GithubCommit, reasons: DashboardPatchSelectionReason[] }>()

  addCommit(selected, eligible[0], 'latest')

  const sortedSizes = eligible.map(commitSize).sort((left, right) => left - right)
  const medianSize = sortedSizes.length
    ? sortedSizes[Math.floor((sortedSizes.length - 1) / 2)]!
    : DASHBOARD_PATCH_SELECTION_RULES.emptyMedianSize
  const latestCommit = eligible[0]
  const typicalCommit = selectBy(eligible, commit => commit.sha !== latestCommit?.sha, (left, right) => Math.abs(commitSize(left) - medianSize) - Math.abs(commitSize(right) - medianSize) || commitTimestamp(right) - commitTimestamp(left))
  addCommit(selected, typicalCommit, 'typical')
  addCommit(selected, typicalCommit, 'workflow-signal')
  addCommit(selected, selectBy(eligible, commit => commit.files.some(file => safetyFilePattern.test(file.filename) || safetySurfaceFilePattern.test(file.filename) || safetyPatchPattern.test(file.patch ?? '')), (left, right) => commitTimestamp(right) - commitTimestamp(left) || commitSize(right) - commitSize(left)), 'safety-signal')

  const commits = Array.from(selected.values())
  const files: DashboardPatchSelection['files'] = []
  let totalPatchChars = 0
  for (const selectedCommit of commits) {
    const reason = selectedCommit.reasons.find(item => item === 'safety-signal')
      ?? selectedCommit.reasons.find(item => item === 'typical')
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
