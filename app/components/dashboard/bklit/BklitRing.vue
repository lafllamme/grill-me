<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitRingContextKey } from './ring-context'
import { useBklitEnter } from './use-bklit-enter'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{
  index: number
  animate?: boolean
  showGlow?: boolean
  lineCap?: 'round' | 'butt'
}>(), {
  animate: true,
  showGlow: true,
  lineCap: 'round',
})

const injectedContext = inject(bklitRingContextKey)

if (!injectedContext) {
  throw new Error('BklitRing must be rendered inside BklitRingChart')
}

const context = injectedContext
const enterTransition = { type: 'tween' as const, durationSeconds: 1.1 }
const expandProgress = useBklitEnter(props.animate, props.index * 0.08 * context.enterStaggerScale, '', enterTransition)
const progressMount = useBklitEnter(props.animate, (0.6 + props.index * 0.1) * context.enterStaggerScale, '', enterTransition)

const progressPath = computed(() => context.getProgressPath(props.index, progressMount.value, props.lineCap))
const ringColor = computed(() => context.data[props.index]?.color ?? 'currentColor')
const hoverScaleTarget = computed(() => context.hoveredIndex.value === props.index ? 1.03 : context.hoveredIndex.value !== null && context.hoveredIndex.value < props.index ? 1.02 : 1)
const hoverScale = useBklitSpring(hoverScaleTarget, { stiffness: 400, damping: 25 }, 1)
const layerOpacity = computed(() => context.hoveredIndex.value !== null && context.hoveredIndex.value !== props.index ? 0.35 : 1)

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
    class="cursor-pointer"
    :style="{ opacity: layerOpacity, filter: showGlow && context.hoveredIndex.value === props.index ? `drop-shadow(0 0 12px ${ringColor})` : 'none', transformOrigin: '0px 0px', transform: `scale(${expandProgress * hoverScale})` }"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
  >
    <path :d="context.getRingPath(props.index, props.lineCap).backgroundPath" class="fill-chart-track" />
    <path
      :d="progressPath"
      :fill="context.data[props.index]?.color"
      :class="[context.data[props.index]?.color ? '' : ringToneClass(props.index)]"
    />
  </g>
</template>
