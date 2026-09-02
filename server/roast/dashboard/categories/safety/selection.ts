import type { GithubCommit } from '../../../github-collector'
import { commitSize, commitTimestamp, isMergeCommit } from '../../shared/commits'
import { SAFETY_SELECTION_RULES } from './constants'
import { generatedSafetyFilePattern, safetyFilePattern, safetyPatchPattern, safetySurfaceFilePattern } from './patterns'

function compareNewest(left: GithubCommit, right: GithubCommit): number {
  return commitTimestamp(right) - commitTimestamp(left) || right.sha.localeCompare(left.sha)
}

function commitSafetyRelevance(commit: GithubCommit): number {
  return commit.files.reduce((score, file) => {
    if (generatedSafetyFilePattern.test(file.filename))
      return score

    const patch = file.patch ?? ''
    return score
      + (safetyFilePattern.test(file.filename) || safetySurfaceFilePattern.test(file.filename) ? SAFETY_SELECTION_RULES.safetyFileRelevanceWeight : 0)
      + (safetyPatchPattern.test(patch) ? SAFETY_SELECTION_RULES.safetyPatchRelevanceWeight : 0)
  }, 0)
}

/**
 * Selects the only commits that the standalone Safety reviewer may inspect.
 * The sample is stratified across the newest personal patch, a typical-sized
 * personal patch, and the strongest visible Safety signal.
 */
export function selectSafetyCommits(commits: readonly GithubCommit[]): GithubCommit[] {
  const eligible = commits.filter(commit => !isMergeCommit(commit) && commit.files.some(file => file.patch && !generatedSafetyFilePattern.test(file.filename)))
  const latest = [...eligible].sort(compareNewest)[0]
  const sizes = eligible.map(commitSize).sort((left, right) => left - right)
  const medianSize = sizes.length ? sizes[Math.floor((sizes.length - 1) / 2)]! : SAFETY_SELECTION_RULES.emptyMedianSize
  const typical = [...eligible]
    .filter(commit => commit.sha !== latest?.sha)
    .sort((left, right) => Math.abs(commitSize(left) - medianSize) - Math.abs(commitSize(right) - medianSize) || compareNewest(left, right))[0]
  const relevant = [...eligible]
    .map(commit => ({ commit, relevance: commitSafetyRelevance(commit) }))
    .filter(item => item.relevance > SAFETY_SELECTION_RULES.minimumRelevanceScore)
    .sort((left, right) => right.relevance - left.relevance || compareNewest(left.commit, right.commit))[0]
    ?.commit

  const selected: GithubCommit[] = []
  for (const commit of [latest, typical, relevant]) {
    if (commit && !selected.some(selectedCommit => selectedCommit.sha === commit.sha))
      selected.push(commit)
  }

  return selected.slice(0, SAFETY_SELECTION_RULES.maximumSelectedCommits)
}
