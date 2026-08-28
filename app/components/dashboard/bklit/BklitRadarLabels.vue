<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'
import { useBklitEnter } from './use-bklit-enter'

const props = withDefaults(defineProps<{ offset?: number, fontSize?: number, interactive?: boolean, className?: string }>(), { offset: 24, fontSize: 11, interactive: false, className: '' })
const context = useBklitRadarContext()
const progress = context.metrics.map((_, index) => useBklitEnter(context.animate, (context.levels * 0.08 * 0.5 + index * 0.08) * context.staggerScale * context.enterDurationMs / 1100, `${context.motionReplayKey}-label-${index}`))
const opacityProgress = context.metrics.map((_, index) => useBklitEnter(context.animate, (context.levels * 0.08 * 0.5 + index * 0.08) * context.staggerScale * context.enterDurationMs / 1100, `${context.motionReplayKey}-label-opacity-${index}`, { type: 'tween', durationSeconds: 0.5 }))
const progressValue = (index: number) => progress[index]?.value ?? 1
const opacityValue = (index: number) => opacityProgress[index]?.value ?? 1
</script>

<template>
  <g class="bklit-radar-labels" :class="props.className">
    <text v-for="(metric, index) in context.metrics" :key="metric.key" class="bklit-radar-label" :x="context.center + (context.getPoint(index, 100, context.radius + props.offset).x - context.center) * progressValue(index)" :y="context.center + (context.getPoint(index, 100, context.radius + props.offset).y - context.center) * progressValue(index)" :opacity="opacityValue(index)" :class="props.interactive ? 'transition-opacity duration-150 hover:opacity-100' : ''" :font-size="props.fontSize" font-weight="500" text-anchor="middle" dominant-baseline="middle" :style="{ fill: 'var(--chart-label)' }">{{ metric.label }}</text>
  </g>
</template>
