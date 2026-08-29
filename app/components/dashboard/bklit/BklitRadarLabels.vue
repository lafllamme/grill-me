<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{ offset?: number, fontSize?: number, interactive?: boolean, className?: string }>(), { offset: 24, fontSize: 11, interactive: false, className: '' })
const context = useBklitRadarContext()
const labelDelay = context.levels * 0.08 * 0.5
const progress = context.metrics.map((_, index) => useBklitEnter(context.animate, labelDelay + index * 0.08, `${context.motionReplayKey}-label-${index}`, { type: 'spring', stiffness: 80, damping: 15, mass: 1 }))
const opacityProgress = context.metrics.map((_, index) => useBklitEnter(context.animate, labelDelay + index * 0.08, `${context.motionReplayKey}-label-opacity-${index}`, { type: 'tween', durationSeconds: 0.5 }))
const progressValue = (index: number) => progress[index]?.value ?? 1
const opacityValue = (index: number) => opacityProgress[index]?.value ?? 1
</script>

<template>
  <g class="bklit-radar-labels" :class="props.className">
    <g v-for="(metric, index) in context.metrics" :key="metric.key" class="bklit-radar-label" :transform="`translate(${context.center + (context.getPoint(index, 100, context.radius + props.offset).x - context.center) * progressValue(index)} ${context.center + (context.getPoint(index, 100, context.radius + props.offset).y - context.center) * progressValue(index)})`" :opacity="opacityValue(index)">
      <text x="0" y="0" :class="props.interactive ? 'transition-opacity duration-150 hover:opacity-100' : ''" :font-size="props.fontSize" font-weight="500" text-anchor="middle" dominant-baseline="middle" :style="{ fill: 'var(--chart-label)' }">
        {{ metric.label }}
      </text>
    </g>
  </g>
</template>
