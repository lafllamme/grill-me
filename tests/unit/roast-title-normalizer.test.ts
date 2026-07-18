import { describe, expect, it } from 'vitest'
import { normalizeRoastTitle } from '../../server/roast/title-normalizer'
import { resolveRoastIntensityProfile } from '../../shared/roast/intensity'

const baseContext = {
  username: 'lafllamme',
  roastLines: ['Line 1'],
  meta: {
    commitCount: 10,
    prCount: 0,
    selectedCommitCount: 6,
  },
  intensityProfile: resolveRoastIntensityProfile(2),
}

describe('roast title normalizer', () => {
  it('keeps valid hook title unchanged', () => {
    const result = normalizeRoastTitle('Did this architecture pass code review at all?', baseContext)
    expect(result.title).toBe('Did this architecture pass code review at all?')
    expect(result.normalized).toBe(false)
  })

  it('keeps a non-question hook title when it already reads well', () => {
    const result = normalizeRoastTitle('Your release process is chaos in production', baseContext)
    expect(result.title).toBe('Your release process is chaos in production')
    expect(result.normalized).toBe(false)
  })

  it('strips generic summary prefixes and clamps length', () => {
    const result = normalizeRoastTitle('Summary: Your release workflow keeps breaking production every single day and night repeatedly', baseContext)
    expect(result.title.toLowerCase().startsWith('summary:')).toBe(false)
    expect(result.reasons).toContain('stripped_summary_prefix')
    expect(result.title.split(/\s+/).length).toBeLessThanOrEqual(12)
  })

  it('falls back to evidence-based hook when title is too short', () => {
    const result = normalizeRoastTitle('Oops?', baseContext)
    expect(result.reasons).toContain('enforced_min_words')
    expect(result.title).toMatch(/shipped 6 commits\?$/)
  })
})
