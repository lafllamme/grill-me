import { consola } from 'consola'

export const DASHBOARD_TRACE_LEVELS = ['off', 'summary', 'full'] as const

export type DashboardTraceLevel = typeof DASHBOARD_TRACE_LEVELS[number]
export type DashboardTraceSource = 'client' | 'server'
export type DashboardTraceStage = 'github' | 'grill' | 'ai' | 'ui'
export type DashboardTraceEvent
  = | 'request-start'
    | 'fetch-start'
    | 'progress'
    | 'collection-complete'
    | 'evidence-ready'
    | 'metrics-calculated'
    | 'scores-calculated'
    | 'patch-selection-complete'
    | 'prompt-prepared'
    | 'request-metrics'
    | 'response-received'
    | 'review-complete'
    | 'finalized'
    | 'stream-start'
    | 'stream-meta'
    | 'stream-event'
    | 'stream-complete'
    | 'stream-error'

export interface DashboardTraceOptions {
  requestId: string
  username: string
  source: DashboardTraceSource
  level: DashboardTraceLevel
  onRender?: DashboardTraceRenderHandler
}

export interface DashboardTraceEntry {
  requestId: string
  username: string
  source: DashboardTraceSource
  elapsedMs: number
  payload: Record<string, unknown>
}

export interface DashboardTraceRender {
  entry: DashboardTraceEntry
  stage: DashboardTraceStage
  event: DashboardTraceEvent
  text: string
  boxes: string[]
}

export type DashboardTraceRenderHandler = (render: DashboardTraceRender) => void

export interface DashboardTrace {
  readonly level: DashboardTraceLevel
  log: (stage: DashboardTraceStage, event: DashboardTraceEvent, payload?: Record<string, unknown>) => void
}

const TRACE_STAGE_LABELS: Record<DashboardTraceStage, string> = {
  github: 'GitHub',
  grill: 'Grill',
  ai: 'AI',
  ui: 'UI',
}

const TRACE_EVENT_DESCRIPTIONS: Record<DashboardTraceEvent, string> = {
  'request-start': 'start analysis',
  'fetch-start': 'read public history',
  'progress': 'update collection',
  'collection-complete': 'finish collection',
  'evidence-ready': 'publish evidence',
  'metrics-calculated': 'calculate metrics',
  'scores-calculated': 'calculate baseline',
  'patch-selection-complete': 'select patch evidence',
  'prompt-prepared': 'prepare AI review',
  'request-metrics': 'measure AI request',
  'response-received': 'receive AI response',
  'review-complete': 'finish AI review',
  'finalized': 'publish final profile',
  'stream-start': 'open analysis stream',
  'stream-meta': 'receive stream meta',
  'stream-event': 'receive stream event',
  'stream-complete': 'complete dashboard stream',
  'stream-error': 'fail dashboard stream',
}

const TRACE_PROGRESS_DESCRIPTIONS: Record<string, string> = {
  'profile': 'verify identity',
  'repositories': 'map repositories',
  'history': 'collect personal history',
  'commits': 'enrich commit patches',
  'pull-requests': 'attach review context',
  'checks': 'collect check results',
}

const TRACE_CONTENT_KEYS = new Set([
  'codeChanges',
  'content',
  'patch',
  'patches',
  'rawResponse',
  'systemPrompt',
  'userPrompt',
])

const TRACE_PROMPT_SEPARATOR = '─'.repeat(18)
const TRACE_MAX_INLINE_TEXT = 120
const TRACE_MAX_PROMPT_LINE = 108

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function estimateDashboardTokens(value: string): number {
  return Math.ceil(value.length / 4)
}

function textStats(value: string): Record<string, number> {
  return {
    characters: value.length,
    bytes: new TextEncoder().encode(value).byteLength,
    estimatedTokens: estimateDashboardTokens(value),
  }
}

function shapeTraceValue(value: unknown, level: DashboardTraceLevel, key?: string): unknown {
  if (level === 'full')
    return value

  if (typeof value === 'string' && key && TRACE_CONTENT_KEYS.has(key))
    return textStats(value)

  if (Array.isArray(value))
    return value.map(item => shapeTraceValue(item, level))

  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).map(([entryKey, entryValue]) => [
      entryKey,
      shapeTraceValue(entryValue, level, entryKey),
    ]))
  }

  return value
}

function formatNumber(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value))
    return String(value ?? '—')

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function formatKey(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .toLowerCase()
}

function truncateText(value: string, maximum = TRACE_MAX_INLINE_TEXT): string {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > maximum ? `${normalized.slice(0, maximum - 1)}…` : normalized
}

