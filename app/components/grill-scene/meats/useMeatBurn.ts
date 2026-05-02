import type { MeshStandardMaterial } from 'three'
import type { BurnControls } from '../types'
import { Color, MathUtils } from 'three'

interface TrackedMaterial {
  material: MeshStandardMaterial
  baseColor: Color
  baseRoughness: number
  baseMetalness: number
}

const CHAR_COLOR = new Color('#1A0F0C')

/**
 * Applies a heat-driven char pass to loaded meat materials while preserving
 * their original material values as the baseline.
 */
export function createMeatBurnController() {
  const trackedMaterials: TrackedMaterial[] = []

  function registerMaterial(material: MeshStandardMaterial) {
    trackedMaterials.push({
      material,
      baseColor: material.color.clone(),
      baseRoughness: material.roughness,
      baseMetalness: material.metalness,
    })
  }

  function clearMaterials() {
    trackedMaterials.length = 0
  }

  function applyBurn(heat: number, burnControls: BurnControls) {
    const thresholded = Math.max(0, heat - burnControls.charThreshold)
    const normalized = MathUtils.clamp(
      thresholded / Math.max(0.001, 1 - burnControls.charThreshold),
      0,
      1,
    )
    const burnAmount = MathUtils.clamp(normalized * burnControls.charStrength, 0, 1)

    for (const tracked of trackedMaterials) {
      tracked.material.color.copy(tracked.baseColor).lerp(CHAR_COLOR, burnAmount)
      tracked.material.roughness = MathUtils.lerp(tracked.baseRoughness, 0.98, burnAmount)
      tracked.material.metalness = MathUtils.lerp(tracked.baseMetalness, 0.01, burnAmount)
      tracked.material.needsUpdate = true
    }
  }

  return {
    registerMaterial,
    clearMaterials,
    applyBurn,
  }
}
