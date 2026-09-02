import type { GithubCommit, GithubCommitFile } from '../../../github-collector'
import type { SafetyMetrics } from './types'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { ratio } from '../../shared/math'
import { addedPatchLinesFromFile } from '../../shared/patches'
import { SAFETY_METRIC_RULES } from './constants'
import { confirmedDefensivePatchPattern, safetySurfaceFilePattern, safetySurfacePatchPattern, safetyTestFilePattern } from './patterns'

function isSafetySurfaceFile(file: GithubCommitFile): boolean {
  return !safetyTestFilePattern.test(file.filename) && safetySurfaceFilePattern.test(file.filename)
}

export function deriveSafetyMetrics(commits: readonly GithubCommit[]): SafetyMetrics {
  const patchFiles = commits.flatMap(commit => commit.files).filter(file => Boolean(file.patch?.trim()))
  const surfaceFiles = patchFiles.filter((file) => {
    if (isSafetySurfaceFile(file))
      return true

    return addedPatchLinesFromFile(file).some(line => safetySurfacePatchPattern.test(line))
  })
  const surfaceLines = patchFiles.flatMap((file) => {
    const addedLines = addedPatchLinesFromFile(file)
    if (isSafetySurfaceFile(file))
      return addedLines

    return addedLines.filter(line => safetySurfacePatchPattern.test(line))
  })
  const defensiveSurfaceFiles = surfaceFiles.filter(file => addedPatchLinesFromFile(file).some(line => confirmedDefensivePatchPattern.test(line)))
  const defensiveSurfaceLines = surfaceLines.filter(line => confirmedDefensivePatchPattern.test(line))
  const fileCoverage = ratio(defensiveSurfaceFiles.length, surfaceFiles.length)
  const lineCoverage = ratio(defensiveSurfaceLines.length, surfaceLines.length)

  return {
    safetySurfaceFileRatio: Math.round(ratio(surfaceFiles.length, patchFiles.length) * DASHBOARD_METRIC_RULES.percentageScale),
    safetySurfaceLineRatio: Math.round(ratio(surfaceLines.length, patchFiles.flatMap(file => addedPatchLinesFromFile(file)).length) * DASHBOARD_METRIC_RULES.percentageScale),
    safetyDefenseCoverage: Math.round((fileCoverage * SAFETY_METRIC_RULES.fileCoverageWeight + lineCoverage * SAFETY_METRIC_RULES.lineCoverageWeight) * DASHBOARD_METRIC_RULES.percentageScale),
  }
}
