import type { NdjsonParserState } from './stream-ndjson-parser'

function toOrderedValues(map: Map<number, string>): string[] {
  return [...map.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, value]) => value.trim())
    .filter(Boolean)
}

export interface CanonicalRoastOutput {
  title: string
  roastLines: string[]
  feedback: string[]
}

export function normalizeCanonicalRoastFromNdjson(state: NdjsonParserState): CanonicalRoastOutput {
  return {
    title: state.title.trim(),
    roastLines: toOrderedValues(state.roastLines),
    feedback: toOrderedValues(state.feedback),
  }
}

export function assertCanonicalRoastOutput(value: CanonicalRoastOutput): void {
  if (!value.title || value.roastLines.length === 0 || value.feedback.length === 0) {
    throw new Error('cloudflare_ai_incomplete_output')
  }
}
