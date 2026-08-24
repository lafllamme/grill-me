<script setup lang="ts">
import type { BklitBarContext, BklitBarDatum } from './bar-context'
import { computed, provide, ref } from 'vue'
import { bklitBarContextKey } from './bar-context'

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
      <g v-if="status === 'loading'" class="animate-pulse">
        <rect v-for="index in 7" :key="index" class="fill-chart-track" :x="48 + (index - 1) * 78" :y="100 + (index % 3) * 14" width="42" :height="120 - (index % 3) * 20" rx="5" />
        <text x="320" y="282" text-anchor="middle" class="fill-on-surface-variant text-[12px] font-meta">Loading evidence…</text>
      </g>
      <g v-else>
        <slot />
      </g>
      <slot name="grid" />
      <slot name="x-axis" />
    </svg>
    <div v-if="hoveredIndex !== null && status === 'ready'" class="pointer-events-none rounded-[8px] bg-surface-bright text-on-background text-[10px] px-3 py-2 top-2 right-2 absolute font-meta">
      {{ props.data[hoveredIndex]?.[props.xDataKey] }} · {{ props.data[hoveredIndex]?.additions }} additions
    </div>
  </div>
</template>
