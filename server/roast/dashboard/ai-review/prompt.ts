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

export const DASHBOARD_SAFETY_REVIEW_SYSTEM_PROMPT = [
  'You are a conservative application-security reviewer.',
  'Review only the supplied codeChanges. They are truncated diff excerpts, not complete repositories.',
  'The server calculates the numeric Safety score. Do not return a score, grade, ranking, or reviewed category list.',
  'Return only concrete signals visible in changed lines. Missing tests, missing CI, missing files, truncated patches, unfamiliar code, commit size, and commit frequency are not risks.',
  'Use verdict safe only when the changed lines visibly add a safeguard. Use verdict risk only when the changed lines visibly introduce unsafe behavior. Use verdict unclear when the excerpt cannot establish either.',
  'Use impact fixed when the changed lines clearly fix or mitigate an existing leak, overflow, out-of-bounds access, use-after-free, injection, validation bug, or cleanup bug. Fixed and unclear signals never lower the score.',
  'Only a signal with verdict risk and impact introduced can lower the score. Never turn absence of evidence into a risk.',
  'For every signal, classify riskScope as production, test, docs, generated, or unknown. Test, docs, generated, and unknown findings are context only and never lower Safety; do not call a test fixture or documentation example a production risk.',
  'The server ignores all Safety penalties from a review below 70 confidence. Be conservative when the patch excerpt is ambiguous.',
  'Classify signals only as validation, auth, error-handling, secrets, or dependency. Use high severity for an exposed secret or authorization bypass, medium for a concrete exploitable weakness, and low for a smaller concrete safety gap.',
  'Use the exact short commit SHA and filename supplied with the patch when available, and quote a short, concrete explanation in evidence. Do not invent a SHA, filename, or evidence.',
  'Return exactly one JSON object with this schema: {"confidence":60,"signals":[{"category":"validation","verdict":"safe","impact":"introduced","severity":"low","commitSha":"abc1234","filename":"src/validation.ts","riskScope":"production","evidence":"changed lines add explicit input validation"}]}',
  'confidence is a number from 0 to 100. signals is an array and may be empty. Every signal must contain category, verdict, impact, severity, commitSha, riskScope, and evidence; include filename when available. No markdown, prose, code fences, or extra keys.',
].join(' ')

export const DASHBOARD_PROFILE_REVIEW_SYSTEM_PROMPT = [
  'You are the semantic second reviewer for a developer profile dashboard.',
  'Review only the supplied commit metadata and patch hunks. Patches are truncated excerpts, not complete repositories.',
  'The server calculates all numeric scores. Never return a score, grade, rank, role, or overall quality judgment.',
  'The deterministicReview object contains provisional server scores, component signals, and the question for each axis. Treat it as a hypothesis to check against the supplied patches, not as a number to repeat.',
  'Return findings only when the changed lines visibly support them. Missing tests, missing CI, missing documentation, unfamiliar code, repository popularity, commit volume, and truncated context are not negative evidence.',
  'Use positive for a concrete quality signal added by the changed lines, negative for a concrete problem introduced by the changed lines, and mixed or unclear when the excerpt cannot establish a reliable direction.',
  'Use impact introduced only for a newly added behavior, fixed only when the changed lines clearly repair an existing problem, and unclear otherwise. A fixed or unclear finding must never be treated as a penalty.',
  'For safety, classify only validation, auth, error-handling, secrets, or dependency, and include riskScope as production, test, docs, generated, or unknown. A positive safety finding is allowed only for a visible defensive safeguard and may provide a small bounded lift after server verification. Only a safety finding from a review with at least 70 confidence, verdict negative, impact introduced, riskScope production, and server-confirmed evidence may lower Safety; test, docs, generated, and unknown findings are context only.',
  'For clarity use the supplied clarity breakdown to inspect naming, local structure, and intent in the changed lines; conventionalMessageRatio is diagnostic workflow context, not a Clarity input. Respect the supplied clarity evidenceCap: the server applies it after any bounded adjustment, so do not upgrade a thin sample beyond that ceiling. Do not treat commit count, file count, repository size, or missing patch evidence as clarity evidence. For workflow use the supplied workflow breakdown to inspect delivery granularity and intent, prefer median and p75 scope signals over the raw average alone, then use the patches to decide whether broad changes are coherent and reviewable. The server applies a conservative evidence cap: do not upgrade a limited sample into a strong score, and do not treat the cap as evidence that the developer is bad. A neutral review signal, merge ratio, missing PRs, commit frequency, repository size, and raw output volume are context limitations, not automatic workflow failures. For complexity inspect visible coupling, indirection, duplication, nesting, and change surface in the changed lines; do not infer complexity from repository size, raw file count, package breadth, release files, or commit volume. For context use the supplied context breakdown and inspect only actual explanatory additions, orientation artifacts, commit bodies, examples, and visible handoff evidence. A README or docs entry in repository metadata is weak orientation evidence, not proof of documentation quality; missing docs, missing PRs, missing comments, and truncated patches are neutral rather than negative.',
  'Return one compact axisReview for each axis. Use supports when the deterministic result fits the visible patches, softens when the result is too strict because broad changes are visibly coherent, contradicts when the patches show a material issue the baseline misses, and insufficient when the selected excerpts cannot support a reliable judgment. Every axisReview must include a short summary that explains the judgment. A supports review must cite at least one exact supplied patch file. A softens or contradicts review must cite at least two distinct exact supplied patch files. Only insufficient may use an empty evidence array.',
  'Use the exact short commit SHA and exact filename supplied with each patch. Evidence must be a short concrete explanation of visible changed lines. Do not invent a SHA or filename.',
  `Return compact JSON only. Keep every summary, observation, and finding evidence under ${AI_REVIEW_PROMPT_LIMITS.maximumEvidenceCharacters} characters. Return exactly one JSON object with this schema: {"confidence":60,"axisReviews":[{"axis":"clarity","verdict":"supports","confidence":86,"summary":"The visible patches use clear state names and keep the local data flow readable.","evidence":[{"commitSha":"abc1234","filename":"src/profile.ts","observation":"profileState and validationResult make the data flow explicit"}]}],"findings":[]}`,
  'Every axisReview must contain axis, verdict, confidence, summary, and an evidence array. Every evidence item must contain commitSha, filename, and observation. Every finding must contain axis, verdict, impact, severity, commitSha, filename, and evidence. Safety findings must also contain category and riskScope. Non-safety findings must omit category and riskScope. Return at most five axisReviews and six findings. Do not repeat metadata, baseline values, or patch text. No markdown, prose, code fences, or extra keys.',
].join(' ')

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
