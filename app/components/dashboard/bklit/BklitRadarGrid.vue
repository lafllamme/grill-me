<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'

withDefaults(defineProps<{ showLabels?: boolean }>(), { showLabels: true })
const context = useBklitRadarContext()
</script>

<template>
  <g class="bklit-radar-grid">
    <polygon v-for="index in context.levels" :key="`grid-${index}`" :points="context.pointsFor(Object.fromEntries(context.metrics.map(metric => [metric.key, 100])), context.radius * (index / context.levels))" fill="none" stroke="var(--color-chart-grid)" stroke-width="1" stroke-opacity="0.7" />
    <g v-if="showLabels">
      <text v-for="index in context.levels" :key="`level-${index}`" :x="context.center + 5" :y="context.center - context.radius * (index / context.levels)" fill="var(--color-on-surface-variant)" font-size="9" text-anchor="start" dominant-baseline="middle">{{ index * (100 / context.levels) }}</text>
    </g>
  </g>
</template>
