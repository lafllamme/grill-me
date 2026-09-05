<script setup lang="ts">
import type { BklitRadarContext, BklitRadarData, BklitRadarMetric, BklitRadarTransition } from './radar-context'
import { computed, ref } from 'vue'
import BklitRadarArea from './BklitRadarArea.vue'
import BklitRadarAxis from './BklitRadarAxis.vue'
import BklitRadarGrid from './BklitRadarGrid.vue'
import BklitRadarLabels from './BklitRadarLabels.vue'
import BklitRadarLegend from './BklitRadarLegend.vue'
import { provideBklitRadarContext } from './radar-context'

const props = withDefaults(defineProps<{
  data: readonly BklitRadarData[]
  metrics: readonly BklitRadarMetric[]
  size?: number
  levels?: number
  margin?: number
  animate?: boolean
  enterDurationMs?: number
  staggerScale?: number
  enterTransition?: BklitRadarTransition
  motionReplayKey?: string
  hoveredIndex?: number | null
  className?: string
}>(), { levels: 5, margin: 60, animate: true, enterDurationMs: 1100, staggerScale: 1, enterTransition: undefined, motionReplayKey: '', hoveredIndex: undefined, className: '' })
const emit = defineEmits<{ 'update:hoveredIndex': [index: number | null] }>()
const hoveredIndex = ref<number | null>(null)
const viewBoxSize = computed(() => props.size ?? 400)
const center = computed(() => viewBoxSize.value / 2)
const radius = computed(() => Math.max(24, viewBoxSize.value / 2 - props.margin))

const currentHoveredIndex = computed(() => props.hoveredIndex !== undefined ? props.hoveredIndex : hoveredIndex.value)

function getPoint(metricIndex: number, value: number, distance = radius.value) {
  const angle = -Math.PI / 2 + (metricIndex * Math.PI * 2) / props.metrics.length
  const scaledRadius = distance * Math.max(0, Math.min(value, 100)) / 100
  return { x: center.value + Math.cos(angle) * scaledRadius, y: center.value + Math.sin(angle) * scaledRadius }
}

function pointsFor(values: Record<string, number>, distance = radius.value) {
  return props.metrics.map((metric, index) => {
    const point = getPoint(index, values[metric.key] ?? 0, distance)
    return `${point.x},${point.y}`
  }).join(' ')
}

function colorFor(index: number) {
  return props.data[index]?.color ?? `var(--chart-${(index % 5) + 1}, var(--color-primary-strong))`
}

function setHoveredIndex(index: number | null) {
  hoveredIndex.value = index
  emit('update:hoveredIndex', index)
}

const enterTransition = computed(() => props.enterTransition ?? { type: 'tween' as const, durationSeconds: props.enterDurationMs / 1000, ease: [0.85, 0, 0.15, 1] as [number, number, number, number] })

const radarContext: BklitRadarContext = {
  get data() { return props.data },
  get metrics() { return props.metrics },
  get levels() { return props.levels },
  get animate() { return props.animate },
  get enterDurationMs() { return props.enterDurationMs },
  get staggerScale() { return props.staggerScale },
  get enterTransition() { return enterTransition.value },
  get motionReplayKey() { return props.motionReplayKey },
  get radius() { return radius.value },
  get center() { return center.value },
  hoveredIndex: currentHoveredIndex,
  setHoveredIndex,
  getPoint,
  pointsFor,
  colorFor,
}

provideBklitRadarContext(radarContext)
const isReady = computed(() => props.data.length > 0 && props.metrics.length > 2)
</script>

<template>
  <figure v-if="isReady" class="min-w-0" :class="props.className" aria-label="Code profile radar chart">
    <div class="flex flex-col gap-4 items-center md:flex-row md:items-center">
      <div class="max-w-[460px] w-full aspect-square md:w-[60%]" :style="props.size ? { maxWidth: `${props.size}px` } : undefined">
        <svg class="h-full w-full overflow-visible" :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`" :width="props.size" :height="props.size" role="img" aria-label="Roast profile dimensions">
          <BklitRadarGrid />
          <BklitRadarAxis />
          <BklitRadarLabels />
          <BklitRadarArea v-for="(_, index) in data" :key="`area-${index}`" :index="index" />
        </svg>
      </div>
      <BklitRadarLegend :data="data" title="Profile score" :hovered-index="currentHoveredIndex" @update:hovered-index="setHoveredIndex" />
    </div>
  </figure>
</template>
