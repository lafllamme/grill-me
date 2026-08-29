<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import { curveNatural, line as d3Line } from 'd3-shape'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBklitSpring } from './use-bklit-spring'

export interface BklitLineDatum {
  [key: string]: string | number
}

export interface BklitLineSeries {
  dataKey: string
  label: string
  color: string
}

interface ChartPoint {
  x: number
  y: number
}

const props = withDefaults(defineProps<{
  data: readonly BklitLineDatum[]
  series: readonly BklitLineSeries[]
  xDataKey?: string
  status?: 'loading' | 'ready'
  loadingLabel?: string
  animationDuration?: number
  aspectRatio?: string
  margin?: { top?: number, right?: number, bottom?: number, left?: number }
}>(), {
  xDataKey: 'date',
  status: 'ready',
  loadingLabel: 'Loading',
  animationDuration: 1100,
  aspectRatio: '2 / 1',
  margin: () => ({ top: 40, right: 40, bottom: 40, left: 40 }),
})

const LOADING_GRID_DELAY_MS = 750
const LOADING_LINE_DELAY_MS = 1650
const LOADING_CYCLE_MS = 2480

const chartWidth = 640
const chartHeight = 320
const margin = computed(() => ({
  top: props.margin?.top ?? 40,
  right: props.margin?.right ?? 40,
  bottom: props.margin?.bottom ?? 40,
  left: props.margin?.left ?? 40,
}))
const plotWidth = computed(() => chartWidth - margin.value.left - margin.value.right)
const plotHeight = computed(() => chartHeight - margin.value.top - margin.value.bottom)
const reducedMotion = usePreferredReducedMotion()
const isReducedMotion = computed(() => reducedMotion.value === 'reduce')
const hoveredIndex = ref<number | null>(null)
const pointerFrame = ref<number | null>(null)
const loadingLineFrame = ref<number | null>(null)
const loadingGridFrame = ref<number | null>(null)
const loadingLineStartedAt = ref<number | null>(null)
const loadingLineDelayStartedAt = ref<number | null>(null)
const loadingGridStartedAt = ref<number | null>(null)
const loadingGridDelayStartedAt = ref<number | null>(null)
const loadingLineProgress = ref(0)
const loadingGridProgress = ref(0)
const loadingLabelCharacterRefs = ref<HTMLElement[]>([])
const loadingLabelAnimations: Animation[] = []
const pendingIndex = ref<number | null>(null)
const revealTarget = ref(props.status === 'ready' ? 1 : 0)
const revealProgress = useBklitSpring(revealTarget, { stiffness: 170, damping: 28 })
const crosshairTarget = ref<number | null>(null)
const crosshairX = useBklitSpring(crosshairTarget, { stiffness: 300, damping: 30 })
const pillTarget = ref<number | null>(null)
const pillX = useBklitSpring(pillTarget, { stiffness: 400, damping: 35 })
const tooltipTarget = ref<number | null>(null)
const tooltipX = useBklitSpring(tooltipTarget, { stiffness: 100, damping: 20 })
const highlightStartTarget = ref<number | null>(null)
const highlightStart = useBklitSpring(highlightStartTarget, { stiffness: 180, damping: 28 })
const highlightWidthTarget = ref<number | null>(null)
const highlightWidth = useBklitSpring(highlightWidthTarget, { stiffness: 180, damping: 28 })
const tooltipVisible = computed(() => hoveredIndex.value !== null && props.status === 'ready')
const activeDatum = computed(() => hoveredIndex.value === null ? null : props.data[hoveredIndex.value] ?? null)
const activeLabel = computed(() => activeDatum.value?.[props.xDataKey] ?? '')
const tooltipSide = computed(() => (tooltipX.value ?? 50) > 64 ? 'left' : 'right')
const tooltipStyle = computed(() => ({
  left: `${tooltipX.value ?? 50}%`,
  top: '29%',
  transform: tooltipSide.value === 'left' ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
}))

function datumTime(datum: BklitLineDatum, index: number) {
  const value = datum[props.xDataKey]
  if (typeof value === 'number') {
    return value
  }
  const parsed = Date.parse(String(value))
  return Number.isNaN(parsed) ? index : parsed
}

