<script setup lang="ts">
import type { GrillHeatState } from '../../utils/grill-heat-state'
import type { AnchorOffset, BurnControls, FlameControls, FuelControls, MeatAdjustmentMap, SmokeControls } from './types'

interface CameraPlacement {
  x: number
  y: number
  z: number
}

interface CameraOrbit {
  minDistance: number
  maxDistance: number
  minPolarAngle: number
  maxPolarAngle: number
}

const props = defineProps<{
  sceneState: GrillHeatState
  heatPercent: number
  hasModelError: boolean
}>()

const heat = defineModel<number>('heat', { required: true })
const emberOffset = defineModel<AnchorOffset>('emberOffset', { required: true })
const meatOffset = defineModel<AnchorOffset>('meatOffset', { required: true })
const cameraPositionOffset = defineModel<CameraPlacement>('cameraPositionOffset', { required: true })
const cameraTargetOffset = defineModel<CameraPlacement>('cameraTargetOffset', { required: true })
const cameraOrbit = defineModel<CameraOrbit>('cameraOrbit', { required: true })
const meatAdjustments = defineModel<MeatAdjustmentMap>('meatAdjustments', { required: true })
const fuelControls = defineModel<FuelControls>('fuelControls', { required: true })
const flameControls = defineModel<FlameControls>('flameControls', { required: true })
const burnControls = defineModel<BurnControls>('burnControls', { required: true })
const smokeControls = defineModel<SmokeControls>('smokeControls', { required: true })

const heatMarks = ['Low', 'Medium', 'High', 'Inferno'] as const
const placementAxes = ['x', 'y', 'z'] as const
const cameraPlacementAxes = ['x', 'y', 'z'] as const
const meatIds = ['sausage', 'steak', 'bacon'] as const

const placementRange = {
  x: { min: -2.5, max: 2.5, step: 0.01 },
  y: { min: 0.5, max: 3.5, step: 0.01 },
  z: { min: -2.5, max: 2.5, step: 0.01 },
} as const

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

const meatRange = {
  x: { min: -2, max: 2, step: 0.01 },
  y: { min: -1, max: 1, step: 0.01 },
  z: { min: -2, max: 2, step: 0.01 },
  scale: { min: 0.4, max: 2.4, step: 0.01 },
  rotationY: { min: -3.14, max: 3.14, step: 0.01 },
} as const

const fuelRange = {
  glowIntensity: { min: 0.4, max: 4, step: 0.01 },
  pulseSpeed: { min: 0.2, max: 3, step: 0.01 },
  coalDensity: { min: 0.4, max: 2, step: 0.01 },
  coalBlackness: { min: 0.4, max: 1, step: 0.01 },
  hotspotVariance: { min: 0.1, max: 1.4, step: 0.01 },
  coalCount: { min: 0.4, max: 2.2, step: 0.01 },
} as const

const flameRange = {
  height: { min: 0.4, max: 2.4, step: 0.01 },
  spread: { min: 0.5, max: 2.2, step: 0.01 },
  opacity: { min: 0.1, max: 1.4, step: 0.01 },
  flicker: { min: 0.4, max: 2.8, step: 0.01 },
  baseDensity: { min: 0.4, max: 2.6, step: 0.01 },
  verticalTaper: { min: 0.2, max: 1, step: 0.01 },
  emberRate: { min: 0.2, max: 2.8, step: 0.01 },
  bedTurbulence: { min: 0.3, max: 2.2, step: 0.01 },
} as const

const burnRange = {
  charStrength: { min: 0, max: 1.5, step: 0.01 },
  charThreshold: { min: 0, max: 0.95, step: 0.01 },
} as const

const smokeRange = {
  density: { min: 0.2, max: 2.2, step: 0.01 },
  rise: { min: 0.2, max: 2.4, step: 0.01 },
  drift: { min: 0.2, max: 2.2, step: 0.01 },
  opacity: { min: 0.05, max: 1, step: 0.01 },
  softness: { min: 0.2, max: 1.8, step: 0.01 },
} as const

function formatOffset(offset: AnchorOffset | CameraPlacement): string {
  return `${offset.x.toFixed(2)}, ${offset.y.toFixed(2)}, ${offset.z.toFixed(2)}`
}

function formatMeatTuning(id: (typeof meatIds)[number]): string {
  const tuning = meatAdjustments.value[id]
  return `p(${tuning.x.toFixed(2)}, ${tuning.y.toFixed(2)}, ${tuning.z.toFixed(2)}) s(${tuning.scale.toFixed(2)}) rY(${tuning.rotationY.toFixed(2)})`
}
</script>

