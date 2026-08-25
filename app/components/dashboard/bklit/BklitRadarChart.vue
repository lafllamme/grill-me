<script setup lang="ts">
import type { BklitRadarData, BklitRadarMetric } from './radar-context'
import { computed, ref } from 'vue'
import BklitRadarArea from './BklitRadarArea.vue'
import BklitRadarAxis from './BklitRadarAxis.vue'
import BklitRadarGrid from './BklitRadarGrid.vue'
import BklitRadarLabels from './BklitRadarLabels.vue'
import { provideBklitRadarContext } from './radar-context'

const props = withDefaults(defineProps<{ data: readonly BklitRadarData[], metrics: readonly BklitRadarMetric[], levels?: number, animate?: boolean }>(), { levels: 5, animate: true })
const hoveredIndex = ref<number | null>(null)
const viewBoxSize = 320
const center = viewBoxSize / 2
const radius = 104

function getPoint(metricIndex: number, value: number, distance = radius) {
  const angle = -Math.PI / 2 + (metricIndex * Math.PI * 2) / props.metrics.length
  const scaledRadius = distance * Math.max(0, Math.min(value, 100)) / 100
  return { x: center + Math.cos(angle) * scaledRadius, y: center + Math.sin(angle) * scaledRadius }
}

function pointsFor(values: Record<string, number>, distance = radius) {
  return props.metrics.map((metric, index) => {
    const point = getPoint(index, values[metric.key] ?? 0, distance)
    return `${point.x},${point.y}`
  }).join(' ')
}

function colorFor(index: number) {
  return props.data[index]?.color ?? 'var(--color-primary-strong)'
}

function averageFor(values: Record<string, number>) {
  const valuesList = Object.values(values)
  return valuesList.length ? Math.round(valuesList.reduce((sum, value) => sum + value, 0) / valuesList.length) : 0
}

provideBklitRadarContext({ data: props.data, metrics: props.metrics, levels: props.levels, radius, center, hoveredIndex, getPoint, pointsFor, colorFor })
const isReady = computed(() => props.data.length > 0 && props.metrics.length > 2)
</script>

<template>
  <figure v-if="isReady" class="min-w-0" aria-label="Code profile radar chart">
    <div class="flex flex-col gap-4 items-center md:flex-row md:items-center">
      <div class="w-full max-w-[360px] md:w-[58%]">
        <svg class="h-full w-full overflow-visible" :class="animate ? 'bklit-radar-enter' : ''" viewBox="0 0 320 320" role="img" aria-label="Roast profile dimensions">
          <BklitRadarGrid />
          <BklitRadarAxis />
          <BklitRadarLabels />
          <BklitRadarArea v-for="(_, index) in data" :key="`area-${index}`" :index="index" />
        </svg>
      </div>
      <div v-if="data.length > 1" class="w-full flex flex-col gap-1 md:w-[42%]">
        <button v-for="(series, index) in data" :key="series.label" class="text-left text-xs text-on-surface-variant tracking-[0.08em] rounded-[6px] px-3 py-2 flex gap-3 items-center transition-colors hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" :class="hoveredIndex === index ? 'bg-surface-bright text-on-background' : ''" type="button" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = null">
          <i class="mr-2 rounded-full h-2 w-2 shrink-0 inline-block" :style="{ backgroundColor: colorFor(index) }" />
          <span class="flex-1">{{ series.label }}</span>
          <strong class="font-meta">{{ averageFor(series.values) }}%</strong>
        </button>
      </div>
    </div>
  </figure>
</template>

<style scoped>
@keyframes bklit-radar-enter {
  from { opacity: 0; transform: scale(0.72); transform-origin: 160px 160px; }
  to { opacity: 1; transform: scale(1); transform-origin: 160px 160px; }
}
.bklit-radar-enter { animation: bklit-radar-enter 1100ms cubic-bezier(.22, 1, .36, 1) both; }
@media (prefers-reduced-motion: reduce) { .bklit-radar-enter { animation: none; } }
</style>
