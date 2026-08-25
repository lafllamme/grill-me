<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'

withDefaults(defineProps<{ offset?: number, interactive?: boolean }>(), { offset: 24, interactive: true })
const context = useBklitRadarContext()
</script>

<template>
  <g class="bklit-radar-labels">
    <text v-for="(metric, index) in context.metrics" :key="metric.key" :x="context.getPoint(index, 100, context.radius + offset).x" :y="context.getPoint(index, 100, context.radius + offset).y" :class="interactive ? 'transition-opacity duration-150 hover:opacity-100' : ''" fill="var(--color-on-surface-variant)" font-size="10" font-weight="500" text-anchor="middle" dominant-baseline="middle">{{ metric.label }}</text>
  </g>
</template>
