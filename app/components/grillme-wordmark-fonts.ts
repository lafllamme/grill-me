export interface WordmarkFontConfig {
  label: string
  family: string
  weight: number
  fontSize: number
  letterSpacing: string
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
    scaleX: 1.05,
    viewBoxWidth: 248,
  },
  bricolage: {
    label: 'Bricolage',
    family: 'Bricolage Grotesque, sans-serif',
    weight: 500,
    fontSize: 34,
    letterSpacing: '-0.015em',
    scaleX: 1.18,
    viewBoxWidth: 257,
  },
  general: {
    label: 'General Sans',
    family: 'General Sans, sans-serif',
    weight: 500,
    fontSize: 34,
    letterSpacing: '-0.015em',
    scaleX: 1.18,
    viewBoxWidth: 254,
  },
  zodiak: {
    label: 'Zodiak',
    family: 'Zodiak, serif',
    weight: 500,
    fontSize: 34,
    letterSpacing: '-0.01em',
    scaleX: 1.12,
    viewBoxWidth: 253,
  },
}