const domain = computed(() => {
  const times = props.data.map(datumTime)
  const min = Math.min(...times)
  const max = Math.max(...times)
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 1]
  }
  return max === min ? [min, min + 1] : [min, max]
})

function xAt(index: number) {
  const times = props.data.map(datumTime)
  const domainStart = domain.value[0] ?? 0
  const domainEnd = domain.value[1] ?? 1
  const span = domainEnd - domainStart
  return margin.value.left + (((times[index] ?? domainStart) - domainStart) / span) * plotWidth.value
}

const maxValue = computed(() => Math.max(1, ...props.data.flatMap(datum => props.series.map(series => Number(datum[series.dataKey]) || 0))))
const yAt = (value: number) => margin.value.top + plotHeight.value - (value / maxValue.value) * plotHeight.value * 0.9
const pointsFor = (series: BklitLineSeries) => props.data.map((datum, index) => ({ x: xAt(index), y: yAt(Number(datum[series.dataKey]) || 0) }))
const pathFor = (points: ChartPoint[]) => d3Line<ChartPoint>().curve(curveNatural).x(point => point.x).y(point => point.y)(points) ?? ''
const linePaths = computed(() => props.series.map(series => ({ ...series, points: pointsFor(series), path: pathFor(pointsFor(series)) })))
// Bklit's loading pulse is intentionally independent from the chart dataset.
// The reference uses a deterministic seven-point skeleton so the travelling
// segment remains legible instead of reproducing every loaded data point.
const skeletonPoints = computed<ChartPoint[]>(() => Array.from({ length: 7 }, (_, index) => ({
  x: margin.value.left + index / 6 * plotWidth.value,
  y: margin.value.top + plotHeight.value - (110 + Math.sin(index * 1.15) * 36 + index * 9) / 200 * plotHeight.value * 0.9,
})))
const skeletonPath = computed(() => pathFor(skeletonPoints.value))
const loadingPulseProgress = computed(() => {
  const elapsed = loadingLineProgress.value * LOADING_CYCLE_MS
  return elapsed >= 2200 ? 1 : elapsed / 2200
})
const loadingClipX = computed(() => {
  const progress = loadingPulseProgress.value
  if (progress <= 0.5)
    return margin.value.left - 10
  return chartWidth - margin.value.right + 10 - (1 - (progress - 0.5) / 0.5) * (plotWidth.value + 20)
})
const loadingClipWidth = computed(() => {
  const progress = loadingPulseProgress.value
  if (progress <= 0.5)
    return (progress / 0.5) * (plotWidth.value + 20)
  return (1 - (progress - 0.5) / 0.5) * (plotWidth.value + 20)
})
const loadingGridX = computed(() => {
  const elapsed = loadingGridProgress.value * LOADING_CYCLE_MS
  const progress = elapsed >= 2200 ? 1 : elapsed / 2200
  return -140 + progress * (plotWidth.value + 280)
})
const dataLabels = computed(() => props.data.map((datum, index) => ({
  label: String(datum[props.xDataKey]),
  x: xAt(index),
})))
const loadingLabelCharacters = computed(() => Array.from(props.loadingLabel))
const xLabels = computed(() => {
  const targetCount = Math.min(5, props.data.length)
  if (targetCount <= 1)
    return dataLabels.value

  const indices = Array.from({ length: targetCount }, (_, tickIndex) => Math.round(tickIndex * (props.data.length - 1) / (targetCount - 1)))
  return indices.map(index => dataLabels.value[index]).filter((item): item is { label: string, x: number } => Boolean(item))
})
const parsedLabels = computed(() => dataLabels.value.map((item, index) => {
  const [month = '', day = ''] = item.label.split(' ')
  return { month, day, index }
}))
const monthSegments = computed(() => parsedLabels.value.reduce<{ month: string, startIndex: number }[]>((segments, item) => {
  if (segments.at(-1)?.month !== item.month)
    segments.push({ month: item.month, startIndex: item.index })
  return segments
}, []))
const currentMonthIndex = computed(() => {
  const currentIndex = hoveredIndex.value ?? 0
  return Math.max(0, monthSegments.value.findLastIndex(segment => segment.startIndex <= currentIndex))
})

