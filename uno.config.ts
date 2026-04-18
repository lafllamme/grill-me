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
      'primary': '#FF3300',
      'primary-container': '#FF5633',
      'background': '#131313',
      'surface': '#1C1B1B',
      'surface-container-low': '#1C1B1B',
      'surface-container': '#20201F',
      'surface-container-high': '#2A2A2A',
      'surface-container-highest': '#353535',
      'surface-container-lowest': '#0E0E0E',
      'surface-variant': '#353535',
      'surface-bright': '#393939',
      'on-surface': '#E5E2E1',
      'on-background': '#E5E2E1',
      'on-surface-variant': '#A3A1A0',
      'outline': 'rgba(229, 226, 225, 0.1)',
      'divider': 'rgba(229, 226, 225, 0.1)',
      'glow': 'rgba(255, 51, 0, 0.15)',
      'error': '#FF3300',
      'success': '#B8FF00',
    },
    font: {
      headline: '"Bricolage Grotesque", sans-serif',
      display: '"Bricolage Grotesque", sans-serif',
      serif: '"DM Serif Display", serif',
      label: '"Bricolage Grotesque", sans-serif',
      body: '"Outfit", sans-serif',
      mono: '"Space Mono", monospace',
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
