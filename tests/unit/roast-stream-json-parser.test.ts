import { describe, expect, it } from 'vitest'
import { normalizeCanonicalRoastFromNdjson } from '../../server/roast/final-normalizer'
import { createStreamJsonProgressParser } from '../../server/roast/stream-json-parser'
import { resolveRoastIntensityProfile } from '../../shared/roast/intensity'

const MEDIUM_RARE = resolveRoastIntensityProfile(2)

describe('roast stream json parser', () => {
  it('emits title, roast lines, and feedback incrementally from growing json', () => {
    const parser = createStreamJsonProgressParser()

    const first = parser.push('{"title":"Build Broiler","roastLines":["Line A"')
    expect(first).toEqual([
      { type: 'title', title: 'Build Broiler' },
      { type: 'roast_line', index: 0, text: 'Line A' },
    ])

    const second = parser.push(',"Line B"],"feedback":["Fix tests"')
    expect(second).toEqual([
      { type: 'roast_line', index: 1, text: 'Line B' },
      { type: 'feedback_item', index: 0, text: 'Fix tests' },
    ])

    const third = parser.push(',"Ship smaller diffs"]}')
    expect(third).toEqual([
      { type: 'feedback_item', index: 1, text: 'Ship smaller diffs' },
    ])

    const canonical = normalizeCanonicalRoastFromNdjson(parser.getState(), MEDIUM_RARE)
    expect(canonical).toEqual({
      title: 'Build Broiler',
      roastLines: ['Line A', 'Line B'],
      feedback: ['Fix tests', 'Ship smaller diffs'],
    })
  })

  it('handles escaped quotes in json strings', () => {
    const parser = createStreamJsonProgressParser()

    const events = parser.push('{"title":"Quote \\"Burn\\" Test","roastLines":["Line A"],"feedback":["Fix \\"that\\" test"]}')
    expect(events).toEqual([
      { type: 'title', title: 'Quote "Burn" Test' },
      { type: 'roast_line', index: 0, text: 'Line A' },
      { type: 'feedback_item', index: 0, text: 'Fix "that" test' },
    ])
  })
})
