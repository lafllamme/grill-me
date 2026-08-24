<script setup lang="ts">
import type { BklitBarContext, BklitBarDatum } from './bar-context'
import { computed, onBeforeUnmount, provide, ref } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitBarChartLoading from './BklitBarChartLoading.vue'

interface BklitBarMargin {
  top: number
  right: number
  bottom: number
  left: number
}

const props = withDefaults(defineProps<{
  data: readonly BklitBarDatum[]
  xDataKey?: string
  status?: 'loading' | 'ready'
  animationDuration?: number
  animationEasing?: string
  margin?: Partial<BklitBarMargin>
  aspectRatio?: string
  barGap?: number
  barWidth?: number
  groupGap?: number
  seriesCount?: number
  stackGap?: number
  revealSignature?: string
  orientation?: 'vertical' | 'horizontal'
  stacked?: boolean
}>(), {
  xDataKey: 'name',
  status: 'ready',
  animationDuration: 1100,
  animationEasing: 'ease-out',
  margin: () => ({ top: 24, right: 24, bottom: 46, left: 48 }),
  aspectRatio: '2 / 1',
  barGap: 0.2,
  groupGap: 4,
  seriesCount: 1,
  stackGap: 0,
  revealSignature: '',
  orientation: 'vertical',
  stacked: false,
})

const hoveredIndex = ref<number | null>(null)
const status = computed(() => props.status)
const chartWidth = 640
const chartHeight = 320
const margin = computed<BklitBarMargin>(() => ({ top: props.margin?.top ?? 24, right: props.margin?.right ?? 24, bottom: props.margin?.bottom ?? 46, left: props.margin?.left ?? 48 }))
const plotTop = margin.value.top
const plotRight = margin.value.right
const plotBottom = margin.value.bottom
const plotLeft = margin.value.left
const plotWidth = chartWidth - plotLeft - plotRight
const plotHeight = chartHeight - plotTop - plotBottom
const seriesColors: Record<string, string> = {}
const seriesOrder: string[] = []

const maxValue = (_dataKey: string) => Math.max(...props.data.flatMap(item => Object.entries(item).filter(([key]) => key !== props.xDataKey).map(([, value]) => typeof value === 'number' ? value : 0)), 1)
const valueAt = (dataKey: string, index: number) => Number(props.data[index]?.[dataKey]) || 0
const xAt = (index: number) => plotLeft + (index + 0.5) * ((chartWidth - plotLeft - plotRight) / Math.max(props.data.length, 1))
const seriesKeys = computed(() => Object.keys(props.data[0] ?? {}).filter(key => key !== props.xDataKey && typeof props.data[0]?.[key] === 'number'))
const firstSeriesKey = computed(() => seriesKeys.value[0] ?? '')
const pointerFrame = ref<number | null>(null)
const pendingIndex = ref<number | null>(null)

const firstSeriesY = computed(() => {
  if (hoveredIndex.value === null || !firstSeriesKey.value) {
    return plotTop + plotHeight / 2
  }
  const value = valueAt(firstSeriesKey.value, hoveredIndex.value)
  return chartHeight - plotBottom - value / maxValue(firstSeriesKey.value) * plotHeight
})

const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null) {
    return {}
  }
  const x = xAt(hoveredIndex.value)
  const shouldFlip = x > chartWidth * 0.68
  return {
    left: `${x / chartWidth * 100}%`,
    top: `${firstSeriesY.value / chartHeight * 100}%`,
    transform: `translate(${shouldFlip ? '-100%' : '0'}, -50%) ${shouldFlip ? 'translateX(-16px)' : 'translateX(16px)'}`,
  }
})

function scheduleHover(index: number) {
  pendingIndex.value = index
  if (pointerFrame.value !== null || typeof requestAnimationFrame === 'undefined') {
    if (typeof requestAnimationFrame === 'undefined') {
      hoveredIndex.value = index
    }
    return
  }
  pointerFrame.value = requestAnimationFrame(() => {
    hoveredIndex.value = pendingIndex.value
    pointerFrame.value = null
  })
}

function clearHover() {
  if (pointerFrame.value !== null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(pointerFrame.value)
    pointerFrame.value = null
  }
  pendingIndex.value = null
  hoveredIndex.value = null
}

function handlePointerMove(event: PointerEvent) {
  if (status.value !== 'ready' || props.data.length === 0) {
    return
  }
  const svg = event.currentTarget as SVGSVGElement
  const bounds = svg.getBoundingClientRect()
  const localX = (event.clientX - bounds.left) / bounds.width * chartWidth
  const position = localX - plotLeft
  if (position < 0 || position > plotWidth) {
    clearHover()
    return
  }
  const columnWidth = plotWidth / props.data.length
  const index = Math.max(0, Math.min(props.data.length - 1, Math.floor(position / columnWidth)))
  scheduleHover(index)
}

onBeforeUnmount(() => {
  if (pointerFrame.value !== null && typeof cancelAnimationFrame !== 'undefined') {
    cancelAnimationFrame(pointerFrame.value)
  }
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
  yAt: index => plotTop + (index + 0.5) * (plotHeight / Math.max(props.data.length, 1)),
  orientation: props.orientation,
  stacked: props.stacked,
  stackGap: props.stackGap,
  seriesColors,
  seriesOrder,
  registerSeries: (dataKey, color) => {
    seriesColors[dataKey] = color
    if (!seriesOrder.includes(dataKey))
      seriesOrder.push(dataKey)
  },
  setHoveredIndex: (index) => { hoveredIndex.value = index },
}

provide(bklitBarContextKey, context)

const chartStyle = computed(() => ({ aspectRatio: props.aspectRatio }))
</script>

<template>
  <div class="w-full relative" :style="chartStyle" :data-animation-duration="props.animationDuration" :data-animation-easing="props.animationEasing" :data-reveal-signature="props.revealSignature" :data-stack-gap="props.stackGap">
    <svg class="h-full w-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Roast change volume bar chart" @pointermove="handlePointerMove" @pointerleave="clearHover">
      <BklitBarChartLoading v-if="status === 'loading'" />
      <g v-else>
        <slot />
      </g>
      <slot name="grid" />
      <slot v-if="status === 'ready'" name="x-axis" />
      <slot v-if="status === 'ready'" name="y-axis" />
      <line v-if="hoveredIndex !== null && status === 'ready'" :x1="xAt(hoveredIndex)" :x2="xAt(hoveredIndex)" :y1="plotTop" :y2="chartHeight - plotBottom" class="stroke-on-surface-variant" stroke-width="1" opacity="0.75" />
    </svg>
    <div v-if="hoveredIndex !== null && status === 'ready'" class="text-on-background font-body px-5 py-4 rounded-none bg-chart-tooltip min-w-[190px] pointer-events-none shadow-[0_14px_28px_rgba(0,0,0,0.35)] transition-[left,top,transform,opacity] duration-200 ease-out absolute" :style="tooltipStyle">
      <p class="text-base font-body font-semibold">
        {{ props.data[hoveredIndex]?.[props.xDataKey] }}
      </p>
      <div v-for="key in seriesKeys" :key="key" class="text-sm text-on-surface-variant mt-4 flex gap-3 items-center">
        <span class="rounded-full shrink-0 h-3 w-3" :style="{ backgroundColor: seriesColors[key] ?? 'var(--color-chart-line-primary)' }" />
        <span class="flex-1">{{ key }}</span>
        <strong class="text-on-background font-body">{{ Number(props.data[hoveredIndex]?.[key] ?? 0).toLocaleString() }}</strong>
      </div>
    </div>
  </div>
</template>
