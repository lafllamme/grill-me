<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ dataKey: string, fill?: string }>(), { fill: 'var(--color-chart-line-secondary)' })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext)
  throw new Error('BklitBarDepthFront must be rendered inside BklitBarChart')
const context = injectedContext
const baseline = context.chartHeight - context.plotBottom
const plotHeight = baseline - context.plotTop
function bar(index: number) {
  const width = context.barWidth ?? Math.max(10, ((context.chartWidth - context.plotLeft - context.plotRight) / Math.max(context.data.length, 1)) * (1 - context.barGap) / Math.max(context.seriesCount, 1) - 4)
  const height = context.valueAt(props.dataKey, index) / context.maxValue(props.dataKey) * plotHeight
  return { x: context.xAt(index) - width / 2, y: baseline - height, width, height }
}
</script>

<template>
  <g :fill="props.fill">
    <rect v-for="(_, index) in context.data" :key="index" :x="bar(index).x" :y="bar(index).y" :width="bar(index).width" :height="bar(index).height" rx="4" />
  </g>
</template>
