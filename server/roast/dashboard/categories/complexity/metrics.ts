import type { GithubCommit, GithubCommitFile } from '../../../github-collector'
import type { ComplexityMetrics } from './types'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { average, clamp, percentile, ratio } from '../../shared/math'
import { COMPLEXITY_FILE_WEIGHTS, COMPLEXITY_SCORE_DEFAULT, COMPLEXITY_SCORING_RULES } from './constants'
import { complexityDocumentationFilePattern, complexityExcludedFilePattern, complexityNonCodeFilePattern, complexityTestFilePattern } from './patterns'

function complexityFileWeight(file: GithubCommitFile): number {
  if (complexityExcludedFilePattern.test(file.filename) || complexityNonCodeFilePattern.test(file.filename))
    return COMPLEXITY_FILE_WEIGHTS.excluded
  if (complexityTestFilePattern.test(file.filename))
    return COMPLEXITY_FILE_WEIGHTS.test
  if (complexityDocumentationFilePattern.test(file.filename))
    return COMPLEXITY_FILE_WEIGHTS.documentation
  return COMPLEXITY_FILE_WEIGHTS.runtime
}

/** Estimates the effective change surface while accounting for omitted files. */
export function effectiveComplexityFiles(commit: GithubCommit): number {
  const visibleWeights = commit.files.map(complexityFileWeight)
  const visibleWeight = visibleWeights.reduce((sum, weight) => sum + weight, DASHBOARD_METRIC_RULES.emptyValue)
  const omittedFileCount = Math.max(DASHBOARD_METRIC_RULES.emptyValue, commit.changedFiles - commit.files.length)
  const inferredOmittedWeight = commit.files.length ? average(visibleWeights) : COMPLEXITY_FILE_WEIGHTS.runtime
  return visibleWeight + omittedFileCount * inferredOmittedWeight
}

export function deriveComplexityMetrics(workflowCommits: readonly GithubCommit[], workflowDeletionRatio: number): ComplexityMetrics {
  const effectiveFileCounts = workflowCommits.map(effectiveComplexityFiles)
  const effectiveFilesP75 = workflowCommits.length
    ? Number(percentile(effectiveFileCounts, COMPLEXITY_SCORING_RULES.percentile).toFixed(DASHBOARD_METRIC_RULES.decimalPlaces))
    : COMPLEXITY_SCORE_DEFAULT
  const relativeOutlierRatio = workflowCommits.length
    ? Math.round(ratio(effectiveFileCounts.filter(value => value >= COMPLEXITY_SCORING_RULES.outlierEffectiveFiles).length, workflowCommits.length) * DASHBOARD_METRIC_RULES.percentageScale)
    : COMPLEXITY_SCORE_DEFAULT

  return {
    effectiveFilesP75,
    excludedFileRatio: Math.round(ratio(
      workflowCommits.flatMap(commit => commit.files).filter(file => complexityFileWeight(file) === COMPLEXITY_FILE_WEIGHTS.excluded).length,
      workflowCommits.flatMap(commit => commit.files).length,
    ) * DASHBOARD_METRIC_RULES.percentageScale),
    relativeOutlierRatio,
    scopeSignal: workflowCommits.length
      ? clamp(
          COMPLEXITY_SCORING_RULES.maximumSignal
          - Math.min(
            COMPLEXITY_SCORING_RULES.maximumScopePenalty,
            Math.max(DASHBOARD_METRIC_RULES.emptyValue, effectiveFilesP75 - COMPLEXITY_SCORING_RULES.scopeBaselineFiles) * COMPLEXITY_SCORING_RULES.scopePenaltyPerFile,
          ),
        )
      : COMPLEXITY_SCORE_DEFAULT,
    outlierSignal: workflowCommits.length ? COMPLEXITY_SCORING_RULES.maximumSignal - relativeOutlierRatio : COMPLEXITY_SCORE_DEFAULT,
    churnSignal: clamp(
      COMPLEXITY_SCORING_RULES.maximumSignal
      - Math.max(DASHBOARD_METRIC_RULES.emptyValue, workflowDeletionRatio - COMPLEXITY_SCORING_RULES.deletionBaselineRatio) * COMPLEXITY_SCORING_RULES.deletionPenaltyPerPoint,
    ),
  }
}
