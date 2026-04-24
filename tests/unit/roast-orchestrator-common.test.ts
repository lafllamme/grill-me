import { describe, expect, it } from 'vitest'
import { toErrorBody, toHandledError } from '../../server/roast/orchestrator-error'

describe('roast orchestrator common helpers', () => {
  it('builds stable error envelope', () => {
    expect(toErrorBody('github_not_found', 'GitHub user not found')).toEqual({
      error: {
        code: 'github_not_found',
        message: 'GitHub user not found',
      },
    })
  })

  it('normalizes unknown errors into stable handled shape', () => {
    expect(toHandledError(undefined)).toEqual({
      statusCode: 500,
      statusMessage: 'Unexpected server error',
      code: 'internal_error',
      details: undefined,
    })
  })

  it('preserves h3-like error tuples', () => {
    const handled = toHandledError({
      statusCode: 502,
      statusMessage: 'Cloudflare AI upstream failed',
      data: {
        code: 'cloudflare_ai_error',
        upstream: { message: 'boom' },
      },
    })

    expect(handled.statusCode).toBe(502)
    expect(handled.statusMessage).toBe('Cloudflare AI upstream failed')
    expect(handled.code).toBe('cloudflare_ai_error')
    expect(handled.details).toEqual({
      code: 'cloudflare_ai_error',
      upstream: { message: 'boom' },
    })
  })
})
