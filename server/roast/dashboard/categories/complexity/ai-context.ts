import type { ComplexityScoreInput } from './types'

export const complexityQuestion = 'Are broad changes coherent and controlled, or do the changed lines introduce unnecessary coupling, indirection, duplication, or nesting?'

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
