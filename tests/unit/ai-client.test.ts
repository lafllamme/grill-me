import { describe, expect, it, vi } from 'vitest'
import { AI_REQUEST_LIMITS, runAiSync } from '../../server/roast/ai-client'

vi.mock('h3', () => ({
  createError: (input: unknown) => input,
}))
vi.mock('consola', () => ({ consola: { info: vi.fn(), error: vi.fn() } }))

describe('cloudflare AI request limits', () => {
  it('rejects an oversized serialized request before network execution', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const result = runAiSync({
      accountId: 'account',
      apiToken: 'token',
      model: '@cf/qwen/qwen3-30b-a3b-fp8',
      timeoutMs: 1000,
      maxTokens: 1000,
      temperature: 0,
      topP: 0.1,
      systemPrompt: 'system',
      userPrompt: 'x'.repeat(AI_REQUEST_LIMITS.maxBodyBytes + 1),
    })

    await expect(result).rejects.toMatchObject({
      statusCode: 413,
      data: { code: 'cloudflare_ai_request_too_large' },
    })
    expect(fetchSpy).not.toHaveBeenCalled()
    fetchSpy.mockRestore()
  })
})
