import { useDebounceFn } from '@vueuse/core'

export interface GrainientSettings {
  color1: string
  color2: string
  color3: string
  timeSpeed: number
  colorBalance: number
  warpStrength: number
  warpFrequency: number
  warpSpeed: number
  warpAmplitude: number
  blendAngle: number
  blendSoftness: number
  rotationAmount: number
  noiseScale: number
  grainAmount: number
  grainScale: number
  grainAnimated: boolean
  contrast: number
  gamma: number
  saturation: number
  centerX: number
  centerY: number
  zoom: number
}

export const GRAINIENT_STORAGE_KEY = 'grillme:grainient:settings:v1'

export const GRAINIENT_DEFAULT_SETTINGS: GrainientSettings = {
  color1: '#323135',
  color2: '#FF5633',
  color3: '#2D2D2F',
  timeSpeed: 0.25,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0.1,
  grainScale: 2,
  grainAnimated: false,
  contrast: 1.5,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object'
}

function toNumberOrDefault(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeSettings(value: unknown): GrainientSettings {
  if (!isRecord(value))
    return { ...GRAINIENT_DEFAULT_SETTINGS }

  return {
    color1: typeof value.color1 === 'string' ? value.color1 : GRAINIENT_DEFAULT_SETTINGS.color1,
    color2: typeof value.color2 === 'string' ? value.color2 : GRAINIENT_DEFAULT_SETTINGS.color2,
    color3: typeof value.color3 === 'string' ? value.color3 : GRAINIENT_DEFAULT_SETTINGS.color3,
    timeSpeed: toNumberOrDefault(value.timeSpeed, GRAINIENT_DEFAULT_SETTINGS.timeSpeed),
    colorBalance: toNumberOrDefault(value.colorBalance, GRAINIENT_DEFAULT_SETTINGS.colorBalance),
    warpStrength: toNumberOrDefault(value.warpStrength, GRAINIENT_DEFAULT_SETTINGS.warpStrength),
    warpFrequency: toNumberOrDefault(value.warpFrequency, GRAINIENT_DEFAULT_SETTINGS.warpFrequency),
    warpSpeed: toNumberOrDefault(value.warpSpeed, GRAINIENT_DEFAULT_SETTINGS.warpSpeed),
    warpAmplitude: toNumberOrDefault(value.warpAmplitude, GRAINIENT_DEFAULT_SETTINGS.warpAmplitude),
    blendAngle: toNumberOrDefault(value.blendAngle, GRAINIENT_DEFAULT_SETTINGS.blendAngle),
    blendSoftness: toNumberOrDefault(value.blendSoftness, GRAINIENT_DEFAULT_SETTINGS.blendSoftness),
    rotationAmount: toNumberOrDefault(value.rotationAmount, GRAINIENT_DEFAULT_SETTINGS.rotationAmount),
    noiseScale: toNumberOrDefault(value.noiseScale, GRAINIENT_DEFAULT_SETTINGS.noiseScale),
    grainAmount: toNumberOrDefault(value.grainAmount, GRAINIENT_DEFAULT_SETTINGS.grainAmount),
    grainScale: toNumberOrDefault(value.grainScale, GRAINIENT_DEFAULT_SETTINGS.grainScale),
    grainAnimated: typeof value.grainAnimated === 'boolean' ? value.grainAnimated : GRAINIENT_DEFAULT_SETTINGS.grainAnimated,
    contrast: toNumberOrDefault(value.contrast, GRAINIENT_DEFAULT_SETTINGS.contrast),
    gamma: toNumberOrDefault(value.gamma, GRAINIENT_DEFAULT_SETTINGS.gamma),
    saturation: toNumberOrDefault(value.saturation, GRAINIENT_DEFAULT_SETTINGS.saturation),
    centerX: toNumberOrDefault(value.centerX, GRAINIENT_DEFAULT_SETTINGS.centerX),
    centerY: toNumberOrDefault(value.centerY, GRAINIENT_DEFAULT_SETTINGS.centerY),
    zoom: toNumberOrDefault(value.zoom, GRAINIENT_DEFAULT_SETTINGS.zoom),
  }
}

export function useGrainientSettings() {
  const settings = reactive<GrainientSettings>({ ...GRAINIENT_DEFAULT_SETTINGS })
  const isPanelOpen = ref(true)

  const loadSettings = () => {
    if (!import.meta.client)
      return

    try {
      const raw = localStorage.getItem(GRAINIENT_STORAGE_KEY)
      if (!raw)
        return
      const parsed = JSON.parse(raw)
      Object.assign(settings, normalizeSettings(parsed))
    }
    catch {
      Object.assign(settings, { ...GRAINIENT_DEFAULT_SETTINGS })
    }
  }

  const saveSettings = () => {
    if (!import.meta.client)
      return
    localStorage.setItem(GRAINIENT_STORAGE_KEY, JSON.stringify(settings))
  }

  const saveSettingsDebounced = useDebounceFn(saveSettings, 180)

  const resetSettings = () => {
    Object.assign(settings, { ...GRAINIENT_DEFAULT_SETTINGS })
    if (import.meta.client)
      localStorage.removeItem(GRAINIENT_STORAGE_KEY)
  }

  const togglePanel = () => {
    isPanelOpen.value = !isPanelOpen.value
  }

  onMounted(() => {
    loadSettings()
  })

  watch(
    settings,
    () => {
      saveSettingsDebounced()
    },
    { deep: true },
  )

  return {
    settings,
    resetSettings,
    isPanelOpen,
    togglePanel,
  }
}
