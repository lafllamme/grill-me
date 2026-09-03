import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDashboardTrace, resolveDashboardTraceLevel } from '../../shared/dashboard/trace'

const { box, info } = vi.hoisted(() => ({ box: vi.fn(), info: vi.fn() }))

vi.mock('consola', () => ({ consola: { box, info } }))

describe('dashboard trace', () => {
  beforeEach(() => {
    box.mockReset()
    info.mockReset()
  })

  it('does not emit entries when tracing is off', () => {
    createDashboardTrace({ requestId: 'req-off', username: 'lafllamme', source: 'server', level: 'off' })
      .log('grill', 'request-start')

    expect(info).not.toHaveBeenCalled()
  })

  it('summarizes prompt and patch content without logging the content', () => {
    createDashboardTrace({ requestId: 'req-summary', username: 'lafllamme', source: 'server', level: 'summary' })
      .log('ai', 'prompt-prepared', {
        systemPrompt: 'do not expose this system prompt',
        userPrompt: 'patch secret content',
        patches: [{ filename: 'src/example.ts', patch: '+ const value = secret' }],
      })

    const output = info.mock.calls.at(-1)?.[0] as string
    expect(output).toContain('[AI] prepare AI review')
    expect(output).toContain('system prompt: hidden · 32 chars · 32 bytes · ≈8 tokens')
    expect(output).toContain('user prompt: hidden · 20 chars · 20 bytes · ≈5 tokens')
    expect(output).not.toContain('secret content')
    expect(output).not.toContain('const value = secret')
    expect(box).not.toHaveBeenCalled()
  })

  it('keeps the prompt content in an explicit full-mode box', () => {
    createDashboardTrace({ requestId: 'req-full-prompt', username: 'lafllamme', source: 'server', level: 'full' })
      .log('ai', 'prompt-prepared', {
        systemPrompt: 'review the supplied patch',
        userPrompt: '{"scores":{"clarity":80}}\n/no_think',
        selectedCommitCount: 3,
        patchCount: 1,
        patchCharacters: 42,
      })

    const output = box.mock.calls.at(-1)?.[0] as string
    expect(output).toContain('AI PROMPT · lafllamme · req-full-prompt')
    expect(output).toContain('review the supplied patch')
    expect(output).toContain('"clarity": 80')
    expect(output).toContain('USER PROMPT / METRICS')
  })

  it('shows the model response in a full-mode box', () => {
    createDashboardTrace({ requestId: 'req-full-response', username: 'lafllamme', source: 'server', level: 'full' })
      .log('ai', 'response-received', { parserPath: 'choices[0].message.reasoning', responseShape: ['choices', 'choices[0].message.reasoning'], rawResponse: '{"confidence":80}' })

    const output = box.mock.calls.at(-1)?.[0] as string
    expect(output).toContain('AI RESPONSE · lafllamme · req-full-response')
    expect(output).toContain('choices[0].message.reasoning')
    expect(output).toContain('"confidence": 80')
    expect(box.mock.calls.at(-1)?.[1]).toBeUndefined()
  })

  it('formats the authored evidence ledger in summary mode', () => {
    createDashboardTrace({ requestId: 'req-sampling', username: 'torvalds', source: 'server', level: 'summary' })
      .log('github', 'collection-complete', {
        repositories: 4,
        commits: 16,
        collection: { candidateCommits: 30, enrichedCommits: 16 },
        sampling: {
          candidateRefs: 30,
          integrationSkipped: 18,
          personalRefs: 12,
          detailsFetched: 16,
          personalWithPatch: 12,
          backfilled: 12,
          evidenceState: 'expanded-window',
        },
      })

    const output = info.mock.calls.at(-1)?.[0] as string
    expect(output).toContain('sampling:')
    expect(output).toContain('integration skipped: 18')
    expect(output).toContain('evidence state: expanded-window')
  })

  it('formats fenced model JSON and wraps long response metadata', () => {
    createDashboardTrace({ requestId: 'req-model-format', username: 'lafllamme', source: 'server', level: 'full' })
      .log('ai', 'response-received', {
        parserPath: 'choices[0].message.reasoning',
        responseShape: ['choices[0].message.reasoning', 'choices[0].message.reasoning_content'],
        rawResponse: 'The compact review follows:\n```json\n{"confidence":80,"axisReviews":[]}\n```',
      })

    const output = box.mock.calls.at(-1)?.[0] as string
    expect(output).toContain('The compact review follows:')
    expect(output).toContain('"confidence": 80')
    expect(output).not.toContain('```json')
    expect(Math.max(...output.split('\n').map(line => line.length))).toBeLessThanOrEqual(108)
  })

  it('resolves only supported levels', () => {
    expect(resolveDashboardTraceLevel('summary')).toBe('summary')
    expect(resolveDashboardTraceLevel('full')).toBe('full')
    expect(resolveDashboardTraceLevel('verbose', 'summary')).toBe('summary')
  })
})
