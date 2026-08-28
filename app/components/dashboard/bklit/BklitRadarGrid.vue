<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

withDefaults(defineProps<{ showLabels?: boolean, stroke?: string, strokeOpacity?: number, className?: string }>(), { showLabels: true, stroke: undefined, strokeOpacity: 0.6, className: '' })
const context = useBklitRadarContext()
const progress = Array.from({ length: context.levels }, (_, index) => useBklitEnter(context.animate, index * 0.08 * context.staggerScale * context.enterDurationMs / 1100, `${context.motionReplayKey}-grid-${index}`, { type: 'tween', durationSeconds: context.enterDurationMs / 1000 }))
const labelProgress = Array.from({ length: context.levels }, (_, index) => useBklitEnter(context.animate, context.levels * 0.08 * 0.5 + index * 0.06, `${context.motionReplayKey}-grid-label-${index}`, { type: 'tween', durationSeconds: 0.5 }))
const progressValue = (index: number) => progress[index]?.value ?? 1
const labelProgressValue = (index: number) => labelProgress[index]?.value ?? 1
</script>

<template>
  <g class="bklit-radar-grid" :class="className" :style="{ stroke: 'var(--chart-grid)' }">
    <polygon v-for="index in context.levels" :key="`grid-${index}`" class="bklit-radar-grid-level" :points="context.pointsFor(Object.fromEntries(context.metrics.map(metric => [metric.key, 100])), context.radius * (index / context.levels) * progressValue(index - 1))" fill="none" :stroke="stroke || undefined" stroke-width="1" :stroke-opacity="strokeOpacity" />
    <g v-if="showLabels">
      <text v-for="index in context.levels" :key="`level-${index}`" :x="context.center + 5" :y="context.center - context.radius * (index / context.levels) * progressValue(index - 1)" :opacity="labelProgressValue(index - 1)" font-size="9" text-anchor="start" dominant-baseline="middle" :style="{ fill: 'var(--chart-label)' }">{{ index * (100 / context.levels) }}</text>
    </g>
  </g>
</template>
