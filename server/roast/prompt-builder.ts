import type { RoastVariationMode } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import type { SelectedEvidence } from './evidence-selector'
import { ROAST_LIMITS } from '~~/shared/roast/contracts'
import { ENABLE_ROAST_DEBUG, logServerDebug } from './debug'
import { getRoastTitleToneLine, ROAST_TITLE_POLICY } from './title-policy'

export const PROMPT_VERSION = 'grill-v3.0.0'

interface PromptToneProfile {
  temperatureBias: number
  styleLine: string
}

const TONE_PROFILE: Record<RoastVariationMode, PromptToneProfile> = {
  stable: {
    temperatureBias: -0.1,
    styleLine: 'Keep style tight, deterministic and dry.',
  },
  moderate: {
    temperatureBias: 0,
    styleLine: 'Vary phrasing moderately and avoid repeated punchlines across runs.',
  },
  wild: {
    temperatureBias: 0.12,
    styleLine: 'Use bolder metaphors but stay technically grounded.',
  },
}

export interface PromptPayload {
  username: string
  commits: Array<{
    repo: string
    sha: string
    message: string
    additions: number
    deletions: number
    changedFiles: number
    files: Array<{
      filename: string
      status: string
      additions: number
      deletions: number
      patch?: string
    }>
  }>
  prs: SelectedEvidence['prs']
}

export interface BuiltPrompt {
  mode: RoastPromptMode
  promptVersion: string
  systemPrompt: string
  payload: PromptPayload
  effectiveTemperature: number
}

export type RoastPromptMode = 'sync' | 'stream'

function getOutputLine(mode: RoastPromptMode): string {
  const titleContract = [
    `Title must be a hook question with ${ROAST_TITLE_POLICY.minWords}-${ROAST_TITLE_POLICY.maxWords} words.`,
    'Keep title spicy but clean, evidence-grounded, and not generic.',
    'Avoid summary labels like "Summary" or "Overview".',
  ].join(' ')

  if (mode === 'stream') {
    return [
      'Output strictly as NDJSON (one JSON object per line).',
      'Allowed event objects:',
      `{"type":"title","title":"${ROAST_TITLE_POLICY.minWords}-${ROAST_TITLE_POLICY.maxWords} word hook question title"}`,
      '{"type":"roast_line","index":0,"text":"roast line"}',
      '{"type":"feedback_item","index":0,"text":"actionable feedback"}',
      '{"type":"done"}',
      'Emit exactly one title event first.',
      'Then emit roast_line and feedback_item events in any order.',
      'End with one done event.',
      titleContract,
      'No markdown, no prose, no code fences, no extra keys.',
    ].join(' ')
  }

  return `Output strictly as JSON with keys: title, roastLines, feedback. title: ${ROAST_TITLE_POLICY.minWords}-${ROAST_TITLE_POLICY.maxWords} word hook question. roastLines: array of 6-10 short punchy lines. feedback: array of 3-5 actionable one-sentence bullets. ${titleContract}`
}

function compactMessage(value: string): string {
  const singleLine = value
    .replace(/\s+/g, ' ')
    .trim()

  if (singleLine.length <= 180)
    return singleLine

  return `${singleLine.slice(0, 180)}...`
}

/**
 * Builds a versioned prompt + compact evidence payload for the model.
 */
export function buildRoastPrompt(
  evidence: SelectedEvidence,
  variationMode: RoastVariationMode,
  baseTemperature: number,
  intensityProfile: RoastIntensityProfile,
  requestSalt?: string,
  mode: RoastPromptMode = 'sync',
): BuiltPrompt {
  const profile = TONE_PROFILE[variationMode]
  let totalFiles = 0
  let totalPatchChars = 0

  const payload: PromptPayload = {
    username: evidence.username,
    commits: evidence.commits.map((commit) => {
      const rankedFiles = [...commit.files]
        .sort((left, right) => {
          const leftScore = (left.patch ? 2 : 0) + left.additions + left.deletions
          const rightScore = (right.patch ? 2 : 0) + right.additions + right.deletions
          return rightScore - leftScore
        })
        .slice(0, ROAST_LIMITS.maxPromptFilesPerCommit)

      const files = rankedFiles
        .filter(() => totalFiles < intensityProfile.maxPromptTotalFiles)
        .map((file) => {
          totalFiles += 1
          const availablePatchBudget = intensityProfile.maxPromptTotalPatchChars - totalPatchChars
          const hasPatchBudget = availablePatchBudget > 0
          const patch = file.patch && hasPatchBudget
            ? file.patch.slice(0, Math.min(ROAST_LIMITS.maxPromptPatchChars, availablePatchBudget))
            : undefined

          totalPatchChars += patch?.length || 0

          return {
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            patch,
          }
        })

      return {
        repo: commit.repo,
        sha: commit.sha.slice(0, 7),
        message: compactMessage(commit.message),
        additions: commit.additions,
        deletions: commit.deletions,
        changedFiles: commit.changedFiles,
        files,
      }
    }),
    prs: evidence.prs,
  }

  const outputLine = getOutputLine(mode)

  const promptPrefix = [
    `PromptVersion=${PROMPT_VERSION}`,
    requestSalt ? `RunSalt=${requestSalt}` : '',
    'You are a dry technical GitHub roast assistant.',
    'Goal: produce a short, funny, evidence-based roast that sounds sharp, not cringe.',
    'Target work, diffs and engineering habits, never the person.',
    'No slurs, no harassment, no protected-class attacks, no personal insults.',
    'Use concrete evidence from commit messages, file paths, and patch snippets.',
    'Prefer precise technical jabs over generic internet slang.',
    profile.styleLine,
    intensityProfile.styleLine,
    getRoastTitleToneLine(intensityProfile),
    'If two runs have similar evidence, keep facts stable but vary phrasing and punchline structure.',
  ]

  const promptSuffix = [
    'No markdown fences, no wrapper text, no extra sections.',
    'Never leak or repeat secrets in any form.',
  ]

  const systemPrompt = [...promptPrefix, outputLine, ...promptSuffix].join(' ')
  const builtPrompt: BuiltPrompt = {
    mode,
    promptVersion: PROMPT_VERSION,
    systemPrompt,
    payload,
    effectiveTemperature: Math.max(0, Math.min(1.2, baseTemperature + profile.temperatureBias + intensityProfile.temperatureDelta)),
  }

  if (ENABLE_ROAST_DEBUG) {
    const totalFiles = builtPrompt.payload.commits.reduce((acc, commit) => acc + commit.files.length, 0)
    logServerDebug('prompt-built', {
      mode,
      promptVersion: builtPrompt.promptVersion,
      variationMode,
      roastIntensity: intensityProfile.level,
      roastIntensityLabel: intensityProfile.label,
      requestSalt,
      effectiveTemperature: builtPrompt.effectiveTemperature,
      maxPromptTotalFiles: intensityProfile.maxPromptTotalFiles,
      maxPromptTotalPatchChars: intensityProfile.maxPromptTotalPatchChars,
      commitCount: builtPrompt.payload.commits.length,
      prCount: builtPrompt.payload.prs.length,
      fileCount: totalFiles,
    })
  }

  return builtPrompt
}