function labelOpacity(x: number) {
  if (!tooltipVisible.value || crosshairTarget.value === null)
    return 1
  const distance = Math.abs(x - crosshairTarget.value)
  if (distance < 50)
    return 0
  if (distance < 70)
    return (distance - 50) / 20
  return 1
}

function setHover(index: number) {
  hoveredIndex.value = index
  const x = xAt(index)
  const xPercent = x / chartWidth * 100
  crosshairTarget.value = x
  pillTarget.value = xPercent
  tooltipTarget.value = xPercent > 64 ? xPercent - 2.5 : xPercent + 2.5
  const startIndex = Math.max(0, index - 1)
  const endIndex = Math.min(props.data.length - 1, index + 1)
  highlightStartTarget.value = xAt(startIndex)
  highlightWidthTarget.value = Math.max(0, xAt(endIndex) - xAt(startIndex))
}

function scheduleHover(index: number) {
  pendingIndex.value = index
  if (pointerFrame.value !== null || typeof requestAnimationFrame === 'undefined') {
    if (typeof requestAnimationFrame === 'undefined')
      setHover(index)
    return
  }
  pointerFrame.value = requestAnimationFrame(() => {
    if (pendingIndex.value !== null)
      setHover(pendingIndex.value)
    pointerFrame.value = null
  })
}

function handlePointerMove(event: PointerEvent) {
  if (props.status !== 'ready' || props.data.length === 0)
    return
  const svg = event.currentTarget as SVGSVGElement
  const bounds = svg.getBoundingClientRect()
  const localX = (event.clientX - bounds.left) / bounds.width * chartWidth
  const nearest = props.data.reduce((best, _, index) => Math.abs(xAt(index) - localX) < Math.abs(xAt(best) - localX) ? index : best, 0)
  scheduleHover(nearest)
}

function clearHover() {
  if (pointerFrame.value !== null && typeof cancelAnimationFrame !== 'undefined')
    cancelAnimationFrame(pointerFrame.value)
  pointerFrame.value = null
  pendingIndex.value = null
  hoveredIndex.value = null
  crosshairTarget.value = null
  pillTarget.value = null
  tooltipTarget.value = null
  highlightStartTarget.value = null
  highlightWidthTarget.value = null
}

function formatValue(value: unknown) {
  return Number(value ?? 0).toLocaleString()
}

function replayReveal() {
  revealTarget.value = 0
  window.setTimeout(() => {
    revealTarget.value = 1
  }, 40)
}

function updateLoadingLine(timestamp: number) {
  if (props.status !== 'loading' || isReducedMotion.value) {
    loadingLineFrame.value = null
    return
  }

  loadingLineDelayStartedAt.value ??= timestamp
  if (timestamp - loadingLineDelayStartedAt.value < LOADING_LINE_DELAY_MS) {
    loadingLineProgress.value = 0
    loadingLineFrame.value = requestAnimationFrame(updateLoadingLine)
    return
  }
  loadingLineStartedAt.value ??= timestamp
  loadingLineProgress.value = ((timestamp - loadingLineStartedAt.value) % LOADING_CYCLE_MS) / LOADING_CYCLE_MS
  loadingLineFrame.value = requestAnimationFrame(updateLoadingLine)
}

function updateLoadingGrid(timestamp: number) {
  if (props.status !== 'loading' || isReducedMotion.value) {
    loadingGridFrame.value = null
    return
  }

  loadingGridDelayStartedAt.value ??= timestamp
  if (timestamp - loadingGridDelayStartedAt.value < LOADING_GRID_DELAY_MS) {
    loadingGridProgress.value = 0
    loadingGridFrame.value = requestAnimationFrame(updateLoadingGrid)
    return
  }
  loadingGridStartedAt.value ??= timestamp
  loadingGridProgress.value = ((timestamp - loadingGridStartedAt.value) % LOADING_CYCLE_MS) / LOADING_CYCLE_MS
  loadingGridFrame.value = requestAnimationFrame(updateLoadingGrid)
}

