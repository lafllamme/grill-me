<script setup lang="ts">
import type { GrillHeatState } from '../../utils/grill-heat-state'
import type { FlameControls } from './types'
import { tryOnBeforeUnmount } from '@vueuse/core'
import { AdditiveBlending, Color, DynamicDrawUsage, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three'
import { shallowRef, watchEffect } from 'vue'

interface GrillSceneFireProps {
  elapsed: number
  state: GrillHeatState
  anchorOffset: { x: number, y: number, z: number }
  controls: FlameControls
}

const props = defineProps<GrillSceneFireProps>()

const BED_COUNT = 96
const BODY_COUNT = 62
const TIP_COUNT = 28
const EMBER_COUNT = 34

const bedMesh = shallowRef<InstancedMesh | null>(null)
const bodyMesh = shallowRef<InstancedMesh | null>(null)
const tipMesh = shallowRef<InstancedMesh | null>(null)
const emberMesh = shallowRef<InstancedMesh | null>(null)

const bedGeometry = new SphereGeometry(1, 6, 5)
const bodyGeometry = new SphereGeometry(1, 6, 5)
const tipGeometry = new SphereGeometry(1, 5, 4)
const emberGeometry = new SphereGeometry(1, 4, 3)

const bedMaterial = new MeshStandardMaterial({
  color: '#ff7f22',
  emissive: '#ff9f32',
  emissiveIntensity: 1,
  transparent: true,
  opacity: 0.84,
  roughness: 0.14,
  metalness: 0,
  blending: AdditiveBlending,
  depthWrite: false,
})

const bodyMaterial = new MeshStandardMaterial({
  color: '#ffad4f',
  emissive: '#ffbf66',
  emissiveIntensity: 1,
  transparent: true,
  opacity: 0.58,
  roughness: 0.12,
  metalness: 0,
  blending: AdditiveBlending,
  depthWrite: false,
})

const tipMaterial = new MeshStandardMaterial({
  color: '#ffc26f',
  emissive: '#ffd28f',
  emissiveIntensity: 1,
  transparent: true,
  opacity: 0.42,
  roughness: 0.1,
  metalness: 0,
  blending: AdditiveBlending,
  depthWrite: false,
})

const emberMaterial = new MeshStandardMaterial({
  color: '#ffb45c',
  emissive: '#ffca7a',
  emissiveIntensity: 1,
  transparent: true,
  opacity: 0.74,
  roughness: 0.08,
  metalness: 0,
  blending: AdditiveBlending,
  depthWrite: false,
})

const temp = new Object3D()
const colorScratch = new Color()

function createInstancedMeshes() {
  const bed = new InstancedMesh(bedGeometry, bedMaterial, BED_COUNT)
  const body = new InstancedMesh(bodyGeometry, bodyMaterial, BODY_COUNT)
  const tip = new InstancedMesh(tipGeometry, tipMaterial, TIP_COUNT)
  const ember = new InstancedMesh(emberGeometry, emberMaterial, EMBER_COUNT)

  bed.instanceMatrix.setUsage(DynamicDrawUsage)
  body.instanceMatrix.setUsage(DynamicDrawUsage)
  tip.instanceMatrix.setUsage(DynamicDrawUsage)
  ember.instanceMatrix.setUsage(DynamicDrawUsage)

  bed.frustumCulled = false
  body.frustumCulled = false
  tip.frustumCulled = false
  ember.frustumCulled = false

  bedMesh.value = bed
  bodyMesh.value = body
  tipMesh.value = tip
  emberMesh.value = ember
}

function setInstance(
  mesh: InstancedMesh,
  index: number,
  position: [number, number, number],
  scale: [number, number, number],
) {
  temp.position.set(position[0], position[1], position[2])
  temp.scale.set(scale[0], scale[1], scale[2])
  temp.rotation.set(0, 0, 0)
  temp.updateMatrix()
  mesh.setMatrixAt(index, temp.matrix)
}

function hideInstance(mesh: InstancedMesh, index: number) {
  setInstance(mesh, index, [999, 999, 999], [0.0001, 0.0001, 0.0001])
}

function updateBedLayer() {
  if (!bedMesh.value)
    return

  const mesh = bedMesh.value
  const density = Math.max(0.4, props.controls.baseDensity)
  const spread = Math.max(0.5, props.controls.spread)
  const flicker = Math.max(0.4, props.controls.flicker)
  const turbulence = Math.max(0.3, props.controls.bedTurbulence)
  const liveCount = Math.round(BED_COUNT * Math.min(1.15, density))

  for (let index = 0; index < BED_COUNT; index += 1) {
    if (index >= liveCount) {
      hideInstance(mesh, index)
      continue
    }

    const seed = index * 0.47
    const t = props.elapsed * (0.85 + (index % 7) * 0.08) * flicker
    const ring = Math.floor(index / 24)
    const angle = (index * 0.61) + seed
    const radius = (0.09 + ring * 0.06 + (Math.sin(seed * 1.1) * 0.03)) * spread

    const centerX = 0.57 + props.anchorOffset.x
    const centerZ = 0.01 + props.anchorOffset.z
    const swirlX = Math.cos(angle + t * 0.7) * radius
    const swirlZ = Math.sin(angle + t * 0.9) * radius

    const lift = (Math.sin(t * 2.2 + seed) * 0.014) * turbulence
    const x = centerX + swirlX
    const y = 1.88 + props.anchorOffset.y + lift
    const z = centerZ + swirlZ

    const pulse = 1 + Math.sin(t * 4.4 + seed * 1.7) * props.state.fire.flickerAmplitude * 1.8
    const size = (0.035 + (index % 4) * 0.01) * (0.95 + pulse * 0.32)

    setInstance(mesh, index, [x, y, z], [size, size * 0.9, size])

    const hot = Math.max(0.12, Math.min(1, 0.42 + Math.sin(seed * 2.8) * 0.3 + props.state.heat * 0.55))
    colorScratch.set('#ff8f2f').lerp(new Color('#ffe09f'), hot)
    mesh.setColorAt(index, colorScratch)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const mat = mesh.material as MeshStandardMaterial
  mat.emissive.set(props.state.fire.tipColor)
  mat.emissiveIntensity = props.state.fire.intensity * (0.46 + props.controls.baseDensity * 0.18)
  mat.opacity = Math.min(1, props.state.fire.opacity * props.controls.opacity * 0.9)
}

function updateBodyLayer() {
  if (!bodyMesh.value)
    return

  const mesh = bodyMesh.value
  const density = Math.max(0.4, props.controls.baseDensity)
  const spread = Math.max(0.5, props.controls.spread)
  const flicker = Math.max(0.4, props.controls.flicker)
  const taper = Math.max(0.2, Math.min(1, props.controls.verticalTaper))
  const height = Math.max(0.4, props.controls.height)

  const liveCount = Math.round(BODY_COUNT * Math.min(1, density * 0.92))

  for (let index = 0; index < BODY_COUNT; index += 1) {
    if (index >= liveCount) {
      hideInstance(mesh, index)
      continue
    }

    const seed = index * 0.59
    const t = props.elapsed * (1 + (index % 5) * 0.09) * flicker
    const progress = ((t * 0.24 + seed * 0.13) % 1)
    const densityCurve = (1 - progress) ** (taper * 1.8)

    const xSpread = (0.21 + (index % 3) * 0.04) * spread * densityCurve
    const zSpread = (0.16 + (index % 4) * 0.03) * spread * densityCurve

    const x = 0.57 + props.anchorOffset.x + Math.sin(seed * 2.1 + t * 1.5) * xSpread
    const y = 1.9 + props.anchorOffset.y + progress * (0.94 * height)
    const z = 0.01 + props.anchorOffset.z + Math.cos(seed * 1.7 + t * 1.2) * zSpread

    const pulse = 1 + Math.sin(t * 3.3 + seed) * props.state.fire.flickerAmplitude
    const size = (0.05 + (index % 3) * 0.015) * (0.8 + pulse * 0.35) * densityCurve

    setInstance(mesh, index, [x, y, z], [size, size * 1.12, size])

    colorScratch.set('#ffb056').lerp(new Color('#fff0b8'), Math.min(1, progress * 0.88 + 0.15))
    mesh.setColorAt(index, colorScratch)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const mat = mesh.material as MeshStandardMaterial
  mat.emissive.set(props.state.fire.tipColor)
  mat.emissiveIntensity = props.state.fire.intensity * 0.5
  mat.opacity = Math.min(0.9, props.state.fire.opacity * props.controls.opacity * 0.62)
}

function updateTipLayer() {
  if (!tipMesh.value)
    return

  const mesh = tipMesh.value
  const density = Math.max(0.4, props.controls.baseDensity)
  const spread = Math.max(0.5, props.controls.spread)
  const flicker = Math.max(0.4, props.controls.flicker)
  const taper = Math.max(0.2, Math.min(1, props.controls.verticalTaper))
  const height = Math.max(0.4, props.controls.height)

  const liveCount = Math.round(TIP_COUNT * Math.min(1, density * 0.72 * taper))

  for (let index = 0; index < TIP_COUNT; index += 1) {
    if (index >= liveCount) {
      hideInstance(mesh, index)
      continue
    }

    const seed = index * 0.83
    const t = props.elapsed * (0.72 + (index % 4) * 0.06) * flicker
    const progress = ((t * 0.18 + seed * 0.08) % 1)

    const x = 0.57 + props.anchorOffset.x + Math.sin(seed * 1.9 + t) * 0.28 * spread * (1 - progress)
    const y = 2.3 + props.anchorOffset.y + progress * (0.64 * height)
    const z = 0.01 + props.anchorOffset.z + Math.cos(seed * 2.3 + t * 0.8) * 0.2 * spread * (1 - progress)

    const size = (0.04 + (index % 3) * 0.012) * (0.72 + (1 - progress) * 0.45)
    setInstance(mesh, index, [x, y, z], [size, size * 1.05, size])

    colorScratch.set('#ffb969').lerp(new Color('#ffd08e'), progress * 0.7)
    mesh.setColorAt(index, colorScratch)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const mat = mesh.material as MeshStandardMaterial
  mat.emissive.set('#ffcc7a')
  mat.emissiveIntensity = props.state.fire.intensity * 0.34
  mat.opacity = Math.min(0.62, props.state.fire.opacity * props.controls.opacity * 0.42)
}

function updateEmbers() {
  if (!emberMesh.value)
    return

  const mesh = emberMesh.value
  const spread = Math.max(0.5, props.controls.spread)
  const flicker = Math.max(0.4, props.controls.flicker)
  const height = Math.max(0.4, props.controls.height)
  const emberRate = Math.max(0.2, props.controls.emberRate)
  const liveCount = Math.round(EMBER_COUNT * Math.min(1.2, emberRate) * 0.92)

  for (let index = 0; index < EMBER_COUNT; index += 1) {
    if (index >= liveCount) {
      hideInstance(mesh, index)
      continue
    }

    const seed = index * 0.67
    const t = props.elapsed * (0.6 + (index % 6) * 0.03) * flicker * emberRate
    const rise = (t + seed) % 1

    const x = 0.57 + props.anchorOffset.x + Math.sin(t * 2.1 + seed) * 0.24 * spread
    const y = 1.94 + props.anchorOffset.y + rise * (1.26 * height)
    const z = 0.01 + props.anchorOffset.z + Math.cos(t * 1.7 + seed * 0.9) * 0.2 * spread

    const size = (0.008 + (1 - rise) * 0.018) * (0.85 + (index % 4) * 0.08)
    setInstance(mesh, index, [x, y, z], [size, size, size])

    colorScratch.set('#ffae4f').lerp(new Color('#ffdba2'), 1 - rise)
    mesh.setColorAt(index, colorScratch)
  }

  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor)
    mesh.instanceColor.needsUpdate = true

  const mat = mesh.material as MeshStandardMaterial
  mat.emissive.set('#ffbe63')
  mat.emissiveIntensity = props.state.fire.intensity * 0.62
  mat.opacity = Math.min(0.92, props.state.fire.opacity * props.controls.opacity * 0.66)
}

createInstancedMeshes()

watchEffect(() => {
  if (!bedMesh.value || !bodyMesh.value || !tipMesh.value || !emberMesh.value)
    return

  updateBedLayer()
  updateBodyLayer()
  updateTipLayer()
  updateEmbers()
})

tryOnBeforeUnmount(() => {
  bedMesh.value?.dispose()
  bodyMesh.value?.dispose()
  tipMesh.value?.dispose()
  emberMesh.value?.dispose()

  bedMaterial.dispose()
  bodyMaterial.dispose()
  tipMaterial.dispose()
  emberMaterial.dispose()

  bedGeometry.dispose()
  bodyGeometry.dispose()
  tipGeometry.dispose()
  emberGeometry.dispose()

  bedMesh.value = null
  bodyMesh.value = null
  tipMesh.value = null
  emberMesh.value = null
})
</script>

<template>
  <primitive v-if="bedMesh" :object="bedMesh" />
  <primitive v-if="bodyMesh" :object="bodyMesh" />
  <primitive v-if="tipMesh" :object="tipMesh" />
  <primitive v-if="emberMesh" :object="emberMesh" />
</template>
