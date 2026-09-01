import type { GithubCommit } from './github-collector'

/**
 * Conservative patterns for risks that can be confirmed from added diff
 * lines. Context lines and removed lines are deliberately ignored.
 */
export const confirmedRiskPatchPattern = /(?:\b(?:eval|child_process|exec|spawn)\s*\(|\binnerHTML\s*=|dangerouslySetInnerHTML|\b[\w$]*(?:api[_-]?key|secret|password|token)\s*[:=]|\b(?:bypassAuthorization|bypassAuth|skipAuthorization|skipAuth)\s*\(|\bSELECT[^;\n]{0,120}(?:\+|\.|\$\{|format\s*\())/i

function matchesCommitSha(signalSha: string, commitSha: string): boolean {
  return signalSha === commitSha || commitSha.startsWith(signalSha) || signalSha.startsWith(commitSha)
}

function addedPatchLines(patch: string): string {
  return patch
    .split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .join('\n')
}

export function hasConfirmedRiskEvidence(signal: { commitSha: string }, commits: readonly GithubCommit[]): boolean {
  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files.some(file => Boolean(file.patch && confirmedRiskPatchPattern.test(addedPatchLines(file.patch)))))
}
