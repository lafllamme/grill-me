import { describe, expect, it } from 'vitest'
import {
  leaderboardSubmitRequestSchema,
  resolveRoastRuntimeOptions,
  roastRequestBodySchema,
  roastResponseSchema,
  roastShareCreateRequestSchema,
  roastStreamEventSchema,
  toRoastLines,
} from '../../shared/roast/contracts'

describe('roast contracts', () => {
  it('parses request body', () => {
    const parsed = roastRequestBodySchema.parse({ githubUsername: 'lafllamme', debugLevel: 'full', roastIntensity: 4 })

    expect(parsed.githubUsername).toBe('lafllamme')
    expect(parsed.debugLevel).toBe('full')
    expect(parsed.roastIntensity).toBe(4)
  })

  it('normalizes runtime options', () => {
    const runtime = resolveRoastRuntimeOptions(
      {
        roastDebug: 'false',
        roastDebugLevel: 'minimal',
        roastVariationMode: 'moderate',
        githubTimeoutMs: '12000',
        cfAiTimeoutMs: '30000',
        cfAiMaxTokens: '240',
        cfAiTemperature: '0.55',
        cfAiTopP: '0.92',
      },
      { githubUsername: 'lafllamme', includeDebug: false },
    )

    expect(runtime.debugLevel).toBe('minimal')
    expect(runtime.variationMode).toBe('moderate')
    expect(runtime.cfAiMaxTokens).toBe(1000)
    expect(runtime.roastIntensity).toBe(2)
  })

  it('normalizes runtime roast intensity from request payload', () => {
    const runtime = resolveRoastRuntimeOptions(
      {
        roastDebugLevel: 'minimal',
        roastVariationMode: 'moderate',
      },
      { githubUsername: 'lafllamme', roastIntensity: 3 },
    )

    expect(runtime.roastIntensity).toBe(3)
  })

  it('validates roast response', () => {
    const parsed = roastResponseSchema.parse({
      username: 'lafllamme',
      title: 'Baseline Burn',
      roastLines: ['line 1'],
      roast: 'line 1',
      feedback: ['a', 'b', 'c'],
      metrics: {
        spaghettiIndex: 72.4,
        stinkScore: 74,
        egoDamage: 70,
        grade: 'C-',
        specialTitle: 'Merge Conflict Magnet',
      },
      receipt: 'share_receipt_abcdefghijklmnopqrstuvwxyz',
      meta: {
        commitCount: 4,
        prCount: 1,
      },
      debug: {
        username: 'lafllamme',
        selectionSummary: {
          candidateCommits: 10,
          selectedCommits: 6,
          selectedFiles: 18,
          selectedPatchChars: 3200,
          configuredMaxCommitRefs: 10,
          configuredMaxSelectedCommits: 6,
        },
        intensityProfile: {
          level: 2,
          label: 'savage',
          maxCommitRefs: 10,
          maxSelectedCommits: 6,
          maxPromptTotalFiles: 14,
          maxPromptTotalPatchChars: 3500,
          aiMaxTokens: 1900,
          temperatureDelta: 0,
          effectiveTemperature: 0.55,
        },
        timingsMs: {},
        requests: [],
      },
    })

    expect(parsed.roastLines).toHaveLength(1)
    expect(parsed.debug?.intensityProfile?.label).toBe('savage')
  })

  it('validates stream event union', () => {
    const parsed = roastStreamEventSchema.parse({
      type: 'roast_line',
      index: 0,
      text: 'hello',
    })

    expect(parsed.type).toBe('roast_line')
  })

  it('rejects legacy content events', () => {
    expect(() => roastStreamEventSchema.parse({
      type: 'typing_roast',
      chunk: 'legacy',
    })).toThrow()
  })

  it('requires canonical done payload fields', () => {
    expect(() => roastStreamEventSchema.parse({
      type: 'done',
      data: {
        username: 'lafllamme',
        roastLines: ['line 1'],
        roast: 'line 1',
        feedback: ['a', 'b', 'c'],
        metrics: {
          spaghettiIndex: 72.4,
          stinkScore: 74,
          egoDamage: 70,
          grade: 'C-',
          specialTitle: 'Merge Conflict Magnet',
        },
        receipt: 'share_receipt_abcdefghijklmnopqrstuvwxyz',
        meta: {
          commitCount: 4,
          prCount: 1,
        },
      },
    })).toThrow()
  })

  it('splits roast text into lines', () => {
    expect(toRoastLines('a\n\nb')).toEqual(['a', 'b'])
  })

  it('validates share and submit request payloads', () => {
    const shareParsed = roastShareCreateRequestSchema.parse({
      receipt: 'share_receipt_abcdefghijklmnopqrstuvwxyz',
    })
    const submitParsed = leaderboardSubmitRequestSchema.parse({
      receipt: 'share_receipt_abcdefghijklmnopqrstuvwxyz',
    })

    expect(shareParsed.receipt).toContain('share_receipt')
    expect(submitParsed.receipt).toContain('share_receipt')
  })
})