function stopLoadingLabelShimmer() {
  for (const animation of loadingLabelAnimations)
    animation.cancel()
  loadingLabelAnimations.length = 0
}

function setLoadingLabelCharacterRef(element: Element | ComponentPublicInstance | null, index: number) {
  if (element && typeof (element as Element).animate === 'function')
    loadingLabelCharacterRefs.value[index] = element as HTMLElement
}

async function startLoadingLabelShimmer() {
  stopLoadingLabelShimmer()
  if (props.status !== 'loading' || isReducedMotion.value || typeof Element === 'undefined' || typeof Element.prototype.animate !== 'function')
    return

  await nextTick()
  const duration = 1000
  const repeatDelay = loadingLabelCharacters.value.length * 50
  const totalCycle = duration + repeatDelay
  for (const [index, element] of loadingLabelCharacterRefs.value.entries()) {
    const animation = element.animate([
      { color: 'var(--color-on-surface-variant)' },
      { color: 'var(--color-on-background)', offset: duration / totalCycle / 2 },
      { color: 'var(--color-on-surface-variant)', offset: duration / totalCycle },
      { color: 'var(--color-on-surface-variant)' },
    ], {
      delay: index * duration / loadingLabelCharacters.value.length,
      duration: totalCycle,
      easing: 'ease-in-out',
      iterations: Number.POSITIVE_INFINITY,
      fill: 'both',
    })
    loadingLabelAnimations.push(animation)
  }
}

function startLoadingAnimation() {
  if (typeof requestAnimationFrame === 'undefined' || isReducedMotion.value || props.status !== 'loading')
    return
  if (loadingLineFrame.value === null)
    loadingLineFrame.value = requestAnimationFrame(updateLoadingLine)
  if (loadingGridFrame.value === null)
    loadingGridFrame.value = requestAnimationFrame(updateLoadingGrid)
}

onMounted(() => {
  if (isReducedMotion.value)
    revealTarget.value = 1
  else replayReveal()
  startLoadingAnimation()
  startLoadingLabelShimmer()
})
onBeforeUnmount(() => {
  if (pointerFrame.value !== null && typeof cancelAnimationFrame !== 'undefined')
    cancelAnimationFrame(pointerFrame.value)
  if (typeof cancelAnimationFrame !== 'undefined') {
    if (loadingLineFrame.value !== null)
      cancelAnimationFrame(loadingLineFrame.value)
    if (loadingGridFrame.value !== null)
      cancelAnimationFrame(loadingGridFrame.value)
  }
  stopLoadingLabelShimmer()
})

watch(() => props.status, (status) => {
  revealTarget.value = status === 'ready' ? 1 : 0
  if (status === 'loading') {
    loadingLineProgress.value = 0
    loadingGridProgress.value = 0
    loadingLineStartedAt.value = null
    loadingLineDelayStartedAt.value = null
    loadingGridStartedAt.value = null
    loadingGridDelayStartedAt.value = null
    startLoadingAnimation()
    startLoadingLabelShimmer()
  }
  else if (typeof cancelAnimationFrame !== 'undefined') {
    if (loadingLineFrame.value !== null)
      cancelAnimationFrame(loadingLineFrame.value)
    if (loadingGridFrame.value !== null)
      cancelAnimationFrame(loadingGridFrame.value)
    loadingLineFrame.value = null
    loadingGridFrame.value = null
    stopLoadingLabelShimmer()
  }
})

watch(isReducedMotion, () => {
  if (props.status === 'loading')
    startLoadingLabelShimmer()
})
</script>

