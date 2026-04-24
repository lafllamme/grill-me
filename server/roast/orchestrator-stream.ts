import type { RoastResponse, RoastStreamEvent } from '~~/shared/roast/contracts'
import type { RoastOrchestratorInput, RoastSyncHooks } from './orchestrator-common'
import type { RoastModelStreamEvent } from './stream-ndjson-parser'
import { createError } from 'h3'
import { runAiStream } from './ai-client'
import { logServerDebug } from './debug'
import { assertCanonicalRoastOutput, normalizeCanonicalRoastFromNdjson } from './final-normalizer'
import {
  createRoastResponse,
  emitStatus,
  ENABLE_ROAST_DEBUG,
  logAiEffectiveConfig,
  prepareRoastContext,
} from './orchestrator-common'
import { parseRoastOutput } from './output-parser'
import { createStreamNdjsonParser } from './stream-ndjson-parser'

interface StreamCounters {
  status: number
  roastTitle: number
  roastLine: number
  feedbackItem: number
  debug: number
  done: number
  error: number
}

interface StreamEmitState {
  titleEmitted: boolean
  emittedRoastLineIndexes: Set<number>
  emittedFeedbackIndexes: Set<number>
}

function createStreamCounters(): StreamCounters {
  return {
    status: 0,
    roastTitle: 0,
    roastLine: 0,
    feedbackItem: 0,
    debug: 0,
    done: 0,
    error: 0,
  }
}

async function emitWithCounter(
  emit: (event: RoastStreamEvent) => Promise<void>,
  counters: StreamCounters,
  event: RoastStreamEvent,
): Promise<void> {
  if (event.type === 'status')
    counters.status += 1
  else if (event.type === 'roast_title')
    counters.roastTitle += 1
  else if (event.type === 'roast_line')
    counters.roastLine += 1
  else if (event.type === 'feedback_item')
    counters.feedbackItem += 1
  else if (event.type === 'debug')
    counters.debug += 1
  else if (event.type === 'done')
    counters.done += 1
  else if (event.type === 'error')
    counters.error += 1

  await emit(event)
}

async function emitModelEvents(
  events: RoastModelStreamEvent[],
  state: StreamEmitState,
  emit: (event: RoastStreamEvent) => Promise<void>,
  counters: StreamCounters,
): Promise<void> {
  for (const modelEvent of events) {
    if (modelEvent.type === 'title') {
      if (!state.titleEmitted) {
        await emitWithCounter(emit, counters, {
          type: 'roast_title',
          title: modelEvent.title,
        })
        state.titleEmitted = true
      }
      continue
    }

    if (modelEvent.type === 'roast_line') {
      if (!state.emittedRoastLineIndexes.has(modelEvent.index)) {
        await emitWithCounter(emit, counters, {
          type: 'roast_line',
          index: modelEvent.index,
          text: modelEvent.text,
        })
        state.emittedRoastLineIndexes.add(modelEvent.index)
      }
      continue
    }

    if (modelEvent.type === 'feedback_item') {
      if (!state.emittedFeedbackIndexes.has(modelEvent.index)) {
        await emitWithCounter(emit, counters, {
          type: 'feedback_item',
          index: modelEvent.index,
          text: modelEvent.text,
        })
        state.emittedFeedbackIndexes.add(modelEvent.index)
      }
    }
  }
}

async function emitMissingFinalItems(
  finalPayload: RoastResponse,
  state: StreamEmitState,
  emit: (event: RoastStreamEvent) => Promise<void>,
  counters: StreamCounters,
): Promise<void> {
  if (!state.titleEmitted) {
    await emitWithCounter(emit, counters, {
      type: 'roast_title',
      title: finalPayload.title,
    })
    state.titleEmitted = true
  }

  for (let index = 0; index < finalPayload.roastLines.length; index += 1) {
    const line = finalPayload.roastLines[index]
    if (!line || state.emittedRoastLineIndexes.has(index))
      continue

    await emitWithCounter(emit, counters, {
      type: 'roast_line',
      index,
      text: line,
    })
    state.emittedRoastLineIndexes.add(index)
  }

  for (let index = 0; index < finalPayload.feedback.length; index += 1) {
    const item = finalPayload.feedback[index]
    if (!item || state.emittedFeedbackIndexes.has(index))
      continue

    await emitWithCounter(emit, counters, {
      type: 'feedback_item',
      index,
      text: item,
    })
    state.emittedFeedbackIndexes.add(index)
  }
}

/**
 * Executes live roast streaming using typed SSE events.
 *
 * @remarks
 * The function emits `meta`, `status`, progressive content events, optional
 * `debug`, and final `done` payload. Canonical final payload is always server-owned.
 */
