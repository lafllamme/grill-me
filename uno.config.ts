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
    colors: {
      "primary-container": "#ff784d",
      "on-secondary-fixed": "#700100",
      "on-tertiary-container": "#5a1170",
      "on-error-container": "#ffa8a3",
      "secondary-fixed": "#ffc4ba",
      "surface-bright": "#2c2c2c",
      "tertiary-dim": "#dc8ef0",
      primary: "#ff906d",
      "inverse-surface": "#fcf9f8",
      "on-surface": "#ffffff",
      "error-dim": "#d7383b",
      "surface-container-lowest": "#000000",
      "outline-variant": "#484847",
      "tertiary-fixed-dim": "#dc8ef0",
      background: "#0e0e0e",
      surface: "#0e0e0e",
      "on-primary-container": "#460f00",
      "on-primary": "#5b1600",
      "surface-variant": "#262626",
      "surface-container-low": "#131313",
      "on-secondary-container": "#fff6f4",
      outline: "#767575",
      "on-tertiary-fixed-variant": "#641d7a",
      error: "#ff716c",
      "primary-fixed": "#ff784d",
      "tertiary-fixed": "#eb9bfe",
      "surface-dim": "#0e0e0e",
      "secondary-dim": "#eb0000",
      "surface-container": "#1a1919",
      "on-surface-variant": "#adaaaa",
      tertiary: "#f1afff",
      "secondary-container": "#c00100",
      "on-secondary-fixed-variant": "#a60100",
      "on-background": "#ffffff",
      secondary: "#ff725e",
      "on-primary-fixed-variant": "#571400",
      "error-container": "#9f0519",
      "on-error": "#490006",
      "on-secondary": "#4a0000",
      "tertiary-container": "#eb9bfe",
      "inverse-primary": "#af3200",
      "inverse-on-surface": "#565555",
      "primary-fixed-dim": "#ff5d26",
      "secondary-fixed-dim": "#ffb0a3",
      "primary-dim": "#ff7346",
      "on-tertiary": "#651e7b",
      "surface-tint": "#ff906d",
      "on-tertiary-fixed": "#3b004d",
      "surface-container-highest": "#262626",
      "surface-container-high": "#201f1f",
      "on-primary-fixed": "#000000",
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
