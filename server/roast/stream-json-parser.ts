export interface ProgressiveRoastState {
  title: string
  roastLines: Map<number, string>
  feedback: Map<number, string>
}

export type ProgressiveRoastEvent
  = { type: 'title', title: string }
    | { type: 'roast_line', index: number, text: string }
    | { type: 'feedback_item', index: number, text: string }

export interface StreamJsonProgressParser {
  push: (chunk: string) => ProgressiveRoastEvent[]
  flush: () => ProgressiveRoastEvent[]
  getState: () => ProgressiveRoastState
}

function skipWhitespace(source: string, startIndex: number): number {
  let index = startIndex
  while (index < source.length && /\s/.test(source[index] || ''))
    index += 1
  return index
}

function findKeyIndex(source: string, key: string): number {
  return source.indexOf(`"${key}"`)
}

function readJsonStringAt(source: string, quoteIndex: number): { value: string, endIndex: number } | null {
  if (source[quoteIndex] !== '"')
    return null

  let index = quoteIndex + 1
  let escaped = false

  while (index < source.length) {
    const char = source[index] || ''

    if (escaped) {
      escaped = false
      index += 1
      continue
    }

    if (char === '\\') {
      escaped = true
      index += 1
      continue
    }

    if (char === '"') {
      const rawValue = source.slice(quoteIndex, index + 1)
      try {
        return {
          value: JSON.parse(rawValue) as string,
          endIndex: index + 1,
        }
      }
      catch {
        return null
      }
    }

    index += 1
  }

  return null
}

function readJsonStringValueForKey(source: string, key: string): string {
  const keyIndex = findKeyIndex(source, key)
  if (keyIndex < 0)
    return ''

  const colonIndex = source.indexOf(':', keyIndex + key.length + 2)
  if (colonIndex < 0)
    return ''

  const quoteIndex = skipWhitespace(source, colonIndex + 1)
  const parsed = readJsonStringAt(source, quoteIndex)
  return parsed?.value.trim() || ''
}

function readJsonStringArrayForKey(source: string, key: string): string[] {
  const keyIndex = findKeyIndex(source, key)
  if (keyIndex < 0)
    return []

  const colonIndex = source.indexOf(':', keyIndex + key.length + 2)
  if (colonIndex < 0)
    return []

  let index = skipWhitespace(source, colonIndex + 1)
  if (source[index] !== '[')
    return []

  index += 1
  const items: string[] = []

  while (index < source.length) {
    index = skipWhitespace(source, index)
    const char = source[index] || ''

    if (char === ']')
      return items

    if (char === ',') {
      index += 1
      continue
    }

    if (char !== '"')
      return items

    const parsed = readJsonStringAt(source, index)
    if (!parsed)
      return items

    const value = parsed.value.trim()
    if (value)
      items.push(value)

    index = parsed.endIndex
  }

  return items
}

function computeEventsFromSnapshot(
  state: ProgressiveRoastState,
  nextTitle: string,
  nextRoastLines: string[],
  nextFeedback: string[],
): ProgressiveRoastEvent[] {
  const events: ProgressiveRoastEvent[] = []

  if (nextTitle && !state.title) {
    state.title = nextTitle
    events.push({ type: 'title', title: nextTitle })
  }

  nextRoastLines.forEach((line, index) => {
    if (!line || state.roastLines.has(index))
      return

    state.roastLines.set(index, line)
    events.push({ type: 'roast_line', index, text: line })
  })

  nextFeedback.forEach((item, index) => {
    if (!item || state.feedback.has(index))
      return

    state.feedback.set(index, item)
    events.push({ type: 'feedback_item', index, text: item })
  })

  return events
}

export function createStreamJsonProgressParser(): StreamJsonProgressParser {
  let buffer = ''
  const state: ProgressiveRoastState = {
    title: '',
    roastLines: new Map(),
    feedback: new Map(),
  }

  const parseSnapshot = (): ProgressiveRoastEvent[] => {
    const nextTitle = readJsonStringValueForKey(buffer, 'title')
    const nextRoastLines = readJsonStringArrayForKey(buffer, 'roastLines')
    const nextFeedback = readJsonStringArrayForKey(buffer, 'feedback')

    return computeEventsFromSnapshot(state, nextTitle, nextRoastLines, nextFeedback)
  }

  return {
    push: (chunk) => {
      buffer += chunk
      return parseSnapshot()
    },
    flush: () => parseSnapshot(),
    getState: () => state,
  }
}
