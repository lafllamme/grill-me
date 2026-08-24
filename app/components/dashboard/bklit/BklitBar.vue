<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{
  dataKey: string
  fill?: string
  lineCap?: 'round' | 'butt' | number
  animationType?: 'grow' | 'fade'
  fadedOpacity?: number
  minBarHeight?: number
  groupGap?: number
}>(), {
  fill: 'currentColor',
  lineCap: 'round',
  animationType: 'grow',
  fadedOpacity: 0.3,
  minBarHeight: 0,
  groupGap: 4,
})

const injectedContext = inject(bklitBarContextKey)
if (!injectedContext) {
  throw new Error('BklitBar must be rendered inside BklitBarChart')
}
const context = injectedContext

const bandWidth = computed(() => {
  const step = (context.chartWidth - context.plotLeft - context.plotRight) / Math.max(context.data.length, 1)
  return step * (1 - context.barGap)
})
const barWidth = computed(() => {
  const groupGap = context.seriesCount > 1 ? props.groupGap : 0
  return context.barWidth ?? Math.max(10, (bandWidth.value - groupGap * (context.seriesCount - 1)) / context.seriesCount)
})
const baseline = context.chartHeight - context.plotBottom
const plotHeight = baseline - context.plotTop

function getRect(index: number) {
  const value = context.valueAt(props.dataKey, index)
  const height = Math.max(props.minBarHeight, value / context.maxValue(props.dataKey) * plotHeight)
  const groupGap = context.seriesCount > 1 ? props.groupGap : 0
  const groupWidth = barWidth.value * context.seriesCount + (context.seriesCount - 1) * groupGap
  const seriesIndex = props.dataKey === 'additions' ? 0 : 1
  return { x: context.xAt(index) - groupWidth / 2 + seriesIndex * (barWidth.value + groupGap), y: baseline - height, height }
}

function getOpacity(index: number) {
  return context.hoveredIndex.value !== null && context.hoveredIndex.value !== index ? props.fadedOpacity : 1
}

function getRadius() {
  return props.lineCap === 'round' ? Math.min(barWidth.value / 2, 8) : typeof props.lineCap === 'number' ? props.lineCap : 0
}
</script>

<template>
  <g :class="[props.animationType === 'fade' ? 'animate-fade-in' : '', props.fill === 'var(--color-chart-line-primary)' ? 'text-chart-line-primary' : '', props.fill === 'var(--color-chart-line-secondary)' ? 'text-chart-line-secondary' : '']">
    <rect v-for="(_, index) in context.data" :key="index" class="transition-[opacity,transform] duration-300 origin-bottom cursor-crosshair" :class="props.animationType === 'grow' ? 'origin-bottom' : ''" :x="getRect(index).x" :y="getRect(index).y" :width="barWidth" :height="getRect(index).height" :rx="getRadius()" :fill="props.fill.startsWith('var(--color-chart-line-') ? 'currentColor' : props.fill" :opacity="getOpacity(index)" @pointerenter="context.setHoveredIndex(index)" @pointerleave="context.setHoveredIndex(null)">
      <title>{{ context.data[index]?.[context.xDataKey] }}: {{ context.valueAt(props.dataKey, index) }}</title>
    </rect>
  </g>
</template>
