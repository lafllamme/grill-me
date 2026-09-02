import type { GithubCommit } from '../../github-collector'

export function isMergeCommit(commit: GithubCommit): boolean {
  return commit.isMerge ?? (commit.parentCount !== undefined
    ? commit.parentCount > 1
    : /^merge\s/i.test(commit.message) || /\bmerge branch\b/i.test(commit.message))
}

export function commitTimestamp(commit: GithubCommit): number {
  if (!commit.committedAt)
    return 0

  const timestamp = Date.parse(commit.committedAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export const commitSize = (commit: GithubCommit): number => commit.additions + commit.deletions

export const personalCommits = (commits: readonly GithubCommit[]): GithubCommit[] => commits.filter(commit => !isMergeCommit(commit))

export const commitSubject = (message: string): string => message.split('\n')[0]?.trim() ?? ''

export const conventionalCommitPattern = /^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i

export const genericCommitPattern = /^(?:fix|changes?|stuff|update|wip|misc|asdf|test)$/i
