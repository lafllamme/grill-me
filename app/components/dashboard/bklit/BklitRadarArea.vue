<script setup lang="ts">
import { computed } from 'vue'
import { useBklitRadarContext } from './radar-context'

const props = withDefaults(defineProps<{ index: number, showPoints?: boolean, showStroke?: boolean, showGlow?: boolean }>(), { showPoints: true, showStroke: true, showGlow: true })
const context = useBklitRadarContext()
const series = computed(() => context.data[props.index])
const isHovered = computed(() => context.hoveredIndex.value === props.index)
const isActive = computed(() => context.activeIndex.value === props.index)
const isDimmed = computed(() => (context.hoveredIndex.value !== null || context.activeIndex.value !== null) && !isHovered.value && !isActive.value)
const color = computed(() => context.colorFor(props.index))
const points = computed(() => series.value ? context.pointsFor(series.value.values) : '')
</script>

<template>
  <g v-if="series" class="bklit-radar-area" :class="{ 'is-hovered': isHovered || isActive, 'is-dimmed': isDimmed }" :style="{ transformOrigin: `${context.center}px ${context.center}px` }" @mouseenter="context.setHoveredIndex(props.index)" @mouseleave="context.setHoveredIndex(null)" @click.stop="context.toggleActiveIndex(props.index)">
    <polygon :points="points" :fill="color" :fill-opacity="isHovered ? 0.35 : 0.15" :stroke="showStroke ? color : 'none'" :stroke-width="isHovered ? 3 : 2" stroke-linejoin="round" :style="{ filter: showGlow && isHovered ? `drop-shadow(0 0 12px ${color})` : 'none' }" />
    <g v-if="showPoints">
      <circle v-for="(metric, metricIndex) in context.metrics" :key="metric.key" :cx="context.getPoint(metricIndex, series.values[metric.key] ?? 0).x" :cy="context.getPoint(metricIndex, series.values[metric.key] ?? 0).y" :r="isHovered ? 6 : 4" :fill="color" stroke="var(--color-chart-tooltip)" stroke-width="2" />
    </g>
  </g>
</template>

<style scoped>
.bklit-radar-area { cursor: pointer; opacity: 1; transition: opacity 150ms ease, transform 350ms cubic-bezier(.22, 1, .36, 1); }
.bklit-radar-area.is-hovered { transform: scale(1.05); }
.bklit-radar-area.is-dimmed { opacity: 0.3; }
</style>
