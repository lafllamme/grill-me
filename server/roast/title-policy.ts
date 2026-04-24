import type { RoastIntensityProfile } from '~~/shared/roast/intensity'

export interface RoastTitlePolicy {
  minWords: number
  maxWords: number
  fallbackPrefixes: readonly string[]
  disallowedSummaryPrefixes: readonly string[]
  mildInsultDenylist: readonly string[]
  toneByIntensity: Record<RoastIntensityProfile['label'], string>
}

export const ROAST_TITLE_POLICY: RoastTitlePolicy = {
  minWords: 6,
  maxWords: 12,
  fallbackPrefixes: [
    'You call this production-ready?',
    'Is this your final architecture choice?',
    'Did this ship without a reality check?',
  ],
  disallowedSummaryPrefixes: [
    'summary:',
    'overview:',
    'recap:',
    'analysis:',
  ],
  mildInsultDenylist: [
    'idiot',
    'stupid',
    'moron',
    'dumb',
  ],
  toneByIntensity: {
    salty: 'Title tone: mild deadpan hook-question, restrained burn.',
    savage: 'Title tone: sharp hook-question, direct and witty.',
    unhinged: 'Title tone: bolder hook-question with heavier punchlines.',
    nuke: 'Title tone: maximal punch hook-question, still policy-safe and technical.',
  },
}

export function getRoastTitleToneLine(profile: RoastIntensityProfile): string {
  return ROAST_TITLE_POLICY.toneByIntensity[profile.label]
}