export async function runRoastStreamPipeline(
  input: RoastOrchestratorInput,
  emit: (event: RoastStreamEvent) => Promise<void>,
): Promise<RoastResponse> {
  const streamCounters = createStreamCounters()

  await emitWithCounter(emit, streamCounters, {
    type: 'meta',
    requestId: input.requestId,
    username: input.username,
  })

  const statusHooks: RoastSyncHooks = {
    onStatus: async (phase, message) => {
      await emitWithCounter(emit, streamCounters, {
        type: 'status',
        phase,
        message,
      })
    },
  }

  const prepared = await prepareRoastContext(input, 'stream', statusHooks)
  if ('roast' in prepared) {
    await emitWithCounter(emit, streamCounters, {
      type: 'roast_title',
      title: prepared.title,
    })

    for (let index = 0; index < prepared.roastLines.length; index += 1) {
      const text = prepared.roastLines[index]
      if (!text)
        continue
      await emitWithCounter(emit, streamCounters, {
        type: 'roast_line',
        index,
        text,
      })
    }

    for (let index = 0; index < prepared.feedback.length; index += 1) {
      const text = prepared.feedback[index]
      if (!text)
        continue
      await emitWithCounter(emit, streamCounters, {
        type: 'feedback_item',
        index,
        text,
      })
    }

    if (prepared.debug)
      await emitWithCounter(emit, streamCounters, { type: 'debug', debug: prepared.debug })

    await emitWithCounter(emit, streamCounters, { type: 'done', data: prepared })
    return prepared
  }

  await emitStatus(statusHooks, 'calling_ai', 'Calling Cloudflare Workers AI...')
  const aiStartedAt = Date.now()
  logAiEffectiveConfig(input, prepared)

  const parser = createStreamNdjsonParser()
  const emitState: StreamEmitState = {
    titleEmitted: false,
    emittedRoastLineIndexes: new Set<number>(),
    emittedFeedbackIndexes: new Set<number>(),
  }

  let rawText = ''
  const parserPath = 'stream/ndjson'
  let streamFailed = false

  try {
    const streamResult = await runAiStream(
      {
        accountId: input.env.cfAccountId,
        apiToken: input.env.cfApiToken,
        model: input.env.cfAiModel,
        timeoutMs: input.runtime.cfAiTimeoutMs,
        maxTokens: prepared.effectiveAiMaxTokens,
        temperature: prepared.prompt.effectiveTemperature,
        topP: input.runtime.cfAiTopP,
        systemPrompt: prepared.prompt.systemPrompt,
        userPrompt: JSON.stringify(prepared.prompt.payload),
        debug: input.debug,
      },
      async (chunk) => {
        rawText += chunk
        const modelEvents = parser.push(chunk)
        await emitModelEvents(modelEvents, emitState, emit, streamCounters)
      },
    )

    rawText = streamResult.rawText || rawText
  }
  catch {
    streamFailed = true
  }

  input.debug.timingsMs.aiGenerate = Date.now() - aiStartedAt

  if (streamFailed && rawText.trim().length === 0) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Cloudflare AI stream failed before content',
      data: {
        code: 'cloudflare_ai_error',
        parserPath: `${parserPath}/stream_failed`,
      },
    })
  }

  const trailingEvents = parser.flush()
  await emitModelEvents(trailingEvents, emitState, emit, streamCounters)

  input.debug.ai = {
    model: input.env.cfAiModel,
    maxTokens: prepared.effectiveAiMaxTokens,
    timeoutMs: input.runtime.cfAiTimeoutMs,
    temperature: prepared.prompt.effectiveTemperature,
    topP: input.runtime.cfAiTopP,
    systemPrompt: prepared.prompt.systemPrompt,
    userPayload: {
      username: prepared.prompt.payload.username,
      commits: prepared.prompt.payload.commits.length,
      prs: prepared.prompt.payload.prs.length,
      payload: prepared.prompt.payload,
    },
    responsePreview: rawText.slice(0, 1000),
    ...(input.runtime.debugLevel === 'full' ? { responseFullText: rawText } : {}),
    ndjsonInvalidLineCount: parser.getState().invalidLineCount,
    streamCounters,
  }

  if (ENABLE_ROAST_DEBUG && input.runtime.debugLevel === 'full') {
    logServerDebug('ai-user-payload', {
      requestId: input.requestId,
      username: input.username,
      payload: input.debug.ai.userPayload,
    })

    logServerDebug('stream-raw-output', {
      requestId: input.requestId,
      username: input.username,
      rawTextLength: rawText.length,
      rawText,
    })
  }

  await emitStatus(statusHooks, 'parsing_output', 'Parsing model output and extracting roast lines...')
  let canonical = normalizeCanonicalRoastFromNdjson(parser.getState())
  let resolvedParserPath = parserPath

  try {
    assertCanonicalRoastOutput(canonical)
  }
  catch {
    const parsedFallback = parseRoastOutput(rawText)
    resolvedParserPath = `${parserPath}->${parsedFallback.parserPath}`
    canonical = {
      title: parsedFallback.title,
      roastLines: parsedFallback.roastLines,
      feedback: parsedFallback.feedback,
    }

    try {
      assertCanonicalRoastOutput(canonical)
    }
    catch {
      throw createError({
        statusCode: 502,
        statusMessage: 'Cloudflare AI returned incomplete structured output',
        data: {
          code: 'cloudflare_ai_incomplete_output',
          parserPath: resolvedParserPath,
        },
      })
    }
  }

  input.debug.parserPath = resolvedParserPath
  if (input.debug.ai)
    input.debug.ai.finalParserPath = resolvedParserPath

  await emitStatus(statusHooks, 'finalizing', 'Finalizing roast output...')
  input.debug.timingsMs.total = Date.now() - prepared.startedAt

  const finalPayload = createRoastResponse(
    input.username,
    canonical.title,
    canonical.roastLines,
    canonical.feedback,
    prepared.meta,
    input.debug,
    input.runtime,
    input.includeDebugInResponse,
  )

  await emitMissingFinalItems(finalPayload, emitState, emit, streamCounters)

  if (finalPayload.debug)
    await emitWithCounter(emit, streamCounters, { type: 'debug', debug: finalPayload.debug })

  await emitWithCounter(emit, streamCounters, { type: 'done', data: finalPayload })

  if (ENABLE_ROAST_DEBUG) {
    logServerDebug('stream-counters', {
      requestId: input.requestId,
      username: input.username,
      parserPath: input.debug.parserPath,
      ndjsonInvalidLineCount: parser.getState().invalidLineCount,
      ...streamCounters,
    })
  }

  return finalPayload
}