function formatStats(value: Record<string, unknown>): string | null {
  if (typeof value.characters !== 'number')
    return null

  const parts = [`${formatNumber(value.characters)} chars`]
  if (typeof value.bytes === 'number')
    parts.push(`${formatNumber(value.bytes)} bytes`)
  if (typeof value.estimatedTokens === 'number')
    parts.push(`≈${formatNumber(value.estimatedTokens)} tokens`)
  return `hidden · ${parts.join(' · ')}`
}

function formatInlineValue(value: unknown): string {
  if (value === undefined || value === null)
    return '—'
  if (typeof value === 'string')
    return truncateText(value)
  if (typeof value === 'number')
    return formatNumber(value)
  if (typeof value === 'boolean')
    return value ? 'yes' : 'no'
  if (Array.isArray(value))
    return `${formatNumber(value.length)} items`
  if (isRecord(value))
    return formatStats(value) ?? Object.entries(value).map(([key, nestedValue]) => `${formatKey(key)}=${formatInlineValue(nestedValue)}`).join(', ')
  return String(value)
}

function formatCommitRows(value: unknown): string[] {
  if (!Array.isArray(value))
    return []

  return value.slice(0, 30).map((item, index) => {
    if (!isRecord(item))
      return `commit ${index + 1}: ${formatInlineValue(item)}`

    const sha = typeof item.sha === 'string' ? item.sha.slice(0, 8) : '--------'
    const repo = typeof item.repo === 'string' ? item.repo : 'unknown repo'
    const message = typeof item.message === 'string' ? truncateText(item.message, 76) : 'no message'
    const size = `+${formatNumber(item.additions)} / -${formatNumber(item.deletions)}`
    const files = `${formatNumber(item.changedFiles)} files`
    const reasons = Array.isArray(item.reasons) ? ` · ${item.reasons.join(', ')}` : ''
    return `${index + 1}. ${sha} · ${repo} · ${message} · ${size} · ${files}${reasons}`
  })
}

function formatFileRows(value: unknown): string[] {
  if (!Array.isArray(value))
    return []

  return value.slice(0, 30).map((item, index) => {
    if (!isRecord(item))
      return `file ${index + 1}: ${formatInlineValue(item)}`

    const sha = typeof item.commitSha === 'string' ? item.commitSha.slice(0, 8) : '--------'
    const filename = typeof item.filename === 'string' ? item.filename : 'unknown file'
    const status = typeof item.status === 'string' ? item.status : 'unknown status'
    const patch = isRecord(item.patch) ? formatStats(item.patch) : typeof item.patchCharacters === 'number' ? `${formatNumber(item.patchCharacters)} chars` : null
    const reason = typeof item.reason === 'string' ? ` · ${item.reason}` : ''
    return `${index + 1}. ${sha} · ${filename} · ${status}${patch ? ` · ${patch}` : ''}${reason}`
  })
}

function formatRecordLines(value: Record<string, unknown>, indent = '  '): string[] {
  return Object.entries(value).flatMap(([key, nestedValue]) => {
    if (Array.isArray(nestedValue))
      return [`${indent}${formatKey(key)}: ${formatNumber(nestedValue.length)} items`]
    if (isRecord(nestedValue))
      return [`${indent}${formatKey(key)}:`, ...formatRecordLines(nestedValue, `${indent}  `)]
    return [`${indent}${formatKey(key)}: ${formatInlineValue(nestedValue)}`]
  })
}

function formatPromptReference(value: unknown, label: string): string {
  if (isRecord(value))
    return `${label}: ${formatStats(value) ?? formatInlineValue(value)}`
  return `${label}: ${typeof value === 'string' ? 'shown in box' : formatInlineValue(value)}`
}

