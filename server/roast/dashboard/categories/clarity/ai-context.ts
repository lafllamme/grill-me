import type { ClarityScoreInput } from './types'
import { CLARITY_AI_QUESTION } from './constants'
import { getDashboardClarityEvidenceCap } from './score'

export const clarityQuestion = CLARITY_AI_QUESTION

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
