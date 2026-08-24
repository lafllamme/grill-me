<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { barDepthAndRise, barDepthMaxDepth } from './bar-depth-geometry'

const props = withDefaults(defineProps<{ dataKey: string, fill?: string, depth?: number }>(), { fill: 'var(--color-chart-line-primary)', depth: 6 })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext)
  throw new Error('BklitBarDepthBack must be rendered inside BklitBarChart')
const context = injectedContext
const baseline = context.chartHeight - context.plotBottom
const plotHeight = baseline - context.plotTop
const barWidth = computed(() => context.barWidth ?? Math.max(10, ((context.chartWidth - context.plotLeft - context.plotRight) / Math.max(context.data.length, 1)) * (1 - context.barGap) / Math.max(context.seriesCount, 1) - 4))
const maxDepth = computed(() => barDepthMaxDepth((context.chartWidth - context.plotLeft - context.plotRight) / Math.max(context.data.length, 1), barWidth.value))
function bar(index: number) {
  const height = context.valueAt(props.dataKey, index) / context.maxValue(props.dataKey) * plotHeight
  const x = context.xAt(index) - barWidth.value / 2
  const rise = barDepthAndRise(Math.abs(index - (context.data.length - 1) / 2) / Math.max((context.data.length - 1) / 2, 1), height, props.depth || maxDepth.value).perspectiveRise
  return { x, y: baseline - height, width: barWidth.value, height, depth: props.depth || maxDepth.value, rise }
}
</script>

<template>
  <g :fill="props.fill" opacity="0.42">
    <template v-for="(_, index) in context.data" :key="index">
      <path :d="`M ${bar(index).x} ${bar(index).y} L ${bar(index).x + bar(index).width} ${bar(index).y} L ${bar(index).x + bar(index).width + bar(index).depth} ${bar(index).y - bar(index).rise} L ${bar(index).x + bar(index).depth} ${bar(index).y - bar(index).rise} Z`" />
    </template>
  </g>
</template>
