import type { DashboardEvidence } from '~~/shared/dashboard/contracts'
import type { GithubContext } from '../github-collector'

export function toDashboardEvidence(context: GithubContext): DashboardEvidence {
  return {
    commits: context.commits.map(commit => ({
      repo: commit.repo,
      sha: commit.sha,
      message: commit.message,
      additions: commit.additions,
      deletions: commit.deletions,
      changedFiles: commit.changedFiles,
      committedAt: commit.committedAt,
      files: commit.files.map(file => ({
        filename: file.filename,
        status: file.status,
        additions: file.additions,
        deletions: file.deletions,
      })),
    })),
    pullRequests: context.prs,
    ...(context.repositories ? { repositories: context.repositories } : {}),
    ...(context.checks ? { checks: context.checks } : {}),
    ...(context.collection ? { collection: { ...context.collection } } : {}),
  }
}
