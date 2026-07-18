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
    rare: 'Title tone: light deadpan hook line, restrained burn.',
    medium_rare: 'Title tone: sharper hook line, direct and witty.',
    medium: 'Title tone: bolder hook line with heavier punchlines.',
    burned_to_crisp: 'Title tone: maximal punch hook line, still policy-safe and technical.',
  },
}

export function getRoastTitleToneLine(profile: RoastIntensityProfile): string {
  return ROAST_TITLE_POLICY.toneByIntensity[profile.label]
}
