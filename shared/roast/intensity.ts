export const ROAST_INTENSITY_LEVELS = {
  1: {
    level: 1,
    label: 'salty',
    maxCommitRefs: 6,
    maxSelectedCommits: 4,
    maxPromptTotalFiles: 10,
    maxPromptTotalPatchChars: 2500,
    aiMaxTokens: 1400,
    temperatureDelta: -0.12,
    styleLine: 'Keep it dry, restrained and deadpan. Prioritize clever understatement over blunt insults.',
  },
  2: {
    level: 2,
    label: 'savage',
    maxCommitRefs: 10,
    maxSelectedCommits: 6,
    maxPromptTotalFiles: 14,
    maxPromptTotalPatchChars: 3500,
    aiMaxTokens: 1900,
    temperatureDelta: 0,
    styleLine: 'Use sharp, direct technical punchlines with balanced aggression.',
  },
  3: {
    level: 3,
    label: 'unhinged',
    maxCommitRefs: 14,
    maxSelectedCommits: 9,
    maxPromptTotalFiles: 20,
    maxPromptTotalPatchChars: 5500,
    aiMaxTokens: 2600,
    temperatureDelta: 0.08,
    styleLine: 'Be harsher and more varied in phrasing while staying evidence-grounded.',
  },
  4: {
    level: 4,
    label: 'nuke',
    maxCommitRefs: 18,
    maxSelectedCommits: 12,
    maxPromptTotalFiles: 26,
    maxPromptTotalPatchChars: 7500,
    aiMaxTokens: 3200,
    temperatureDelta: 0.16,
    styleLine: 'Go maximal on roast intensity, but keep every line technically specific and policy-safe.',
  },
} as const

export type RoastIntensity = keyof typeof ROAST_INTENSITY_LEVELS
export type RoastIntensityProfile = (typeof ROAST_INTENSITY_LEVELS)[RoastIntensity]

export function resolveRoastIntensityProfile(value: number): RoastIntensityProfile {
  const numericValue = Number(value)
  const rounded = Number.isFinite(numericValue) ? Math.round(numericValue) : 2
  const normalized = Math.min(4, Math.max(1, rounded)) as RoastIntensity
  return ROAST_INTENSITY_LEVELS[normalized]
}
