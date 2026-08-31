import type { RoastDebug } from '~~/shared/roast/contracts'
import { createError } from 'h3'
import { pushDebugRequest } from './debug'

export interface AiRequestInput {
  accountId?: string
  apiToken?: string
  model?: string
  timeoutMs: number
  maxTokens: number
  temperature: number
  topP: number
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high'
  systemPrompt: string
  userPrompt: string
  debug?: RoastDebug
}

export const AI_REQUEST_LIMITS = {
  maxBodyBytes: 96 * 1024,
} as const

function extractStreamTextChunk(payload: any): string {
  const toText = (value: unknown): string => {
    if (typeof value === 'string')
      return value

    if (!Array.isArray(value))
      return ''

    const parts = value
      .map((item) => {
        if (typeof item === 'string')
          return item
        if (item && typeof item === 'object' && typeof (item as any).text === 'string')
          return String((item as any).text)
        if (item && typeof item === 'object' && typeof (item as any).content === 'string')
          return String((item as any).content)
        return ''
      })
      .filter(Boolean)

    return parts.join('')
  }

  const candidates: unknown[] = [
    payload?.response,
    payload?.output_text,
    payload?.text,
    payload?.result?.response,
    payload?.result?.output_text,
    payload?.result?.text,
    payload?.choices?.[0]?.delta?.content,
    payload?.choices?.[0]?.message?.content,
    payload?.choices?.[0]?.text,
    payload?.result?.choices?.[0]?.delta?.content,
    payload?.result?.choices?.[0]?.message?.content,
    payload?.result?.choices?.[0]?.text,
  ]

  for (const candidate of candidates) {
    const text = toText(candidate)
    if (text.length > 0)
      return text
  }

  return ''
}

/**
 * Ensures Cloudflare model credentials exist before request execution.
 */
function assertAiConfig(input: AiRequestInput): void {
  if (!input.accountId || !input.apiToken || !input.model) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Cloudflare AI is not configured',
      data: {
        code: 'cloudflare_ai_not_configured',
      },
    })
  }
}

function throwCloudflareUpstreamError(status: number): never {
  const isPayloadTooLarge = status === 413
  throw createError({
    statusCode: status >= 500 ? 503 : 502,
    statusMessage: isPayloadTooLarge ? 'Cloudflare AI request payload is too large' : 'Cloudflare AI upstream failed',
    data: {
      code: isPayloadTooLarge ? 'cloudflare_ai_request_too_large' : 'cloudflare_ai_error',
    },
  })
}

function buildAiRequestBody(input: AiRequestInput, stream = false): string {
  const body = {
    model: input.model,
    messages: [
      { role: 'system', content: input.systemPrompt },
      { role: 'user', content: input.userPrompt },
    ],
    ...(stream ? { stream: true } : {}),
    max_tokens: input.maxTokens,
    temperature: input.temperature,
    top_p: input.topP,
    reasoning_effort: input.reasoningEffort ?? 'low',
  }
  const serialized = JSON.stringify(body)
  const bodyBytes = new TextEncoder().encode(serialized).byteLength

  if (bodyBytes > AI_REQUEST_LIMITS.maxBodyBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: 'Cloudflare AI request payload is too large',
      data: {
        code: 'cloudflare_ai_request_too_large',
        bodyBytes,
        maxBodyBytes: AI_REQUEST_LIMITS.maxBodyBytes,
      },
    })
  }

  return serialized
}

/**
 * Sends a synchronous Cloudflare Workers AI request.
 *
 * @param input Request configuration and model payload.
 * @returns Raw upstream JSON payload.
 * @throws h3Error `cloudflare_ai_not_configured`
 * @throws h3Error `cloudflare_ai_timeout`
 * @throws h3Error `cloudflare_ai_error`
 */
export async function runAiSync(input: AiRequestInput): Promise<any> {
  assertAiConfig(input)

  const url = `https://api.cloudflare.com/client/v4/accounts/${input.accountId}/ai/v1/chat/completions`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${input.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: buildAiRequestBody(input),
      signal: controller.signal,
    })

    pushDebugRequest(input.debug, {
      stage: 'cloudflare_ai',
      url,
      durationMs: Date.now() - startedAt,
      ok: response.ok,
      statusCode: response.status,
    })

    if (!response.ok) {
      throwCloudflareUpstreamError(response.status)
    }

    const payload = await response.json()
    if (payload?.error) {
      const message = String(payload?.error?.message || 'Cloudflare AI returned an error envelope')
      throw createError({
        statusCode: 502,
        statusMessage: message,
        data: {
          code: 'cloudflare_ai_error',
          upstream: payload?.error,
        },
      })
    }

    return payload
  }
  catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({
        statusCode: 503,
        statusMessage: 'Cloudflare AI request timed out',
        data: {
          code: 'cloudflare_ai_timeout',
        },
      })
    }

    throw error
  }
  finally {
    clearTimeout(timer)
  }
}

/**
 * Streams Cloudflare Workers AI response and yields incremental text chunks.
 *
 * @param input Request configuration and model payload.
 * @param onChunk Callback invoked for each extracted text chunk.
 * @returns Collected raw text used for final canonical parsing.
 * @throws h3Error `cloudflare_ai_not_configured`
 * @throws h3Error `cloudflare_ai_stream_unavailable`
 * @throws h3Error `cloudflare_ai_timeout`
 * @throws h3Error `cloudflare_ai_error`
 * @example
 * const { rawText } = await runAiStream(input, chunk => parser.push(chunk))
 */
export async function runAiStream(input: AiRequestInput, onChunk: (chunk: string) => Promise<void> | void): Promise<{ rawText: string }> {
  assertAiConfig(input)

  const url = `https://api.cloudflare.com/client/v4/accounts/${input.accountId}/ai/v1/chat/completions`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${input.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: buildAiRequestBody(input, true),
      signal: controller.signal,
    })

    pushDebugRequest(input.debug, {
      stage: 'cloudflare_ai',
      url,
      durationMs: Date.now() - startedAt,
      ok: response.ok,
      statusCode: response.status,
    })

    if (!response.ok) {
      throwCloudflareUpstreamError(response.status)
    }

    if (!response.body) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Cloudflare AI stream unavailable',
        data: {
          code: 'cloudflare_ai_stream_unavailable',
        },
      })
    }

    const decoder = new TextDecoder()
    const reader = response.body.getReader()
    let buffer = ''
    let rawText = ''
    let envelopeError: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      for (const message of messages) {
        const lines = message.split('\n')
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:'))
            continue

          const payloadText = trimmed.slice(5).trim()
          if (!payloadText || payloadText === '[DONE]')
            continue

          try {
            const payload = JSON.parse(payloadText)
            if (payload?.error) {
              envelopeError = String(payload?.error?.message || 'Cloudflare AI returned an error envelope')
              continue
            }
            const chunk = extractStreamTextChunk(payload)
            if (!chunk)
              continue

            rawText += chunk
            await onChunk(chunk)
          }
          catch {
            continue
          }
        }
      }
    }

    if (envelopeError) {
      throw createError({
        statusCode: 502,
        statusMessage: envelopeError,
        data: {
          code: 'cloudflare_ai_error',
        },
      })
    }

    return { rawText }
  }
  catch (error: any) {
    if (error?.name === 'AbortError') {
      throw createError({
        statusCode: 503,
        statusMessage: 'Cloudflare AI request timed out',
        data: {
          code: 'cloudflare_ai_timeout',
        },
      })
    }

    throw error
  }
  finally {
    clearTimeout(timer)
  }
}
