import type { RoastResponse, RoastStreamEvent } from '~~/shared/roast/contracts'
import type { RoastOrchestratorInput } from './orchestrator-common'
import { toErrorBody, toHandledError } from './orchestrator-error'
import { runRoastStreamPipeline } from './orchestrator-stream'
import { runRoastSyncPipeline } from './orchestrator-sync'
import { PROMPT_VERSION } from './prompt-builder'

/**
 * Runs the full roast pipeline and returns one final JSON payload.
 *
 * @param input Request-scoped orchestrator input.
 * @returns Final roast response payload.
 * @example
 * const response = await runRoastSync(input)
 */
export async function runRoastSync(input: RoastOrchestratorInput): Promise<RoastResponse> {
  return runRoastSyncPipeline(input)
}

/**
 * Runs the live roast stream pipeline and emits typed SSE events.
 *
 * @param input Request-scoped orchestrator input.
 * @param emit Async event emitter used by the stream API route.
 * @returns Final canonical roast response used in `done.data`.
 */
export async function runRoastStream(
  input: RoastOrchestratorInput,
  emit: (event: RoastStreamEvent) => Promise<void>,
): Promise<RoastResponse> {
  return runRoastStreamPipeline(input, emit)
}

export { PROMPT_VERSION, toErrorBody, toHandledError }
export type { RoastOrchestratorInput }
