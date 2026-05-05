<script setup lang="ts">
import type { GrillHeatState } from '../../utils/grill-heat-state'
import type { SmokeControls } from './types'
import { tryOnBeforeUnmount } from '@vueuse/core'
import { Color, DynamicDrawUsage, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three'
import { shallowRef, watchEffect } from 'vue'

interface GrillSceneSmokeProps {
  elapsed: number
  state: GrillHeatState
  smokeOffset: { x: number, y: number, z: number }
  controls: SmokeControls
}

const props = defineProps<GrillSceneSmokeProps>()

const SMOKE_COUNT = 54
const smokeMesh = shallowRef<InstancedMesh | null>(null)

const smokeGeometry = new SphereGeometry(1, 5, 4)
const smokeMaterial = new MeshStandardMaterial({
  color: '#3d3833',
  emissive: '#1e1a16',
  emissiveIntensity: 0.18,
  transparent: true,
  opacity: 0.28,
  roughness: 1,
  metalness: 0,
  depthWrite: false,
})

const temp = new Object3D()
const colorScratch = new Color()

/**
 * Builds a subtle smoke column with stronger density near the fire-bed and a
 * tapered falloff upwards. Motion stays deterministic via seeded trigonometry.
 */
function updateSmokeLayer() {
  if (!smokeMesh.value)
    return

  const mesh = smokeMesh.value
  const density = Math.max(0.2, props.controls.density)
  const rise = Math.max(0.2, props.controls.rise)
  const drift = Math.max(0.2, props.controls.drift)
  const softness = Math.max(0.2, props.controls.softness)
  const opacity = Math.max(0.05, props.controls.opacity)

  const liveCount = Math.min(SMOKE_COUNT, Math.max(8, Math.round(SMOKE_COUNT * density)))

  for (let index = 0; index < SMOKE_COUNT; index += 1) {
    if (index >= liveCount) {
      temp.position.set(999, 999, 999)
      temp.scale.setScalar(0.0001)
      temp.rotation.set(0, 0, 0)
      temp.updateMatrix()
      mesh.setMatrixAt(index, temp.matrix)
      continue
    }

    const seed = index * 0.61
    const t = props.elapsed * (0.22 + (index % 7) * 0.018) * rise
    const progress = (t + seed * 0.13) % 1
    const taper = (1 - progress) ** (1.2 + softness)

    const baseX = props.smokeOffset.x
    const baseY = props.smokeOffset.y
    const baseZ = props.smokeOffset.z

    const baseSpread = 0.35 + props.state.heat * 0.2
    const offsetX = Math.sin(seed * 1.9 + t * 1.3) * baseSpread * drift * taper
    const offsetZ = Math.cos(seed * 1.4 + t * 1.1) * (baseSpread * 0.85) * drift * taper

    const x = baseX + offsetX
    const y = baseY + progress * (1.15 + props.state.heat * 0.75) + Math.sin(seed * 2.3 + t * 2.1) * 0.04
    const z = baseZ + offsetZ

    const radius = (0.08 + (index % 4) * 0.014) * (0.72 + progress * 1.1)

    temp.position.set(x, y, z)
    temp.scale.set(radius, radius * 1.05, radius)
    temp.rotation.set(0, seed, 0)
    temp.updateMatrix()
    mesh.setMatrixAt(index, temp.matrix)

    colorScratch
      .set('#2f2b27')
      .lerp(new Color('#5a534a'), Math.min(1, progress * 0.65 + props.state.heat * 0.2))
    mesh.setColorAt(index, colorScratch)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const mat = mesh.material as MeshStandardMaterial
  mat.opacity = Math.min(0.72, opacity * (0.42 + props.state.heat * 0.5))
  mat.emissiveIntensity = 0.08 + props.state.heat * 0.18
}

function createSmokeMesh() {
  const next = new InstancedMesh(smokeGeometry, smokeMaterial, SMOKE_COUNT)
  next.instanceMatrix.setUsage(DynamicDrawUsage)
  next.frustumCulled = false
  smokeMesh.value = next
}

createSmokeMesh()

watchEffect(() => {
  updateSmokeLayer()
})

tryOnBeforeUnmount(() => {
  smokeMesh.value?.dispose()
  smokeGeometry.dispose()
  smokeMaterial.dispose()
  smokeMesh.value = null
})
</script>

<template>
  <primitive v-if="smokeMesh" :object="smokeMesh" />
</template>
