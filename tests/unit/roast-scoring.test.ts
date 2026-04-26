import { describe, expect, it } from 'vitest'
import { computeRoastMetrics, DEFAULT_ROAST_SCORING_PROFILE } from '../../server/roast/scoring'

describe('roast scoring', () => {
  it('computes deterministic metrics in bounds', () => {
    const metrics = computeRoastMetrics({
      commitCount: 10,
      selectedCommitCount: 6,
      prCount: 1,
      roastIntensity: 2,
      roastLineCount: 4,
      feedbackCount: 3,
      selectedFiles: 24,
      selectedPatchChars: 4200,
      titleLength: 74,
    }, DEFAULT_ROAST_SCORING_PROFILE)

    expect(metrics.spaghettiIndex).toBeGreaterThanOrEqual(0)
    expect(metrics.spaghettiIndex).toBeLessThanOrEqual(100)
    expect(metrics.stinkScore).toBeGreaterThanOrEqual(0)
    expect(metrics.stinkScore).toBeLessThanOrEqual(100)
    expect(metrics.egoDamage).toBeGreaterThanOrEqual(0)
    expect(metrics.egoDamage).toBeLessThanOrEqual(100)
    expect(['F-', 'F', 'D-', 'D', 'C-', 'C', 'B', 'A']).toContain(metrics.grade)
    expect(metrics.specialTitle.length).toBeGreaterThan(0)
  })

  it('assigns worst grade for very high signal', () => {
    const metrics = computeRoastMetrics({
      commitCount: 30,
      selectedCommitCount: 16,
      prCount: 5,
      roastIntensity: 4,
      roastLineCount: 8,
      feedbackCount: 5,
      selectedFiles: 180,
      selectedPatchChars: 40000,
      titleLength: 120,
    })

    expect(metrics.grade).toBe('F-')
    expect(metrics.stinkScore).toBeGreaterThanOrEqual(95)
  })
})
