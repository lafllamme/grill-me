import { roastExplorerFixtures, roastExplorerLevels, roastMetricDescriptors } from '../../app/data/roast-explorer'
import { roastResponseSchema } from '../../shared/roast/contracts'

describe('roast explorer fixtures', () => {
  it('provides a contract-valid fixture for every intensity level', () => {
    expect(Object.keys(roastExplorerFixtures)).toHaveLength(4)

    for (const level of roastExplorerLevels) {
      const fixture = roastExplorerFixtures[level.value]
      const parsed = roastResponseSchema.safeParse(fixture)

      expect(parsed.success).toBe(true)
      expect(fixture.intensity.label).toBe(level.value)
      expect(fixture.roastLines.length).toBeGreaterThanOrEqual(2)
      expect(fixture.feedback.length).toBeGreaterThanOrEqual(2)
      expect(fixture.evidence.commits.length).toBeGreaterThan(0)
    }
  })

  it('keeps the three score meanings explicit and complete', () => {
    expect(roastMetricDescriptors).toEqual([
      { key: 'stinkScore', label: 'Stink', descriptor: 'overall code smell' },
      { key: 'spaghettiIndex', label: 'Spaghetti', descriptor: 'complexity & entanglement' },
      { key: 'egoDamage', label: 'Ego damage', descriptor: 'roast severity' },
    ])
  })

  it('contains raw diff snippets for secondary evidence', () => {
    const fixture = roastExplorerFixtures.medium_rare
    const files = fixture.evidence.commits.flatMap(commit => commit.files)

    expect(files.length).toBeGreaterThan(0)
    expect(files.every(file => file.patch.length > 0)).toBe(true)
  })
})
