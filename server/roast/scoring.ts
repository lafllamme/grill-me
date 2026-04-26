import type { RoastGrade, RoastMetrics } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import type { SelectedEvidence } from './evidence-selector'

export interface RoastScoringProfile {
  version: string
  weights: {
    volume: number
    churn: number
    entropy: number
    intensity: number
    signal: number
  }
  gradeThresholds: Array<{ min: number, grade: RoastGrade }>
  specialTitles: Record<RoastGrade, string>
}

export interface RoastScoringInputs {
  commitCount: number
  selectedCommitCount: number
  prCount: number
  roastIntensity: number
  roastLineCount: number
  feedbackCount: number
  selectedFiles: number
  selectedPatchChars: number
  titleLength: number
}

export const DEFAULT_ROAST_SCORING_PROFILE: RoastScoringProfile = {
  version: 'v1.0.0',
  weights: {
    volume: 0.28,
    churn: 0.22,
    entropy: 0.18,
    intensity: 0.17,
    signal: 0.15,
  },
  gradeThresholds: [
    { min: 95, grade: 'F-' },
    { min: 90, grade: 'F' },
    { min: 85, grade: 'D-' },
    { min: 78, grade: 'D' },
    { min: 70, grade: 'C-' },
    { min: 60, grade: 'C' },
    { min: 45, grade: 'B' },
    { min: 0, grade: 'A' },
  ],
  specialTitles: {
    'F-': 'Refactor Reject',
    'F': 'Dry Principle Murderer',
    'D-': 'Git Force Enthusiast',
    'D': 'Callback Hell Architect',
    'C-': 'Merge Conflict Magnet',
    'C': 'Node Modules Hoarder',
    'B': 'Technical Debt Collector',
    'A': 'Barely Production Safe',
  },
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, value))
}

function computeGrade(score: number, thresholds: RoastScoringProfile['gradeThresholds']): RoastGrade {
  const found = thresholds.find(item => score >= item.min)
  return found?.grade || 'A'
}

export function getDefaultRoastScoringInputs(
  payload: {
    title: string
    roastLines: string[]
    feedback: string[]
    meta: { commitCount: number, prCount: number, selectedCommitCount?: number }
    evidenceSummary?: SelectedEvidence['summary']
    intensityProfile: RoastIntensityProfile
  },
): RoastScoringInputs {
  return {
    commitCount: payload.meta.commitCount,
    selectedCommitCount: payload.meta.selectedCommitCount || payload.meta.commitCount,
    prCount: payload.meta.prCount,
    roastIntensity: payload.intensityProfile.level,
    roastLineCount: payload.roastLines.length,
    feedbackCount: payload.feedback.length,
    selectedFiles: payload.evidenceSummary?.selectedFiles || 0,
    selectedPatchChars: payload.evidenceSummary?.selectedPatchChars || 0,
    titleLength: payload.title.length,
  }
}

/**
 * Computes deterministic roast metrics used by persistence + leaderboard.
 */
export function computeRoastMetrics(
  inputs: RoastScoringInputs,
  profile: RoastScoringProfile = DEFAULT_ROAST_SCORING_PROFILE,
): RoastMetrics {
  const volume = clampScore(inputs.selectedCommitCount * 8 + inputs.commitCount * 2 + inputs.prCount * 6)
  const churn = clampScore(inputs.selectedFiles * 1.7 + inputs.selectedPatchChars / 130)
  const entropy = clampScore(inputs.roastLineCount * 9 + inputs.feedbackCount * 6 + inputs.titleLength / 6)
  const intensity = clampScore((inputs.roastIntensity - 1) * 25)
  const signal = clampScore(inputs.selectedPatchChars / 95 + inputs.selectedFiles * 2.4)

  const spaghettiIndex = clampScore(
    profile.weights.volume * volume
    + profile.weights.churn * churn
    + profile.weights.entropy * entropy
    + profile.weights.intensity * intensity
    + profile.weights.signal * signal,
  )

  const stinkScore = clampScore(Math.round(spaghettiIndex))
  const egoDamage = clampScore(Math.round(stinkScore * 0.7 + entropy * 0.3))
  const grade = computeGrade(stinkScore, profile.gradeThresholds)

  return {
    spaghettiIndex: Number(spaghettiIndex.toFixed(1)),
    stinkScore,
    egoDamage,
    grade,
    specialTitle: profile.specialTitles[grade],
  }
}
