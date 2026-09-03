export interface DashboardTraceCheckOptions {
  requireAiLifecycle?: boolean
}

export interface DashboardTraceCheckResult {
  ok: boolean
  events: string[]
  missingEvents: string[]
  missingFields: string[]
  orderValid: boolean
}

const BASE_REQUIRED_EVENTS = [
  'request-start',
  'fetch-start',
  'collection-complete',
  'evidence-ready',
  'scores-calculated',
  'patch-selection-complete',
] as const

const AI_REQUIRED_EVENTS = ['prompt-prepared', 'request-metrics', 'response-received'] as const
const TERMINAL_REQUIRED_EVENTS = ['review-complete', 'finalized'] as const

const REQUIRED_FIELDS: Record<string, readonly string[]> = {
  'collection-complete': ['candidate refs', 'integration skipped', 'personal refs', 'details fetched', 'personal with patch', 'backfilled'],
  'patch-selection-complete': ['commit count', 'file count', 'patch characters', 'ai selected'],
  'scores-calculated': ['scores', 'overall score'],
  'review-complete': ['status', 'confidence'],
  'finalized': ['overall score', 'grade', 'role'],
}

interface TraceBlock {
  event: string
  body: string
}

function readTraceBlocks(markdown: string): TraceBlock[] {
  const headingPattern = /^### \d+ · ([a-z-]+) ·/gm
  const matches = [...markdown.matchAll(headingPattern)]
  return matches.map((match, index) => ({
    event: match[1]!.trim(),
    body: markdown.slice(match.index! + match[0].length, matches[index + 1]?.index ?? markdown.length),
  }))
}

function hasField(block: TraceBlock | undefined, field: string): boolean {
  return Boolean(block?.body.toLowerCase().includes(`${field.toLowerCase()}:`))
}

export function validateDashboardTraceMarkdown(markdown: string, options: DashboardTraceCheckOptions = {}): DashboardTraceCheckResult {
  const blocks = readTraceBlocks(markdown)
  const events = blocks.map(block => block.event)
  const requiredEvents = options.requireAiLifecycle
    ? [...BASE_REQUIRED_EVENTS, ...AI_REQUIRED_EVENTS, ...TERMINAL_REQUIRED_EVENTS]
    : [...BASE_REQUIRED_EVENTS, ...TERMINAL_REQUIRED_EVENTS]
  const missingEvents = requiredEvents.filter(event => !events.includes(event))
  const requiredFields = Object.entries(REQUIRED_FIELDS).flatMap(([event, fields]) => fields
    .filter(field => !hasField(blocks.find(block => block.event === event), field))
    .map(field => `${event}.${field}`))
  const orderedEvents = requiredEvents
    .map(event => events.indexOf(event))
    .filter(index => index >= 0)
  const orderValid = orderedEvents.every((index, position) => position === 0 || index > orderedEvents[position - 1]!)

  return {
    ok: missingEvents.length === 0 && requiredFields.length === 0 && orderValid,
    events,
    missingEvents,
    missingFields: requiredFields,
    orderValid,
  }
}
