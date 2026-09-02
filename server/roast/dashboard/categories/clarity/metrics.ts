import type { GithubCommit } from '../../../github-collector'
import type { ClaritySignal } from './types'
import { clamp, ratio } from '../../shared/math'
import { addedPatchLines } from '../../shared/patches'
import { CLARITY_SCORE_DEFAULT, CLARITY_SIGNAL_RULES } from './constants'
import { clarityCommentPattern, clarityDeclarationPattern, clarityDeepIndentPattern, clarityGenericIdentifierPattern, clarityLongLinePattern } from './patterns'

export function clarityNamingSignal(commits: readonly GithubCommit[]): ClaritySignal {
  const declarations = addedPatchLines(commits)
    .map(line => line.trim().match(clarityDeclarationPattern)?.[1])
    .filter((name): name is string => Boolean(name))

  if (!declarations.length)
    return { signal: CLARITY_SCORE_DEFAULT, evidenceAvailable: false }

  const descriptiveRatio = ratio(
    declarations.filter(name => !clarityGenericIdentifierPattern.test(name)).length,
    declarations.length,
  )
  return { signal: clamp(descriptiveRatio * CLARITY_SIGNAL_RULES.maximumSignal), evidenceAvailable: true }
}

export function clarityStructureSignal(commits: readonly GithubCommit[]): ClaritySignal {
  const codeLines = addedPatchLines(commits)
    .filter(line => line.trim() && !clarityCommentPattern.test(line))

  if (!codeLines.length)
    return { signal: CLARITY_SCORE_DEFAULT, evidenceAvailable: false }

  const longLineRatio = ratio(codeLines.filter(line => clarityLongLinePattern.test(line.trimEnd())).length, codeLines.length)
  const deeplyIndentedRatio = ratio(codeLines.filter(line => clarityDeepIndentPattern.test(line)).length, codeLines.length)
  return {
    signal: clamp(
      CLARITY_SIGNAL_RULES.maximumSignal
      - longLineRatio * CLARITY_SIGNAL_RULES.longLinePenalty
      - deeplyIndentedRatio * CLARITY_SIGNAL_RULES.deepIndentationPenalty,
    ),
    evidenceAvailable: true,
  }
}

export function deriveClarityMetrics(commits: readonly GithubCommit[]): { naming: ClaritySignal, structure: ClaritySignal } {
  return {
    naming: clarityNamingSignal(commits),
    structure: clarityStructureSignal(commits),
  }
}
