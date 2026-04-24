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
  it('keeps valid hook question title unchanged', () => {
    const result = normalizeRoastTitle('Did this architecture pass code review at all?', baseContext)
    expect(result.title).toBe('Did this architecture pass code review at all?')
    expect(result.normalized).toBe(false)
  })

  it('turns non-question title into hook question', () => {
    const result = normalizeRoastTitle('Your release process is chaos in production', baseContext)
    expect(result.title.endsWith('?')).toBe(true)
    expect(result.normalized).toBe(true)
    expect(result.reasons).toContain('ensured_question')
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
