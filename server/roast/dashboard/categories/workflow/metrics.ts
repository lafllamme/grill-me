import type { GithubCommit } from '../../../github-collector'
import type { WorkflowMetrics } from './types'
import { commitSize, commitSubject, conventionalCommitPattern, genericCommitPattern } from '../../shared/commits'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { average, clamp, percentile, ratio } from '../../shared/math'
import { WORKFLOW_MESSAGE_SCORING, WORKFLOW_SCOPE_RULES, WORKFLOW_SCORE_DEFAULT } from './constants'
import { workflowActionWordPattern } from './patterns'

export function scoreCommitMessage(message: string): number {
  const subject = commitSubject(message)
  if (!subject)
    return WORKFLOW_MESSAGE_SCORING.emptyMessageScore

  let score = WORKFLOW_MESSAGE_SCORING.defaultScore
  if (subject.length >= WORKFLOW_MESSAGE_SCORING.readableSubjectLength)
    score += WORKFLOW_MESSAGE_SCORING.readableSubjectBonus
  if (subject.length >= WORKFLOW_MESSAGE_SCORING.detailedSubjectLength)
    score += WORKFLOW_MESSAGE_SCORING.detailedSubjectBonus
  if (conventionalCommitPattern.test(subject))
    score += WORKFLOW_MESSAGE_SCORING.conventionalMessageBonus
  if (workflowActionWordPattern.test(subject))
    score += WORKFLOW_MESSAGE_SCORING.actionWordBonus
  if (genericCommitPattern.test(subject))
    score -= WORKFLOW_MESSAGE_SCORING.genericMessagePenalty
  if (subject === subject.toUpperCase() && /[A-Z]/.test(subject))
    score -= WORKFLOW_MESSAGE_SCORING.uppercaseMessagePenalty

  return clamp(score)
}

export function deriveWorkflowMetrics(commits: readonly GithubCommit[], workflowCommits: readonly GithubCommit[]): WorkflowMetrics {
  const workflowCommitSizes = workflowCommits.map(commitSize)
  const workflowFileCounts = workflowCommits.map(commit => commit.changedFiles)
  const conventionalMessages = commits.filter(commit => conventionalCommitPattern.test(commitSubject(commit.message))).length
  const genericMessages = commits.filter(commit => genericCommitPattern.test(commitSubject(commit.message))).length
  const emptyMessages = commits.filter(commit => !commitSubject(commit.message)).length
  const largeCommitCount = commits.filter(commit => commitSize(commit) >= WORKFLOW_SCOPE_RULES.largeCommitSize || commit.changedFiles >= WORKFLOW_SCOPE_RULES.largeCommitFiles).length
  const typicalWorkflowSize = percentile(workflowCommitSizes, WORKFLOW_SCOPE_RULES.medianPercentile)
  const typicalWorkflowFiles = percentile(workflowFileCounts, WORKFLOW_SCOPE_RULES.medianPercentile)
  const workflowSizeThreshold = Math.max(WORKFLOW_SCOPE_RULES.largeCommitSize, typicalWorkflowSize * WORKFLOW_SCOPE_RULES.relativeOutlierMultiplier)
  const workflowFileThreshold = Math.max(WORKFLOW_SCOPE_RULES.largeCommitFiles, typicalWorkflowFiles * WORKFLOW_SCOPE_RULES.relativeOutlierMultiplier)
  const workflowLargeCommitCount = workflowCommits.filter(commit => commitSize(commit) >= workflowSizeThreshold || commit.changedFiles >= workflowFileThreshold).length
  const workflowAdditions = workflowCommits.reduce<number>((sum, commit) => sum + commit.additions, DASHBOARD_METRIC_RULES.emptyValue)
  const workflowDeletions = workflowCommits.reduce<number>((sum, commit) => sum + commit.deletions, DASHBOARD_METRIC_RULES.emptyValue)
  const workflowPatchCommitCount = workflowCommits.filter(commit => commit.files.some(file => Boolean(file.patch?.trim()))).length

  return {
    workflowCommitCount: workflowCommits.length,
    workflowPatchCommitCount,
    safetyPatchCommitRatio: Math.round(ratio(workflowPatchCommitCount, workflowCommits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    workflowAverageFilesPerCommit: workflowCommits.length ? Number(average(workflowFileCounts).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces)) : DASHBOARD_METRIC_RULES.emptyValue,
    workflowMedianFilesPerCommit: workflowCommits.length ? Number(percentile(workflowFileCounts, WORKFLOW_SCOPE_RULES.medianPercentile).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces)) : DASHBOARD_METRIC_RULES.emptyValue,
    workflowP75FilesPerCommit: workflowCommits.length ? Number(percentile(workflowFileCounts, WORKFLOW_SCOPE_RULES.p75Percentile).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces)) : DASHBOARD_METRIC_RULES.emptyValue,
    workflowMessageQuality: workflowCommits.length ? Math.round(average(workflowCommits.map(commit => scoreCommitMessage(commit.message)))) : WORKFLOW_SCORE_DEFAULT,
    workflowConventionalMessageRatio: Math.round(ratio(workflowCommits.filter(commit => conventionalCommitPattern.test(commitSubject(commit.message))).length, workflowCommits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    workflowLargeCommitRatio: workflowCommits.length ? Math.round(ratio(workflowLargeCommitCount, workflowCommits.length) * DASHBOARD_METRIC_RULES.percentageScale) : WORKFLOW_SCORE_DEFAULT,
    workflowDeletionRatio: Math.round(ratio(workflowDeletions, workflowAdditions + workflowDeletions) * DASHBOARD_METRIC_RULES.percentageScale),
    messageQuality: Math.round(average(commits.map(commit => scoreCommitMessage(commit.message)))),
    conventionalMessageRatio: Math.round(ratio(conventionalMessages, commits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    genericMessageRatio: Math.round(ratio(genericMessages, commits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    emptyMessageRatio: Math.round(ratio(emptyMessages, commits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    largeCommitRatio: Math.round(ratio(largeCommitCount, commits.length) * DASHBOARD_METRIC_RULES.percentageScale),
    clarityScopeSignal: workflowCommits.length
      ? clamp(WORKFLOW_SCOPE_RULES.maximumSignal - Math.max(DASHBOARD_METRIC_RULES.emptyValue, average(workflowFileCounts) - WORKFLOW_SCOPE_RULES.clarityScopeBaselineFiles) * WORKFLOW_SCOPE_RULES.clarityScopePenaltyPerFile)
      : WORKFLOW_SCORE_DEFAULT,
  }
}
