import type { DashboardDerivedMetrics, DashboardProfileScores } from '~~/shared/dashboard/contracts'
import type { GithubCommit, GithubContext } from '../../github-collector'
import type { DashboardPatchSelection } from '../patch-selection'
import type { DashboardAiReviewBaseline, DashboardReviewAxis } from './types'
import { ROAST_LIMITS } from '../../../../shared/roast/contracts'
import { buildClarityAiContext, clarityQuestion } from '../categories/clarity'
import { buildComplexityAiContext, complexityQuestion } from '../categories/complexity'
import { buildContextAiContext, contextQuestion } from '../categories/context'
import { buildSafetyAiContext, safetyFilePattern, safetyPatchPattern, safetyQuestion } from '../categories/safety'
import { buildWorkflowAiContext, workflowQuestion } from '../categories/workflow'
import { AI_REVIEW_PROMPT_LIMITS } from './constants'

export const dashboardCategoryQuestions: Record<DashboardReviewAxis, string> = {
  clarity: clarityQuestion,
  safety: safetyQuestion,
  workflow: workflowQuestion,
  complexity: complexityQuestion,
  context: contextQuestion,
}

export function buildDashboardAiReviewBaseline(scores: DashboardProfileScores, metrics: DashboardDerivedMetrics): DashboardAiReviewBaseline {
  const workflow = buildWorkflowAiContext(metrics)

  return {
    scores,
    questions: dashboardCategoryQuestions,
    safety: buildSafetyAiContext(metrics),
    clarity: buildClarityAiContext(metrics),
    workflow: {
      ...workflow,
      mergeCommitRatio: metrics.mergeCommitRatio,
    },
    complexity: buildComplexityAiContext(metrics),
    context: buildContextAiContext(metrics),
  }
}

/** Builds the compact JSON prompt payload for the single dashboard review. */
export function buildDashboardReviewPrompt(context: GithubContext, selection: DashboardPatchSelection, baseline?: DashboardAiReviewBaseline): string {
  const payload = {
    deterministicReview: baseline,
    repositories: (context.repositories ?? []).map(repository => ({
      repo: repository.repo,
      defaultBranch: repository.defaultBranch,
      language: repository.language,
      rootEntries: repository.rootEntries.slice(0, AI_REVIEW_PROMPT_LIMITS.maximumRepositoryEntries),
    })),
    commits: selection.commits.map(({ commit, reasons }) => ({
      sha: commit.sha.slice(0, AI_REVIEW_PROMPT_LIMITS.shortCommitShaCharacters),
      repo: commit.repo,
      message: commit.message.split('\n')[0]?.trim().slice(0, AI_REVIEW_PROMPT_LIMITS.maximumCommitSubjectCharacters) ?? '',
      additions: commit.additions,
      deletions: commit.deletions,
      changedFiles: commit.changedFiles,
      committedAt: commit.committedAt,
      selectionReasons: reasons,
    })),
    pullRequests: context.prs.slice(0, AI_REVIEW_PROMPT_LIMITS.maximumPullRequests).map(pullRequest => ({
      repo: pullRequest.repo,
      number: pullRequest.number,
      title: pullRequest.title.slice(0, AI_REVIEW_PROMPT_LIMITS.maximumPullRequestTitleCharacters),
      state: pullRequest.state,
      reviewCount: pullRequest.reviewCount,
      commentCount: pullRequest.commentCount,
      changedFiles: pullRequest.changedFiles,
      merged: Boolean(pullRequest.mergedAt),
    })),
    checks: (context.checks ?? []).slice(0, AI_REVIEW_PROMPT_LIMITS.maximumChecks).map(check => ({
      repo: check.repo,
      sha: check.sha.slice(0, AI_REVIEW_PROMPT_LIMITS.shortCommitShaCharacters),
      total: check.total,
      successful: check.successful,
      failed: check.failed,
      pending: check.pending,
    })),
    patches: selection.files.map(file => ({
      commitSha: file.commitSha.slice(0, AI_REVIEW_PROMPT_LIMITS.shortCommitShaCharacters),
      repo: file.repo,
      filename: file.filename,
      status: file.status,
      selectionReason: file.reason,
      patch: file.patch,
    })),
  }

  return JSON.stringify(payload)
}

export function buildSafetyPrompt(commits: readonly GithubCommit[]): string {
  let remainingPatchChars = ROAST_LIMITS.maxPromptTotalPatchChars
  const payload = commits
    .slice(0, AI_REVIEW_PROMPT_LIMITS.maximumSafetyCommits)
    .map(commit => ({
      sha: commit.sha.slice(0, AI_REVIEW_PROMPT_LIMITS.shortCommitShaCharacters),
      message: commit.message,
      additions: commit.additions,
      deletions: commit.deletions,
      codeChanges: [...commit.files]
        .filter(file => file.patch)
        .sort((left, right) => {
          const leftRelevance = (safetyFilePattern.test(left.filename) ? AI_REVIEW_PROMPT_LIMITS.safetyPatternMatchWeight : 0) + (safetyPatchPattern.test(left.patch ?? '') ? AI_REVIEW_PROMPT_LIMITS.safetyPatternMatchWeight : 0)
          const rightRelevance = (safetyFilePattern.test(right.filename) ? AI_REVIEW_PROMPT_LIMITS.safetyPatternMatchWeight : 0) + (safetyPatchPattern.test(right.patch ?? '') ? AI_REVIEW_PROMPT_LIMITS.safetyPatternMatchWeight : 0)
          return rightRelevance - leftRelevance || left.filename.localeCompare(right.filename)
        })
        .slice(0, ROAST_LIMITS.maxPromptFilesPerCommit)
        .flatMap((file) => {
          if (!file.patch || remainingPatchChars <= 0)
            return []

          const patch = file.patch.slice(0, Math.min(ROAST_LIMITS.maxPatchChars, remainingPatchChars))
          remainingPatchChars -= patch.length
          return [{ filename: file.filename, status: file.status, patch }]
        }),
    }))

  return JSON.stringify({ commits: payload })
}
