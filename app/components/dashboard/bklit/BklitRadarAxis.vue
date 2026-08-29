<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{ stroke?: string, strokeOpacity?: number, className?: string }>(), { stroke: undefined, strokeOpacity: 0.6, className: '' })
const context = useBklitRadarContext()
const progress = context.metrics.map((_, index) => useBklitEnter(context.animate, index * 0.05, `${context.motionReplayKey}-axis-${index}`, { type: 'spring', stiffness: 80, damping: 15, mass: 1 }))
const progressValue = (index: number) => progress[index]?.value ?? 1
</script>

<template>
  <g class="bklit-radar-axis" :class="props.className" :transform="`translate(${context.center} ${context.center})`">
    <line v-for="(metric, index) in context.metrics" :key="metric.key" class="bklit-radar-axis-line" x1="0" :x2="(context.getPoint(index, 100).x - context.center) * progressValue(index)" y1="0" :y2="(context.getPoint(index, 100).y - context.center) * progressValue(index)" :stroke="props.stroke || 'var(--border, var(--color-chart-grid))'" stroke-width="1" :stroke-opacity="props.strokeOpacity" />
  </g>
</template>
