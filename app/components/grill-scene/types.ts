import type { GrillHeatState } from '../../utils/grill-heat-state'

export interface PositionedStagePart {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  phase?: number
}

export interface AnchorOffset {
  x: number
  y: number
  z: number
}

export interface MeatModelConfig {
  id: 'sausage' | 'steak' | 'bacon'
  url: string
  position: [number, number, number]
  rotation: [number, number, number]
  targetWidth: number
  modelScale: number
  phase: number
}

export interface MeatAdjustment {
  x: number
  y: number
  z: number
  scale: number
  rotationY: number
}

export type MeatAdjustmentMap = Record<MeatModelConfig['id'], MeatAdjustment>

export interface GrillSceneVisualProps {
  elapsed: number
  state: GrillHeatState
  anchorOffset: AnchorOffset
}

export interface FuelControls {
  glowIntensity: number
  pulseSpeed: number
  coalDensity: number
  coalBlackness: number
  hotspotVariance: number
  coalCount: number
}

export interface FlameControls {
  height: number
  spread: number
  opacity: number
  flicker: number
  baseDensity: number
  verticalTaper: number
  emberRate: number
  bedTurbulence: number
}

export interface BurnControls {
  charStrength: number
  charThreshold: number
}

export function offsetPosition(
  base: [number, number, number],
  offset: AnchorOffset,
): [number, number, number] {
  return [base[0] + offset.x, base[1] + offset.y, base[2] + offset.z]
}
