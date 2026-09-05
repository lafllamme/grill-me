import type { MaybeRefOrGetter, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref, toValue, watch } from 'vue'

export type AIState = 'idle' | 'listening' | 'thinking' | 'streaming' | 'done' | 'error'
export type AIStateMotif = 'breathe' | 'receive' | 'scan' | 'pulse' | 'ping' | 'fault'
export type AIStateAccent = 'success' | 'danger' | null

export interface AIStateMotion {
  accent: AIStateAccent
  glow: number
  hueRotate: number
  intensity: number
  motif: AIStateMotif
  pulseSeconds: number
  reactivity: number
  saturation: number
  scale: number
  speed: number
  tumble: number
  turbulence: number
}

export const AI_STATE_MOTION: Record<AIState, AIStateMotion> = {
  done: { accent: 'success', glow: 0.7, hueRotate: 0, intensity: 0.4, motif: 'ping', pulseSeconds: 0.65, reactivity: 0, saturation: 1, scale: 1.1, speed: 0.8, tumble: 0.02, turbulence: 0.08 },
  error: { accent: 'danger', glow: 0.25, hueRotate: 0, intensity: 0.5, motif: 'fault', pulseSeconds: 0.9, reactivity: 0, saturation: 0.3, scale: 0.96, speed: 1, tumble: 0, turbulence: 0.55 },
  idle: { accent: null, glow: 0.15, hueRotate: 0, intensity: 0.3, motif: 'breathe', pulseSeconds: 4.5, reactivity: 0, saturation: 0.75, scale: 0.94, speed: 0.6, tumble: 0.012, turbulence: 0.14 },
  listening: { accent: null, glow: 0.6, hueRotate: 0, intensity: 0.75, motif: 'receive', pulseSeconds: 1.6, reactivity: 1, saturation: 1.05, scale: 1.06, speed: 1, tumble: 0.03, turbulence: 0.42 },
  streaming: { accent: null, glow: 0.45, hueRotate: -10, intensity: 0.6, motif: 'pulse', pulseSeconds: 1.25, reactivity: 0.6, saturation: 1, scale: 1.02, speed: 1.4, tumble: 0.06, turbulence: 0.5 },
  thinking: { accent: null, glow: 0.35, hueRotate: 18, intensity: 1, motif: 'scan', pulseSeconds: 1.1, reactivity: 0.15, saturation: 1, scale: 1, speed: 2.4, tumble: 0.14, turbulence: 0.95 },
}

export const AI_ACCENT_COLORS: Record<'success' | 'danger', string> = {
  danger: 'oklch(63% 0.21 25)',
  success: 'oklch(72% 0.17 150)',
}

export function getAIStateMotion(state: AIState | undefined): AIStateMotion {
  return AI_STATE_MOTION[state ?? 'idle'] ?? AI_STATE_MOTION.idle
}

export function getAIStateAccentColor(state: AIState | undefined, fallback: string): string {
  const accent = getAIStateMotion(state).accent
  return accent ? AI_ACCENT_COLORS[accent] : fallback
}

export type AIAmplitude = MaybeRefOrGetter<number> | undefined

export function useAmplitudeValue(amplitude: AIAmplitude): Ref<number> {
  const value = ref(0)

  watch(
    () => amplitude === undefined ? undefined : toValue(amplitude),
    (nextValue) => {
      value.value = Math.min(1, Math.max(0, nextValue ?? 0))
    },
    { immediate: true },
  )

  return value
}

export function useSimulatedAmplitude(state: MaybeRefOrGetter<AIState> = 'idle'): Ref<number> {
  const amplitude = ref(0)
  let frameId: number | undefined

  onMounted(() => {
    const update = (time: number) => {
      const motion = getAIStateMotion(toValue(state))
      const seconds = time / 1000
      const envelope = 0.5
        + 0.3 * Math.sin(seconds * 2.1 * motion.speed)
        + 0.14 * Math.sin(seconds * 5.3 * motion.speed + 1.7)
        + 0.06 * Math.sin(seconds * 11.7 * motion.speed + 0.4)

      amplitude.value = Math.min(1, Math.max(0, envelope * motion.intensity))
      frameId = window.requestAnimationFrame(update)
    }

    frameId = window.requestAnimationFrame(update)
  })

  onBeforeUnmount(() => {
    if (frameId !== undefined)
      window.cancelAnimationFrame(frameId)
  })

  return amplitude
}

export type AudioAmplitudeStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'

export interface UseAudioAmplitudeOptions {
  autoStart?: boolean
  smoothing?: number
  fftSize?: number
}

export interface UseAudioAmplitudeResult {
  amplitude: Ref<number>
  status: Ref<AudioAmplitudeStatus>
  start: () => Promise<void>
  stop: () => void
}

const DEFAULT_SMOOTHING = 0.55
const DEFAULT_FFT_SIZE = 512
const RMS_TO_UNIT = 3.2
const ATTACK_FACTOR = 0.35

export function useAudioAmplitude(options: UseAudioAmplitudeOptions = {}): UseAudioAmplitudeResult {
  const {
    autoStart = false,
    smoothing = DEFAULT_SMOOTHING,
    fftSize = DEFAULT_FFT_SIZE,
  } = options
  const amplitude = ref(0)
  const status = ref<AudioAmplitudeStatus>('idle')
  let audioContext: AudioContext | null = null
  let stream: MediaStream | null = null
  let analyser: AnalyserNode | null = null
  let buffer: Float32Array<ArrayBuffer> | null = null
  let frameId: number | undefined

  const stop = () => {
    if (frameId !== undefined) {
      window.cancelAnimationFrame(frameId)
      frameId = undefined
    }
    stream?.getTracks().forEach(track => track.stop())
    stream = null
    analyser = null
    buffer = null
    void audioContext?.close()
    audioContext = null
    amplitude.value = 0
    status.value = 'idle'
  }

  const start = async () => {
    if (analyser)
      return

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      status.value = 'unsupported'
      return
    }

    const AudioContextConstructor = window.AudioContext
    if (!AudioContextConstructor) {
      status.value = 'unsupported'
      return
    }

    status.value = 'requesting'

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContext = new AudioContextConstructor()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = fftSize
      audioContext.createMediaStreamSource(stream).connect(analyser)
      buffer = new Float32Array(analyser.fftSize)
      status.value = 'active'

      const update = () => {
        if (!(analyser && buffer))
          return

        analyser.getFloatTimeDomainData(buffer)
        let sumOfSquares = 0
        for (const sample of buffer)
          sumOfSquares += sample * sample

        const rms = Math.sqrt(sumOfSquares / buffer.length)
        const target = Math.min(1, rms * RMS_TO_UNIT)
        const previous = amplitude.value
        const factor = target > previous ? smoothing * ATTACK_FACTOR : smoothing
        amplitude.value = previous + (target - previous) * (1 - factor)
        frameId = window.requestAnimationFrame(update)
      }

      frameId = window.requestAnimationFrame(update)
    }
    catch {
      stream?.getTracks().forEach(track => track.stop())
      stream = null
      analyser = null
      buffer = null
      status.value = 'denied'
    }
  }

  onMounted(() => {
    if (autoStart)
      void start()
  })

  onBeforeUnmount(stop)

  return { amplitude, status, start, stop }
}