function formatTracePayload(event: DashboardTraceEvent, payload: Record<string, unknown>): string {
  const lines: string[] = []
  const add = (label: string, value: unknown) => lines.push(`${formatKey(label)}: ${formatInlineValue(value)}`)

  if (event === 'progress') {
    const phase = typeof payload.phase === 'string' ? payload.phase : 'unknown phase'
    const description = TRACE_PROGRESS_DESCRIPTIONS[phase]
    lines.push(`phase: ${phase}${description ? ` · ${description}` : ''}`)
    for (const [key, value] of Object.entries(payload)) {
      if (key !== 'phase')
        add(key, value)
    }
    return lines.join('\n  ')
  }

  if (event === 'collection-complete') {
    add('duration', typeof payload.durationMs === 'number' ? `${formatNumber(payload.durationMs)} ms` : undefined)
    for (const key of ['repositories', 'commits', 'pullRequests', 'checks', 'patchCharacters']) {
      if (key in payload)
        add(key, payload[key])
    }
    if (payload.collection && isRecord(payload.collection))
      lines.push(`collection: ${formatRecordLines(payload.collection, '').join(' · ')}`)
    if (payload.commits)
      lines.push(`commits:\n  ${formatCommitRows(payload.commits).join('\n  ')}`)
    return lines.join('\n  ')
  }

  if (event === 'patch-selection-complete') {
    for (const key of ['commitCount', 'fileCount', 'usablePatchCount', 'patchCharacters']) {
      if (key in payload)
        add(key, payload[key])
    }
    if (payload.commits)
      lines.push(`selected commits:\n  ${formatCommitRows(payload.commits).join('\n  ')}`)
    if (payload.files)
      lines.push(`selected files:\n  ${formatFileRows(payload.files).join('\n  ')}`)
    return lines.join('\n  ')
  }

  if (event === 'prompt-prepared') {
    for (const key of ['selectedCommitCount', 'patchCount', 'patchCharacters']) {
      if (key in payload)
        add(key, payload[key])
    }
    lines.push(formatPromptReference(payload.systemPrompt, 'system prompt'))
    lines.push(formatPromptReference(payload.userPrompt, 'user prompt'))
    return lines.join('\n  ')
  }

  if (event === 'response-received') {
    add('parser path', payload.parserPath)
    if (payload.responseShape)
      add('response shape', payload.responseShape)
    lines.push(formatPromptReference(payload.rawResponse, 'model response'))
    return lines.join('\n  ')
  }

  if (event === 'scores-calculated') {
    if (payload.scores && isRecord(payload.scores))
      lines.push(`scores: ${Object.entries(payload.scores).map(([key, value]) => `${formatKey(key)}=${formatInlineValue(value)}`).join(' · ')}`)
    for (const key of ['overallScore', 'grade', 'role', 'roleStatus']) {
      if (key in payload)
        add(key, payload[key])
    }
    if (payload.metrics && isRecord(payload.metrics)) {
      lines.push('metrics:')
      lines.push(...formatRecordLines(payload.metrics, '  '))
    }
    return lines.join('\n  ')
  }

  if (event === 'request-metrics') {
    for (const [key, value] of Object.entries(payload))
      add(key, value)
    return lines.join('\n  ')
  }

  if (event === 'review-complete') {
    for (const key of ['status', 'responsePath', 'confidence', 'axisReviews', 'findings', 'diagnostic']) {
      if (key in payload)
        add(key, payload[key])
    }
    if (payload.parseWarnings)
      add('parse warnings', payload.parseWarnings)
    return lines.join('\n  ')
  }

  for (const [key, value] of Object.entries(payload)) {
    if (Array.isArray(value) && key === 'commits') {
      lines.push(`commits:\n  ${formatCommitRows(value).join('\n  ')}`)
      continue
    }
    if (Array.isArray(value) && key === 'files') {
      lines.push(`files:\n  ${formatFileRows(value).join('\n  ')}`)
      continue
    }
    if (isRecord(value)) {
      lines.push(`${formatKey(key)}:\n${formatRecordLines(value, '  ').join('\n')}`)
      continue
    }
    add(key, value)
  }
  return lines.join('\n  ')
}

function wrapText(value: string, maximum = TRACE_MAX_PROMPT_LINE): string[] {
  return value.split('\n').flatMap((line) => {
    if (!line)
      return ['']

    const chunks: string[] = []
    let remaining = line
    while (remaining.length > maximum) {
      let splitAt = remaining.lastIndexOf(' ', maximum)
      if (splitAt <= 0)
        splitAt = maximum
      chunks.push(remaining.slice(0, splitAt))
      remaining = remaining.slice(splitAt).trimStart()
    }
    chunks.push(remaining)
    return chunks
  })
}

function formatPromptText(value: unknown): string[] {
  if (typeof value !== 'string')
    return [formatInlineValue(value)]

  const withoutNoThink = value.replace(/\n\/no_think\s*$/i, '').trim()
  try {
    return wrapText(JSON.stringify(JSON.parse(withoutNoThink), null, 2))
  }
  catch {
    return wrapText(withoutNoThink)
  }
}

