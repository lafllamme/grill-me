<script setup lang="ts">
import { animate, motionValue } from 'motion-v'
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { bklitRingContextKey } from './ring-context'

const props = withDefaults(defineProps<{
  index: number
  animate?: boolean
  showGlow?: boolean
}>(), {
  animate: true,
  showGlow: true,
})

const injectedContext = inject(bklitRingContextKey)

if (!injectedContext) {
  throw new Error('BklitRing must be rendered inside BklitRingChart')
}

const context = injectedContext
const expandProgress = ref(0)
const progressMount = ref(0)
const expandMotion = motionValue(0)
const progressMotion = motionValue(0)
let expandControls: { stop: () => void } | undefined
let progressControls: { stop: () => void } | undefined

const progressPath = computed(() => context.getProgressPath(props.index, progressMount.value))
const ringColor = computed(() => context.data[props.index]?.color ?? 'currentColor')
const hoverScale = computed(() => context.hoveredIndex.value === props.index ? 1.03 : context.hoveredIndex.value !== null && context.hoveredIndex.value < props.index ? 1.02 : 1)
const layerOpacity = computed(() => context.hoveredIndex.value !== null && context.hoveredIndex.value !== props.index ? 0.35 : 1)

function syncExpand(value: number) {
  expandProgress.value = value
}

function syncProgress(value: number) {
  progressMount.value = value
}

onMounted(() => {
  const expandUnsubscribe = expandMotion.on('change', syncExpand)
  const progressUnsubscribe = progressMotion.on('change', syncProgress)
  if (!props.animate) {
    expandProgress.value = 1
    progressMount.value = 1
    return
  }
  expandControls = animate(expandMotion, 1, { type: 'spring', stiffness: 320, damping: 28, delay: props.index * 0.08 })
  progressControls = animate(progressMotion, 1, { type: 'spring', stiffness: 260, damping: 25, delay: 0.6 + props.index * 0.1 })
  onBeforeUnmount(() => {
    expandUnsubscribe()
    progressUnsubscribe()
  })
})

onBeforeUnmount(() => {
  expandControls?.stop()
  progressControls?.stop()
})

function handleEnter() {
  context.setHoveredIndex(props.index)
}

function handleLeave() {
  context.clearHoveredIndex()
}

function ringToneClass(index: number) {
  return index === 0 ? 'fill-primary-strong' : index === 1 ? 'fill-primary' : 'fill-primary/70'
}
</script>

<template>
  <g
    class="cursor-pointer transition-[transform,opacity,filter] duration-200 ease-out"
    :style="{ opacity: layerOpacity, filter: showGlow && context.hoveredIndex.value === props.index ? `drop-shadow(0 0 12px ${ringColor})` : 'none', transformOrigin: '0px 0px', transform: `scale(${expandProgress * hoverScale})` }"
    @pointerenter="handleEnter"
    @pointerleave="handleLeave"
  >
    <path :d="context.getRingPath(props.index).backgroundPath" class="fill-chart-track" />
    <path
      :d="progressPath"
      :fill="context.data[props.index]?.color"
      :class="[context.data[props.index]?.color ? '' : ringToneClass(props.index)]"
    />
  </g>
</template>
