import type { DashboardDerivedMetrics } from '~~/shared/dashboard/contracts'
import type { GithubContext } from '../../github-collector'
import { deriveClarityMetrics, getDashboardClarityEvidenceCap } from '../categories/clarity'
import { deriveComplexityMetrics } from '../categories/complexity'
import { deriveContextMetrics } from '../categories/context'
import { deriveSafetyMetrics } from '../categories/safety'
import { deriveWorkflowMetrics } from '../categories/workflow'
import { dashboardCiFilePattern, dashboardDefensivePatchPattern, dashboardDocumentationFilePattern, dashboardRiskyFilePattern, dashboardRiskyPatchPattern, dashboardTestFilePattern, dashboardValidationFilePattern } from './analysis-patterns'
import { personalCommits } from './commits'
import { DASHBOARD_METRIC_RULES } from './constants'
import { average, percentile, ratio } from './math'
import { addedPatchSignal, fileSignal } from './patches'

export function deriveDashboardMetrics(context: GithubContext): DashboardDerivedMetrics {
  const commits = context.commits
  const workflowCommits = personalCommits(commits)
  const additions = commits.reduce((sum, commit) => sum + commit.additions, 0)
  const deletions = commits.reduce((sum, commit) => sum + commit.deletions, 0)
  const changedFiles = commits.reduce((sum, commit) => sum + commit.changedFiles, 0)
  const commitSizes = commits.map(commit => commit.additions + commit.deletions)
  const commitDates = commits.map(commit => commit.committedAt ? new Date(commit.committedAt) : null).filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())))
  const dayKeys = new Set(commitDates.map(date => date.toISOString().slice(0, 10)))
  const sortedDayKeys = [...dayKeys].sort()
  const earliestDay = sortedDayKeys[0] ? Date.parse(`${sortedDayKeys[0]}T00:00:00Z`) : DASHBOARD_METRIC_RULES.emptyValue
  const latestDay = sortedDayKeys.at(-1) ? Date.parse(`${sortedDayKeys.at(-1)}T00:00:00Z`) : DASHBOARD_METRIC_RULES.emptyValue
  const spanDays = earliestDay && latestDay
    ? Math.max(1, Math.round((latestDay - earliestDay) / DASHBOARD_METRIC_RULES.millisecondsPerDay) + 1)
    : DASHBOARD_METRIC_RULES.emptyValue
  const pullRequestCoverage = Math.round(Math.min(1, ratio(context.prs.length, workflowCommits.length)) * DASHBOARD_METRIC_RULES.percentageScale)
  const workflowMetrics = deriveWorkflowMetrics(commits, workflowCommits)
  const clarityMetrics = deriveClarityMetrics(workflowCommits)
  const contextMetrics = deriveContextMetrics(workflowCommits, context.repositories, pullRequestCoverage, context.prs)
  const complexityMetrics = deriveComplexityMetrics(workflowCommits, workflowMetrics.workflowDeletionRatio)
  const safetyMetrics = deriveSafetyMetrics(workflowCommits)

  return {
    commitCount: commits.length,
    pullRequestCount: context.prs.length,
    additions,
    deletions,
    changedFiles,
    averageCommitSize: Math.round(average(commitSizes)),
    medianCommitSize: Math.round(percentile(commitSizes, 50)),
    largestCommitSize: Math.max(0, ...commitSizes),
    p90CommitSize: Math.round(percentile(commitSizes, 90)),
    activeDays: dayKeys.size,
    spanDays,
    commitsPer30Days: spanDays ? Number((commits.length / spanDays * 30).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces)) : DASHBOARD_METRIC_RULES.emptyValue,
    averageFilesPerCommit: Number(average(commits.map(commit => commit.changedFiles)).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces)),
    ...workflowMetrics,
    clarityEvidenceCap: getDashboardClarityEvidenceCap({
      commitCount: commits.length,
      workflowCommitCount: workflowMetrics.workflowCommitCount,
      workflowPatchCommitCount: workflowMetrics.workflowPatchCommitCount,
    }),
    clarityNamingSignal: clarityMetrics.naming.signal,
    clarityStructureSignal: clarityMetrics.structure.signal,
    clarityNamingEvidenceAvailable: clarityMetrics.naming.evidenceAvailable,
    clarityStructureEvidenceAvailable: clarityMetrics.structure.evidenceAvailable,
    contextPatchExplanationSignal: contextMetrics.patchExplanation.signal,
    contextOrientationArtifactSignal: contextMetrics.orientationArtifact.signal,
    contextCommitSignal: contextMetrics.commit.signal,
    contextRepositoryOrientationSignal: contextMetrics.repositoryOrientation.signal,
    contextHandoffSignal: contextMetrics.handoff.signal,
    contextPatchExplanationEvidenceAvailable: contextMetrics.patchExplanation.evidenceAvailable,
    contextOrientationArtifactEvidenceAvailable: contextMetrics.orientationArtifact.evidenceAvailable,
    contextCommitEvidenceAvailable: contextMetrics.commit.evidenceAvailable,
    contextRepositoryEvidenceAvailable: contextMetrics.repositoryOrientation.evidenceAvailable,
    contextHandoffEvidenceAvailable: contextMetrics.handoff.evidenceAvailable,
    complexityEffectiveFilesP75: complexityMetrics.effectiveFilesP75,
    complexityExcludedFileRatio: complexityMetrics.excludedFileRatio,
    complexityRelativeOutlierRatio: complexityMetrics.relativeOutlierRatio,
    complexityScopeSignal: complexityMetrics.scopeSignal,
    complexityOutlierSignal: complexityMetrics.outlierSignal,
    complexityChurnSignal: complexityMetrics.churnSignal,
    documentationFileRatio: Math.round(fileSignal(workflowCommits, dashboardDocumentationFilePattern) * DASHBOARD_METRIC_RULES.percentageScale),
    testFileRatio: Math.round(fileSignal(workflowCommits, dashboardTestFilePattern) * DASHBOARD_METRIC_RULES.percentageScale),
    ciFileRatio: Math.round(fileSignal(workflowCommits, dashboardCiFilePattern) * DASHBOARD_METRIC_RULES.percentageScale),
    validationFileRatio: Math.round(fileSignal(workflowCommits, dashboardValidationFilePattern) * DASHBOARD_METRIC_RULES.percentageScale),
    safetySurfaceFileRatio: safetyMetrics.safetySurfaceFileRatio,
    safetySurfaceLineRatio: safetyMetrics.safetySurfaceLineRatio,
    safetyDefenseCoverage: safetyMetrics.safetyDefenseCoverage,
    pullRequestCoverage,
    deletionRatio: Math.round(ratio(deletions, additions + deletions) * DASHBOARD_METRIC_RULES.percentageScale),
    riskyFileRatio: Math.round(fileSignal(workflowCommits, dashboardRiskyFilePattern) * DASHBOARD_METRIC_RULES.percentageScale),
    defensivePatchRatio: Math.round(addedPatchSignal(workflowCommits, dashboardDefensivePatchPattern) * DASHBOARD_METRIC_RULES.percentageScale),
    riskyPatchRatio: Math.round(addedPatchSignal(workflowCommits, dashboardRiskyPatchPattern) * DASHBOARD_METRIC_RULES.percentageScale),
    mergeCommitRatio: Math.round(ratio(commits.length - workflowCommits.length, commits.length) * DASHBOARD_METRIC_RULES.percentageScale),
  }
}
