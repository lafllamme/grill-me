<script setup lang="ts">
import type { SunburstArc, SunburstGeometry } from './sunburst'
import { animate, motionValue } from 'motion-v'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { createSunburstGeometryPath } from './sunburst'
import { useBklitEnter } from './use-bklit-enter'

const props = defineProps<{
  arc: SunburstArc
  color: string
  delay: number
  fillOpacity: number
  geometry: SunburstGeometry | null
  hoverGrow: number
  hoverOffset: number
  isRelated: boolean
  reducedMotion: boolean
  replayKey: string
}>()
const emit = defineEmits<{ hover: [active: boolean], select: [] }>()
const progress = useBklitEnter(!props.reducedMotion, props.delay, `${props.replayKey}-${props.arc.id}`, { type: 'tween', durationSeconds: 1.1 })
const hoverProgressMotion = motionValue(props.reducedMotion ? 1 : 0)
const hoverProgress = ref(hoverProgressMotion.get())
let stopHoverAnimation: (() => void) | undefined

function animateHover() {
  stopHoverAnimation?.()
  if (props.reducedMotion) {
    hoverProgressMotion.set(1)
    return
  }
  const target = props.hoverGrow || props.hoverOffset ? 1 : 0
  const controls = animate(hoverProgressMotion, target, { type: 'tween', duration: 0.42, ease: [0.22, 1, 0.36, 1] })
  stopHoverAnimation = () => controls.stop()
}

onMounted(() => {
  const unsubscribe = hoverProgressMotion.on('change', (value) => {
    hoverProgress.value = value
  })
  animateHover()
  onBeforeUnmount(unsubscribe)
})
watch(() => [props.hoverGrow, props.hoverOffset, props.reducedMotion], animateHover)
onBeforeUnmount(() => stopHoverAnimation?.())

const hitPath = computed(() => props.geometry
  ? createSunburstGeometryPath(props.geometry, props.reducedMotion ? 1 : progress.value)
  : '')
const visualPath = computed(() => props.geometry
  ? createSunburstGeometryPath(props.geometry, props.reducedMotion ? 1 : progress.value, props.hoverGrow * hoverProgress.value, props.hoverOffset * hoverProgress.value)
  : '')
</script>

<template>
  <g
    class="cursor-pointer"
    :style="{ opacity: props.isRelated ? 1 : 0.25, transition: props.reducedMotion ? 'none' : 'opacity 160ms ease-out', transformOrigin: '0 0' }"
    :transform="`scale(${progress})`"
    @pointerenter="emit('hover', true)"
    @focusin="emit('hover', true)"
  >
    <title>{{ props.arc.name }} · {{ props.arc.value }} changes</title>
    <path
      :d="hitPath"
      fill="transparent"
      tabindex="0"
      :aria-label="`${props.arc.name}, ${props.arc.value} changes`"
      role="button"
      @click="emit('select')"
      @keydown.enter="emit('select')"
      @keydown.space.prevent="emit('select')"
    />
    <path
      :d="visualPath"
      :fill="props.color"
      :fill-opacity="props.fillOpacity"
      pointer-events="none"
      stroke="var(--color-chart-track)"
      stroke-linejoin="round"
      stroke-width="1"
    />
  </g>
</template>
