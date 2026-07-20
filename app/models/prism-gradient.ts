export type PrismGradientColorTriplet = [string, string, string]

export interface PrismGradientShaderSettings {
  rotation: number
  proportion: number
  scale: number
  distortion: number
  swirl: number
  swirlIterations: number
  softness: number
  offset: number
  shapeSize: number
}

export interface PrismGradientSettings extends PrismGradientShaderSettings {
  speed: number
  noiseOpacity: number
  noiseScale: number
  ambientOpacity: number
  radius: string
  darkColors: PrismGradientColorTriplet
  lightColors: PrismGradientColorTriplet
}

export const PRISM_GRADIENT_DEFAULT_DARK_COLORS = [
  '#050505',
  '#66B3FF',
  '#FFFFFF',
] as const satisfies PrismGradientColorTriplet

export const PRISM_GRADIENT_DEFAULT_LIGHT_COLORS = [
  '#FAFAFA',
  '#66B3FF',
  '#050505',
] as const satisfies PrismGradientColorTriplet

export const PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS: PrismGradientShaderSettings = {
  rotation: -50,
  proportion: 1,
  scale: 0.01,
  distortion: 0,
  swirl: 50,
  swirlIterations: 16,
  softness: 47,
  offset: -299,
  shapeSize: 45,
}

export const PRISM_GRADIENT_DEFAULT_SETTINGS: PrismGradientSettings = {
  speed: 1,
  noiseOpacity: 0.08,
  noiseScale: 1,
  ambientOpacity: 0,
  radius: '0px',
  darkColors: [...PRISM_GRADIENT_DEFAULT_DARK_COLORS],
  lightColors: [...PRISM_GRADIENT_DEFAULT_LIGHT_COLORS],
  ...PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS,
}
