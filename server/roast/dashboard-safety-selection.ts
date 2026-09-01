import type { GithubCommit } from './github-collector'

export const safetyFilePattern = /(?:^|\/)(?:auth|security|permission|permissions|secret|secrets|credential|database|db|payment|payments|validator|validation|schema|middleware|guards?)(?:\/|\.|$)|(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:dockerfile|jenkinsfile|azure-pipelines\.ya?ml)$/i
export const safetyPatchPattern = /(?:\b(?:eval|child_process|exec|spawn)\s*\(|\binnerHTML\s*=|dangerouslySetInnerHTML|\bSELECT[^;\n]{0,120}(?:\+|\.|\$\{|format\s*\()|\b(?:validate|sanitize|escape|authorize|permission|fallback|throw new)\b|\b[\w$]*(?:api[_-]?key|secret|password|token)\b)/i

function commitTimestamp(commit: GithubCommit): number {
  if (!commit.committedAt)
    return 0

  const timestamp = Date.parse(commit.committedAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function compareNewest(left: GithubCommit, right: GithubCommit): number {
  return commitTimestamp(right) - commitTimestamp(left) || right.sha.localeCompare(left.sha)
}

function commitSafetyRelevance(commit: GithubCommit): number {
  return commit.files.reduce((score, file) => {
    const patch = file.patch ?? ''
    return score
      + (safetyFilePattern.test(file.filename) ? 2 : 0)
      + (safetyPatchPattern.test(patch) ? 3 : 0)
  }, 0)
}

/**
 * Selects the only commits that the Safety reviewer may inspect.
 * The order is stable: newest, largest, then the strongest Safety signal.
 */
export function selectSafetyCommits(commits: readonly GithubCommit[]): GithubCommit[] {
  const latest = [...commits].sort(compareNewest)[0]
  const largest = [...commits].sort((left, right) => {
    const leftSize = left.additions + left.deletions
    const rightSize = right.additions + right.deletions
    return rightSize - leftSize || compareNewest(left, right)
  })[0]
  const relevant = [...commits]
    .map(commit => ({ commit, relevance: commitSafetyRelevance(commit) }))
    .filter(item => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance || compareNewest(left.commit, right.commit))[0]
    ?.commit

  const selected: GithubCommit[] = []
  for (const commit of [latest, largest, relevant]) {
    if (commit && !selected.some(selectedCommit => selectedCommit.sha === commit.sha))
      selected.push(commit)
  }

  return selected.slice(0, 3)
}
