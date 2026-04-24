import type { RoastResponse } from '~~/shared/roast/contracts'
import type { RoastOrchestratorInput } from './orchestrator-common'
import { runAiSync } from './ai-client'
import { logServerDebug } from './debug'
import {
  emitStatus,
  ENABLE_ROAST_DEBUG,
  finalizeFromRawText,
  logAiEffectiveConfig,
  prepareRoastContext,
} from './orchestrator-common'
import { extractModelText } from './output-parser'

/**
 * Executes the synchronous roast generation path.
 *
 * @remarks
 * This path always returns a single final JSON payload and is also used as the
 * fallback path from client side when stream parsing fails.
 */
export async function runRoastSyncPipeline(input: RoastOrchestratorInput): Promise<RoastResponse> {
  const prepared = await prepareRoastContext(input, 'sync')
  if ('roast' in prepared)
    return prepared

  await emitStatus(undefined, 'calling_ai', 'Calling Cloudflare Workers AI...')
  const aiStartedAt = Date.now()
  logAiEffectiveConfig(input, prepared)

  const aiPayload = await runAiSync({
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
  })

  input.debug.timingsMs.aiGenerate = Date.now() - aiStartedAt
  const extracted = extractModelText(aiPayload)
  input.debug.parserPath = extracted.parserPath

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
    responsePreview: extracted.rawText.slice(0, 1000),
  }

  if (ENABLE_ROAST_DEBUG && input.runtime.debugLevel === 'full') {
    logServerDebug('ai-user-payload', {
      requestId: input.requestId,
      username: input.username,
      payload: input.debug.ai.userPayload,
    })
  }

  return finalizeFromRawText(input, prepared, extracted.rawText, extracted.parserPath)
}
