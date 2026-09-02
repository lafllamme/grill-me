import type { GithubCommit } from '../../../github-collector'
import type { DashboardAiSafetyAssessment, DashboardSafetyScoreBreakdown, SafetyScoreInput } from './types'
import { isMergeCommit } from '../../shared/commits'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { clamp } from '../../shared/math'
import { SAFETY_SCORE_DEFAULT, SAFETY_SCORE_RULES, SAFETY_SEVERITY_PENALTIES } from './constants'
import { hasConfirmedDefensiveEvidence, hasConfirmedRiskEvidence } from './evidence'

export function confirmedRiskPenalty(aiSafety: DashboardAiSafetyAssessment | undefined, commits: readonly GithubCommit[]): number {
  if (!aiSafety)
    return 0

  return aiSafety.signals.reduce((penalty, signal) => {
    const knownCommit = commits.some(commit => signal.commitSha === commit.sha || commit.sha.startsWith(signal.commitSha) || signal.commitSha.startsWith(commit.sha))
    if (signal.verdict !== 'risk'
      || signal.impact !== 'introduced'
      || !signal.evidence.trim()
      || !knownCommit
      || !hasConfirmedRiskEvidence(signal, commits)) {
      return penalty
    }

    const isSecretOrAuthBypass = (signal.category === 'secrets' || signal.category === 'auth') && signal.severity === 'high'
    return penalty + (isSecretOrAuthBypass ? SAFETY_SCORE_RULES.criticalRiskPenalty : SAFETY_SEVERITY_PENALTIES[signal.severity])
  }, 0)
}

export function confirmedDefensivePatchBonus(aiSafety: DashboardAiSafetyAssessment | undefined, commits: readonly GithubCommit[]): number {
  if (!aiSafety || aiSafety.status !== 'assessed' || aiSafety.confidence < SAFETY_SCORE_RULES.aiConfidenceThreshold)
    return 0

  const groundedSignals = aiSafety.signals.filter(signal => (
    signal.verdict === 'safe'
    && (signal.impact === 'introduced' || signal.impact === 'fixed')
    && Boolean(signal.evidence.trim())
    && commits.some(commit => signal.commitSha === commit.sha || commit.sha.startsWith(signal.commitSha) || signal.commitSha.startsWith(commit.sha))
    && hasConfirmedDefensiveEvidence(signal, commits)
  ))
  const distinctSignals = new Set(groundedSignals.map(signal => `${signal.commitSha}:${signal.filename ?? signal.category}`))
  return Math.min(SAFETY_SCORE_RULES.maximumAiDefenseBonus, distinctSignals.size * SAFETY_SCORE_RULES.aiDefenseSignalStep)
}

export function getDashboardSafetyScoreBreakdown(metrics: SafetyScoreInput, commits: readonly GithubCommit[], aiSafety?: DashboardAiSafetyAssessment): DashboardSafetyScoreBreakdown {
  const personalCommits = commits.filter(commit => !isMergeCommit(commit))
  const hasPatchEvidence = personalCommits.some(commit => commit.files.some(file => Boolean(file.patch?.trim())))
  if (!hasPatchEvidence) {
    return {
      evidenceStatus: 'insufficient',
      surfaceFileRatio: metrics.safetySurfaceFileRatio,
      surfaceLineRatio: metrics.safetySurfaceLineRatio,
      defenseCoverage: metrics.safetyDefenseCoverage,
      deterministicDefenseBonus: 0,
      aiDefenseBonus: 0,
      processBonus: 0,
      riskPenalty: 0,
      rawScore: SAFETY_SCORE_DEFAULT,
    }
  }

  const hasSafetySurface = metrics.safetySurfaceFileRatio > 0 || metrics.safetySurfaceLineRatio > 0
  const patchCoverageMultiplier = SAFETY_SCORE_RULES.patchCoverageBase
    + (metrics.safetyPatchCommitRatio / DASHBOARD_METRIC_RULES.percentageScale) * SAFETY_SCORE_RULES.patchCoverageScale
  const riskPenalty = confirmedRiskPenalty(aiSafety, personalCommits)
  const aiDefenseBonus = confirmedDefensivePatchBonus(aiSafety, personalCommits) * patchCoverageMultiplier
  const processBonus = hasSafetySurface
    ? Math.min(
        SAFETY_SCORE_RULES.maximumProcessBonus,
        metrics.validationFileRatio * SAFETY_SCORE_RULES.validationProcessWeight
        + metrics.ciFileRatio * SAFETY_SCORE_RULES.ciProcessWeight,
      )
    : 0
  const deterministicDefenseBonus = hasSafetySurface
    ? metrics.safetyDefenseCoverage * SAFETY_SCORE_RULES.deterministicDefenseWeight * patchCoverageMultiplier
    : 0
  const rawScore = SAFETY_SCORE_RULES.neutralScore + deterministicDefenseBonus + aiDefenseBonus + processBonus - riskPenalty

  return {
    evidenceStatus: hasSafetySurface ? 'surface-observed' : 'neutral',
    surfaceFileRatio: metrics.safetySurfaceFileRatio,
    surfaceLineRatio: metrics.safetySurfaceLineRatio,
    defenseCoverage: metrics.safetyDefenseCoverage,
    deterministicDefenseBonus,
    aiDefenseBonus,
    processBonus,
    riskPenalty,
    rawScore: clamp(Math.min(SAFETY_SCORE_RULES.maximumScore, rawScore)),
  }
}

export function scoreDashboardSafety(metrics: SafetyScoreInput, commits: readonly GithubCommit[], aiSafety?: DashboardAiSafetyAssessment): number {
  return getDashboardSafetyScoreBreakdown(metrics, commits, aiSafety).rawScore
}
