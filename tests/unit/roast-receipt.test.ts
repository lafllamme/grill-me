import { describe, expect, it } from 'vitest'
import { createRoastReceipt, verifyRoastReceipt } from '../../server/roast/receipt'

const SECRET = 'unit-test-receipt-secret-1234567890'

describe('roast receipt', () => {
  it('creates and verifies a valid receipt', () => {
    const receipt = createRoastReceipt(SECRET, {
      requestId: 'abc12345',
      username: 'lafllamme',
      title: 'Do You Ship Bugs Before Coffee Too?',
      roastLines: ['line 1'],
      feedback: ['fix tests'],
      roast: 'line 1',
      meta: {
        commitCount: 5,
        prCount: 1,
        selectedCommitCount: 3,
      },
      metrics: {
        spaghettiIndex: 71,
        stinkScore: 74,
        egoDamage: 69,
        grade: 'C-',
        specialTitle: 'Merge Conflict Magnet',
      },
      source: 'sync',
      roastIntensity: 2,
    })

    const payload = verifyRoastReceipt(SECRET, receipt)
    expect(payload.username).toBe('lafllamme')
    expect(payload.requestId).toBe('abc12345')
    expect(payload.metrics.grade).toBe('C-')
  })

  it('rejects tampered receipt signatures', () => {
    const receipt = createRoastReceipt(SECRET, {
      requestId: 'abc12345',
      username: 'lafllamme',
      title: 'Do You Ship Bugs Before Coffee Too?',
      roastLines: ['line 1'],
      feedback: ['fix tests'],
      roast: 'line 1',
      meta: {
        commitCount: 5,
        prCount: 1,
        selectedCommitCount: 3,
      },
      metrics: {
        spaghettiIndex: 71,
        stinkScore: 74,
        egoDamage: 69,
        grade: 'C-',
        specialTitle: 'Merge Conflict Magnet',
      },
      source: 'stream',
      roastIntensity: 4,
    })

    const tampered = `${receipt.slice(0, -2)}xx`
    expect(() => verifyRoastReceipt(SECRET, tampered)).toThrow()
  })
})
