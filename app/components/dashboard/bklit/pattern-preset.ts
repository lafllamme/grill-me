export const PATTERN_PRESET_IDS = ['none', 'diagonal', 'crosshatch', 'dots', 'waves', 'hexagons'] as const
export type PatternPresetId = typeof PATTERN_PRESET_IDS[number]

export interface PatternPresetOptions {
  color?: string
  fill?: string
  strokeWidth?: number
  dotFill?: boolean
}

export function patternPresetTileSize(preset: PatternPresetId, scale = 1) {
  const base = preset === 'dots' ? { width: 10, height: 10, strokeWidth: 0 } : preset === 'hexagons' ? { width: 8, height: 8, strokeWidth: 1 } : { width: 6, height: 6, strokeWidth: 1 }
  return { width: base.width * scale, height: base.height * scale, strokeWidth: base.strokeWidth * scale }
}

export function patternCss(preset: PatternPresetId, color: string) {
  if (preset === 'none')
    return undefined
  if (preset === 'dots')
    return `radial-gradient(circle, ${color} 1px, transparent 1px) 0 0 / 8px 8px`
  const angle = preset === 'crosshatch' ? '45deg, transparent 45%, currentColor 45%, currentColor 55%, transparent 55%, transparent' : '135deg, transparent 45%, currentColor 45%, currentColor 55%, transparent 55%, transparent'
  return `repeating-linear-gradient(${angle})`
}
