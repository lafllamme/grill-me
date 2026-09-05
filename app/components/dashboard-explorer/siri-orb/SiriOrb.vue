<script setup lang="ts">
import type { AIAmplitude, AIState } from './ai-core'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { getAIStateMotion, useAmplitudeValue, useSimulatedAmplitude } from './ai-core'

interface SiriOrbColors {
  bg?: string
  c1?: string
  c2?: string
  c3?: string
  c4?: string
}

interface SiriOrbProps {
  amplitude?: AIAmplitude
  animationDuration?: number
  class?: string
  colors?: SiriOrbColors
  size?: string
  state?: AIState
}

const props = withDefaults(defineProps<SiriOrbProps>(), {
  animationDuration: 20,
  size: '192px',
  state: 'idle',
})

const AMPLITUDE_BLUR_FALLOFF = 0.45
const AMPLITUDE_SCALE_GAIN = 0.12

const root = ref<HTMLElement | null>(null)
const isReducedMotion = ref(false)
const simulatedAmplitude = useSimulatedAmplitude(() => props.state)
const externalAmplitude = useAmplitudeValue(props.amplitude)
const amplitude = computed(() => props.amplitude === undefined ? simulatedAmplitude.value : externalAmplitude.value)
const stateMotion = computed(() => getAIStateMotion(props.state))
let reducedMotionQuery: MediaQueryList | undefined

const defaultColors: Required<SiriOrbColors> = {
  bg: 'oklch(92% 0.03 300)',
  c1: 'oklch(68% 0.21 350)',
  c2: 'oklch(70% 0.18 210)',
  c3: 'oklch(66% 0.2 285)',
  c4: 'oklch(72% 0.19 325)',
}

const sizeValue = computed(() => {
  const parsedSize = Number.parseFloat(props.size)
  return Number.isFinite(parsedSize) ? parsedSize : 192
})
const blurAmount = computed(() => sizeValue.value < 50 ? Math.max(sizeValue.value * 0.008, 1) : Math.max(sizeValue.value * 0.015, 4))
const contrastAmount = computed(() => sizeValue.value < 50 ? Math.max(sizeValue.value * 0.004, 1.2) : Math.max(sizeValue.value * 0.008, 1.5))
const dotSize = computed(() => sizeValue.value < 50 ? Math.max(sizeValue.value * 0.004, 0.05) : Math.max(sizeValue.value * 0.008, 0.1))
const shadowSpread = computed(() => sizeValue.value < 50 ? Math.max(sizeValue.value * 0.004, 0.5) : Math.max(sizeValue.value * 0.008, 2))
const maskRadius = computed(() => sizeValue.value < 30 ? '0%' : sizeValue.value < 50 ? '5%' : sizeValue.value < 100 ? '15%' : '25%')
const finalContrast = computed(() => sizeValue.value < 30 ? 1.1 : sizeValue.value < 50 ? Math.max(contrastAmount.value * 1.2, 1.3) : contrastAmount.value)
const colors = computed(() => ({ ...defaultColors, ...props.colors }))

const orbStyle = computed<Record<string, string>>(() => ({
  '--animation-duration': `${props.animationDuration / stateMotion.value.speed}s`,
  '--bg': colors.value.bg,
  '--blur-amount': `${blurAmount.value}px`,
  '--c1': colors.value.c1,
  '--c2': colors.value.c2,
  '--c3': colors.value.c3,
  '--c4': colors.value.c4,
  '--contrast-amount': `${finalContrast.value}`,
  '--dot-size': `${dotSize.value}px`,
  '--drift-duration': `${(12 / (1 + stateMotion.value.speed)) * 2}s`,
  '--glow-blur': `${sizeValue.value * 0.28}px`,
  '--hue-rotate': `${stateMotion.value.hueRotate}deg`,
  '--mask-radius': maskRadius.value,
  '--reactivity': `${isReducedMotion.value ? 0 : stateMotion.value.reactivity}`,
  '--reactive-scale': `${stateMotion.value.scale}`,
  '--rim': `${Math.max(sizeValue.value * 0.06, 1.5)}px`,
  '--shadow-offset': `${shadowSpread.value * 0.2}px`,
  '--shadow-spread': `${shadowSpread.value}px`,
  '--state-glow': `${stateMotion.value.glow * 0.7}`,
  '--state-saturation': `${stateMotion.value.saturation}`,
  '--orb-size': props.size,
  '--pulse-duration': `${stateMotion.value.pulseSeconds}s`,
}))

function syncAmplitude() {
  if (!root.value)
    return

  const level = isReducedMotion.value ? 0 : Math.min(1, Math.max(0, amplitude.value))
  const reactivity = isReducedMotion.value ? 0 : stateMotion.value.reactivity
  const reactiveBlur = blurAmount.value * (1 - level * reactivity * AMPLITUDE_BLUR_FALLOFF)
  const reactiveScale = stateMotion.value.scale + level * reactivity * AMPLITUDE_SCALE_GAIN
  root.value.style.setProperty('--amplitude', `${level}`)
  root.value.style.setProperty('--blur-amount', `${reactiveBlur}px`)
  root.value.style.setProperty('--reactive-scale', `${reactiveScale}`)
}

function updateReducedMotion(event?: MediaQueryListEvent) {
  isReducedMotion.value = event?.matches ?? reducedMotionQuery?.matches ?? false
  syncAmplitude()
}

watch([amplitude, stateMotion, isReducedMotion, blurAmount], syncAmplitude, { immediate: true })

onMounted(() => {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateReducedMotion()
  reducedMotionQuery.addEventListener('change', updateReducedMotion)
})

onBeforeUnmount(() => {
  reducedMotionQuery?.removeEventListener('change', updateReducedMotion)
})
</script>

