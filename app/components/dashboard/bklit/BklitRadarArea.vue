<script setup lang="ts">
import { computed } from 'vue'
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{ index: number, color?: string, showPoints?: boolean, showStroke?: boolean, showGlow?: boolean, className?: string }>(), { color: undefined, showPoints: true, showStroke: true, showGlow: true, className: '' })
const context = useBklitRadarContext()
const series = computed(() => context.data[props.index])
const isHovered = computed(() => context.hoveredIndex.value === props.index)
const isDimmed = computed(() => context.hoveredIndex.value !== null && !isHovered.value)
const color = computed(() => props.color || context.colorFor(props.index))
const durationFactor = context.enterDurationMs / 1100
const gridStagger = 0.08 * context.staggerScale * durationFactor
const campaignBaseDelay = (context.levels * gridStagger + 0.2) * durationFactor
const campaignStagger = 0.15 * context.staggerScale * durationFactor
const enterProgress = useBklitEnter(context.animate, campaignBaseDelay + props.index * campaignStagger, `${context.motionReplayKey}-${props.index}`, { type: 'spring', stiffness: 100, damping: 15, mass: 1 })
const hoverScaleTarget = computed(() => isHovered.value ? 1.05 : 1)
const hoverScale = useBklitSpring(hoverScaleTarget, { stiffness: 400, damping: 25 }, 1)
const points = computed(() => {
  if (!series.value) {
    return ''
  }
  return context.metrics.map((metric, metricIndex) => {
    const target = context.getPoint(metricIndex, series.value?.values[metric.key] ?? 0)
    return `${context.center + (target.x - context.center) * enterProgress.value},${context.center + (target.y - context.center) * enterProgress.value}`
  }).join(' ')
})
</script>

<template>
  <g v-if="series" class="bklit-radar-area cursor-pointer" :class="[props.className, { 'is-hovered': isHovered, 'is-dimmed': isDimmed }]" :opacity="isDimmed ? 0.3 : enterProgress" :transform="`translate(${context.center} ${context.center}) scale(${hoverScale}) translate(${-context.center} ${-context.center})`" @pointerenter="context.setHoveredIndex(props.index)" @pointerleave="context.setHoveredIndex(null)">
    <path :d="`M ${points.replaceAll(' ', ' L ')} Z`" :fill="color" :fill-opacity="isHovered ? 0.35 : 0.15" :stroke="showStroke ? color : 'none'" :stroke-width="isHovered ? 3 : 2" stroke-linejoin="round" :style="{ filter: showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : 'none', transition: 'fill-opacity 200ms ease, stroke-width 200ms ease' }" />
    <g v-if="showPoints">
      <circle v-for="(metric, metricIndex) in context.metrics" :key="metric.key" :cx="context.center + (context.getPoint(metricIndex, series.values[metric.key] ?? 0).x - context.center) * enterProgress" :cy="context.center + (context.getPoint(metricIndex, series.values[metric.key] ?? 0).y - context.center) * enterProgress" :r="isHovered ? 6 : 4" :fill="color" class="stroke-background" stroke-width="2" />
    </g>
  </g>
</template>
