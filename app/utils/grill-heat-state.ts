import { Color, MathUtils } from 'three'

const RAW_MEAT = new Color('#D9846E')
const SEARED_MEAT = new Color('#8C4A2F')
const CHARRED_MEAT = new Color('#2A1712')
const LOW_COAL = new Color('#4B190F')
const HOT_COAL = new Color('#FF6A1A')
const LOW_FIRE = new Color('#FF8F3A')
const HOT_FIRE = new Color('#FFE08A')
const AMBIENT_LOW = new Color('#2C170F')
const AMBIENT_HIGH = new Color('#B84D1A')

export interface GrillHeatState {
  heat: number
  labels: {
    primary: string
    secondary: string
  }
  meat: {
    color: string
    grillMarkOpacity: number
    roughness: number
    metalness: number
    wobble: number
  }
  coals: {
    color: string
    emissive: string
    emissiveIntensity: number
    pulse: number
  }
  fire: {
    color: string
    tipColor: string
    opacity: number
    intensity: number
    height: number
    flickerAmplitude: number
  }
  ambience: {
    color: string
    intensity: number
  }
}

/**
 * Linearly interpolates between two Three colors and returns a CSS rgb() string
 * that can be fed directly into Tres material props.
 */
function lerpColor(from: Color, to: Color, amount: number): string {
  return from.clone().lerp(to, amount).getStyle()
}

/**
 * Clamps external heat input into the supported normalized scene range.
 */
export const clampHeat = (value: number): number => MathUtils.clamp(value, 0, 1)

/**
 * Derives all visual scene parameters from a single normalized heat value.
 * This keeps the grill scene deterministic and easy to retune from one place.
 */
export function getGrillHeatState(value: number): GrillHeatState {
  const heat = clampHeat(value)
  const browning = heat < 0.55
    ? lerpColor(RAW_MEAT, SEARED_MEAT, heat / 0.55)
    : lerpColor(SEARED_MEAT, CHARRED_MEAT, (heat - 0.55) / 0.45)

  const primaryLabel = heat < 0.2
    ? 'Low'
    : heat < 0.5
      ? 'Medium'
      : heat < 0.8
        ? 'High'
        : 'Inferno'

  const secondaryLabel = heat < 0.2
    ? 'Raw edges'
    : heat < 0.5
      ? 'Rendering crust'
      : heat < 0.8
        ? 'Searing hard'
        : 'Char risk maximum'

  return {
    heat,
    labels: {
      primary: primaryLabel,
      secondary: secondaryLabel,
    },
    meat: {
      color: browning,
      grillMarkOpacity: MathUtils.lerp(0.08, 0.72, heat),
      roughness: MathUtils.lerp(0.92, 0.66, heat),
      metalness: MathUtils.lerp(0.02, 0.08, heat),
      wobble: MathUtils.lerp(0.003, 0.016, heat),
    },
    coals: {
      color: lerpColor(LOW_COAL, HOT_COAL, heat),
      emissive: lerpColor(LOW_COAL, HOT_COAL, MathUtils.lerp(0.28, 1, heat)),
      emissiveIntensity: MathUtils.lerp(0.18, 2.8, heat),
      pulse: MathUtils.lerp(0.02, 0.11, heat),
    },
    fire: {
      color: lerpColor(LOW_FIRE, HOT_FIRE, heat),
      tipColor: lerpColor(HOT_COAL, HOT_FIRE, MathUtils.lerp(0.4, 0.95, heat)),
      opacity: MathUtils.lerp(0.12, 0.82, heat),
      intensity: MathUtils.lerp(0.2, 3.2, heat),
      height: MathUtils.lerp(0.18, 1.15, heat),
      flickerAmplitude: MathUtils.lerp(0.03, 0.22, heat),
    },
    ambience: {
      color: lerpColor(AMBIENT_LOW, AMBIENT_HIGH, heat),
      intensity: MathUtils.lerp(0.32, 1.25, heat),
    },
  }
}
