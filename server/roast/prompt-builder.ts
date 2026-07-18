import type { RoastVariationMode } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import type { SelectedEvidence } from './evidence-selector'
import { ROAST_LIMITS } from '~~/shared/roast/contracts'
import { getRoastOutputTarget } from '~~/shared/roast/intensity'
import { ENABLE_ROAST_DEBUG, logServerDebug } from './debug'
import { getRoastTitleToneLine, ROAST_TITLE_POLICY } from './title-policy'

export const PROMPT_VERSION = 'grill-v3.2.0'

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

function getPersonaLines(): string[] {
  return [
    'You are a sharp GitHub roast reviewer with blunt senior maintainer energy.',
    'Sound technically literate, unimpressed, funny because of precision, and concise.',
    'Target the work, diffs, and engineering habits, never the person.',
    'No slurs, no harassment, no protected-class attacks, no personal insults.',
    'Use concrete evidence from commit messages, file paths, and patch snippets.',
    'Prefer technical metaphors and precise jabs over generic internet slang.',
  ]
}

function getIntensityOutputGuidance(intensityProfile: RoastIntensityProfile): string {
  const target = getRoastOutputTarget(intensityProfile)

  return [
    `Return ${target.minRoastLines}-${target.maxRoastLines} roast lines.`,
    `Return ${target.minFeedbackItems}-${target.maxFeedbackItems} feedback items.`,
    'Roast lines are the main act: distinct, reveal-friendly, and written as a short flowing review instead of random disconnected bullets.',
    'Vary sentence openings and rhythm across the roast body.',
    'Prefer mostly declarative roast lines and use rhetorical questions sparingly.',
    'Let adjacent roast lines feel connected, as if the same reviewer is building an argument.',
    'Feedback items should be more concrete and actionable than the roast lines.',
    intensityProfile.level >= 3
      ? 'At this intensity, increase callback structure, stronger punchlines, and harsher phrasing while staying evidence-grounded.'
      : 'At this intensity, keep the phrasing tight and technically grounded without overperforming.',
  ].join(' ')
}

function getOutputLine(mode: RoastPromptMode, intensityProfile: RoastIntensityProfile): string {
  const target = getRoastOutputTarget(intensityProfile)
  const titleContract = [
    `Title must be a hook line with ${ROAST_TITLE_POLICY.minWords}-${ROAST_TITLE_POLICY.maxWords} words.`,
    'A question is optional, not required.',
    'Keep title spicy but clean, evidence-grounded, and not generic.',
    'Avoid summary labels like "Summary" or "Overview".',
  ].join(' ')

  if (mode === 'stream') {
    return [
      'Output strictly as one JSON object with keys in this exact order: title, roastLines, feedback.',
      'Start the response with the opening { immediately and stream the JSON object directly.',
      'Emit the full title value before starting roastLines.',
      'After title, emit roastLines as a JSON array of strings.',
      'After roastLines, emit feedback as a JSON array of strings.',
      `Emit ${target.minRoastLines}-${target.maxRoastLines} roastLines total.`,
      `Emit ${target.minFeedbackItems}-${target.maxFeedbackItems} feedback items total.`,
      'Make roastLines read like a short connected review, not unrelated one-liners.',
      'Do not make every roast line a question.',
      titleContract,
      'No markdown, no prose, no code fences, no extra keys.',
    ].join(' ')
  }

  return [
    'Output strictly as JSON with keys: title, roastLines, feedback.',
    `title: ${ROAST_TITLE_POLICY.minWords}-${ROAST_TITLE_POLICY.maxWords} word hook line.`,
    `roastLines: array of ${target.minRoastLines}-${target.maxRoastLines} flowing roast lines.`,
    `feedback: array of ${target.minFeedbackItems}-${target.maxFeedbackItems} actionable one-sentence bullets.`,
    titleContract,
  ].join(' ')
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

      const files: PromptPayload['commits'][number]['files'] = []

      for (const file of rankedFiles) {
        if (totalFiles >= intensityProfile.maxPromptTotalFiles)
          break

        totalFiles += 1
        const availablePatchBudget = intensityProfile.maxPromptTotalPatchChars - totalPatchChars
        const hasPatchBudget = availablePatchBudget > 0
        const patch = file.patch && hasPatchBudget
          ? file.patch.slice(0, Math.min(ROAST_LIMITS.maxPromptPatchChars, availablePatchBudget))
          : undefined

        totalPatchChars += patch?.length || 0

        files.push({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
          patch,
        })
      }

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

  const outputLine = getOutputLine(mode, intensityProfile)

  const promptPrefix = [
    `PromptVersion=${PROMPT_VERSION}`,
    requestSalt ? `RunSalt=${requestSalt}` : '',
    ...getPersonaLines(),
    'Goal: produce a short, funny, evidence-based roast that feels like a sharp code review, not random insult comedy.',
    profile.styleLine,
    intensityProfile.styleLine,
    getIntensityOutputGuidance(intensityProfile),
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
