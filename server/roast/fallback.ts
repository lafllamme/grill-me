import type { RoastMeta } from '~~/shared/roast/contracts'

interface FallbackHints {
  topRepo?: string
  topFiles?: string[]
}

export interface FallbackRoast {
  username: string
  title: string
  roastLines: string[]
  roast: string
  feedback: string[]
  meta: RoastMeta
  debug: {
    username: string
    fallbackReason: string
    timingsMs: Record<string, never>
    requests: []
  }
}

/**
 * Creates a deterministic fallback response when model output is unavailable.
 */
export function createFallbackRoast(username: string, meta: RoastMeta, reason: string, hints?: FallbackHints): FallbackRoast {
  const lowEvidence = meta.commitCount === 0 && meta.prCount === 0
  const topFilesLabel = hints?.topFiles?.slice(0, 2).join(', ')

  const roastLines = lowEvidence
    ? [
        `No juicy public activity for @${username} right now.`,
        'Your commit trail is either hidden, clean, or suspiciously absent.',
      ]
    : [
        `@${username}, your recent diff quality around ${hints?.topRepo || 'your active repo'} reads like a rushed hotfix marathon.`,
        topFilesLabel
          ? `Most churn clustered in ${topFilesLabel}, and the signal-to-noise ratio still lost.`
          : 'We had enough evidence, but upstream generation returned an empty payload.',
      ]

  return {
    username,
    title: lowEvidence ? 'No Activity, No Mercy' : 'Fallback Furnace',
    roastLines,
    roast: roastLines.join(' '),
    feedback: [
      'Push focused commits with meaningful code deltas, not only metadata churn.',
      'Open at least one PR with a concrete diff and clear intent.',
      'Use commit subjects that describe architecture impact, not just activity.',
    ],
    meta,
    debug: {
      username,
      fallbackReason: reason,
      timingsMs: {},
      requests: [],
    },
  }
}
