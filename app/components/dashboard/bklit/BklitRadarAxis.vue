<script setup lang="ts">
import { useBklitRadarContext } from './radar-context'

const context = useBklitRadarContext()
</script>

<template>
  <g class="bklit-radar-axis">
    <line v-for="(metric, index) in context.metrics" :key="metric.key" :x1="context.center" :x2="context.getPoint(index, 100).x" :y1="context.center" :y2="context.getPoint(index, 100).y" stroke="var(--color-chart-grid)" stroke-width="1" stroke-opacity="0.7" />
  </g>
</template>
