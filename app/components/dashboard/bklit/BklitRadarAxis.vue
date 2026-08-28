<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{ stroke?: string, strokeOpacity?: number, className?: string }>(), { stroke: undefined, strokeOpacity: 0.6, className: '' })
const context = useBklitRadarContext()
const progress = context.metrics.map((_, index) => useBklitEnter(context.animate, index * 0.05 * context.staggerScale * context.enterDurationMs / 1100, `${context.motionReplayKey}-axis-${index}`))
const progressValue = (index: number) => progress[index]?.value ?? 1
</script>

<template>
  <g class="bklit-radar-axis stroke-divider" :class="props.className">
    <line v-for="(metric, index) in context.metrics" :key="metric.key" class="bklit-radar-axis-line" :x1="context.center" :x2="context.center + (context.getPoint(index, 100).x - context.center) * progressValue(index)" :y1="context.center" :y2="context.center + (context.getPoint(index, 100).y - context.center) * progressValue(index)" :stroke="props.stroke || undefined" stroke-width="1" :stroke-opacity="props.strokeOpacity" />
  </g>
</template>