function formatModelText(value: unknown): string[] {
  if (typeof value !== 'string')
    return [formatInlineValue(value)]

  const normalized = value.replace(/\r\n/g, '\n').trim()
  const fencedStart = normalized.match(/```(?:json)?[ \t]*/i)
  const fencedEnd = fencedStart?.index === undefined ? -1 : normalized.indexOf('```', fencedStart.index + fencedStart[0].length)
  const fencedJson = fencedStart && fencedEnd >= 0
    ? normalized.slice(fencedStart.index! + fencedStart[0].length, fencedEnd).trim()
    : undefined
  const jsonStart = normalized.indexOf('{')
  const jsonEnd = normalized.lastIndexOf('}')
  const jsonCandidate = fencedJson ?? (jsonStart >= 0 && jsonEnd > jsonStart ? normalized.slice(jsonStart, jsonEnd + 1) : normalized)

  try {
    const prefix = fencedJson
      ? normalized.slice(0, fencedStart!.index).trim()
      : jsonCandidate === normalized ? '' : normalized.slice(0, jsonStart).trim()
    return [
      ...(prefix ? wrapText(prefix) : []),
      ...wrapText(JSON.stringify(JSON.parse(jsonCandidate), null, 2)),
    ]
  }
  catch {
    return wrapText(normalized)
  }
}

function buildPromptBox(entry: DashboardTraceEntry, payload: Record<string, unknown>): string {
  const selection = [
    typeof payload.selectedCommitCount === 'number' ? `${formatNumber(payload.selectedCommitCount)} commits` : null,
    typeof payload.patchCount === 'number' ? `${formatNumber(payload.patchCount)} files` : null,
    typeof payload.patchCharacters === 'number' ? `${formatNumber(payload.patchCharacters)} patch chars` : null,
  ].filter(Boolean).join(' · ')

  return [
    `AI PROMPT · ${entry.username} · ${entry.requestId}`,
    selection ? `selection · ${selection}` : null,
    `${TRACE_PROMPT_SEPARATOR} SYSTEM PROMPT ${TRACE_PROMPT_SEPARATOR}`,
    ...formatPromptText(payload.systemPrompt),
    `${TRACE_PROMPT_SEPARATOR} USER PROMPT / METRICS ${TRACE_PROMPT_SEPARATOR}`,
    ...formatPromptText(payload.userPrompt),
  ].filter((line): line is string => line !== null).join('\n')
}

function buildResponseBox(entry: DashboardTraceEntry, payload: Record<string, unknown>): string {
  const shape = Array.isArray(payload.responseShape)
    ? wrapText(payload.responseShape.map(value => String(value)).join(' · ')).join('\n')
    : 'not available'
  return [
    `AI RESPONSE · ${entry.username} · ${entry.requestId}`,
    `parser · ${formatInlineValue(payload.parserPath)}`,
    `shape ·\n${shape}`,
    `${TRACE_PROMPT_SEPARATOR} MODEL TEXT ${TRACE_PROMPT_SEPARATOR}`,
    ...formatModelText(payload.rawResponse),
  ].join('\n')
}

function formatTraceHeader(stage: DashboardTraceStage, event: DashboardTraceEvent, entry: DashboardTraceEntry): string {
  return `[${TRACE_STAGE_LABELS[stage]}] ${TRACE_EVENT_DESCRIPTIONS[event]} · ${entry.username} · ${entry.requestId} · ${entry.source} · +${formatNumber(entry.elapsedMs)}ms`
}

export function resolveDashboardTraceLevel(value: unknown, fallback: DashboardTraceLevel = 'off'): DashboardTraceLevel {
  return typeof value === 'string' && DASHBOARD_TRACE_LEVELS.includes(value as DashboardTraceLevel)
    ? value as DashboardTraceLevel
    : fallback
}

export function createDashboardTrace(options: DashboardTraceOptions): DashboardTrace {
  const startedAt = Date.now()

  return {
    level: options.level,
    log: (stage, event, payload = {}) => {
      if (options.level === 'off')
        return

      const entry: DashboardTraceEntry = {
        requestId: options.requestId,
        username: options.username,
        source: options.source,
        elapsedMs: Date.now() - startedAt,
        payload: shapeTraceValue(payload, options.level) as Record<string, unknown>,
      }
      const details = formatTracePayload(event, entry.payload)
      const text = `${formatTraceHeader(stage, event, entry)}${details ? `\n  ${details}` : ''}`
      const boxes: string[] = []
      consola.info(text)

      if (options.level === 'full' && event === 'prompt-prepared') {
        const promptBox = buildPromptBox(entry, payload)
        boxes.push(promptBox)
        consola.box(promptBox)
      }
      if (options.level === 'full' && event === 'response-received') {
        const responseBox = buildResponseBox(entry, payload)
        boxes.push(responseBox)
        consola.box(responseBox)
      }

      options.onRender?.({ entry, stage, event, text, boxes })
    },
  }
}

export function getDashboardTextStats(value: string): Record<string, number> {
  return textStats(value)
}
