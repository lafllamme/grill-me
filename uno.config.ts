import {
  defineConfig,
  presetIcons,
  presetMini,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

const basePreset = presetWind4({
  preflights: {
    reset: true,
  },
})
const basePresetAlternatives = {
  mini: () => presetMini(),
}
export const unoBasePresetAlternatives = basePresetAlternatives

export default defineConfig({
  theme: {
    colors: {
      'ember': {
        50: '#faf6f5',
        100: '#f6ebe9',
        200: '#f1d5d0',
        300: '#eeb1a5',
        400: '#f27c64',
        500: '#ff4925',
        600: '#e12d09',
        700: '#b6280c',
        800: '#882511',
        900: '#5d1f13',
        950: '#38160f',
      },
      'basalt': {
        50: '#f5f4f2',
        100: '#ece8e4',
        200: '#d7d1cb',
        300: '#b4aca5',
        400: '#8d837a',
        500: '#665d56',
        600: '#504943',
        700: '#3d3833',
        800: '#292522',
        900: '#181614',
        950: '#0f0e0d',
      },
      'bone': {
        50: '#fffdf9',
        100: '#fcf7f0',
        200: '#f5ebdf',
        300: '#ead8c6',
        400: '#d8bfa8',
        500: '#c1a68d',
        600: '#a3846d',
        700: '#856956',
        800: '#685143',
        900: '#47372f',
        950: '#2a201b',
      },
      'primary': '#ff4925',
      'primary-strong': '#f27c64',
      'primary-soft': 'rgba(255, 73, 37, 0.12)',
      'primary-container': '#5d1f13',
      'primary-muted': 'rgba(255, 73, 37, 0.08)',
      'header-glass': 'rgba(15, 14, 13, 0.72)',
      'header-border': 'rgba(252, 247, 240, 0.1)',
      'header-highlight': 'rgba(252, 247, 240, 0.06)',
      'header-hover': 'rgba(255, 73, 37, 0.12)',
      'background': '#0f0e0d',
      'surface': '#181614',
      'surface-container-low': '#131211',
      'surface-container': '#1a1715',
      'surface-container-high': '#211d1a',
      'surface-container-highest': '#292522',
      'surface-container-lowest': '#0f0e0d',
      'surface-variant': '#3d3833',
      'surface-bright': '#504943',
      'muted': '#1a1715',
      'on-background': '#fcf7f0',
      'on-surface': '#fcf7f0',
      'on-surface-variant': '#d8bfa8',
      'on-primary-fixed': '#fffdf9',
      'border': 'rgba(252, 247, 240, 0.1)',
      'outline': 'rgba(252, 247, 240, 0.14)',
      'divider': 'rgba(252, 247, 240, 0.08)',
      'glow': 'rgba(255, 73, 37, 0.18)',
      'error': '#ff4925',
      'success': '#7dbd6d',
    },
    font: {
      headline: '"Bricolage Grotesque", sans-serif',
      display: '"Bricolage Grotesque", sans-serif',
      label: '"Bricolage Grotesque", sans-serif',
      body: '"General Sans", sans-serif',
      mono: '"Azeret Mono", monospace',
      meta: '"Azeret Mono", monospace',
      serif: '"Zodiak", serif',
      accent: '"Zodiak", serif',
    },
  },
  presets: [basePreset, presetIcons()],
  preflights: [
    {
      getCSS: () => `
html, body {
  font-synthesis: none;
  font-synthesis-weight: none;
  font-synthesis-style: none;
  font-synthesis-small-caps: none;
}
`,
    },
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
})
