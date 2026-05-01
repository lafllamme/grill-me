<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { useDevicePixelRatio, useRafFn } from '@vueuse/core'
import { computed } from 'vue'
import { clampHeat, getGrillHeatState } from '../utils/grill-heat-state'
import GrillSceneOrbitControls from './GrillSceneOrbitControls'

interface GrillSceneProps {
  heightClass?: string
  initialHeat?: number
}

/**
 * Minimal descriptor for repeated stage parts that only differ in transform
 * and animation phase.
 */
interface PositionedStagePart {
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  phase?: number
}

const props = withDefaults(defineProps<GrillSceneProps>(), {
  heightClass: 'h-[20rem] sm:h-[24rem] lg:h-[30rem]',
  initialHeat: 0.38,
})

const heat = ref(clampHeat(props.initialHeat))
const elapsed = ref(0)
const cameraPosition: [number, number, number] = [0, 3.35, 8.75]
const controlsTarget: [number, number, number] = [0, 1.35, 0]

const grateBars = Array.from({ length: 7 }, (_, index) => ({
  position: [-1.44 + index * 0.48, 1.72, 0] as [number, number, number],
  scale: [0.12, 0.06, 2.08] as [number, number, number],
}))

const coalChunks: PositionedStagePart[] = [
  { position: [-1.1, 1.12, -0.54], scale: [0.32, 0.28, 0.34], phase: 0.1 },
  { position: [-0.48, 1.08, 0.12], scale: [0.38, 0.26, 0.32], phase: 1.4 },
  { position: [0.18, 1.1, -0.18], scale: [0.34, 0.24, 0.36], phase: 2.1 },
  { position: [0.88, 1.1, 0.44], scale: [0.3, 0.25, 0.3], phase: 2.9 },
  { position: [1.28, 1.07, -0.22], scale: [0.28, 0.22, 0.28], phase: 3.5 },
  { position: [0.04, 1.06, 0.74], scale: [0.34, 0.22, 0.28], phase: 4.2 },
]

const fireColumns: PositionedStagePart[] = [
  { position: [-0.92, 1.14, -0.2], scale: [0.36, 1, 0.36], phase: 0.4 },
  { position: [-0.36, 1.16, 0.22], scale: [0.42, 1.12, 0.42], phase: 1.2 },
  { position: [0.24, 1.13, -0.08], scale: [0.34, 0.92, 0.34], phase: 2.5 },
  { position: [0.86, 1.15, 0.18], scale: [0.38, 1.08, 0.38], phase: 3.1 },
]

const meatCuts: PositionedStagePart[] = [
  { position: [-0.66, 1.86, -0.12], rotation: [0.02, -0.18, -0.06], scale: [1.04, 0.18, 0.76], phase: 0.5 },
  { position: [0.72, 1.84, 0.24], rotation: [-0.03, 0.26, 0.08], scale: [0.9, 0.16, 0.68], phase: 1.8 },
]

const grillMarkOffsets = [-0.24, -0.08, 0.08, 0.24] as const
const heatMarks = ['Low', 'Medium', 'High', 'Inferno'] as const

const { pixelRatio } = useDevicePixelRatio()
const maxDpr = computed<[number, number]>(() => [1, Math.min(2, pixelRatio.value || 1)])
const sceneState = computed(() => getGrillHeatState(heat.value))
const heatPercent = computed(() => Math.round(heat.value * 100))
const fireLightPosition = computed<[number, number, number]>(() => [0, 1.35 + sceneState.value.fire.height * 0.2, 0])
const ambientIntensity = computed(() => 1 + sceneState.value.ambience.intensity * 0.22)
const hemisphereIntensity = computed(() => 1.2 + sceneState.value.ambience.intensity * 0.28)

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
    (column.scale?.[0] || 0.34) * flicker,
    Math.max(0.01, height),
    (column.scale?.[2] || 0.34) * flicker,
  ]
}

/**
 * Anchors flame shards to the coal bed while allowing height to grow with heat.
 */
function firePosition(column: PositionedStagePart): [number, number, number] {
  const height = fireScale(column)[1]
  return [column.position[0], 1.12 + height * 0.5, column.position[2]]
}

/**
 * Adds a tiny idle wobble to keep the meat from reading as dead static geometry.
 */
function meatPosition(cut: PositionedStagePart): [number, number, number] {
  const wobble = Math.sin(elapsed.value * 2.4 + (cut.phase || 0)) * sceneState.value.meat.wobble
  return [cut.position[0], cut.position[1] + wobble, cut.position[2]]
}

/**
 * Expands a scalar grill-mark offset into the tuple shape Tres expects.
 */
function grillMarkPosition(mark: number): [number, number, number] {
  return [mark, 0.11, 0]
}

