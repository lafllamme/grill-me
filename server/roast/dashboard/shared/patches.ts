import type { GithubCommit, GithubCommitFile } from '../../github-collector'
import { ratio } from './math'

export function addedPatchLinesFromFile(file: GithubCommitFile): string[] {
  return file.patch
    ?.split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1))
    .filter(line => line.trim())
    ?? []
}

export function addedPatchLines(commits: readonly GithubCommit[]): string[] {
  return commits
    .flatMap(commit => commit.files)
    .flatMap(file => file.patch?.split('\n') ?? [])
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1))
}

export function fileSignal(commits: readonly GithubCommit[], pattern: RegExp): number {
  const files = commits.flatMap(commit => commit.files)
  return ratio(files.filter(file => pattern.test(file.filename)).length, files.length)
}

export function addedPatchSignal(commits: readonly GithubCommit[], pattern: RegExp): number {
  const patches = commits
    .flatMap(commit => commit.files)
    .map(file => file.patch)
    .filter((patch): patch is string => Boolean(patch))
    .map(patch => patch
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .join('\n'))
    .filter(Boolean)

  return ratio(patches.filter(patch => pattern.test(patch)).length, patches.length)
}
