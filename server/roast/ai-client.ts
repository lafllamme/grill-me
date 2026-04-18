import { createError } from "h3"
import { type RoastDebug } from "~~/shared/roast/contracts"
import { ROAST_LIMITS } from "~~/shared/roast/contracts"
import { pushDebugRequest } from "./debug"

export interface AiRequestInput {
  accountId?: string
  apiToken?: string
  model?: string
  timeoutMs: number
  maxTokens: number
  temperature: number
  topP: number
  systemPrompt: string
  userPrompt: string
  debug?: RoastDebug
}

const extractStreamTextChunk = (payload: any): string => {
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
    if (typeof candidate === "string" && candidate.length > 0)
      return candidate
  }

  return ""
}

/**
 * Ensures Cloudflare model credentials exist before request execution.
 */
const assertAiConfig = (input: AiRequestInput): void => {
  if (!input.accountId || !input.apiToken || !input.model) {
    throw createError({
      statusCode: 503,
      statusMessage: "Cloudflare AI is not configured",
      data: {
        code: "cloudflare_ai_not_configured",
      },
    })
  }
}

/**
 * Sends a synchronous Cloudflare Workers AI request.
 */
export const runAiSync = async (input: AiRequestInput): Promise<any> => {
  assertAiConfig(input)

  const url = `https://api.cloudflare.com/client/v4/accounts/${input.accountId}/ai/v1/chat/completions`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
        max_tokens: input.maxTokens,
        temperature: input.temperature,
        top_p: input.topP,
        reasoning_effort: "low",
      }),
      signal: controller.signal,
    })

    pushDebugRequest(input.debug, {
      stage: "cloudflare_ai",
      url,
      durationMs: Date.now() - startedAt,
      ok: response.ok,
      statusCode: response.status,
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status >= 500 ? 503 : 502,
        statusMessage: "Cloudflare AI upstream failed",
        data: {
          code: "cloudflare_ai_error",
        },
      })
    }

    const payload = await response.json()
    if (payload?.error) {
      const message = String(payload?.error?.message || "Cloudflare AI returned an error envelope")
      throw createError({
        statusCode: 502,
        statusMessage: message,
        data: {
          code: "cloudflare_ai_error",
          upstream: payload?.error,
        },
      })
    }

    return payload
  }
  catch (error: any) {
    if (error?.name === "AbortError") {
      throw createError({
        statusCode: 503,
        statusMessage: "Cloudflare AI request timed out",
        data: {
          code: "cloudflare_ai_timeout",
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
 */
export const runAiStream = async (
  input: AiRequestInput,
  onChunk: (chunk: string) => Promise<void> | void,
): Promise<{ rawText: string }> => {
  assertAiConfig(input)

  const url = `https://api.cloudflare.com/client/v4/accounts/${input.accountId}/ai/v1/chat/completions`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), input.timeoutMs)
  const startedAt = Date.now()

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: input.model,
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
        stream: true,
        max_tokens: input.maxTokens,
        temperature: input.temperature,
        top_p: input.topP,
        reasoning_effort: "low",
      }),
      signal: controller.signal,
    })

    pushDebugRequest(input.debug, {
      stage: "cloudflare_ai",
      url,
      durationMs: Date.now() - startedAt,
      ok: response.ok,
      statusCode: response.status,
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status >= 500 ? 503 : 502,
        statusMessage: "Cloudflare AI upstream failed",
        data: {
          code: "cloudflare_ai_error",
        },
      })
    }

    if (!response.body) {
      throw createError({
        statusCode: 503,
        statusMessage: "Cloudflare AI stream unavailable",
        data: {
          code: "cloudflare_ai_stream_unavailable",
        },
      })
    }

    const decoder = new TextDecoder()
    const reader = response.body.getReader()
    let buffer = ""
    let rawText = ""
    let envelopeError: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const messages = buffer.split("\n\n")
      buffer = messages.pop() || ""

      for (const message of messages) {
        const lines = message.split("\n")
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:"))
            continue

          const payloadText = trimmed.slice(5).trim()
          if (!payloadText || payloadText === "[DONE]")
            continue

          try {
            const payload = JSON.parse(payloadText)
            if (payload?.error) {
              envelopeError = String(payload?.error?.message || "Cloudflare AI returned an error envelope")
              continue
            }
            const chunk = extractStreamTextChunk(payload)
            if (!chunk)
              continue

            rawText += chunk
            await onChunk(chunk.slice(0, ROAST_LIMITS.maxStreamChunkChars))
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
          code: "cloudflare_ai_error",
        },
      })
    }

    return { rawText }
  }
  catch (error: any) {
    if (error?.name === "AbortError") {
      throw createError({
        statusCode: 503,
        statusMessage: "Cloudflare AI request timed out",
        data: {
          code: "cloudflare_ai_timeout",
        },
      })
    }

    throw error
  }
  finally {
    clearTimeout(timer)
  }
}
