export type RoastModelStreamEvent = { type: 'title', title: string } | { type: 'roast_line', index: number, text: string } | { type: 'feedback_item', index: number, text: string } | { type: 'done' }

export interface NdjsonParserState {
  title: string
  roastLines: Map<number, string>
  feedback: Map<number, string>
  sawDone: boolean
  invalidLineCount: number
}

export interface StreamNdjsonParser {
  push: (chunk: string) => RoastModelStreamEvent[]
  flush: () => RoastModelStreamEvent[]
  getState: () => NdjsonParserState
}

function assertNonNegativeIndex(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0)
    throw new Error('invalid_index')

  return value
}

function assertNonEmptyString(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0)
    throw new Error('invalid_text')

  return value.trim()
}

function parseEnvelopeObject(parsed: unknown): RoastModelStreamEvent {
  if (!parsed || typeof parsed !== 'object')
    throw new Error('invalid_envelope')

  const type = (parsed as any).type
  if (type === 'done')
    return { type: 'done' }

  if (type === 'title') {
    return {
      type: 'title',
      title: assertNonEmptyString((parsed as any).title),
    }
  }

  if (type === 'roast_line') {
    return {
      type: 'roast_line',
      index: assertNonNegativeIndex((parsed as any).index),
      text: assertNonEmptyString((parsed as any).text),
    }
  }

  if (type === 'feedback_item') {
    return {
      type: 'feedback_item',
      index: assertNonNegativeIndex((parsed as any).index),
      text: assertNonEmptyString((parsed as any).text),
    }
  }

  throw new Error('invalid_event_type')
}

function applyEventState(state: NdjsonParserState, event: RoastModelStreamEvent): void {
  if (event.type === 'title') {
    if (!state.title)
      state.title = event.title
    return
  }

  if (event.type === 'roast_line') {
    if (!state.roastLines.has(event.index))
      state.roastLines.set(event.index, event.text)
    return
  }

  if (event.type === 'feedback_item') {
    if (!state.feedback.has(event.index))
      state.feedback.set(event.index, event.text)
    return
  }

  if (event.type === 'done')
    state.sawDone = true
}

function extractBalancedObject(buffer: string): { objectText: string, endIndex: number } | null {
  const start = buffer.indexOf('{')
  if (start < 0)
    return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let index = start; index < buffer.length; index += 1) {
    const char = buffer[index]

    if (inString) {
      if (escaped)
        escaped = false
      else if (char === '\\')
        escaped = true
      else if (char === '"')
        inString = false
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === '{') {
      depth += 1
      continue
    }

    if (char === '}') {
      depth -= 1
      if (depth === 0) {
        return {
          objectText: buffer.slice(start, index + 1),
          endIndex: index + 1,
        }
      }
    }
  }

  return null
}

function parseAvailableObjects(state: NdjsonParserState, source: string): { events: RoastModelStreamEvent[], rest: string } {
  let buffer = source
  const events: RoastModelStreamEvent[] = []

  while (buffer.length > 0) {
    const firstBraceIndex = buffer.indexOf('{')
    if (firstBraceIndex < 0) {
      const newlineIndex = buffer.lastIndexOf('\n')
      if (newlineIndex < 0)
        return { events, rest: buffer }

      const completed = buffer.slice(0, newlineIndex + 1)
      const rest = buffer.slice(newlineIndex + 1)
      const invalidLines = completed
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)

      state.invalidLineCount += invalidLines.length
      return { events, rest }
    }

    if (firstBraceIndex > 0) {
      const leading = buffer.slice(0, firstBraceIndex).trim()
      if (leading)
        state.invalidLineCount += 1
      buffer = buffer.slice(firstBraceIndex)
    }

    const extracted = extractBalancedObject(buffer)
    if (!extracted)
      return { events, rest: buffer }

    const candidate = extracted.objectText.trim()
    buffer = buffer.slice(extracted.endIndex)

    try {
      const parsed = JSON.parse(candidate)
      const event = parseEnvelopeObject(parsed)
      applyEventState(state, event)
      events.push(event)
    }
    catch {
      state.invalidLineCount += 1
    }
  }

  return { events, rest: '' }
}

/**
 * Creates an incremental parser for model output that may arrive as NDJSON
 * lines or concatenated JSON objects split across arbitrary chunk boundaries.
 *
 * @remarks
 * - Input can contain partial objects.
 * - Objects are extracted via balanced-brace scanning.
 * - Invalid fragments are counted in `invalidLineCount` and skipped.
 * - First value wins for duplicate indexes via parser state rules.
 *
 * @returns Stream parser with `push`, `flush`, and `getState`.
 * @example
 * const parser = createStreamNdjsonParser()
 * parser.push('{"type":"title","title":"Build Burn"}')
 * parser.push('{"type":"roast_line","index":0,"text":"Line"}')
 * const events = parser.flush()
 */
export function createStreamNdjsonParser(): StreamNdjsonParser {
  let buffer = ''
  const state: NdjsonParserState = {
    title: '',
    roastLines: new Map(),
    feedback: new Map(),
    sawDone: false,
    invalidLineCount: 0,
  }

  return {
    push: (chunk) => {
      buffer += chunk
      const parsed = parseAvailableObjects(state, buffer)
      buffer = parsed.rest
      return parsed.events
    },
    flush: () => {
      const parsed = parseAvailableObjects(state, buffer)
      buffer = ''
      if (parsed.rest.trim())
        state.invalidLineCount += 1
      return parsed.events
    },
    getState: () => state,
  }
}
