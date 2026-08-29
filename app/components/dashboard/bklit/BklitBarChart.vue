<script setup lang="ts">
import type { BklitBarContext, BklitBarDatum } from './bar-context'
import { computed, onBeforeUnmount, provide, ref } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitBarChartLoading from './BklitBarChartLoading.vue'
import BklitChartTooltip from './BklitChartTooltip.vue'
import { useBklitSpring } from './use-bklit-spring'

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
  animationEasing: 'cubic-bezier(0.85, 0, 0.15, 1)',
  margin: () => ({ top: 40, right: 40, bottom: 40, left: 40 }),
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
const margin = computed<BklitBarMargin>(() => ({ top: props.margin?.top ?? 40, right: props.margin?.right ?? 40, bottom: props.margin?.bottom ?? 40, left: props.margin?.left ?? 40 }))
const plotTop = margin.value.top
const plotRight = margin.value.right
const plotBottom = margin.value.bottom
const plotLeft = margin.value.left
const plotWidth = chartWidth - plotLeft - plotRight
const plotHeight = chartHeight - plotTop - plotBottom
const seriesColors: Record<string, string> = {}
const seriesOrder: string[] = []
const tooltipX = ref<number | null>(null)
const animatedTooltipX = useBklitSpring(tooltipX)
const tooltipY = ref<number | null>(null)
const xPositions = ref<Record<string, number>>({})
const yPositions = ref<Record<string, number>>({})

const maxValue = (_dataKey: string) => Math.max(...props.data.flatMap(item => Object.entries(item).filter(([key]) => key !== props.xDataKey).map(([, value]) => typeof value === 'number' ? value : 0)), 1)
const valueAt = (dataKey: string, index: number) => Number(props.data[index]?.[dataKey]) || 0
const xAt = (index: number) => plotLeft + (index + 0.5) * ((chartWidth - plotLeft - plotRight) / Math.max(props.data.length, 1))
const seriesKeys = computed(() => Object.keys(props.data[0] ?? {}).filter(key => key !== props.xDataKey && typeof props.data[0]?.[key] === 'number'))
const pointerFrame = ref<number | null>(null)
const pendingIndex = ref<number | null>(null)

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
    if (pendingIndex.value !== null) {
      const index = pendingIndex.value
      tooltipX.value = xAt(index)
      const positions = Object.fromEntries(seriesKeys.value.map(key => [key, chartHeight - plotBottom - valueAt(key, index) / maxValue(key) * plotHeight]))
      yPositions.value = positions
      const step = plotWidth / Math.max(props.data.length, 1)
      const bandWidth = step * (1 - props.barGap)
      const groupGap = seriesKeys.value.length > 1 ? props.groupGap : 0
      const width = props.barWidth ?? Math.max(10, (bandWidth - groupGap * (seriesKeys.value.length - 1)) / seriesKeys.value.length)
      const groupWidth = width * seriesKeys.value.length + groupGap * (seriesKeys.value.length - 1)
      xPositions.value = Object.fromEntries(seriesKeys.value.map((key, seriesIndex) => [key, xAt(index) - groupWidth / 2 + seriesIndex * (width + groupGap) + width / 2]))
      tooltipY.value = plotTop
    }
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
  tooltipX.value = null
  tooltipY.value = null
  yPositions.value = {}
  xPositions.value = {}
}

function handlePointerMove(event: PointerEvent) {
  if (status.value !== 'ready' || props.data.length === 0) {
    return
  }
  const svg = event.currentTarget as SVGSVGElement
  const bounds = svg.getBoundingClientRect()
  const localX = (event.clientX - bounds.left) / bounds.width * chartWidth
  const position = Math.max(0, Math.min(plotWidth - Number.EPSILON, localX - plotLeft))
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
  animationDuration: props.animationDuration,
  hoveredIndex,
  tooltipX,
  animatedTooltipX,
  tooltipY,
  xPositions,
  yPositions,
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
    <svg :class="status === 'ready' ? 'cursor-crosshair' : 'cursor-default'" class="h-full w-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Roast change volume bar chart" @pointermove="handlePointerMove" @pointerleave="clearHover">
      <BklitBarChartLoading v-if="status === 'loading'" :bar-count="12" />
      <g v-else>
        <slot />
      </g>
      <slot name="grid" />
      <slot v-if="status === 'ready'" name="x-axis" />
      <slot v-if="status === 'ready'" name="y-axis" />
    </svg>
    <BklitChartTooltip />
  </div>
</template>
