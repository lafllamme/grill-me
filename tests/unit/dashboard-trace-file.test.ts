import type { DashboardTraceLevel } from '../../shared/dashboard/trace'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
})
