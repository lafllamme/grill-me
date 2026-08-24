<script setup lang="ts">
import type { BklitBarContext, BklitBarDatum } from './bar-context'
import { computed, provide, ref } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitBarChartLoading from './BklitBarChartLoading.vue'

const props = withDefaults(defineProps<{
  data: readonly BklitBarDatum[]
  xDataKey?: string
  status?: 'loading' | 'ready'
  animationDuration?: number
  aspectRatio?: string
  barGap?: number
  barWidth?: number
  groupGap?: number
  seriesCount?: number
  orientation?: 'vertical' | 'horizontal'
  stacked?: boolean
}>(), {
  xDataKey: 'name',
  status: 'ready',
  animationDuration: 1100,
  aspectRatio: '2 / 1',
  barGap: 0.2,
  groupGap: 4,
  seriesCount: 1,
  orientation: 'vertical',
  stacked: false,
})

const hoveredIndex = ref<number | null>(null)
const status = computed(() => props.status)
const chartWidth = 640
const chartHeight = 320
const plotTop = 24
const plotRight = 24
const plotBottom = 46
const plotLeft = 48

const maxValue = (_dataKey: string) => Math.max(...props.data.flatMap(item => Object.entries(item).filter(([key]) => key !== props.xDataKey).map(([, value]) => typeof value === 'number' ? value : 0)), 1)
const valueAt = (dataKey: string, index: number) => Number(props.data[index]?.[dataKey]) || 0
const xAt = (index: number) => plotLeft + (index + 0.5) * ((chartWidth - plotLeft - plotRight) / Math.max(props.data.length, 1))
const seriesKeys = computed(() => Object.keys(props.data[0] ?? {}).filter(key => key !== props.xDataKey && typeof props.data[0]?.[key] === 'number'))
const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null) {
    return {}
  }
  const x = xAt(hoveredIndex.value) / chartWidth * 100
  return { left: `${Math.min(Math.max(x + 4, 12), 78)}%`, top: '12%' }
})

const context: BklitBarContext = {
  data: props.data,
  xDataKey: props.xDataKey,
  status,
  hoveredIndex,
  chartWidth,
  chartHeight,
  plotTop,
  plotRight,
  plotBottom,
  plotLeft,
  barGap: props.barGap,
  barWidth: props.barWidth,
  groupGap: props.groupGap,
  seriesCount: props.seriesCount,
  maxValue,
  valueAt,
  xAt,
  setHoveredIndex: (index) => { hoveredIndex.value = index },
}

provide(bklitBarContextKey, context)

const chartStyle = computed(() => ({ aspectRatio: props.aspectRatio }))
</script>

<template>
  <div class="relative w-full" :style="chartStyle" :data-animation-duration="props.animationDuration">
    <svg class="w-full h-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Roast change volume bar chart">
      <BklitBarChartLoading v-if="status === 'loading'" />
      <g v-else>
        <slot />
      </g>
      <slot name="grid" />
      <slot name="x-axis" />
      <line v-if="hoveredIndex !== null && status === 'ready'" :x1="xAt(hoveredIndex)" :x2="xAt(hoveredIndex)" :y1="plotTop" :y2="chartHeight - plotBottom" class="stroke-on-surface-variant" stroke-width="1" opacity="0.75" />
    </svg>
    <div v-if="hoveredIndex !== null && status === 'ready'" class="pointer-events-none min-w-[160px] rounded-none bg-surface-bright text-on-background px-4 py-3 absolute font-body shadow-[0_14px_28px_rgba(0,0,0,0.35)]" :style="tooltipStyle">
      <p class="text-base font-body font-semibold">{{ props.data[hoveredIndex]?.[props.xDataKey] }}</p>
      <div v-for="key in seriesKeys" :key="key" class="text-sm text-on-surface-variant flex gap-3 items-center mt-3">
        <span class="rounded-full bg-chart-line-primary h-3 w-3 shrink-0" :class="key === 'deletions' ? 'bg-chart-line-secondary' : ''" />
        <span class="flex-1">{{ key }}</span>
        <strong class="text-on-background font-body">{{ Number(props.data[hoveredIndex]?.[key] ?? 0).toLocaleString() }}</strong>
      </div>
    </div>
  </div>
</template>
