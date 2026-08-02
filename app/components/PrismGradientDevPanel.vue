<script setup lang="ts">
import type { PrismGradientSettings } from '~/models/prism-gradient'
import { useClipboard } from '@vueuse/core'
import { computed } from 'vue'
import {
  PRISM_GRADIENT_DEFAULT_DARK_COLORS,
  PRISM_GRADIENT_DEFAULT_LIGHT_COLORS,
  PRISM_GRADIENT_DEFAULT_SETTINGS,
} from '~/models/prism-gradient'

type NumericSettingKey
  = | 'speed'
    | 'noiseOpacity'
    | 'noiseScale'
    | 'ambientOpacity'
    | 'rotation'
    | 'proportion'
    | 'scale'
    | 'distortion'
    | 'swirl'
    | 'swirlIterations'
    | 'softness'
    | 'offset'
    | 'shapeSize'

interface NumericControl {
  key: NumericSettingKey
  label: string
  min: number
  max: number
  step: number
}

interface NumericControlGroup {
  label: string
  controls: NumericControl[]
}

type ColorModeKey = 'darkColors' | 'lightColors'

interface ColorGroup {
  key: ColorModeKey
  label: string
  defaults: readonly [string, string, string]
}

const props = defineProps<{
  settings: PrismGradientSettings
  defaults?: PrismGradientSettings
  isPanelOpen: boolean
  isPanelVisible: boolean
}>()

const emit = defineEmits<{
  'update:settings': [value: PrismGradientSettings]
  'toggle': []
  'reset': []
  'close': []
  'show': []
}>()

const numericControlGroups: NumericControlGroup[] = [
  {
    label: 'Motion',
    controls: [
      { key: 'speed', label: 'Animation Speed', min: 0, max: 4, step: 0.01 },
      { key: 'offset', label: 'Starting Offset', min: -1000, max: 1000, step: 1 },
    ],
  },
  {
    label: 'Texture',
    controls: [
      { key: 'noiseOpacity', label: 'Noise Opacity', min: 0, max: 0.3, step: 0.005 },
      { key: 'noiseScale', label: 'Noise Scale', min: 0.2, max: 4, step: 0.05 },
      { key: 'ambientOpacity', label: 'Ambient Overlay', min: 0, max: 0.35, step: 0.01 },
    ],
  },
  {
    label: 'Composition',
    controls: [
      { key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 1 },
      { key: 'proportion', label: 'Color Proportion', min: 0, max: 100, step: 1 },
      { key: 'scale', label: 'Pattern Scale', min: 0, max: 5, step: 0.01 },
      { key: 'distortion', label: 'Distortion', min: 0, max: 100, step: 1 },
      { key: 'swirl', label: 'Swirl', min: 0, max: 100, step: 1 },
      { key: 'swirlIterations', label: 'Swirl Iterations', min: 1, max: 30, step: 1 },
      { key: 'softness', label: 'Softness', min: 0, max: 100, step: 1 },
      { key: 'shapeSize', label: 'Shape Size', min: 0, max: 100, step: 1 },
    ],
  },
]

const resetDefaults = computed(() => props.defaults ?? PRISM_GRADIENT_DEFAULT_SETTINGS)

const colorGroups = computed<ColorGroup[]>(() => [
  {
    key: 'darkColors',
    label: 'Dark Mode Colors',
    defaults: props.defaults?.darkColors ?? PRISM_GRADIENT_DEFAULT_DARK_COLORS,
  },
  {
    key: 'lightColors',
    label: 'Light Mode Colors',
    defaults: props.defaults?.lightColors ?? PRISM_GRADIENT_DEFAULT_LIGHT_COLORS,
  },
])

const { copy, copied } = useClipboard({ copiedDuring: 1500 })

function setSetting<K extends keyof PrismGradientSettings>(key: K, value: PrismGradientSettings[K]) {
  emit('update:settings', {
    ...props.settings,
    [key]: value,
  })
}

function setNumericSetting(key: NumericSettingKey, value: number) {
  setSetting(key, Number(value) as PrismGradientSettings[NumericSettingKey])
}

function getNumericSetting(key: NumericSettingKey): number {
  return props.settings[key]
}

