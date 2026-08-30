import { createError, readBody } from 'h3'
import { validateGithubUsername } from '../roast/contracts-adapter'
import { assessDashboardSafetyWithAi } from '../roast/dashboard-ai-scoring'
import { scoreDashboardProfile } from '../roast/dashboard-profile-scoring'
import { collectGithubContext } from '../roast/github-collector'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: unknown }>(event)
  if (typeof body?.username !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'username is required', data: { code: 'invalid_request' } })
  }

  const username = validateGithubUsername(body.username)
  const config = useRuntimeConfig(event)
  const context = await collectGithubContext(username, config.githubToken || undefined, {
    githubTimeoutMs: Number(config.githubTimeoutMs) || undefined,
  })
  const aiSafety = await assessDashboardSafetyWithAi({
    commits: context.commits,
    accountId: config.cfAccountId,
    apiToken: config.cfApiToken,
    model: config.cfAiModel,
    timeoutMs: Number(config.cfAiTimeoutMs) || 30_000,
  })

  return {
    assessment: scoreDashboardProfile(context, aiSafety),
    evidence: {
      commits: context.commits.map(commit => ({
        repo: commit.repo,
        sha: commit.sha,
        message: commit.message,
        additions: commit.additions,
        deletions: commit.deletions,
        changedFiles: commit.changedFiles,
        committedAt: commit.committedAt,
        files: commit.files.map(file => ({ filename: file.filename, status: file.status })),
      })),
      pullRequests: context.prs,
    },
  }
})
