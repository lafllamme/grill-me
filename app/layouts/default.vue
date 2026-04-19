<script setup lang="ts">
import type { GrainientSettings } from '~/composables/useGrainientSettings'
import { GRAINIENT_DEFAULT_SETTINGS, useGrainientSettings } from '~/composables/useGrainientSettings'

type NumericSettingKey
  = | 'timeSpeed'
    | 'colorBalance'
    | 'warpStrength'
    | 'warpFrequency'
    | 'warpSpeed'
    | 'warpAmplitude'
    | 'blendAngle'
    | 'blendSoftness'
    | 'rotationAmount'
    | 'noiseScale'
    | 'grainAmount'
    | 'grainScale'
    | 'contrast'
    | 'gamma'
    | 'saturation'
    | 'centerX'
    | 'centerY'
    | 'zoom'

interface NumericControl {
  key: NumericSettingKey
  label: string
  min: number
  max: number
  step: number
}

const isDev = import.meta.dev

const {
  settings,
  isPanelOpen,
  togglePanel,
  resetSettings,
} = useGrainientSettings()

const numericControls: NumericControl[] = [
  { key: 'timeSpeed', label: 'Time Speed', min: 0, max: 2, step: 0.01 },
  { key: 'colorBalance', label: 'Color Balance', min: -1, max: 1, step: 0.01 },
  { key: 'warpStrength', label: 'Warp Strength', min: 0, max: 3, step: 0.01 },
  { key: 'warpFrequency', label: 'Warp Frequency', min: 0, max: 15, step: 0.1 },
  { key: 'warpSpeed', label: 'Warp Speed', min: 0, max: 8, step: 0.1 },
  { key: 'warpAmplitude', label: 'Warp Amplitude', min: 1, max: 150, step: 1 },
  { key: 'blendAngle', label: 'Blend Angle', min: -180, max: 180, step: 1 },
  { key: 'blendSoftness', label: 'Blend Softness', min: 0, max: 0.3, step: 0.005 },
  { key: 'rotationAmount', label: 'Rotation Amount', min: 0, max: 1000, step: 1 },
  { key: 'noiseScale', label: 'Noise Scale', min: 0.1, max: 10, step: 0.1 },
  { key: 'grainAmount', label: 'Grain Amount', min: 0, max: 0.5, step: 0.01 },
  { key: 'grainScale', label: 'Grain Scale', min: 0.1, max: 10, step: 0.1 },
  { key: 'contrast', label: 'Contrast', min: 0.2, max: 3, step: 0.01 },
  { key: 'gamma', label: 'Gamma', min: 0.2, max: 3, step: 0.01 },
  { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.01 },
  { key: 'centerX', label: 'Center X', min: -1, max: 1, step: 0.01 },
  { key: 'centerY', label: 'Center Y', min: -1, max: 1, step: 0.01 },
  { key: 'zoom', label: 'Zoom', min: 0.2, max: 2, step: 0.01 },
]

function formatValue(value: number) {
  if (Number.isInteger(value))
    return String(value)
  return value.toFixed(2)
}

const defaultSettings = GRAINIENT_DEFAULT_SETTINGS

const getNumericSetting = (key: NumericSettingKey) => settings[key]

function setNumericSetting(key: NumericSettingKey, value: number) {
  settings[key] = Number(value) as GrainientSettings[NumericSettingKey]
}
</script>

<template>
  <div class="text-on-surface bg-black min-h-screen selection:text-on-surface selection:bg-primary">
    <div class="pointer-events-none inset-0 fixed z-0">
      <GrainientBackground
        class-name="inset-0 absolute"
        :time-speed="settings.timeSpeed"
        :color-balance="settings.colorBalance"
        :warp-strength="settings.warpStrength"
        :warp-frequency="settings.warpFrequency"
        :warp-speed="settings.warpSpeed"
        :warp-amplitude="settings.warpAmplitude"
        :blend-angle="settings.blendAngle"
        :blend-softness="settings.blendSoftness"
        :rotation-amount="settings.rotationAmount"
        :noise-scale="settings.noiseScale"
        :grain-amount="settings.grainAmount"
        :grain-scale="settings.grainScale"
        :grain-animated="settings.grainAnimated"
        :contrast="settings.contrast"
        :gamma="settings.gamma"
        :saturation="settings.saturation"
        :center-x="settings.centerX"
        :center-y="settings.centerY"
        :zoom="settings.zoom"
        :color1="settings.color1"
        :color2="settings.color2"
        :color3="settings.color3"
      />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>

    <div v-if="isDev" class="max-h-[calc(100vh-6rem)] w-[340px] pointer-events-none right-4 top-20 fixed z-30">
      <div class="border border-white/10 rounded-xl bg-black/75 flex flex-col max-h-full pointer-events-auto backdrop-blur-md">
        <div class="p-3 border-b border-white/10 flex items-center justify-between">
          <span class="text-xs text-white/80 tracking-[0.12em] uppercase">Grainient</span>
          <div class="flex gap-2 items-center">
            <button
              type="button"
              class="text-[10px] text-white/80 px-2 py-1 border border-white/20 rounded-md hover:bg-white/10"
              @click="resetSettings"
            >
              Reset
            </button>
            <button
              type="button"
              class="text-[10px] text-white/80 px-2 py-1 border border-white/20 rounded-md hover:bg-white/10"
              @click="togglePanel"
            >
              {{ isPanelOpen ? 'Collapse' : 'Expand' }}
            </button>
          </div>
        </div>

        <div v-if="isPanelOpen" class="p-3 overflow-auto space-y-3">
          <div class="gap-2 grid grid-cols-3">
            <label class="space-y-1">
              <span class="text-[10px] text-white/70 uppercase">Color 1</span>
              <input v-model="settings.color1" type="color" class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full">
            </label>
            <label class="space-y-1">
              <span class="text-[10px] text-white/70 uppercase">Color 2</span>
              <input v-model="settings.color2" type="color" class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full">
            </label>
            <label class="space-y-1">
              <span class="text-[10px] text-white/70 uppercase">Color 3</span>
              <input v-model="settings.color3" type="color" class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full">
            </label>
          </div>

          <label class="px-3 py-2 border border-white/10 rounded-lg flex items-center justify-between">
            <span class="text-[11px] text-white/80">Grain Animated</span>
            <input v-model="settings.grainAnimated" type="checkbox" class="accent-[#FF5633] h-4 w-4">
          </label>

          <div
            v-for="control in numericControls"
            :key="control.key"
            class="px-3 py-2 border border-white/10 rounded-lg space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-[11px] text-white/80">{{ control.label }}</span>
              <button
                type="button"
                class="text-[10px] text-white/50 hover:text-white/80"
                @click="setNumericSetting(control.key, defaultSettings[control.key])"
              >
                reset
              </button>
            </div>
            <div class="flex gap-2 items-center">
              <input
                :value="getNumericSetting(control.key)"
                :min="control.min"
                :max="control.max"
                :step="control.step"
                type="range"
                class="w-full"
                @input="setNumericSetting(control.key, Number(($event.target as HTMLInputElement).value))"
              >
              <input
                :value="getNumericSetting(control.key)"
                :min="control.min"
                :max="control.max"
                :step="control.step"
                type="number"
                class="text-[11px] text-white px-2 py-1 border border-white/20 rounded-md bg-black/40 w-20"
                @input="setNumericSetting(control.key, Number(($event.target as HTMLInputElement).value))"
              >
            </div>
            <div class="text-[10px] text-white/50 text-right">
              {{ formatValue(getNumericSetting(control.key)) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
