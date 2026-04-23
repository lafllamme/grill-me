import type { RoastIntensity, RoastIntensityProfile } from '~~/shared/roast/intensity'
import { ROAST_INTENSITY_LEVELS as SHARED_ROAST_INTENSITY_LEVELS } from '~~/shared/roast/intensity'

export type RoastIntensityValue = RoastIntensity
export type RoastIntensityKey = RoastIntensityProfile['label']

export const ROAST_INTENSITY_LEVELS: Array<{ value: RoastIntensityValue, key: RoastIntensityKey, label: RoastIntensityKey }> = Object.values(SHARED_ROAST_INTENSITY_LEVELS).map(level => ({
  value: level.level,
  key: level.label,
  label: level.label,
}))

export const ROAST_INTENSITY_FUTURE_MAPPING = {
  1: {
    key: 'salty',
    notes: 'active: milder tone and smaller commit window',
  },
  2: {
    key: 'savage',
    notes: 'active: baseline behavior',
  },
  3: {
    key: 'unhinged',
    notes: 'active: higher variation and harsher tone',
  },
  4: {
    key: 'nuke',
    notes: 'active: max intensity mode',
  },
} as const
