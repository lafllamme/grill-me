<script setup lang="ts">
import { computed } from 'vue'
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{ index: number, color?: string, showPoints?: boolean, showStroke?: boolean, showGlow?: boolean, className?: string }>(), { color: undefined, showPoints: true, showStroke: true, showGlow: true, className: '' })
const context = useBklitRadarContext()
const series = computed(() => context.data[props.index])
const isHovered = computed(() => context.hoveredIndex.value === props.index)
const color = computed(() => props.color || context.colorFor(props.index))
const enterProgress = useBklitEnter(context.animate, (context.levels * 0.08 + 0.2 + props.index * 0.15) * context.staggerScale * context.enterDurationMs / 1100, `${context.motionReplayKey}-${props.index}`, { type: 'tween', durationSeconds: context.enterDurationMs / 1000 })
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
  <g v-if="series" class="bklit-radar-area" :class="[props.className, { 'is-hovered': isHovered }]" @pointerenter="context.setHoveredIndex(props.index)" @pointerleave="context.setHoveredIndex(null)">
    <path :d="`M ${points.replaceAll(' ', ' L ')} Z`" :fill="color" :fill-opacity="isHovered ? 0.35 : 0.15" :stroke="showStroke ? color : 'none'" :stroke-width="isHovered ? 3 : 2" stroke-linejoin="round" :style="{ filter: showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : 'none' }" />
    <g v-if="showPoints">
      <circle v-for="(metric, metricIndex) in context.metrics" :key="metric.key" :cx="context.center + (context.getPoint(metricIndex, series.values[metric.key] ?? 0).x - context.center) * enterProgress" :cy="context.center + (context.getPoint(metricIndex, series.values[metric.key] ?? 0).y - context.center) * enterProgress" :r="isHovered ? 6 : 4" :fill="color" class="stroke-background" stroke-width="2" />
    </g>
  </g>
</template>

<style scoped>
.bklit-radar-area { cursor: pointer; opacity: 1; transform-origin: center; transition: opacity 150ms ease, transform 350ms cubic-bezier(.22, 1, .36, 1); }
.bklit-radar-area.is-hovered { transform: scale(1.05); }
</style>
