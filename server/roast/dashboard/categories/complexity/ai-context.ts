import type { ComplexityScoreInput } from './types'
import { COMPLEXITY_AI_QUESTION } from './constants'

export const complexityQuestion = COMPLEXITY_AI_QUESTION

export function buildComplexityAiContext(metrics: ComplexityScoreInput) {
  return {
    effectiveFilesP75: metrics.complexityEffectiveFilesP75,
    excludedFileRatio: metrics.complexityExcludedFileRatio,
    relativeOutlierRatio: metrics.complexityRelativeOutlierRatio,
    scopeSignal: metrics.complexityScopeSignal,
    outlierSignal: metrics.complexityOutlierSignal,
    churnSignal: metrics.complexityChurnSignal,
  }
}