<template>
  <div class="px-4 py-3 overscroll-contain border border-divider/60 rounded-[1.25rem] bg-black/32 flex flex-col gap-3 max-h-[calc(100%-2.5rem)] min-w-[14rem] right-5 top-5 absolute z-20 overflow-y-auto backdrop-blur-md">
    <div class="flex gap-3 items-center justify-between">
      <div>
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Heat state
        </p>
        <p class="text-sm text-on-surface font-display uppercase">
          {{ props.sceneState.labels.primary }}
        </p>
      </div>
      <p class="text-xs text-primary tracking-[0.16em] font-mono uppercase">
        {{ props.heatPercent }}%
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
      {{ props.sceneState.labels.secondary }}. Orbit and zoom stay enabled.
    </p>

    <p v-if="props.hasModelError" class="text-xs text-primary font-body">
      Grill shell failed to mount. The procedural overlays are still active.
    </p>

    <div class="pt-3 border-t border-divider/50 space-y-3">
      <div>
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Fuel controls
        </p>
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-glow-intensity">
          Glow intensity
        </label>
        <input
          id="fuel-glow-intensity"
          v-model.number="fuelControls.glowIntensity"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.glowIntensity.max"
          :min="fuelRange.glowIntensity.min"
          :step="fuelRange.glowIntensity.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-pulse-speed">
          Pulse speed
        </label>
        <input
          id="fuel-pulse-speed"
          v-model.number="fuelControls.pulseSpeed"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.pulseSpeed.max"
          :min="fuelRange.pulseSpeed.min"
          :step="fuelRange.pulseSpeed.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-coal-density">
          Coal density
        </label>
        <input
          id="fuel-coal-density"
          v-model.number="fuelControls.coalDensity"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.coalDensity.max"
          :min="fuelRange.coalDensity.min"
          :step="fuelRange.coalDensity.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-coal-blackness">
          Coal blackness
        </label>
        <input
          id="fuel-coal-blackness"
          v-model.number="fuelControls.coalBlackness"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.coalBlackness.max"
          :min="fuelRange.coalBlackness.min"
          :step="fuelRange.coalBlackness.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-hotspot-variance">
          Hotspot variance
        </label>
        <input
          id="fuel-hotspot-variance"
          v-model.number="fuelControls.hotspotVariance"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.hotspotVariance.max"
          :min="fuelRange.hotspotVariance.min"
          :step="fuelRange.hotspotVariance.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="fuel-coal-count">
          Coal count
        </label>
        <input
          id="fuel-coal-count"
          v-model.number="fuelControls.coalCount"
          class="mt-2 accent-primary w-full"
          :max="fuelRange.coalCount.max"
          :min="fuelRange.coalCount.min"
          :step="fuelRange.coalCount.step"
          type="range"
        >
      </div>

      <div>
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Flame controls
        </p>
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-height">
          Flame height
        </label>
        <input
          id="flame-height"
          v-model.number="flameControls.height"
          class="mt-2 accent-primary w-full"
          :max="flameRange.height.max"
          :min="flameRange.height.min"
          :step="flameRange.height.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-spread">
          Flame spread
        </label>
        <input
          id="flame-spread"
          v-model.number="flameControls.spread"
          class="mt-2 accent-primary w-full"
          :max="flameRange.spread.max"
          :min="flameRange.spread.min"
          :step="flameRange.spread.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-opacity">
          Flame opacity
        </label>
        <input
          id="flame-opacity"
          v-model.number="flameControls.opacity"
          class="mt-2 accent-primary w-full"
          :max="flameRange.opacity.max"
          :min="flameRange.opacity.min"
          :step="flameRange.opacity.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-flicker">
          Flame flicker
        </label>
        <input
          id="flame-flicker"
          v-model.number="flameControls.flicker"
          class="mt-2 accent-primary w-full"
          :max="flameRange.flicker.max"
          :min="flameRange.flicker.min"
          :step="flameRange.flicker.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-base-density">
          Base density
        </label>
        <input
          id="flame-base-density"
          v-model.number="flameControls.baseDensity"
          class="mt-2 accent-primary w-full"
          :max="flameRange.baseDensity.max"
          :min="flameRange.baseDensity.min"
          :step="flameRange.baseDensity.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-vertical-taper">
          Vertical taper
        </label>
        <input
          id="flame-vertical-taper"
          v-model.number="flameControls.verticalTaper"
          class="mt-2 accent-primary w-full"
          :max="flameRange.verticalTaper.max"
          :min="flameRange.verticalTaper.min"
          :step="flameRange.verticalTaper.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-ember-rate">
          Ember rate
        </label>
        <input
          id="flame-ember-rate"
          v-model.number="flameControls.emberRate"
          class="mt-2 accent-primary w-full"
          :max="flameRange.emberRate.max"
          :min="flameRange.emberRate.min"
          :step="flameRange.emberRate.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="flame-bed-turbulence">
          Bed turbulence
        </label>
        <input
          id="flame-bed-turbulence"
          v-model.number="flameControls.bedTurbulence"
          class="mt-2 accent-primary w-full"
          :max="flameRange.bedTurbulence.max"
          :min="flameRange.bedTurbulence.min"
          :step="flameRange.bedTurbulence.step"
          type="range"
        >
      </div>

      <div>
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Burn controls
        </p>
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="burn-char-strength">
          Char strength
        </label>
        <input
          id="burn-char-strength"
          v-model.number="burnControls.charStrength"
          class="mt-2 accent-primary w-full"
          :max="burnRange.charStrength.max"
          :min="burnRange.charStrength.min"
          :step="burnRange.charStrength.step"
          type="range"
        >
      </div>

      <div>
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Smoke controls
        </p>
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="smoke-density">
          Smoke density
        </label>
        <input
          id="smoke-density"
          v-model.number="smokeControls.density"
          class="mt-2 accent-primary w-full"
          :max="smokeRange.density.max"
          :min="smokeRange.density.min"
          :step="smokeRange.density.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="smoke-rise">
          Smoke rise
        </label>
        <input
          id="smoke-rise"
          v-model.number="smokeControls.rise"
          class="mt-2 accent-primary w-full"
          :max="smokeRange.rise.max"
          :min="smokeRange.rise.min"
          :step="smokeRange.rise.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="smoke-drift">
          Smoke drift
        </label>
        <input
          id="smoke-drift"
          v-model.number="smokeControls.drift"
          class="mt-2 accent-primary w-full"
          :max="smokeRange.drift.max"
          :min="smokeRange.drift.min"
          :step="smokeRange.drift.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="smoke-opacity">
          Smoke opacity
        </label>
        <input
          id="smoke-opacity"
          v-model.number="smokeControls.opacity"
          class="mt-2 accent-primary w-full"
          :max="smokeRange.opacity.max"
          :min="smokeRange.opacity.min"
          :step="smokeRange.opacity.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="smoke-softness">
          Smoke softness
        </label>
        <input
          id="smoke-softness"
          v-model.number="smokeControls.softness"
          class="mt-2 accent-primary w-full"
          :max="smokeRange.softness.max"
          :min="smokeRange.softness.min"
          :step="smokeRange.softness.step"
          type="range"
        >
      </div>

      <div>
        <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" for="burn-char-threshold">
          Char threshold
        </label>
        <input
          id="burn-char-threshold"
          v-model.number="burnControls.charThreshold"
          class="mt-2 accent-primary w-full"
          :max="burnRange.charThreshold.max"
          :min="burnRange.charThreshold.min"
          :step="burnRange.charThreshold.step"
          type="range"
        >
      </div>

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

      <div class="pt-3 border-t border-divider/50 space-y-3">
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase">
          Meat model tuning
        </p>

        <div v-for="id in meatIds" :key="id" class="pt-2 border-t border-divider/30 space-y-2">
          <p class="text-[10px] text-primary tracking-[0.16em] font-mono uppercase">
            {{ id }}
          </p>
          <p class="text-[11px] text-primary font-mono">
            {{ formatMeatTuning(id) }}
          </p>

          <div v-for="axis in placementAxes" :key="`${id}-pos-${axis}`">
            <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`${id}-pos-${axis}`">
              {{ id }} {{ axis }}
            </label>
            <input
              :id="`${id}-pos-${axis}`"
              v-model.number="meatAdjustments[id][axis]"
              class="mt-2 accent-primary w-full"
              :max="meatRange[axis].max"
              :min="meatRange[axis].min"
              :step="meatRange[axis].step"
              type="range"
            >
          </div>

          <div>
            <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`${id}-scale`">
              {{ id }} scale
            </label>
            <input
              :id="`${id}-scale`"
              v-model.number="meatAdjustments[id].scale"
              class="mt-2 accent-primary w-full"
              :max="meatRange.scale.max"
              :min="meatRange.scale.min"
              :step="meatRange.scale.step"
              type="range"
            >
          </div>

          <div>
            <label class="text-[10px] text-on-surface-variant tracking-[0.16em] font-mono uppercase" :for="`${id}-rotation-y`">
              {{ id }} rot y
            </label>
            <input
              :id="`${id}-rotation-y`"
              v-model.number="meatAdjustments[id].rotationY"
              class="mt-2 accent-primary w-full"
              :max="meatRange.rotationY.max"
              :min="meatRange.rotationY.min"
              :step="meatRange.rotationY.step"
              type="range"
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
