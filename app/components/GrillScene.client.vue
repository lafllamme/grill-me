<script setup lang="ts">
import type { Object3D } from 'three'
import { TresCanvas } from '@tresjs/core'
import { tryOnBeforeUnmount, useDevicePixelRatio, useLocalStorage, usePreferredReducedMotion, useRafFn } from '@vueuse/core'
import { Box3, Group, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { computed, shallowRef } from 'vue'
import { clampHeat, getGrillHeatState } from '../utils/grill-heat-state'
import GrillSceneOrbitControls from './GrillSceneOrbitControls'

interface GrillSceneProps {
  heightClass?: string
  initialHeat?: number
}

interface PositionedStagePart {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  phase?: number
}

interface AnchorOffset {
  x: number
  y: number
  z: number
}

interface CameraPlacement {
  x: number
  y: number
  z: number
}

const props = withDefaults(defineProps<GrillSceneProps>(), {
  heightClass: 'h-[20rem] sm:h-[24rem] lg:h-[30rem]',
  initialHeat: 0.38,
})

const heat = ref(clampHeat(props.initialHeat))
const elapsed = ref(0)
const prefersReducedMotion = usePreferredReducedMotion()
const grillModel = shallowRef<Object3D | null>(null)
const hasModelError = ref(false)
const cameraPosition: [number, number, number] = [0.46, 2.72, 10.4]
const controlsTarget: [number, number, number] = [0.48, 1.48, 0]
const modelUrl = new URL('../assets/models/grill/Barbeque.glb', import.meta.url).href

const coalChunks: PositionedStagePart[] = [
  { position: [0.22, 1.95, -0.18], scale: [0.24, 0.18, 0.22], phase: 0.1 },
  { position: [0.42, 1.92, 0], scale: [0.28, 0.18, 0.26], phase: 1.2 },
  { position: [0.64, 1.94, 0.18], scale: [0.26, 0.16, 0.24], phase: 2.1 },
  { position: [0.82, 1.9, -0.06], scale: [0.2, 0.14, 0.18], phase: 3.0 },
  { position: [0.98, 1.9, 0.28], scale: [0.16, 0.12, 0.16], phase: 3.6 },
]

const fireColumns: PositionedStagePart[] = [
  { position: [0.22, 1.96, -0.12], scale: [0.18, 0.46, 0.18], phase: 0.4 },
  { position: [0.44, 1.98, 0.08], scale: [0.22, 0.58, 0.22], phase: 1.4 },
  { position: [0.68, 1.96, 0.22], scale: [0.2, 0.5, 0.2], phase: 2.4 },
  { position: [0.86, 1.94, -0.02], scale: [0.16, 0.4, 0.16], phase: 3.1 },
]

const meatCuts: PositionedStagePart[] = [
  { position: [0.34, 2.16, -0.14], rotation: [0.02, -0.18, -0.06], scale: [0.72, 0.13, 0.48], phase: 0.5 },
  { position: [0.82, 2.14, 0.12], rotation: [-0.03, 0.22, 0.08], scale: [0.62, 0.13, 0.44], phase: 1.8 },
]

const grillMarkOffsets = [-0.18, -0.04, 0.1, 0.24] as const
const heatMarks = ['Low', 'Medium', 'High', 'Inferno'] as const
const placementAxes = ['x', 'y', 'z'] as const
const placementRange = {
  x: { min: -2.5, max: 2.5, step: 0.01 },
  y: { min: 0.5, max: 3.5, step: 0.01 },
  z: { min: -2.5, max: 2.5, step: 0.01 },
} as const
const defaultEmberOffset: AnchorOffset = {
  x: 0.38,
  y: 0.5,
  z: -0.49,
}
const defaultMeatOffset: AnchorOffset = {
  x: 0.34,
  y: 0.59,
  z: -0.37,
}
const cameraPlacementAxes = ['x', 'y', 'z'] as const
const cameraPlacementRange = {
  x: { min: -8, max: 8, step: 0.01 },
  y: { min: 0.1, max: 12, step: 0.01 },
  z: { min: -12, max: 14, step: 0.01 },
} as const
const cameraDistanceRange = {
  minDistance: { min: 0.2, max: 12, step: 0.01 },
  maxDistance: { min: 0.4, max: 24, step: 0.01 },
} as const
const cameraPolarRange = {
  minPolarAngle: { min: 0, max: 3.1, step: 0.01 },
  maxPolarAngle: { min: 0.1, max: 3.14, step: 0.01 },
} as const
const defaultCameraPosition: CameraPlacement = {
  x: cameraPosition[0],
  y: cameraPosition[1],
  z: cameraPosition[2],
}
const defaultCameraTarget: CameraPlacement = {
  x: controlsTarget[0],
  y: controlsTarget[1],
  z: controlsTarget[2],
}
const defaultCameraOrbit = {
  minDistance: 0.6,
  maxDistance: 18,
  minPolarAngle: 0.62,
  maxPolarAngle: 1.52,
}

const emberOffset = useLocalStorage<AnchorOffset>('grill-scene-ember-offset-v2', defaultEmberOffset)

const meatOffset = useLocalStorage<AnchorOffset>('grill-scene-meat-offset-v2', defaultMeatOffset)
const cameraPositionOffset = useLocalStorage<CameraPlacement>('grill-scene-camera-position-v1', defaultCameraPosition)
const cameraTargetOffset = useLocalStorage<CameraPlacement>('grill-scene-camera-target-v1', defaultCameraTarget)
const cameraOrbit = useLocalStorage<{
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
}>('grill-scene-camera-orbit-v1', defaultCameraOrbit)

const { pixelRatio } = useDevicePixelRatio()
const maxDpr = computed<[number, number]>(() => [1, Math.min(2, pixelRatio.value || 1)])
const sceneState = computed(() => getGrillHeatState(heat.value))
const heatPercent = computed(() => Math.round(heat.value * 100))
const fireLightPosition = computed<[number, number, number]>(() => [0.56, 2.18 + sceneState.value.fire.height * 0.1, 0.08])
const ambientIntensity = computed(() => 1 + sceneState.value.ambience.intensity * 0.18)
const hemisphereIntensity = computed(() => 1.12 + sceneState.value.ambience.intensity * 0.22)
const cameraPositionValues = computed<[number, number, number]>(() => [cameraPositionOffset.value.x, cameraPositionOffset.value.y, cameraPositionOffset.value.z])
const cameraTargetValues = computed<[number, number, number]>(() => [cameraTargetOffset.value.x, cameraTargetOffset.value.y, cameraTargetOffset.value.z])

watch(
  () => [cameraOrbit.value.minDistance, cameraOrbit.value.maxDistance],
  () => {
    const minDistance = cameraOrbit.value.minDistance
    const maxDistance = cameraOrbit.value.maxDistance
    if (maxDistance <= minDistance)
      cameraOrbit.value.maxDistance = minDistance + 0.2
  },
  { immediate: true },
)

watch(
  () => [cameraOrbit.value.minPolarAngle, cameraOrbit.value.maxPolarAngle],
  () => {
    const minPolarAngle = cameraOrbit.value.minPolarAngle
    const maxPolarAngle = cameraOrbit.value.maxPolarAngle
    if (maxPolarAngle <= minPolarAngle)
      cameraOrbit.value.maxPolarAngle = minPolarAngle + 0.05
  },
  { immediate: true },
)

/**
 * Loads the bundled grill shell and normalizes it into the landing scene so we
 * can keep all procedural heat, fire, and meat overlays on top of one stable body.
 */
async function loadGrillModel() {
  const loader = new GLTFLoader()

  try {
    const gltf = await loader.loadAsync(modelUrl)
    const root = gltf.scene

    root.traverse((child) => {
      const mesh = child as { isMesh?: boolean, castShadow?: boolean, receiveShadow?: boolean }
      if (!mesh.isMesh)
        return

      mesh.castShadow = true
      mesh.receiveShadow = true
    })

    const initialBox = new Box3().setFromObject(root)
    const initialSize = initialBox.getSize(new Vector3())
    const targetWidth = 5.75
    const scale = targetWidth / initialSize.x
    root.scale.setScalar(scale)

    const centeredBox = new Box3().setFromObject(root)
    const centeredCenter = centeredBox.getCenter(new Vector3())
    root.position.x -= centeredCenter.x
    root.position.y -= centeredCenter.y
    root.position.z -= centeredCenter.z

    const groundedBox = new Box3().setFromObject(root)
    root.position.y += -groundedBox.min.y - 0.18
    root.position.x += 0.22
    root.position.z += 0.04
    root.rotation.y = Math.PI * 0.04

    const container = new Group()
    container.add(root)
    grillModel.value = container
    hasModelError.value = false
  }
  catch {
    grillModel.value = null
    hasModelError.value = true
  }
}

/**
 * Applies a user-tuned offset to a base procedural anchor so overlays can be
 * aligned against the imported grill shell without recompiling the scene.
 */
function offsetPosition(base: [number, number, number], offset: AnchorOffset): [number, number, number] {
  return [base[0] + offset.x, base[1] + offset.y, base[2] + offset.z]
}

/**
 * Pulses ember geometry subtly so the coal bed feels alive at all heat levels.
 */
function coalScale(chunk: PositionedStagePart): [number, number, number] {
  const base = chunk.scale || [0.3, 0.24, 0.3]
  const pulse = 1 + Math.sin(elapsed.value * 3.1 + (chunk.phase || 0)) * sceneState.value.coals.pulse
  return [base[0] * pulse, base[1] * pulse, base[2] * pulse]
}

/**
 * Uses the derived fire state plus a time-based flicker to resize each flame shard.
 */
function fireScale(column: PositionedStagePart): [number, number, number] {
  const flicker = 1 + Math.sin(elapsed.value * 5.4 + (column.phase || 0)) * sceneState.value.fire.flickerAmplitude
  const height = sceneState.value.fire.height * (column.scale?.[1] || 1) * flicker
  return [
    (column.scale?.[0] || 0.26) * flicker,
    Math.max(0.01, height),
    (column.scale?.[2] || 0.26) * flicker,
  ]
}

/**
 * Anchors flame shards to the coal bed while allowing height to grow with heat.
 */
function firePosition(column: PositionedStagePart): [number, number, number] {
  const height = fireScale(column)[1]
  return offsetPosition([column.position[0], 1.9 + height * 0.5, column.position[2]], emberOffset.value)
}

/**
 * Adds a tiny idle wobble to keep the meat from reading as dead static geometry.
 */
function meatPosition(cut: PositionedStagePart): [number, number, number] {
  const wobble = prefersReducedMotion.value
    ? 0
    : Math.sin(elapsed.value * 2.4 + (cut.phase || 0)) * sceneState.value.meat.wobble
  return offsetPosition([cut.position[0], cut.position[1] + wobble, cut.position[2]], meatOffset.value)
}

/**
 * Expands a scalar grill-mark offset into the tuple shape Tres expects.
 */
function grillMarkPosition(mark: number): [number, number, number] {
  return [mark, 0.11, 0]
}

/**
 * Formats the active placement offset so final anchor values can be copied
 * back into code once the scene has been dialed in.
 */
function formatOffset(offset: AnchorOffset): string {
  return `${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}, ${offset.z.toFixed(2)}`
}

useRafFn(({ delta }) => {
  if (prefersReducedMotion.value)
    return

  elapsed.value += delta / 1000
})

loadGrillModel()

tryOnBeforeUnmount(() => {
  grillModel.value = null
})
</script>

<template>
  <div
    class="border border-divider/70 rounded-[1.75rem] shadow-[0_32px_120px_-48px_rgba(0,0,0,0.75)] relative overflow-hidden from-surface-container-low to-surface-container-lowest via-surface-container bg-gradient-to-br"
    :class="props.heightClass"
  >
    <div class="inset-0 absolute from-primary/8 to-primary-container/10 via-transparent bg-gradient-to-br" />
    <div class="rounded-full bg-black/35 h-12 inset-x-10 bottom-7 absolute blur-2xl" />

    <TresCanvas
      :dpr="maxDpr"
      alpha
      class="h-full w-full relative z-10"
    >
      <TresPerspectiveCamera
        :position="cameraPositionValues"
        :fov="30"
        :near="0.1"
        :far="100"
      />
      <GrillSceneOrbitControls
        :target="cameraTargetValues"
        :min-distance="cameraOrbit.minDistance"
        :max-distance="cameraOrbit.maxDistance"
        :min-polar-angle="cameraOrbit.minPolarAngle"
        :max-polar-angle="cameraOrbit.maxPolarAngle"
      />
      <TresAmbientLight :intensity="ambientIntensity" />
      <TresHemisphereLight :intensity="hemisphereIntensity" :position="[0, 8, 0]" />
      <TresDirectionalLight :intensity="1.85" :position="[7, 9, 6]" />
      <TresDirectionalLight :intensity="0.72" :position="[-4, 3, -2]" />
      <TresPointLight
        :color="sceneState.fire.tipColor"
        :intensity="sceneState.fire.intensity"
        :distance="10"
        :position="fireLightPosition"
      />

      <TresGroup>
        <TresMesh :position="[0, -0.22, 0]" :receive-shadow="true">
          <TresCylinderGeometry :args="[3.7, 4.05, 0.38, 10]" />
          <TresMeshStandardMaterial color="#1A1514" :roughness="0.95" :metalness="0.05" />
        </TresMesh>

        <primitive v-if="grillModel" :object="grillModel" />

        <TresMesh v-for="chunk in coalChunks" :key="`coal-${chunk.position.join('-')}`" :position="offsetPosition(chunk.position, emberOffset)" :scale="coalScale(chunk)" :cast-shadow="true">
          <TresDodecahedronGeometry :args="[0.44, 0]" />
          <TresMeshStandardMaterial
            :color="sceneState.coals.color"
            :emissive="sceneState.coals.emissive"
            :emissive-intensity="sceneState.coals.emissiveIntensity"
            :roughness="0.9"
            :metalness="0"
          />
        </TresMesh>

        <TresMesh v-for="column in fireColumns" :key="`fire-${column.position.join('-')}`" :position="firePosition(column)" :scale="fireScale(column)">
          <TresOctahedronGeometry :args="[0.44, 0]" />
          <TresMeshStandardMaterial
            :color="sceneState.fire.color"
            :emissive="sceneState.fire.tipColor"
            :emissive-intensity="sceneState.fire.intensity * 0.35"
            :opacity="sceneState.fire.opacity"
            :transparent="true"
            :roughness="0.32"
            :metalness="0"
          />
        </TresMesh>

        <TresGroup v-for="cut in meatCuts" :key="`meat-${cut.position.join('-')}`" :position="meatPosition(cut)" :rotation="cut.rotation">
          <TresMesh :scale="cut.scale" :cast-shadow="true" :receive-shadow="true">
            <TresBoxGeometry :args="[1, 1, 1]" />
            <TresMeshStandardMaterial
              :color="sceneState.meat.color"
              :roughness="sceneState.meat.roughness"
              :metalness="sceneState.meat.metalness"
            />
          </TresMesh>
          <TresMesh
            v-for="mark in grillMarkOffsets"
            :key="`mark-${mark}`"
            :position="grillMarkPosition(mark)"
            :rotation="[0, 0, 0.24]"
            :scale="[0.08, 0.03, cut.scale?.[2] ? cut.scale[2] * 0.72 : 0.5]"
          >
            <TresBoxGeometry :args="[1, 1, 1]" />
            <TresMeshStandardMaterial
              color="#130A09"
              :opacity="sceneState.meat.grillMarkOpacity"
              :transparent="true"
              :roughness="0.98"
            />
          </TresMesh>
        </TresGroup>
      </TresGroup>
    </TresCanvas>

    <div class="px-3 py-1.5 border border-divider/60 rounded-full bg-black/30 flex gap-2 pointer-events-none items-center left-5 top-5 absolute z-20 backdrop-blur-md">
      <span class="rounded-full bg-primary h-2 w-2" />
      <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
        Hybrid grill shell + live browning
      </span>
    </div>

    <div class="px-4 py-3 overscroll-contain border border-divider/60 rounded-[1.25rem] bg-black/32 flex flex-col gap-3 max-h-[calc(100%-2.5rem)] min-w-[14rem] right-5 top-5 absolute z-20 overflow-y-auto backdrop-blur-md">
      <div class="flex gap-3 items-center justify-between">
        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Heat state
          </p>
          <p class="text-sm text-on-surface font-display uppercase">
            {{ sceneState.labels.primary }}
          </p>
        </div>
        <p class="text-xs text-primary tracking-[0.16em] font-mono uppercase">
          {{ heatPercent }}%
        </p>
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="grill-heat-slider">
          Fire control
        </label>
        <input
          id="grill-heat-slider"
          v-model.number="heat"
          class="mt-2 accent-primary w-full"
          max="1"
          min="0"
          step="0.01"
          type="range"
        >
      </div>

      <div class="text-[10px] text-on-surface-variant/80 tracking-[0.14em] font-mono gap-2 grid grid-cols-4 uppercase">
        <span v-for="label in heatMarks" :key="label">{{ label }}</span>
      </div>

      <p class="text-xs text-on-surface-variant font-body">
        {{ sceneState.labels.secondary }}. Orbit and zoom stay enabled.
      </p>

      <p v-if="hasModelError" class="text-xs text-primary font-body">
        Grill shell failed to mount. The procedural overlays are still active.
      </p>

      <div class="pt-3 border-t border-divider/50 space-y-3">
        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Camera position
          </p>
          <p class="text-[11px] text-primary font-mono mt-1">
            {{ formatOffset(cameraPositionOffset) }}
          </p>
        </div>

        <div v-for="axis in cameraPlacementAxes" :key="`camera-position-${axis}`">
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`camera-position-${axis}`">
            Camera {{ axis }}
          </label>
          <input
            :id="`camera-position-${axis}`"
            v-model.number="cameraPositionOffset[axis]"
            class="mt-2 accent-primary w-full"
            :max="cameraPlacementRange[axis].max"
            :min="cameraPlacementRange[axis].min"
            :step="cameraPlacementRange[axis].step"
            type="range"
          >
        </div>

        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Camera target
          </p>
          <p class="text-[11px] text-primary font-mono mt-1">
            {{ formatOffset(cameraTargetOffset) }}
          </p>
        </div>

        <div v-for="axis in cameraPlacementAxes" :key="`camera-target-${axis}`">
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`camera-target-${axis}`">
            Target {{ axis }}
          </label>
          <input
            :id="`camera-target-${axis}`"
            v-model.number="cameraTargetOffset[axis]"
            class="mt-2 accent-primary w-full"
            :max="cameraPlacementRange[axis].max"
            :min="cameraPlacementRange[axis].min"
            :step="cameraPlacementRange[axis].step"
            type="range"
          >
        </div>

        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Orbit limits
          </p>
        </div>

        <div>
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="camera-min-distance">
            Min distance
          </label>
          <input
            id="camera-min-distance"
            v-model.number="cameraOrbit.minDistance"
            class="mt-2 accent-primary w-full"
            :max="cameraDistanceRange.minDistance.max"
            :min="cameraDistanceRange.minDistance.min"
            :step="cameraDistanceRange.minDistance.step"
            type="range"
          >
        </div>

        <div>
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="camera-max-distance">
            Max distance
          </label>
          <input
            id="camera-max-distance"
            v-model.number="cameraOrbit.maxDistance"
            class="mt-2 accent-primary w-full"
            :max="cameraDistanceRange.maxDistance.max"
            :min="cameraDistanceRange.maxDistance.min"
            :step="cameraDistanceRange.maxDistance.step"
            type="range"
          >
        </div>

        <div>
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="camera-min-polar-angle">
            Min polar
          </label>
          <input
            id="camera-min-polar-angle"
            v-model.number="cameraOrbit.minPolarAngle"
            class="mt-2 accent-primary w-full"
            :max="cameraPolarRange.minPolarAngle.max"
            :min="cameraPolarRange.minPolarAngle.min"
            :step="cameraPolarRange.minPolarAngle.step"
            type="range"
          >
        </div>

        <div>
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="camera-max-polar-angle">
            Max polar
          </label>
          <input
            id="camera-max-polar-angle"
            v-model.number="cameraOrbit.maxPolarAngle"
            class="mt-2 accent-primary w-full"
            :max="cameraPolarRange.maxPolarAngle.max"
            :min="cameraPolarRange.maxPolarAngle.min"
            :step="cameraPolarRange.maxPolarAngle.step"
            type="range"
          >
        </div>

        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Ember anchor
          </p>
          <p class="text-[11px] text-primary font-mono mt-1">
            {{ formatOffset(emberOffset) }}
          </p>
        </div>

        <div v-for="axis in placementAxes" :key="`ember-${axis}`">
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`ember-offset-${axis}`">
            Ember {{ axis }}
          </label>
          <input
            :id="`ember-offset-${axis}`"
            v-model.number="emberOffset[axis]"
            class="mt-2 accent-primary w-full"
            :max="placementRange[axis].max"
            :min="placementRange[axis].min"
            :step="placementRange[axis].step"
            type="range"
          >
        </div>

        <div>
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
            Meat anchor
          </p>
          <p class="text-[11px] text-primary font-mono mt-1">
            {{ formatOffset(meatOffset) }}
          </p>
        </div>

        <div v-for="axis in placementAxes" :key="`meat-${axis}`">
          <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`meat-offset-${axis}`">
            Meat {{ axis }}
          </label>
          <input
            :id="`meat-offset-${axis}`"
            v-model.number="meatOffset[axis]"
            class="mt-2 accent-primary w-full"
            :max="placementRange[axis].max"
            :min="placementRange[axis].min"
            :step="placementRange[axis].step"
            type="range"
          >
        </div>
      </div>
    </div>
  </div>
</template>
