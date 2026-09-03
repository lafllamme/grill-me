import type { GithubCommit } from '../../../github-collector'
import type { DashboardSafetyRiskScope } from '../../ai-review/types'
import { addedPatchLinesFromFile } from '../../shared/patches'
import { confirmedDefensivePatchPattern, confirmedRiskPatchPattern, generatedSafetyFilePattern, safetyDocumentationFilePattern, safetyTestFilePattern } from './patterns'

function matchesCommitSha(signalSha: string, commitSha: string): boolean {
  return signalSha === commitSha || commitSha.startsWith(signalSha) || signalSha.startsWith(commitSha)
}

export function resolveSafetyRiskScope(signal: { filename?: string, riskScope?: DashboardSafetyRiskScope }): DashboardSafetyRiskScope {
  if (signal.filename) {
    if (generatedSafetyFilePattern.test(signal.filename))
      return 'generated'
    if (safetyTestFilePattern.test(signal.filename))
      return 'test'
    if (safetyDocumentationFilePattern.test(signal.filename))
      return 'docs'
  }

  // A missing filename exists in the standalone legacy contract. Keep that
  // path compatible; profile findings always carry an exact filename. For a
  // known path, the server-side classification above wins over model output.
  return signal.riskScope ?? 'production'
}

export function isProductionSafetyRisk(signal: { filename?: string, riskScope?: DashboardSafetyRiskScope }): boolean {
  return resolveSafetyRiskScope(signal) === 'production'
}

export function hasConfirmedRiskEvidence(signal: { commitSha: string, filename?: string, riskScope?: DashboardSafetyRiskScope }, commits: readonly GithubCommit[]): boolean {
  // A risk deduction must point to the exact changed file. A commit-level
  // claim is useful for the AI explanation, but is too broad to lower a score.
  if (!signal.filename)
    return false

  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files
      .filter(file => file.filename === signal.filename)
      .some(file => Boolean(file.patch && confirmedRiskPatchPattern.test(addedPatchLinesFromFile(file).join('\n')))))
}

export function hasConfirmedDefensiveEvidence(signal: { commitSha: string, filename?: string }, commits: readonly GithubCommit[]): boolean {
  return commits
    .filter(commit => matchesCommitSha(signal.commitSha, commit.sha))
    .some(commit => commit.files
      .filter(file => !signal.filename || file.filename === signal.filename)
      .some(file => Boolean(file.patch && confirmedDefensivePatchPattern.test(addedPatchLinesFromFile(file).join('\n')))))
}
