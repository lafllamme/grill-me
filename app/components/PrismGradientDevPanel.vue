<script setup lang="ts">
import type { PrismGradientSettings } from '~/composables/usePrismGradientSettings'
import { useClipboard } from '@vueuse/core'
import {
  PRISM_GRADIENT_DEFAULT_DARK_COLORS,
  PRISM_GRADIENT_DEFAULT_LIGHT_COLORS,
  PRISM_GRADIENT_DEFAULT_SETTINGS,
} from '~/composables/usePrismGradientSettings'

type NumericSettingKey
  = | 'speed'
    | 'noiseOpacity'
    | 'noiseScale'

interface NumericControl {
  key: NumericSettingKey
  label: string
  min: number
  max: number
  step: number
}

type ColorModeKey = 'darkColors' | 'lightColors'

interface ColorGroup {
  key: ColorModeKey
  label: string
  defaults: readonly [string, string, string]
}

const props = defineProps<{
  settings: PrismGradientSettings
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

const numericControls: NumericControl[] = [
  { key: 'speed', label: 'Speed', min: 0, max: 4, step: 0.01 },
  { key: 'noiseOpacity', label: 'Noise Opacity', min: 0, max: 0.3, step: 0.005 },
  { key: 'noiseScale', label: 'Noise Scale', min: 0.2, max: 4, step: 0.05 },
]

const colorGroups: ColorGroup[] = [
  {
    key: 'darkColors',
    label: 'Dark Mode Colors',
    defaults: PRISM_GRADIENT_DEFAULT_DARK_COLORS,
  },
  {
    key: 'lightColors',
    label: 'Light Mode Colors',
    defaults: PRISM_GRADIENT_DEFAULT_LIGHT_COLORS,
  },
]

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
  <button
    v-if="!isPanelVisible"
    type="button"
    class="text-xs text-on-surface-variant tracking-[0.12em] px-3 py-2 border border-divider rounded-lg bg-surface/85 pointer-events-auto uppercase right-4 top-20 fixed z-30 backdrop-blur-md hover:bg-surface-container"
    @click="emit('show')"
  >
    Prism
  </button>

  <div
    v-else
    class="w-[340px] pointer-events-auto right-4 top-20 fixed z-30"
    :class="isPanelOpen ? 'h-[calc(100vh-6rem)]' : 'h-auto'"
  >
    <div
      class="border border-divider rounded-xl bg-surface/85 flex flex-col min-h-0 overflow-hidden backdrop-blur-md"
      :class="isPanelOpen ? 'h-full' : 'h-auto'"
    >
      <div class="p-3 border-b border-divider flex items-center justify-between">
        <span class="text-xs text-on-surface-variant tracking-[0.12em] uppercase">Prism Gradient</span>
        <div class="flex gap-2 items-center">
          <button
            v-if="isPanelOpen"
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md hover:bg-surface-container"
            @click="copySettingsJson"
          >
            {{ copied ? 'Copied' : 'Copy JSON' }}
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md hover:bg-surface-container"
            @click="emit('reset')"
          >
            Reset
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md hover:bg-surface-container"
            @click="emit('toggle')"
          >
            {{ isPanelOpen ? 'Collapse' : 'Expand' }}
          </button>
          <button
            type="button"
            class="text-[10px] text-on-surface-variant px-2 py-1 border border-divider rounded-md hover:bg-surface-container"
            @click="emit('close')"
          >
            Close
          </button>
        </div>
      </div>

      <div v-if="isPanelOpen" class="p-3 overscroll-contain flex-1 min-h-0 overflow-y-auto space-y-3">
        <label class="px-3 py-2 border border-divider rounded-lg bg-surface-container-low/70 block space-y-2">
          <span class="text-[11px] text-on-surface">Radius</span>
          <input
            :value="settings.radius"
            type="text"
            class="text-[11px] text-on-surface px-2 py-1 border border-divider rounded-md bg-surface w-full"
            @input="setSetting('radius', ($event.target as HTMLInputElement).value)"
          >
          <span class="text-[10px] text-on-surface-variant">Examples: `0px`, `24px`, `2rem`</span>
        </label>

        <div
          v-for="control in numericControls"
          :key="control.key"
          class="px-3 py-2 border border-divider rounded-lg bg-surface-container-low/70 space-y-2"
        >
          <div class="flex items-center justify-between">
            <span class="text-[11px] text-on-surface">{{ control.label }}</span>
            <button
              type="button"
              class="text-[10px] text-on-surface-variant hover:text-on-surface"
              @click="setNumericSetting(control.key, PRISM_GRADIENT_DEFAULT_SETTINGS[control.key])"
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
              class="text-[11px] text-on-surface px-2 py-1 border border-divider rounded-md bg-surface w-22"
              @input="setNumericSetting(control.key, Number(($event.target as HTMLInputElement).value))"
            >
          </div>
          <div class="text-[10px] text-on-surface-variant text-right">
            {{ formatValue(getNumericSetting(control.key)) }}
          </div>
        </div>

        <div
          v-for="group in colorGroups"
          :key="group.key"
          class="px-3 py-2 border border-divider rounded-lg bg-surface-container-low/70 space-y-2"
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
                class="border border-divider rounded-md bg-surface size-10"
                @input="setColor(group.key, index, ($event.target as HTMLInputElement).value)"
              >
              <input
                :value="color"
                type="text"
                class="text-[11px] text-on-surface font-mono px-2 py-2 border border-divider rounded-md bg-surface w-full uppercase"
                @change="setColor(group.key, index, ($event.target as HTMLInputElement).value)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
