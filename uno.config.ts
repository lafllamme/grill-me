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
  presets: [
    basePreset,
    presetIcons(),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
