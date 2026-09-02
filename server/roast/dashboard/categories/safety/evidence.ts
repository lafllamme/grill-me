import type { GithubCommit } from '../../../github-collector'
import { addedPatchLinesFromFile } from '../../shared/patches'
import { confirmedDefensivePatchPattern, confirmedRiskPatchPattern } from './patterns'

function matchesCommitSha(signalSha: string, commitSha: string): boolean {
  return signalSha === commitSha || commitSha.startsWith(signalSha) || signalSha.startsWith(commitSha)
}

export function hasConfirmedRiskEvidence(signal: { commitSha: string }, commits: readonly GithubCommit[]): boolean {
  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files.some(file => Boolean(file.patch && confirmedRiskPatchPattern.test(addedPatchLinesFromFile(file).join('\n')))))
}

export function hasConfirmedDefensiveEvidence(signal: { commitSha: string, filename?: string }, commits: readonly GithubCommit[]): boolean {
  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files
      .filter(file => !signal.filename || file.filename === signal.filename)
      .some(file => Boolean(file.patch && confirmedDefensivePatchPattern.test(addedPatchLinesFromFile(file).join('\n')))))
}