<template>
  <div class="w-full relative touch-none" :style="{ aspectRatio: props.aspectRatio }">
    <svg class="h-full w-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Roast change trend line chart" @pointermove="handlePointerMove" @pointerleave="clearHover">
      <defs>
        <linearGradient id="bklit-line-grid-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="10%" stop-color="white" stop-opacity="1" />
          <stop offset="90%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="bklit-line-grid-mask" maskUnits="userSpaceOnUse">
          <rect :x="margin.left" :y="margin.top" :width="plotWidth" :height="plotHeight" fill="url(#bklit-line-grid-fade)" />
        </mask>
        <linearGradient id="bklit-line-grid-shimmer" gradientUnits="userSpaceOnUse" x1="0" x2="140" y1="0" y2="0" :gradientTransform="`translate(${loadingGridX} 0)`">
          <stop offset="0%" stop-color="var(--color-on-background)" stop-opacity="0" />
          <stop offset="35%" stop-color="var(--color-on-background)" stop-opacity="0.45" />
          <stop offset="50%" stop-color="var(--color-on-background)" stop-opacity="1" />
          <stop offset="65%" stop-color="var(--color-on-background)" stop-opacity="0.45" />
          <stop offset="100%" stop-color="var(--color-on-background)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="bklit-line-loading-fade" gradientUnits="userSpaceOnUse" :x1="margin.left" :x2="chartWidth - margin.right" y1="0" y2="0">
          <stop offset="0%" stop-color="var(--color-on-background)" stop-opacity="0" />
          <stop offset="15%" stop-color="var(--color-on-background)" stop-opacity="1" />
          <stop offset="85%" stop-color="var(--color-on-background)" stop-opacity="1" />
          <stop offset="100%" stop-color="var(--color-on-background)" stop-opacity="0" />
        </linearGradient>
        <clipPath id="bklit-line-loading-pulse-clip" clipPathUnits="userSpaceOnUse">
          <rect :x="loadingClipX" :y="margin.top - 10" :height="plotHeight + 20" :width="loadingClipWidth" />
        </clipPath>
        <clipPath id="bklit-line-highlight-clip" clipPathUnits="userSpaceOnUse">
          <rect :x="highlightStart" :y="margin.top" :width="highlightWidth" :height="plotHeight" />
        </clipPath>
      </defs>

      <g :stroke="status === 'loading' ? 'color-mix(in oklch, var(--color-chart-grid) 50%, transparent)' : 'var(--color-chart-grid)'" stroke-width="1" stroke-dasharray="4 6" mask="url(#bklit-line-grid-mask)">
        <line v-for="index in 5" :key="`h-${index}`" :x1="margin.left" :x2="chartWidth - margin.right" :y1="margin.top + (index - 1) * plotHeight / 4" :y2="margin.top + (index - 1) * plotHeight / 4" />
      </g>
      <g v-if="status === 'loading' && !isReducedMotion" stroke="url(#bklit-line-grid-shimmer)" stroke-width="1" stroke-dasharray="4 6" mask="url(#bklit-line-grid-mask)">
        <line v-for="index in 5" :key="`loading-h-${index}`" :x1="margin.left" :x2="chartWidth - margin.right" :y1="margin.top + (index - 1) * plotHeight / 4" :y2="margin.top + (index - 1) * plotHeight / 4" />
      </g>
      <g v-if="status === 'ready'" stroke="var(--color-chart-grid)" stroke-width="1" stroke-dasharray="4 6" opacity="0.65">
        <line v-for="(item, index) in xLabels" :key="`v-${index}`" :x1="item.x" :x2="item.x" :y1="margin.top" :y2="chartHeight - margin.bottom" />
      </g>

      <path v-if="status === 'loading' && !isReducedMotion" :d="skeletonPath" fill="none" stroke="url(#bklit-line-loading-fade)" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.5" clip-path="url(#bklit-line-loading-pulse-clip)" />
      <path v-else-if="status === 'loading'" :d="skeletonPath" fill="none" stroke="var(--color-on-background)" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.5" />
      <template v-else>
        <path v-for="series in linePaths" :key="series.dataKey" :d="series.path" fill="none" :stroke="series.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" :stroke-dasharray="`1 ${1}`" :stroke-dashoffset="1 - revealProgress" :style="{ opacity: tooltipVisible ? 0.3 : 1, transition: isReducedMotion ? 'none' : 'opacity 400ms ease-in-out' }" />
        <path v-for="series in linePaths" :key="`highlight-${series.dataKey}`" :d="series.path" fill="none" :stroke="series.color" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#bklit-line-highlight-clip)" :style="{ opacity: tooltipVisible ? 1 : 0, transition: isReducedMotion ? 'none' : 'opacity 400ms ease-in-out' }" />
      </template>

      <line v-if="tooltipVisible" :x1="crosshairX" :x2="crosshairX" :y1="margin.top" :y2="chartHeight - margin.bottom" stroke="var(--color-on-background)" stroke-width="1" opacity="0.9" />
      <template v-if="tooltipVisible">
        <template v-for="series in linePaths" :key="`dot-${series.dataKey}`">
          <circle :cx="series.points[hoveredIndex ?? 0]?.x" :cy="series.points[hoveredIndex ?? 0]?.y" r="7" :fill="series.color" stroke="var(--color-chart-track)" stroke-width="3" />
        </template>
      </template>

      <g class="text-[12px] font-body" :style="{ fill: 'var(--chart-label)' }">
        <template v-if="status === 'ready'">
          <text v-for="(item, index) in xLabels" :key="`label-${index}`" :x="item.x" y="299" text-anchor="middle" :opacity="labelOpacity(item.x)" :style="{ transition: isReducedMotion ? 'none' : 'opacity 400ms ease-in-out' }">{{ item.label }}</text>
        </template>
        <g v-if="pillX !== null && hoveredIndex !== null" :transform="`translate(${pillX / 100 * chartWidth}, 284)`" class="pointer-events-none">
          <rect x="-50" y="0" width="100" height="30" rx="15" fill="var(--color-on-background)" class="shadow-lg" />
          <clipPath id="bklit-line-pill-clip"><rect x="-50" y="0" width="100" height="30" rx="15" /></clipPath>
          <g clip-path="url(#bklit-line-pill-clip)">
            <g :style="{ transform: `translateY(${-(currentMonthIndex * 24)}px)`, transition: isReducedMotion ? 'none' : 'transform 300ms cubic-bezier(.22,1,.36,1)' }">
              <text v-for="segment in monthSegments" :key="`pill-month-${segment.startIndex}`" x="-2" :y="20 + monthSegments.indexOf(segment) * 24" text-anchor="end" class="text-background text-[13px] font-semibold" fill="currentColor">{{ segment.month }}</text>
            </g>
            <g :style="{ transform: `translateY(${-(hoveredIndex * 24)}px)`, transition: isReducedMotion ? 'none' : 'transform 300ms cubic-bezier(.22,1,.36,1)' }">
              <text v-for="item in parsedLabels" :key="`pill-day-${item.index}`" x="2" :y="20 + item.index * 24" text-anchor="start" class="text-background text-[13px] font-semibold" fill="currentColor">{{ item.day }}</text>
            </g>
          </g>
        </g>
      </g>
    </svg>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="status === 'loading'" class="flex pointer-events-none items-center inset-0 justify-center absolute" role="status" aria-live="polite">
        <span class="inline-flex select-none items-center leading-none text-sm text-on-surface-variant tracking-wide font-medium" aria-hidden="true">
          <span v-for="(character, index) in loadingLabelCharacters" :key="`${character}-${index}`" :ref="element => setLoadingLabelCharacterRef(element, index)" class="inline-block whitespace-pre leading-none">{{ character }}</span>
        </span>
        <span class="sr-only">{{ loadingLabel }}</span>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="tooltipVisible && activeDatum" class="text-on-background px-3 py-2.5 bg-chart-tooltip min-w-[180px] pointer-events-none shadow-lg absolute z-30" :style="tooltipStyle">
        <p class="text-sm font-medium mb-2">
          {{ activeLabel }}
        </p>
        <div class="flex flex-col gap-1.5">
          <div v-for="series in props.series" :key="series.dataKey" class="text-sm flex gap-4 items-center justify-between">
            <span class="text-on-surface-variant/70 flex gap-2 min-w-0 items-center"><span class="rounded-full shrink-0 h-2.5 w-2.5" :style="{ backgroundColor: series.color }" />{{ series.label }}</span>
            <strong class="font-medium shrink-0 tabular-nums">{{ formatValue(activeDatum[series.dataKey]) }}</strong>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
