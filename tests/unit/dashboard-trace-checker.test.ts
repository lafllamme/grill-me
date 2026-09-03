import { describe, expect, it } from 'vitest'
import { validateDashboardTraceMarkdown } from '../../server/roast/dashboard/trace-checker'

const validTrace = [
  '### 01 · request-start · +1ms',
  '### 02 · fetch-start · +2ms',
  '### 03 · collection-complete · +20ms',
  'candidate refs: 30',
  'integration skipped: 18',
  'personal refs: 12',
  'details fetched: 16',
  'personal with patch: 12',
  'backfilled: 12',
  '### 04 · evidence-ready · +21ms',
  '### 05 · scores-calculated · +23ms',
  'scores: clarity=80',
  'overall score: 78',
  '### 06 · patch-selection-complete · +24ms',
  'commit count: 3',
  'file count: 8',
  'patch characters: 4200',
  'sampling:',
  'ai selected: 3',
  '### 07 · prompt-prepared · +25ms',
  '### 08 · request-metrics · +30ms',
  '### 09 · response-received · +500ms',
  '### 10 · review-complete · +501ms',
  'status: assessed',
  'confidence: 80',
  '### 11 · finalized · +502ms',
  'overall score: 79',
  'grade: B',
  'role: Human Compiler',
].join('\n')

describe('dashboard trace checker', () => {
  it('accepts a complete full AI trace in lifecycle order', () => {
    expect(validateDashboardTraceMarkdown(validTrace, { requireAiLifecycle: true })).toMatchObject({
      ok: true,
      missingEvents: [],
      missingFields: [],
      orderValid: true,
    })
  })

  it('reports missing sampling fields and lifecycle events instead of silently passing', () => {
    const result = validateDashboardTraceMarkdown([
      '### 01 · request-start · +1ms',
      '### 02 · collection-complete · +20ms',
      'candidate refs: 2',
      '### 03 · finalized · +21ms',
      'overall score: 50',
    ].join('\n'), { requireAiLifecycle: true })

    expect(result.ok).toBe(false)
    expect(result.missingEvents).toContain('fetch-start')
    expect(result.missingEvents).toContain('prompt-prepared')
    expect(result.missingFields).toContain('collection-complete.integration skipped')
    expect(result.missingFields).toContain('finalized.grade')
  })

  it('does not require provider events for a local no-AI trace', () => {
    const trace = validTrace
      .split('\n')
      .filter(line => !line.includes('prompt-prepared') && !line.includes('request-metrics') && !line.includes('response-received'))
      .join('\n')

    expect(validateDashboardTraceMarkdown(trace)).toMatchObject({ ok: true, orderValid: true })
  })
})
