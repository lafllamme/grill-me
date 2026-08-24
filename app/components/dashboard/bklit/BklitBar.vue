<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{
  dataKey: string
  fill?: string
  stroke?: string
  animate?: boolean
  lineCap?: 'round' | 'butt' | number
  animationType?: 'grow' | 'fade'
  fadedOpacity?: number
  minBarHeight?: number
  groupGap?: number
  staggerDelay?: number
  stackGap?: number
  perspective?: boolean
}>(), {
  fill: 'currentColor',
  stroke: undefined,
  animate: true,
  lineCap: 'round',
  animationType: 'grow',
  fadedOpacity: 0.3,
  minBarHeight: 0,
  groupGap: 4,
  staggerDelay: 0,
  stackGap: 0,
  perspective: false,
})

const injectedContext = inject(bklitBarContextKey)
if (!injectedContext) {
  throw new Error('BklitBar must be rendered inside BklitBarChart')
}
const context = injectedContext

context.registerSeries(props.dataKey, props.stroke ?? (props.fill.startsWith('var(--color-chart-line-') ? props.fill.replace('var(--color-', 'var(--color-') : props.fill))

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
  const valueLength = Math.max(props.minBarHeight, value / context.maxValue(props.dataKey) * (context.orientation === 'horizontal' ? context.chartWidth - context.plotLeft - context.plotRight : plotHeight))
  const groupGap = context.seriesCount > 1 ? props.groupGap : 0
  const groupWidth = barWidth.value * context.seriesCount + (context.seriesCount - 1) * groupGap
  const seriesIndex = Math.max(0, context.seriesOrder.indexOf(props.dataKey))
  if (context.orientation === 'horizontal') {
    return { x: context.plotLeft, y: context.yAt(index) - groupWidth / 2 + seriesIndex * (barWidth.value + groupGap), width: valueLength, height: barWidth.value }
  }
  if (context.stacked) {
    const stackIndex = Math.max(0, context.seriesOrder.indexOf(props.dataKey))
    const stackBefore = context.seriesOrder.slice(0, stackIndex).reduce((total, key) => total + context.valueAt(key, index) / context.maxValue(key) * plotHeight, 0)
    const stackOffset = stackIndex * context.stackGap
    return { x: context.xAt(index) - bandWidth.value / 2, y: baseline - stackBefore - valueLength - stackOffset, width: bandWidth.value, height: valueLength }
  }
  return { x: context.xAt(index) - groupWidth / 2 + seriesIndex * (barWidth.value + groupGap), y: baseline - valueLength, width: barWidth.value, height: valueLength }
}

function getOpacity(index: number) {
  return context.hoveredIndex.value !== null && context.hoveredIndex.value !== index ? props.fadedOpacity : 1
}

function getRadius() {
  return props.lineCap === 'round' ? Math.min(barWidth.value / 2, 8) : typeof props.lineCap === 'number' ? props.lineCap : 0
}
</script>

<template>
  <g :class="[props.animationType === 'fade' ? 'animate-fade-in' : '', props.fill === 'var(--color-chart-line-primary)' ? 'text-chart-line-primary' : '', props.fill === 'var(--color-chart-line-secondary)' ? 'text-chart-line-secondary' : '']" :style="{ '--bklit-stagger-delay': `${props.staggerDelay}s` }">
    <rect v-for="(_, index) in context.data" :key="index" class="cursor-crosshair origin-bottom transition-[opacity,transform] duration-300" :class="[props.animationType === 'grow' ? 'origin-bottom' : '', props.animate ? 'animate-bklit-bar-reveal' : '']" :style="{ animationDelay: `${props.staggerDelay + index * 0.035}s` }" :x="getRect(index).x" :y="getRect(index).y" :width="getRect(index).width" :height="getRect(index).height" :rx="getRadius()" :fill="props.fill.startsWith('var(--color-chart-line-') ? 'currentColor' : props.fill" :opacity="getOpacity(index)">
      <title>{{ context.data[index]?.[context.xDataKey] }}: {{ context.valueAt(props.dataKey, index) }}</title>
    </rect>
  </g>
</template>
