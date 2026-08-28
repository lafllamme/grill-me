<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitRingContextKey } from './ring-context'
import { useBklitEnter } from './use-bklit-enter'

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
const expandProgress = useBklitEnter(props.animate, props.index * 0.08 * context.enterStaggerScale, '', { type: 'tween', durationSeconds: context.animationDuration / 1000 })
const progressMount = useBklitEnter(props.animate, (0.6 + props.index * 0.1) * context.enterStaggerScale, '', { type: 'tween', durationSeconds: context.animationDuration / 1000 })

const progressPath = computed(() => context.getProgressPath(props.index, progressMount.value))
const ringColor = computed(() => context.data[props.index]?.color ?? 'currentColor')
const hoverScale = computed(() => context.hoveredIndex.value === props.index ? 1.03 : context.hoveredIndex.value !== null && context.hoveredIndex.value < props.index ? 1.02 : 1)
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
