import type { PrismGradientSettings } from '~/models/prism-gradient'
import { useDebounceFn } from '@vueuse/core'
import { useCookie } from '#imports'
import {
  PRISM_GRADIENT_DEFAULT_SETTINGS,
} from '~/models/prism-gradient'

export const PRISM_GRADIENT_STORAGE_KEY = 'grillme:prism-gradient:settings:v1'
export const PRISM_GRADIENT_PANEL_OPEN_STORAGE_KEY = 'grillme:prism-gradient:panel-open:v1'

interface PrismGradientSettingsOptions {
  defaults?: PrismGradientSettings
  storageKey?: string
  panelOpenStorageKey?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function toNumberOrDefault(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function createDefaultSettings(defaults: PrismGradientSettings): PrismGradientSettings {
  return {
    ...defaults,
    darkColors: [...defaults.darkColors],
    lightColors: [...defaults.lightColors],
  }
}

function normalizeSettings(value: unknown, defaults: PrismGradientSettings): PrismGradientSettings {
  if (!isRecord(value))
    return createDefaultSettings(defaults)

  return {
    speed: toNumberOrDefault(value.speed, defaults.speed),
    noiseOpacity: toNumberOrDefault(value.noiseOpacity, defaults.noiseOpacity),
    noiseScale: toNumberOrDefault(value.noiseScale, defaults.noiseScale),
    ambientOpacity: toNumberOrDefault(value.ambientOpacity, defaults.ambientOpacity),
    rotation: toNumberOrDefault(value.rotation, defaults.rotation),
    proportion: toNumberOrDefault(value.proportion, defaults.proportion),
    scale: toNumberOrDefault(value.scale, defaults.scale),
    distortion: toNumberOrDefault(value.distortion, defaults.distortion),
    swirl: toNumberOrDefault(value.swirl, defaults.swirl),
    swirlIterations: Math.round(toNumberOrDefault(value.swirlIterations, defaults.swirlIterations)),
    softness: toNumberOrDefault(value.softness, defaults.softness),
    offset: toNumberOrDefault(value.offset, defaults.offset),
    shapeSize: toNumberOrDefault(value.shapeSize, defaults.shapeSize),
    radius: typeof value.radius === 'string' ? value.radius : defaults.radius,
    darkColors: normalizeColorTriplet(value.darkColors, defaults.darkColors),
    lightColors: normalizeColorTriplet(value.lightColors, defaults.lightColors),
  }
}

function normalizeColorTriplet(
  value: unknown,
  fallback: readonly [string, string, string],
): [string, string, string] {
  if (!Array.isArray(value) || value.length !== 3)
    return [...fallback]

  const normalized = value.map((entry, index) =>
    isHexColor(entry) ? normalizeHexColor(entry) : fallback[index]!,
  ) as [string, string, string]

  return normalized
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
}

function normalizeHexColor(value: string): string {
  const trimmed = value.trim().toUpperCase()
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`
  }

  return trimmed
}

export function usePrismGradientSettings(options: PrismGradientSettingsOptions = {}) {
  const defaults = createDefaultSettings(options.defaults ?? PRISM_GRADIENT_DEFAULT_SETTINGS)
  const storageKey = options.storageKey ?? PRISM_GRADIENT_STORAGE_KEY
  const panelOpenStorageKey = options.panelOpenStorageKey ?? PRISM_GRADIENT_PANEL_OPEN_STORAGE_KEY
  const panelVisibilityCookieKey = `${panelOpenStorageKey}:visible`
  const settings = reactive<PrismGradientSettings>(createDefaultSettings(defaults))
  const isPanelOpen = ref(false)
  const isPanelVisible = useCookie<boolean>(panelVisibilityCookieKey, {
    default: () => true,
    sameSite: 'lax',
  })

  const saveSettings = () => {
    if (!import.meta.client)
      return

    localStorage.setItem(storageKey, JSON.stringify(settings))
  }

  const saveSettingsDebounced = useDebounceFn(saveSettings, 180)

  const resetSettings = () => {
    Object.assign(settings, createDefaultSettings(defaults))

    if (!import.meta.client)
      return

    localStorage.removeItem(storageKey)
  }

  const togglePanel = () => {
    isPanelOpen.value = !isPanelOpen.value
  }

  const closePanel = () => {
    isPanelVisible.value = false
  }

  const showPanel = () => {
    isPanelVisible.value = true
  }

  onMounted(() => {
    if (!import.meta.client)
      return

    const rawSettings = localStorage.getItem(storageKey)
    if (rawSettings) {
      try {
        Object.assign(settings, normalizeSettings(JSON.parse(rawSettings), defaults))
      }
      catch {
        Object.assign(settings, createDefaultSettings(defaults))
      }
    }

    const rawPanelOpen = localStorage.getItem(panelOpenStorageKey)
    if (rawPanelOpen !== null)
      isPanelOpen.value = rawPanelOpen === '1'
  })

  watch(
    settings,
    () => {
      saveSettingsDebounced()
    },
    { deep: true },
  )

  watch(isPanelOpen, (value) => {
    if (!import.meta.client)
      return

    localStorage.setItem(panelOpenStorageKey, value ? '1' : '0')
  })

  return {
    settings,
    isPanelOpen,
    isPanelVisible,
    resetSettings,
    togglePanel,
    closePanel,
    showPanel,
  }
}
