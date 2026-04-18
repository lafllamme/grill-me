import type { RoastVariationMode } from "~~/shared/roast/contracts"
import { ROAST_LIMITS } from "~~/shared/roast/contracts"
import type { SelectedEvidence } from "./evidence-selector"

export const PROMPT_VERSION = "grill-v2.0.0"

interface PromptToneProfile {
  temperatureBias: number
  styleLine: string
}

const TONE_PROFILE: Record<RoastVariationMode, PromptToneProfile> = {
  stable: {
    temperatureBias: -0.1,
    styleLine: "Keep style tight, deterministic and dry.",
  },
  moderate: {
    temperatureBias: 0,
    styleLine: "Vary phrasing moderately and avoid repeated punchlines across runs.",
  },
  wild: {
    temperatureBias: 0.12,
    styleLine: "Use bolder metaphors but stay technically grounded.",
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
  prs: SelectedEvidence["prs"]
}

export interface BuiltPrompt {
  promptVersion: string
  systemPrompt: string
  payload: PromptPayload
  effectiveTemperature: number
}

export type RoastPromptMode = "sync" | "stream"

const compactMessage = (value: string): string => {
  const singleLine = value
    .replace(/\s+/g, " ")
    .trim()

  if (singleLine.length <= 180)
    return singleLine

  return `${singleLine.slice(0, 180)}...`
}

/**
 * Builds a versioned prompt + compact evidence payload for the model.
 */
export const buildRoastPrompt = (
  evidence: SelectedEvidence,
  variationMode: RoastVariationMode,
  baseTemperature: number,
  requestSalt?: string,
  mode: RoastPromptMode = "sync",
): BuiltPrompt => {
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
        .filter(() => totalFiles < ROAST_LIMITS.maxPromptTotalFiles)
        .map((file) => {
          totalFiles += 1
          const availablePatchBudget = ROAST_LIMITS.maxPromptTotalPatchChars - totalPatchChars
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

  const outputLine = mode === "stream"
    ? "Output as plain text only. First output roast lines (6-10). Then output exactly one line: FEEDBACK:. After that output only 3-5 bullet feedback lines. No extra headings, wrappers, or prose after FEEDBACK:."
    : "Output strictly as JSON with keys: roastLines, feedback. roastLines: array of 6-10 short punchy lines. feedback: array of 3-5 actionable one-sentence bullets."

  const systemPrompt = [
    `PromptVersion=${PROMPT_VERSION}`,
    requestSalt ? `RunSalt=${requestSalt}` : "",
    "You are a dry technical GitHub roast assistant.",
    "Goal: produce a short, funny, evidence-based roast that sounds sharp, not cringe.",
    "Target work, diffs and engineering habits, never the person.",
    "No slurs, no harassment, no protected-class attacks, no personal insults.",
    "Use concrete evidence from commit messages, file paths, and patch snippets.",
    "Prefer precise technical jabs over generic internet slang.",
    profile.styleLine,
    "If two runs have similar evidence, keep facts stable but vary phrasing and punchline structure.",
    outputLine,
    "No markdown fences, no wrapper text, no extra sections.",
    "Never leak or repeat secrets in any form.",
  ].join(" ")

  return {
    promptVersion: PROMPT_VERSION,
    systemPrompt,
    payload,
    effectiveTemperature: Math.max(0, Math.min(1.2, baseTemperature + profile.temperatureBias)),
  }
}
