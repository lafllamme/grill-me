<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

withDefaults(defineProps<{ showLabels?: boolean, stroke?: string, strokeOpacity?: number, className?: string }>(), { showLabels: true, stroke: undefined, strokeOpacity: 0.6, className: '' })
const context = useBklitRadarContext()
const durationFactor = context.enterDurationMs / 1100
const gridStagger = 0.08 * context.staggerScale * durationFactor
const labelDelay = context.levels * gridStagger * 0.5
const progress = Array.from({ length: context.levels }, (_, index) => useBklitEnter(context.animate, index * gridStagger, `${context.motionReplayKey}-grid-${index}`, { type: 'spring', stiffness: 100, damping: 15, mass: 1 }))
const labelProgress = Array.from({ length: context.levels }, (_, index) => useBklitEnter(context.animate, labelDelay + index * 0.06 * durationFactor, `${context.motionReplayKey}-grid-label-${index}`, { type: 'tween', durationSeconds: 0.5 }))
const progressValue = (index: number) => progress[index]?.value ?? 1
const labelProgressValue = (index: number) => labelProgress[index]?.value ?? 1

function gridPoints(distance: number) {
  const halfStep = Math.PI / context.metrics.length
  return context.metrics.map((_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / context.metrics.length + halfStep
    return `${context.center + Math.cos(angle) * distance},${context.center + Math.sin(angle) * distance}`
  }).join(' ')
}
</script>

<template>
  <g class="bklit-radar-grid" :class="className" :style="{ stroke: 'var(--color-chart-grid)' }">
    <g v-for="index in context.levels" :key="`grid-${index}`" :transform="`translate(${context.center} ${context.center}) scale(${progressValue(index - 1)}) translate(${-context.center} ${-context.center})`" :opacity="progressValue(index - 1)">
      <polygon class="bklit-radar-grid-level" :points="gridPoints(context.radius * (index / context.levels))" fill="none" :stroke="stroke || undefined" stroke-linecap="round" stroke-width="1" :stroke-opacity="strokeOpacity" />
    </g>
    <g v-if="showLabels">
      <g v-for="index in context.levels" :key="`level-${index}`" :opacity="labelProgressValue(index - 1)">
        <text :x="context.center + 4" :y="context.center - context.radius * (index / context.levels)" font-size="9" text-anchor="start" dominant-baseline="middle" :style="{ fill: 'var(--chart-label)' }">
          {{ index * (100 / context.levels) }}
        </text>
      </g>
    </g>
  </g>
</template>