function formatValue(value: number): string {
  if (Number.isInteger(value))
    return String(value)

  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function copySettingsJson() {
  copy(JSON.stringify(props.settings, null, 2))
}

function setColor(mode: ColorModeKey, index: number, value: string) {
  const normalized = normalizeHexColor(value)
  if (!normalized)
    return

  const nextColors = [...props.settings[mode]] as [string, string, string]
  nextColors[index] = normalized
  setSetting(mode, nextColors)
}

function resetColorGroup(group: ColorGroup) {
  setSetting(group.key, [...group.defaults] as PrismGradientSettings[ColorModeKey])
}

function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim().toUpperCase()
  if (/^#[0-9A-F]{6}$/.test(trimmed))
    return trimmed
  if (/^#[0-9A-F]{3}$/.test(trimmed)) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return null
}
</script>

<template>
  <div
    v-if="isPanelVisible"
    role="region"
    aria-label="Prism gradient development controls"
    class="w-[340px] pointer-events-auto right-4 top-20 fixed z-30"
    :class="isPanelOpen ? 'h-[calc(100vh-6rem)]' : 'h-auto'"
  >
    <div
      class="border border-divider rounded-xl border-solid bg-surface/85 flex flex-col min-h-0 overflow-hidden backdrop-blur-md"
      :class="isPanelOpen ? 'h-full' : 'h-auto'"
    >
      <div class="p-3 border-b-[1px] border-divider border-solid flex items-center justify-between">
        <span class="text-xs text-on-surface-variant tracking-[0.12em] uppercase">Prism Gradient</span>
        <div class="flex gap-2 items-center">
          <button
            v-if="isPanelOpen"
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md border-solid hover:bg-surface-container"
            @click="copySettingsJson"
          >
            {{ copied ? 'Copied' : 'Copy JSON' }}
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md border-solid hover:bg-surface-container"
            @click="emit('reset')"
          >
            Reset
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md border-solid hover:bg-surface-container"
            @click="emit('toggle')"
          >
            {{ isPanelOpen ? 'Collapse' : 'Expand' }}
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md border-solid hover:bg-surface-container"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>

      <div v-if="isPanelOpen" data-lenis-prevent class="p-3 overscroll-contain flex-1 min-h-0 overflow-y-auto space-y-3">
        <label class="px-3 py-2 border border-divider rounded-lg border-solid bg-surface-container-low/70 block space-y-2">
          <span class="text-[11px] text-on-surface">Radius</span>
          <input
            :value="settings.radius"
            type="text"
            class="text-[11px] text-on-surface px-2 py-1 border border-divider rounded-md border-solid bg-surface w-full"
            @input="setSetting('radius', ($event.target as HTMLInputElement).value)"
          >
          <span class="text-[10px] text-on-surface-variant">Examples: `0px`, `24px`, `2rem`</span>
        </label>

        <section v-for="controlGroup in numericControlGroups" :key="controlGroup.label" class="space-y-2">
          <p class="text-[9px] text-on-surface-variant tracking-[0.14em] px-1 uppercase">
            {{ controlGroup.label }}
          </p>
          <div
            v-for="control in controlGroup.controls"
            :key="control.key"
            class="px-3 py-2 border border-divider rounded-lg border-solid bg-surface-container-low/70 space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-[11px] text-on-surface">{{ control.label }}</span>
              <button
                type="button"
                class="text-[10px] text-on-surface-variant hover:text-on-surface"
                @click="setNumericSetting(control.key, resetDefaults[control.key])"
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
                class="text-[11px] text-on-surface px-2 py-1 border border-divider rounded-md border-solid bg-surface w-22"
                @input="setNumericSetting(control.key, Number(($event.target as HTMLInputElement).value))"
              >
            </div>
            <div class="text-[10px] text-on-surface-variant text-right">
              {{ formatValue(getNumericSetting(control.key)) }}
            </div>
          </div>
        </section>

        <div
          v-for="group in colorGroups"
          :key="group.key"
          class="px-3 py-2 border border-divider rounded-lg border-solid bg-surface-container-low/70 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-on-surface">{{ group.label }}</span>
            <button
              type="button"
              class="text-[10px] text-on-surface-variant hover:text-on-surface"
              @click="resetColorGroup(group)"
            >
              reset
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(color, index) in settings[group.key]"
              :key="`${group.key}-${index}`"
              class="gap-2 grid grid-cols-[auto_1fr] items-center"
            >
              <input
                :value="color"
                type="color"
                class="border border-divider rounded-md border-solid bg-surface size-10"
                @input="setColor(group.key, index, ($event.target as HTMLInputElement).value)"
              >
              <input
                :value="color"
                type="text"
                class="text-[11px] text-on-surface font-mono px-2 py-2 border border-divider rounded-md border-solid bg-surface w-full uppercase"
                @change="setColor(group.key, index, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