<template>
  <div
    ref="root"
    class="siri-orb-shell"
    :class="props.class"
    :data-reduced-motion="isReducedMotion"
    :data-state="props.state"
    :style="orbStyle"
    aria-hidden="true"
    data-testid="dashboard-loading-siri-orb"
  >
    <div class="siri-orb-bloom" />
    <div class="siri-orb-core" :data-mask-radius="maskRadius">
      <span aria-hidden="true" class="siri-orb-layer siri-orb-sheen" />
      <span aria-hidden="true" class="siri-orb-layer siri-orb-rim" />
    </div>
  </div>
</template>

<style>
@property --angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}

.siri-orb-shell {
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: var(--orb-size);
  height: var(--orb-size);
  transform-origin: center;
  isolation: isolate;
}

.siri-orb-bloom {
  position: absolute;
  inset: -12%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, var(--c2) 0%, transparent 64%);
  filter: blur(var(--glow-blur));
  opacity: var(--state-glow);
  pointer-events: none;
}

.siri-orb-core {
  position: relative;
  display: grid;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
  isolation: isolate;
  transform: scale(var(--reactive-scale));
  transform-origin: center;
  filter: saturate(var(--state-saturation)) hue-rotate(var(--hue-rotate));
  will-change: transform;
}

.siri-orb-core::before,
.siri-orb-core::after,
.siri-orb-core > .siri-orb-layer {
  content: "";
  display: block;
  grid-area: 1 / 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.siri-orb-sheen {
  background:
    radial-gradient(circle at 30% 24%, hsl(0 0% 100% / 0.32), transparent 34%),
    radial-gradient(circle at 72% 80%, hsl(0 0% 100% / 0.07), transparent 48%);
  mix-blend-mode: screen;
  animation: siri-orb-drift var(--drift-duration) ease-in-out infinite alternate;
}

.siri-orb-rim {
  box-shadow:
    inset 0 0 0 1px hsl(0 0% 100% / 0.16),
    inset 0 var(--rim) calc(var(--rim) * 2) hsl(0 0% 100% / 0.22),
    inset 0 calc(var(--rim) * -1.2) calc(var(--rim) * 2.4) hsl(0 0% 0% / 0.4);
  pointer-events: none;
}

.siri-orb-core::before {
  background:
    conic-gradient(from calc(var(--angle) * 2) at 25% 70%, var(--c3), transparent 20% 80%, var(--c3)),
    conic-gradient(from calc(var(--angle) * 2) at 45% 75%, var(--c2), transparent 30% 60%, var(--c2)),
    conic-gradient(from calc(var(--angle) * -3) at 80% 20%, var(--c1), transparent 40% 60%, var(--c1)),
    conic-gradient(from calc(var(--angle) * 1.5) at 60% 35%, var(--c4), transparent 25% 75%, var(--c4)),
    conic-gradient(from calc(var(--angle) * 2) at 15% 5%, var(--c2), transparent 10% 90%, var(--c2)),
    conic-gradient(from calc(var(--angle) * 1) at 20% 80%, var(--c1), transparent 10% 90%, var(--c1)),
    conic-gradient(from calc(var(--angle) * -2) at 85% 10%, var(--c3), transparent 20% 80%, var(--c3));
  box-shadow: inset 0 0 var(--shadow-spread) var(--shadow-offset) var(--bg);
  filter: blur(var(--blur-amount)) contrast(var(--contrast-amount)) saturate(1.4);
  animation: siri-orb-rotate var(--animation-duration) linear infinite;
}

.siri-orb-core::after {
  background-image: radial-gradient(circle at center, var(--bg) var(--dot-size), transparent var(--dot-size));
  background-repeat: repeat;
  background-size: calc(var(--dot-size) * 2) calc(var(--dot-size) * 2);
  backdrop-filter: blur(calc(var(--blur-amount) * 2)) contrast(calc(var(--contrast-amount) * 2));
  mix-blend-mode: overlay;
}

.siri-orb-core:not([data-mask-radius="0%"])::after {
  mask-image: radial-gradient(black var(--mask-radius), transparent 75%);
}

.siri-orb-shell[data-state="idle"] {
  animation: siri-orb-breathe 5.5s ease-in-out infinite;
}

.siri-orb-shell[data-state="streaming"] {
  animation: siri-orb-pulse var(--pulse-duration) ease-in-out infinite;
}

.siri-orb-shell[data-state="done"] {
  animation: siri-orb-settle 650ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.siri-orb-shell[data-state="error"] {
  animation: siri-orb-error 180ms cubic-bezier(0.645, 0.045, 0.355, 1) both;
}

@keyframes siri-orb-rotate {
  to { --angle: 360deg; }
}

@keyframes siri-orb-drift {
  0% { transform: translate(-6%, -4%) scale(1.05); }
  100% { transform: translate(7%, 6%) scale(1.12); }
}

@keyframes siri-orb-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.035); }
}

@keyframes siri-orb-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}

@keyframes siri-orb-settle {
  0% { transform: scale(0.98); }
  55% { transform: scale(1.035); }
  100% { transform: scale(1); }
}

@keyframes siri-orb-error {
  0%, 100% { transform: translateX(0); }
  33% { transform: translateX(-3px); }
  66% { transform: translateX(3px); }
}

@media (prefers-reduced-motion: reduce) {
  .siri-orb-shell,
  .siri-orb-core::before,
  .siri-orb-sheen {
    animation: none !important;
  }
}

.siri-orb-shell[data-reduced-motion="true"] .siri-orb-core::before,
.siri-orb-shell[data-reduced-motion="true"] .siri-orb-sheen {
  animation: none !important;
}
</style>
