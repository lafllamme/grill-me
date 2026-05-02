<script setup lang="ts">
import type { GrillHeatState } from '../../utils/grill-heat-state'
import type { FuelControls } from './types'
import { tryOnBeforeUnmount } from '@vueuse/core'
import { Color, DynamicDrawUsage, InstancedMesh, Matrix4, MeshStandardMaterial, Object3D, SphereGeometry } from 'three'
import { shallowRef, watchEffect } from 'vue'

interface GrillSceneCoalsProps {
  elapsed: number
  state: GrillHeatState
  anchorOffset: { x: number, y: number, z: number }
  controls: FuelControls
}

const props = defineProps<GrillSceneCoalsProps>()

const BASE_COAL_COUNT = 48
const coalMesh = shallowRef<InstancedMesh | null>(null)

const coalGeometry = new SphereGeometry(1, 6, 5)
const coalMaterial = new MeshStandardMaterial({
  color: '#1e1a18',
  emissive: '#2e120a',
  emissiveIntensity: 0.6,
  roughness: 0.95,
  metalness: 0.02,
})

const tempObject = new Object3D()
const tempMatrix = new Matrix4()
const coalColor = new Color()

function createMesh() {
  const next = new InstancedMesh(coalGeometry, coalMaterial, BASE_COAL_COUNT)
  next.instanceMatrix.setUsage(DynamicDrawUsage)
  next.frustumCulled = false
  coalMesh.value = next
}

function applyInstance(
  mesh: InstancedMesh,
  index: number,
  position: [number, number, number],
  scale: [number, number, number],
  rotationY: number,
) {
  tempObject.position.set(position[0], position[1], position[2])
  tempObject.scale.set(scale[0], scale[1], scale[2])
  tempObject.rotation.set(0.05, rotationY, 0.08)
  tempObject.updateMatrix()
  mesh.setMatrixAt(index, tempObject.matrix)
}

function updateCoals() {
  if (!coalMesh.value)
    return

  const mesh = coalMesh.value
  const count = Math.min(BASE_COAL_COUNT, Math.max(8, Math.round(BASE_COAL_COUNT * props.controls.coalCount * props.controls.coalDensity)))
  const blackness = props.controls.coalBlackness
  const hotspotVariance = props.controls.hotspotVariance
  const pulseSpeed = props.controls.pulseSpeed
  const glowIntensity = props.controls.glowIntensity

  for (let index = 0; index < BASE_COAL_COUNT; index += 1) {
    if (index >= count) {
      applyInstance(mesh, index, [999, 999, 999], [0.0001, 0.0001, 0.0001], 0)
      continue
    }

    const row = Math.floor(index / 8)
    const col = index % 8
    const seed = index * 0.73

    const baseX = 0.16 + col * 0.12
    const baseZ = -0.3 + row * 0.11
    const jitterX = Math.sin(seed * 1.7) * 0.045
    const jitterZ = Math.cos(seed * 1.3) * 0.05

    const pulse = 1 + Math.sin(props.elapsed * (2.1 + (index % 5) * 0.11) * pulseSpeed + seed) * props.state.coals.pulse * 0.5
    const hotspot = 0.45 + ((Math.sin(seed * 2.6) * 0.5 + 0.5) * hotspotVariance)

    const x = baseX + jitterX + props.anchorOffset.x
    const y = 1.86 + props.anchorOffset.y + (Math.sin(seed + props.elapsed * 0.4) * 0.012)
    const z = baseZ + jitterZ + props.anchorOffset.z

    const sx = (0.11 + (index % 3) * 0.02) * pulse
    const sy = (0.08 + (index % 4) * 0.014) * (0.95 + pulse * 0.06)
    const sz = (0.1 + (index % 2) * 0.022) * pulse

    applyInstance(mesh, index, [x, y, z], [sx, sy, sz], seed)

    const emberFactor = Math.min(1, props.state.heat * hotspot)
    const r = (24 * blackness) + emberFactor * 40
    const g = (20 * blackness) + emberFactor * 22
    const b = (18 * blackness) + emberFactor * 12
    coalColor.setRGB(r / 255, g / 255, b / 255)
    mesh.setColorAt(index, coalColor)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const material = mesh.material as MeshStandardMaterial
  material.color.setRGB(0.08 * blackness, 0.07 * blackness, 0.07 * blackness)
  material.emissive.set(props.state.coals.emissive)
  material.emissiveIntensity = props.state.coals.emissiveIntensity * glowIntensity * 0.55
  material.roughness = 0.9 + blackness * 0.08
}

createMesh()

watchEffect(() => {
  updateCoals()
})

tryOnBeforeUnmount(() => {
  coalMesh.value?.dispose()
  coalMaterial.dispose()
  coalGeometry.dispose()
  coalMesh.value = null
  tempMatrix.identity()
})
</script>

<template>
  <primitive v-if="coalMesh" :object="coalMesh" />
</template>