useRafFn(({ delta }) => {
  elapsed.value += delta / 1000
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
        :position="cameraPosition"
        :fov="30"
        :near="0.1"
        :far="100"
      />
      <GrillSceneOrbitControls :target="controlsTarget" />
      <TresAmbientLight :intensity="ambientIntensity" />
      <TresHemisphereLight :intensity="hemisphereIntensity" :position="[0, 8, 0]" />
      <TresDirectionalLight :intensity="1.85" :position="[7, 9, 6]" />
      <TresDirectionalLight :intensity="0.72" :position="[-4, 3, -2]" />
      <TresPointLight
        :color="sceneState.fire.tipColor"
        :intensity="sceneState.fire.intensity"
        :distance="11"
        :position="fireLightPosition"
      />

      <TresGroup>
        <TresMesh :position="[0, -0.2, 0]" :receive-shadow="true">
          <TresCylinderGeometry :args="[3.55, 3.95, 0.4, 10]" />
          <TresMeshStandardMaterial color="#1A1514" :roughness="0.95" :metalness="0.05" />
        </TresMesh>

        <TresMesh :position="[0, 1.08, 0]" :cast-shadow="true" :receive-shadow="true">
          <TresCylinderGeometry :args="[2.15, 2.3, 1.06, 8]" />
          <TresMeshStandardMaterial color="#2F3338" :roughness="0.72" :metalness="0.34" />
        </TresMesh>

        <TresMesh :position="[0, 1.86, -1.02]" :rotation="[-0.68, 0, 0]" :cast-shadow="true">
          <TresBoxGeometry :args="[3.25, 1.04, 0.18]" />
          <TresMeshStandardMaterial color="#40464D" :roughness="0.6" :metalness="0.28" />
        </TresMesh>

        <TresMesh :position="[-1.55, 0.42, -0.92]" :rotation="[0.08, 0, 0.02]" :cast-shadow="true">
          <TresCylinderGeometry :args="[0.08, 0.08, 1.4, 6]" />
          <TresMeshStandardMaterial color="#2E3136" :roughness="0.78" :metalness="0.2" />
        </TresMesh>
        <TresMesh :position="[1.55, 0.42, -0.92]" :rotation="[-0.08, 0, -0.02]" :cast-shadow="true">
          <TresCylinderGeometry :args="[0.08, 0.08, 1.4, 6]" />
          <TresMeshStandardMaterial color="#2E3136" :roughness="0.78" :metalness="0.2" />
        </TresMesh>
        <TresMesh :position="[-1.55, 0.42, 0.92]" :rotation="[-0.08, 0, 0.02]" :cast-shadow="true">
          <TresCylinderGeometry :args="[0.08, 0.08, 1.4, 6]" />
          <TresMeshStandardMaterial color="#2E3136" :roughness="0.78" :metalness="0.2" />
        </TresMesh>
        <TresMesh :position="[1.55, 0.42, 0.92]" :rotation="[0.08, 0, -0.02]" :cast-shadow="true">
          <TresCylinderGeometry :args="[0.08, 0.08, 1.4, 6]" />
          <TresMeshStandardMaterial color="#2E3136" :roughness="0.78" :metalness="0.2" />
        </TresMesh>

        <TresMesh :position="[0, 1.56, 0]" :receive-shadow="true">
          <TresBoxGeometry :args="[3.18, 0.12, 2.3]" />
          <TresMeshStandardMaterial color="#1E2327" :roughness="0.84" :metalness="0.08" />
        </TresMesh>

        <TresMesh v-for="bar in grateBars" :key="`bar-${bar.position[0]}`" :position="bar.position" :scale="bar.scale" :cast-shadow="true" :receive-shadow="true">
          <TresBoxGeometry :args="[1, 1, 1]" />
          <TresMeshStandardMaterial color="#7C848A" :roughness="0.48" :metalness="0.9" />
        </TresMesh>

        <TresMesh v-for="chunk in coalChunks" :key="`coal-${chunk.position.join('-')}`" :position="chunk.position" :scale="coalScale(chunk)" :cast-shadow="true">
          <TresDodecahedronGeometry :args="[0.58, 0]" />
          <TresMeshStandardMaterial
            :color="sceneState.coals.color"
            :emissive="sceneState.coals.emissive"
            :emissive-intensity="sceneState.coals.emissiveIntensity"
            :roughness="0.9"
            :metalness="0"
          />
        </TresMesh>

        <TresMesh v-for="column in fireColumns" :key="`fire-${column.position.join('-')}`" :position="firePosition(column)" :scale="fireScale(column)">
          <TresOctahedronGeometry :args="[0.52, 0]" />
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
        Procedural low-poly grill + live browning
      </span>
    </div>

    <div class="px-4 py-3 border border-divider/60 rounded-[1.25rem] bg-black/32 flex flex-col gap-3 min-w-[14rem] right-5 top-5 absolute z-20 backdrop-blur-md">
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
    </div>
  </div>
</template>
