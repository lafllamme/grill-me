import type { RoastIntensity, RoastIntensityProfile } from '~~/shared/roast/intensity'
import { ROAST_INTENSITY_LEVELS as SHARED_ROAST_INTENSITY_LEVELS } from '~~/shared/roast/intensity'

export type RoastIntensityValue = RoastIntensity
export type RoastIntensityKey = RoastIntensityProfile['label']

const ROAST_INTENSITY_DISPLAY_LABELS: Record<RoastIntensityKey, string> = {
  rare: 'Rare',
  medium_rare: 'Medium Rare',
  medium: 'Medium',
  burned_to_crisp: 'Burned to Crisp',
}

export const ROAST_INTENSITY_LEVELS: Array<{ value: RoastIntensityValue, key: RoastIntensityKey, label: string }> = Object.values(SHARED_ROAST_INTENSITY_LEVELS).map(level => ({
  value: level.level,
  key: level.label,
  label: ROAST_INTENSITY_DISPLAY_LABELS[level.label],
}))

export const ROAST_INTENSITY_FUTURE_MAPPING = {
  1: {
    key: 'rare',
    notes: 'active: restrained tone and smaller commit window',
  },
  2: {
    key: 'medium_rare',
    notes: 'active: baseline behavior',
  },
  3: {
    key: 'medium',
    notes: 'active: higher variation and harsher tone',
  },
  4: {
    key: 'burned_to_crisp',
    notes: 'active: max intensity mode',
  },
} as const
