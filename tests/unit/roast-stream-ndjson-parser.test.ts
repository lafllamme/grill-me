import { describe, expect, it } from 'vitest'
import { assertCanonicalRoastOutput, normalizeCanonicalRoastFromNdjson } from '../../server/roast/final-normalizer'
import { createStreamNdjsonParser } from '../../server/roast/stream-ndjson-parser'

describe('roast stream ndjson parser', () => {
  it('parses split chunks incrementally', () => {
    const parser = createStreamNdjsonParser()

    const first = parser.push('{"type":"title","title":"Build Broiler"}\n{"type":"roast_line","index":0')
    expect(first).toHaveLength(1)
    expect(first[0]).toEqual({ type: 'title', title: 'Build Broiler' })

    const second = parser.push(',"text":"Line A"}\n{"type":"feedback_item","index":0,"text":"Fix tests"}\n')
    expect(second).toHaveLength(2)
    expect(second[0]).toEqual({ type: 'roast_line', index: 0, text: 'Line A' })
    expect(second[1]).toEqual({ type: 'feedback_item', index: 0, text: 'Fix tests' })

    const flushed = parser.flush()
    expect(flushed).toHaveLength(0)

    const canonical = normalizeCanonicalRoastFromNdjson(parser.getState())
    expect(canonical.title).toBe('Build Broiler')
    expect(canonical.roastLines).toEqual(['Line A'])
    expect(canonical.feedback).toEqual(['Fix tests'])
  })

  it('counts invalid ndjson lines without throwing', () => {
    const parser = createStreamNdjsonParser()
    const events = parser.push('not-json\n')
    expect(events).toHaveLength(0)
    expect(parser.getState().invalidLineCount).toBe(1)
  })

  it('keeps first value on duplicate indexes', () => {
    const parser = createStreamNdjsonParser()
    parser.push('{"type":"title","title":"First"}\n')
    parser.push('{"type":"roast_line","index":0,"text":"A"}\n')
    parser.push('{"type":"roast_line","index":0,"text":"B"}\n')
    parser.push('{"type":"feedback_item","index":0,"text":"X"}\n')
    parser.push('{"type":"feedback_item","index":0,"text":"Y"}\n')

    const canonical = normalizeCanonicalRoastFromNdjson(parser.getState())
    expect(canonical.roastLines).toEqual(['A'])
    expect(canonical.feedback).toEqual(['X'])
  })

  it('parses concatenated json objects without newline delimiters', () => {
    const parser = createStreamNdjsonParser()
    const events = parser.push(
      '{"type":"title","title":"Hot Build"}{"type":"roast_line","index":0,"text":"line"}{"type":"feedback_item","index":0,"text":"fix"}{"type":"done"}',
    )

    expect(events.map(event => event.type)).toEqual(['title', 'roast_line', 'feedback_item', 'done'])
    const canonical = normalizeCanonicalRoastFromNdjson(parser.getState())
    expect(canonical.title).toBe('Hot Build')
    expect(canonical.roastLines).toEqual(['line'])
    expect(canonical.feedback).toEqual(['fix'])
  })

  it('fails canonical validation when required fields are missing', () => {
    expect(() => assertCanonicalRoastOutput({
      title: '',
      roastLines: ['line'],
      feedback: ['item'],
    })).toThrowError('cloudflare_ai_incomplete_output')
  })
})
