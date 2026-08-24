<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ dataKey: string, fill?: string, animate?: boolean }>(), { fill: 'var(--color-chart-line-primary)', animate: true })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext)
  throw new Error('BklitBarPulse must be rendered inside BklitBarChart')
const context = injectedContext
const baseline = context.chartHeight - context.plotBottom
const plotHeight = baseline - context.plotTop
function pulse(index: number) {
  const height = context.valueAt(props.dataKey, index) / context.maxValue(props.dataKey) * plotHeight
  return { x: context.xAt(index), y: baseline - height }
}
</script>

<template>
  <g :fill="props.fill">
    <circle v-for="(_, index) in context.data" :key="index" :cx="pulse(index).x" :cy="pulse(index).y" r="3" :class="props.animate ? 'animate-pulse' : ''" />
  </g>
</template>
