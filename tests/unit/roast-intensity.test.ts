import { describe, expect, it } from 'vitest'
import { resolveRoastIntensityProfile } from '../../shared/roast/intensity'

describe('roast intensity profiles', () => {
  it('resolves all 4 intensity levels', () => {
    expect(resolveRoastIntensityProfile(1).label).toBe('salty')
    expect(resolveRoastIntensityProfile(2).label).toBe('savage')
    expect(resolveRoastIntensityProfile(3).label).toBe('unhinged')
    expect(resolveRoastIntensityProfile(4).label).toBe('nuke')
  })

  it('normalizes out-of-range values to valid profile', () => {
    expect(resolveRoastIntensityProfile(0).level).toBe(1)
    expect(resolveRoastIntensityProfile(99).level).toBe(4)
  })

  it('uses progressive limits and stronger config at higher intensity', () => {
    const low = resolveRoastIntensityProfile(1)
    const high = resolveRoastIntensityProfile(4)

    expect(high.maxCommitRefs).toBeGreaterThan(low.maxCommitRefs)
    expect(high.maxSelectedCommits).toBeGreaterThan(low.maxSelectedCommits)
    expect(high.maxPromptTotalFiles).toBeGreaterThan(low.maxPromptTotalFiles)
    expect(high.maxPromptTotalPatchChars).toBeGreaterThan(low.maxPromptTotalPatchChars)
    expect(high.aiMaxTokens).toBeGreaterThan(low.aiMaxTokens)
    expect(high.temperatureDelta).toBeGreaterThan(low.temperatureDelta)
  })
})
