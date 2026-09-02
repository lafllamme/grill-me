import type { ClarityScoreInput } from './types'
import { getDashboardClarityEvidenceCap } from './score'

export const clarityQuestion = 'Do the changed lines make names, structure, and intent easier or harder for a new reader to understand?'

export function buildClarityAiContext(metrics: ClarityScoreInput) {
  return {
    messageSignal: metrics.workflowMessageQuality,
    conventionalMessageRatio: metrics.workflowConventionalMessageRatio,
    namingSignal: metrics.clarityNamingSignal,
    structureSignal: metrics.clarityStructureSignal,
    namingEvidenceAvailable: metrics.clarityNamingEvidenceAvailable,
    structureEvidenceAvailable: metrics.clarityStructureEvidenceAvailable,
    evidenceCap: getDashboardClarityEvidenceCap(metrics),
  }
}
