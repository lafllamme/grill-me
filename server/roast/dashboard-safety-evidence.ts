import type { GithubCommit } from './github-collector'

/**
 * Conservative patterns for risks that can be confirmed from added diff
 * lines. Context lines and removed lines are deliberately ignored.
 */
export const confirmedRiskPatchPattern = /(?:\b(?:eval|child_process|exec|spawn)\s*\(|\binnerHTML\s*=|dangerouslySetInnerHTML|\b[\w$]*(?:api[_-]?key|secret|password|token)\s*[:=]|\b(?:bypassAuthorization|bypassAuth|skipAuthorization|skipAuth)\s*\(|\bSELECT[^;\n]{0,120}(?:\+|\.|\$\{|format\s*\())/i
export const confirmedDefensivePatchPattern = /(?:real_escape_string|\b(?:validate|sanitize|escape|authorize|permission|fallback|rateLimit|csrf|safeParse|parseInt|parseFloat|getenv|process\.env)\b|\b(?:try|catch)\s*\{|\bthrow\s+new\b)/i

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

export function hasConfirmedDefensiveEvidence(signal: { commitSha: string, filename?: string }, commits: readonly GithubCommit[]): boolean {
  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files
      .filter(file => !signal.filename || file.filename === signal.filename)
      .some(file => Boolean(file.patch && confirmedDefensivePatchPattern.test(addedPatchLines(file.patch)))))
}
