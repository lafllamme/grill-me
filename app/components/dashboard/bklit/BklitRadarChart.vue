<script setup lang="ts">
import { computed, ref } from 'vue'

export interface BklitRadarMetric {
  key: string
  label: string
}

export interface BklitRadarSeries {
  label: string
  color?: string
  values: Record<string, number>
}

const props = withDefaults(defineProps<{
  data: readonly BklitRadarSeries[]
  metrics: readonly BklitRadarMetric[]
  levels?: number
  animate?: boolean
}>(), {
  levels: 5,
  animate: true,
})

const hoveredIndex = ref<number | null>(null)
const viewBoxSize = 320
const center = viewBoxSize / 2
const radius = 104

const angleFor = (index: number) => -Math.PI / 2 + (index * Math.PI * 2) / props.metrics.length
function pointFor(index: number, value: number, distance = radius) {
  const angle = angleFor(index)
  const scaledRadius = distance * Math.max(0, Math.min(value, 100)) / 100
  return {
    x: center + Math.cos(angle) * scaledRadius,
    y: center + Math.sin(angle) * scaledRadius,
  }
}

function pointsFor(values: Record<string, number>, distance = radius) {
  return props.metrics.map((metric, index) => {
    const point = pointFor(index, values[metric.key] ?? 0, distance)
    return `${point.x},${point.y}`
  }).join(' ')
}

const gridPoints = computed(() => Array.from({ length: props.levels }, (_, index) => pointsFor(
  Object.fromEntries(props.metrics.map(metric => [metric.key, 100])),
  radius * ((index + 1) / props.levels),
)))

const axisPoints = computed(() => props.metrics.map((metric, index) => {
  const point = pointFor(index, 100)
  return { ...point, metric }
}))

const labels = computed(() => axisPoints.value.map(({ metric }, index) => {
  const labelPoint = pointFor(index, 117)
  return { ...labelPoint, label: metric.label }
}))

const seriesWithState = computed(() => props.data.map((series, index) => ({
  ...series,
  color: series.color ?? 'var(--color-primary-strong)',
  points: pointsFor(series.values),
  isHovered: hoveredIndex.value === index,
  isDimmed: hoveredIndex.value !== null && hoveredIndex.value !== index,
})))
</script>

<template>
  <figure class="min-w-0" aria-label="Code profile radar chart">
    <div class="relative mx-auto aspect-square max-w-[360px]">
      <svg class="h-full w-full overflow-visible" :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`" role="img" aria-label="Roast profile dimensions">
        <g :class="animate ? 'bklit-radar-enter' : ''">
          <polygon v-for="(points, index) in gridPoints" :key="`grid-${index}`" :points="points" fill="none" stroke="var(--color-chart-grid)" stroke-width="1" stroke-opacity="0.7" />
          <line v-for="point in axisPoints" :key="`axis-${point.metric.key}`" :x1="center" :x2="point.x" :y1="center" :y2="point.y" stroke="var(--color-chart-grid)" stroke-width="1" stroke-opacity="0.7" />
          <text v-for="(label, index) in labels" :key="`label-${index}`" :x="label.x" :y="label.y" fill="var(--color-on-surface-variant)" font-size="10" font-weight="500" text-anchor="middle" dominant-baseline="middle">{{ label.label }}</text>
          <g v-for="(series, index) in seriesWithState" :key="series.label" :style="{ opacity: series.isDimmed ? 0.28 : 1, transition: 'opacity 150ms ease, transform 350ms cubic-bezier(.22,1,.36,1)', transformOrigin: `${center}px ${center}px` }" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = null">
            <polygon :points="series.points" :fill="series.color" :fill-opacity="series.isHovered ? 0.35 : 0.15" :stroke="series.color" :stroke-width="series.isHovered ? 3 : 2" stroke-linejoin="round" :style="{ filter: series.isHovered ? `drop-shadow(0 0 10px ${series.color})` : 'none' }" />
            <circle v-for="(point, pointIndex) in props.metrics.map((metric, metricIndex) => pointFor(metricIndex, series.values[metric.key] ?? 0))" :key="`${series.label}-${pointIndex}`" :cx="point.x" :cy="point.y" :r="series.isHovered ? 5 : 3.5" :fill="series.color" stroke="var(--color-chart-tooltip)" stroke-width="2" />
          </g>
        </g>
      </svg>
    </div>
    <div v-if="data.length > 1" class="flex flex-wrap gap-x-5 gap-y-2 justify-center mt-1">
      <button v-for="(series, index) in data" :key="series.label" class="text-[10px] text-on-surface-variant tracking-[0.12em] uppercase font-meta transition-colors hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = null">
        <i class="rounded-full h-2 w-2 mr-2 inline-block" :style="{ backgroundColor: series.color ?? 'var(--color-primary-strong)' }" />{{ series.label }}
      </button>
    </div>
  </figure>
</template>

<style scoped>
@keyframes bklit-radar-enter {
  from { opacity: 0; transform: scale(0.72); transform-origin: 160px 160px; }
  to { opacity: 1; transform: scale(1); transform-origin: 160px 160px; }
}

.bklit-radar-enter {
  animation: bklit-radar-enter 900ms cubic-bezier(.22, 1, .36, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .bklit-radar-enter { animation: none; }
}
</style>
