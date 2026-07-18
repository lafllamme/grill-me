import { useDebounceFn } from '@vueuse/core'

export interface PrismGradientSettings {
  speed: number
  noiseOpacity: number
  noiseScale: number
  radius: string
  darkColors: [string, string, string]
  lightColors: [string, string, string]
}

export const PRISM_GRADIENT_STORAGE_KEY = 'grillme:prism-gradient:settings:v1'
export const PRISM_GRADIENT_PANEL_OPEN_STORAGE_KEY = 'grillme:prism-gradient:panel-open:v1'

export const PRISM_GRADIENT_DEFAULT_DARK_COLORS = [
  '#050505',
  '#66B3FF',
  '#FFFFFF',
] as const satisfies [string, string, string]

export const PRISM_GRADIENT_DEFAULT_LIGHT_COLORS = [
  '#FAFAFA',
  '#66B3FF',
  '#050505',
] as const satisfies [string, string, string]

export const PRISM_GRADIENT_DEFAULT_SETTINGS: PrismGradientSettings = {
  speed: 1,
  noiseOpacity: 0.08,
  noiseScale: 1,
  radius: '0px',
  darkColors: [...PRISM_GRADIENT_DEFAULT_DARK_COLORS],
  lightColors: [...PRISM_GRADIENT_DEFAULT_LIGHT_COLORS],
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function toNumberOrDefault(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeSettings(value: unknown): PrismGradientSettings {
  if (!isRecord(value))
    return { ...PRISM_GRADIENT_DEFAULT_SETTINGS }

  return {
    speed: toNumberOrDefault(value.speed, PRISM_GRADIENT_DEFAULT_SETTINGS.speed),
    noiseOpacity: toNumberOrDefault(value.noiseOpacity, PRISM_GRADIENT_DEFAULT_SETTINGS.noiseOpacity),
    noiseScale: toNumberOrDefault(value.noiseScale, PRISM_GRADIENT_DEFAULT_SETTINGS.noiseScale),
    radius: typeof value.radius === 'string' ? value.radius : PRISM_GRADIENT_DEFAULT_SETTINGS.radius,
    darkColors: normalizeColorTriplet(value.darkColors, PRISM_GRADIENT_DEFAULT_DARK_COLORS),
    lightColors: normalizeColorTriplet(value.lightColors, PRISM_GRADIENT_DEFAULT_LIGHT_COLORS),
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

export function usePrismGradientSettings() {
  const settings = reactive<PrismGradientSettings>({ ...PRISM_GRADIENT_DEFAULT_SETTINGS })
  const isPanelOpen = ref(false)
  const isPanelVisible = ref(true)

  const saveSettings = () => {
    if (!import.meta.client)
      return

    localStorage.setItem(PRISM_GRADIENT_STORAGE_KEY, JSON.stringify(settings))
  }

  const saveSettingsDebounced = useDebounceFn(saveSettings, 180)

  const resetSettings = () => {
    Object.assign(settings, { ...PRISM_GRADIENT_DEFAULT_SETTINGS })

    if (!import.meta.client)
      return

    localStorage.removeItem(PRISM_GRADIENT_STORAGE_KEY)
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

    const rawSettings = localStorage.getItem(PRISM_GRADIENT_STORAGE_KEY)
    if (rawSettings) {
      try {
        Object.assign(settings, normalizeSettings(JSON.parse(rawSettings)))
      }
      catch {
        Object.assign(settings, { ...PRISM_GRADIENT_DEFAULT_SETTINGS })
      }
    }

    const rawPanelOpen = localStorage.getItem(PRISM_GRADIENT_PANEL_OPEN_STORAGE_KEY)
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

    localStorage.setItem(PRISM_GRADIENT_PANEL_OPEN_STORAGE_KEY, value ? '1' : '0')
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
