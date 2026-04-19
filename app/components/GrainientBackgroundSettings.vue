<script setup lang="ts">
import type { GrainientSettings } from '~/composables/useGrainientSettings'
import { useClipboard } from '@vueuse/core'
import { GRAINIENT_DEFAULT_SETTINGS } from '~/composables/useGrainientSettings'

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

const props = defineProps<{
  settings: GrainientSettings
  isPanelOpen: boolean
}>()

const emit = defineEmits<{
  'update:settings': [value: GrainientSettings]
  'toggle': []
  'reset': []
}>()

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

const defaultSettings = GRAINIENT_DEFAULT_SETTINGS
const { copy, copied } = useClipboard({ copiedDuring: 1500 })

const getNumericSetting = (key: NumericSettingKey) => props.settings[key]

function setSetting<K extends keyof GrainientSettings>(key: K, value: GrainientSettings[K]) {
  emit('update:settings', {
    ...props.settings,
    [key]: value,
  })
}

function setNumericSetting(key: NumericSettingKey, value: number) {
  setSetting(key, Number(value) as GrainientSettings[NumericSettingKey])
}

function formatValue(value: number) {
  if (Number.isInteger(value))
    return String(value)
  return value.toFixed(2)
}

function copySettingsJson() {
  const payload = JSON.stringify(props.settings, null, 2)
  copy(payload)
}
</script>

<template>
  <div
    class="w-[340px] pointer-events-auto right-4 top-20 fixed z-30"
    :class="isPanelOpen ? 'h-[calc(100vh-6rem)]' : 'h-auto'"
  >
    <div
      class="border border-white/10 rounded-xl bg-black/75 flex flex-col min-h-0 overflow-hidden backdrop-blur-md"
      :class="isPanelOpen ? 'h-full' : 'h-auto'"
    >
      <div class="p-3 border-b border-white/10 flex items-center justify-between">
        <span class="text-xs text-white/80 tracking-[0.12em] uppercase">Grainient</span>
        <div class="flex gap-2 items-center">
          <button
            v-if="isPanelOpen"
            type="button"
            class="text-[10px] text-white/80 px-2 py-1 border border-white/20 rounded-md hover:bg-white/10"
            @click="copySettingsJson"
          >
            {{ copied ? 'Copied' : 'Copy JSON' }}
          </button>
          <button
            type="button"
            class="text-[10px] text-white/80 px-2 py-1 border border-white/20 rounded-md hover:bg-white/10"
            @click="emit('reset')"
          >
            Reset
          </button>
          <button
            type="button"
            class="text-[10px] text-white/80 px-2 py-1 border border-white/20 rounded-md hover:bg-white/10"
            @click="emit('toggle')"
          >
            {{ isPanelOpen ? 'Collapse' : 'Expand' }}
          </button>
        </div>
      </div>

      <div v-if="isPanelOpen" class="p-3 overscroll-contain flex-1 min-h-0 overflow-y-auto space-y-3">
        <div class="gap-2 grid grid-cols-3">
          <label class="space-y-1">
            <span class="text-[10px] text-white/70 uppercase">Color 1</span>
            <input
              :value="settings.color1"
              type="color"
              class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full"
              @input="setSetting('color1', ($event.target as HTMLInputElement).value)"
            >
          </label>
          <label class="space-y-1">
            <span class="text-[10px] text-white/70 uppercase">Color 2</span>
            <input
              :value="settings.color2"
              type="color"
              class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full"
              @input="setSetting('color2', ($event.target as HTMLInputElement).value)"
            >
          </label>
          <label class="space-y-1">
            <span class="text-[10px] text-white/70 uppercase">Color 3</span>
            <input
              :value="settings.color3"
              type="color"
              class="p-1 border border-white/20 rounded-md bg-transparent h-8 w-full"
              @input="setSetting('color3', ($event.target as HTMLInputElement).value)"
            >
          </label>
        </div>

        <label class="px-3 py-2 border border-white/10 rounded-lg flex items-center justify-between">
          <span class="text-[11px] text-white/80">Grain Animated</span>
          <input
            :checked="settings.grainAnimated"
            type="checkbox"
            class="accent-[#FF5633] h-4 w-4"
            @change="setSetting('grainAnimated', ($event.target as HTMLInputElement).checked)"
          >
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
</template>
