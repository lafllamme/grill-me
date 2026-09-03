import type { DashboardTraceLevel } from '../../shared/dashboard/trace'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateDashboardTraceMarkdown } from '../../server/roast/dashboard/trace-checker'
import { createDashboardTraceFileSink } from '../../server/roast/dashboard/trace-file'
import { createDashboardTrace } from '../../shared/dashboard/trace'

const { box, info } = vi.hoisted(() => ({ box: vi.fn(), info: vi.fn() }))

vi.mock('consola', () => ({ consola: { box, info } }))

const temporaryDirectories: string[] = []

function createTemporaryDirectory(): string {
  const directory = mkdtempSync(join(tmpdir(), 'grill-me-dashboard-trace-'))
  temporaryDirectories.push(directory)
  return directory
}

function readTraceFile(directory: string, level: DashboardTraceLevel): string {
  const sink = createDashboardTraceFileSink({
    directory,
    requestId: `req-${level}`,
    username: 'lafllamme',
    level,
  })
  if (!sink)
    throw new Error('Expected a trace file sink')

  const trace = createDashboardTrace({
    requestId: `req-${level}`,
    username: 'lafllamme',
    source: 'server',
    level,
    onRender: sink.onRender,
  })
  trace.log('ai', 'prompt-prepared', {
    systemPrompt: 'review the supplied patch',
    userPrompt: '{"scores":{"safety":80}}\n/no_think',
    selectedCommitCount: 1,
    patchCount: 1,
    patchCharacters: 24,
  })

  return readFileSync(sink.filePath, 'utf8')
}

describe('dashboard trace file sink', () => {
  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0))
      rmSync(directory, { recursive: true, force: true })
  })

  it('stores readable full-mode prompt sections in Markdown', () => {
    const content = readTraceFile(createTemporaryDirectory(), 'full')

    expect(content).toContain('# Dashboard trace — lafllamme')
    expect(content).toContain('## Events')
    expect(content).toContain('#### AI prompt')
    expect(content).toContain('review the supplied patch')
    expect(content).toContain('"safety": 80')
  })

  it('keeps prompt content redacted in summary files', () => {
    const content = readTraceFile(createTemporaryDirectory(), 'summary')

    expect(content).toContain('system prompt: hidden')
    expect(content).toContain('user prompt: hidden')
    expect(content).not.toContain('review the supplied patch')
    expect(content).not.toContain('"safety":80')
  })

  it('does not create a file when tracing is off', () => {
    const sink = createDashboardTraceFileSink({
      directory: createTemporaryDirectory(),
      requestId: 'req-off',
      username: 'lafllamme',
      level: 'off',
    })

    expect(sink).toBeUndefined()
  })

  it('checks a rendered trace file against the full lifecycle contract', () => {
    const directory = createTemporaryDirectory()
    const sink = createDashboardTraceFileSink({
      directory,
      requestId: 'req-checker',
      username: 'torvalds',
      level: 'summary',
    })
    if (!sink)
      throw new Error('Expected a trace file sink')

    const trace = createDashboardTrace({
      requestId: 'req-checker',
      username: 'torvalds',
      source: 'server',
      level: 'summary',
      onRender: sink.onRender,
    })
    trace.log('grill', 'request-start')
    trace.log('github', 'fetch-start')
    trace.log('github', 'collection-complete', {
      sampling: {
        candidateRefs: 30,
        integrationSkipped: 18,
        personalRefs: 12,
        detailsFetched: 16,
        personalWithPatch: 12,
        backfilled: 12,
      },
    })
    trace.log('github', 'evidence-ready')
    trace.log('grill', 'scores-calculated', { scores: { safety: 86 }, overallScore: 84 })
    trace.log('ai', 'patch-selection-complete', {
      commitCount: 3,
      fileCount: 8,
      patchCharacters: 4200,
      sampling: { aiSelected: 3 },
    })
    trace.log('ai', 'prompt-prepared', { systemPrompt: 'system', userPrompt: 'user' })
    trace.log('ai', 'request-metrics', { requestBytes: 4200 })
    trace.log('ai', 'response-received', { parserPath: 'choices[0].message.content', rawResponse: '{"confidence":80}' })
    trace.log('ai', 'review-complete', { status: 'assessed', confidence: 80 })
    trace.log('grill', 'finalized', { overallScore: 84, grade: 'B+', role: 'Human Compiler' })

    const content = readFileSync(sink.filePath, 'utf8')
    expect(validateDashboardTraceMarkdown(content, { requireAiLifecycle: true })).toMatchObject({
      ok: true,
      missingEvents: [],
      missingFields: [],
      orderValid: true,
    })
  })
})
