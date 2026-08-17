export interface WordmarkFontConfig {
  label: string
  family: string
  weight: number
  fontSize: number
  letterSpacing: string
  heroFontSize: string
  heroLineHeight: string
  heroLetterSpacing: string
  heroScaleX: number
  heroEntryOffset: number
  /** Horizontal stretch applied to the wordmark, FUEL-style extended look. */
  scaleX: number
  /** Total lockup viewBox width for this font. */
  viewBoxWidth: number
}

export const WORDMARK_FONTS: Record<string, WordmarkFontConfig> = {
  azeret: {
    label: 'Azeret Mono',
    family: 'Azeret Mono, monospace',
    weight: 500,
    fontSize: 34,
    letterSpacing: '0em',
    heroFontSize: 'clamp(4.65rem, 16.8vw, 21rem)',
    heroLineHeight: '0.64',
    heroLetterSpacing: '0em',
    heroScaleX: 1,
    heroEntryOffset: 170,
    scaleX: 1.05,
    viewBoxWidth: 248,
  },
  bricolage: {
    label: 'Bricolage',
    family: 'Bricolage Grotesque, sans-serif',
    weight: 500,
    fontSize: 34,
    letterSpacing: '-0.015em',
    heroFontSize: 'clamp(4.65rem, 16.8vw, 21rem)',
    heroLineHeight: '0.64',
    heroLetterSpacing: '-0.015em',
    heroScaleX: 1,
    heroEntryOffset: 170,
    scaleX: 1.18,
    viewBoxWidth: 257,
  },
  general: {
    label: 'General Sans',
    family: 'General Sans, sans-serif',
    weight: 500,
    fontSize: 34,
    letterSpacing: '-0.015em',
    heroFontSize: 'clamp(4.65rem, 16.8vw, 21rem)',
    heroLineHeight: '0.64',
    heroLetterSpacing: '-0.015em',
    heroScaleX: 1,
    heroEntryOffset: 170,
    scaleX: 1.18,
    viewBoxWidth: 254,
  },
  climate: {
    label: 'Climate Crisis',
    family: 'Climate Crisis, sans-serif',
    weight: 400,
    fontSize: 34,
    letterSpacing: '-0.015em',
    heroFontSize: 'clamp(4.65rem, 15.6vw, 19.5rem)',
    heroLineHeight: '0.67',
    heroLetterSpacing: '-0.02em',
    heroScaleX: 0.72,
    heroEntryOffset: 154,
    scaleX: 1.12,
    viewBoxWidth: 258,
  },
}
