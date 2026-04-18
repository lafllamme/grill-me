import {
  defineConfig,
  presetIcons,
  presetMini,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

const basePreset = presetWind4({
  preflights: {
    reset: true,
  },
});
const basePresetAlternatives = {
  mini: () => presetMini(),
};
export const unoBasePresetAlternatives = basePresetAlternatives;

export default defineConfig({
  theme: {
    font: {
      headline: '"Bricolage Grotesque", sans-serif',
      display: '"Bricolage Grotesque", sans-serif',
      serif: '"DM Serif Display", serif',
      label: '"Bricolage Grotesque", sans-serif',
      body: '"Outfit", sans-serif',
      mono: '"Space Mono", monospace',
    },
  },
  presets: [
    basePreset,
    presetIcons(),
  ],
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
});
