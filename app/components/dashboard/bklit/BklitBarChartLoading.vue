<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{
  barCount?: number
  durationSeconds?: number
}>(), {
  barCount: 12,
  durationSeconds: 2,
})

const chartId = `bklit-bar-sweep-${useId()}`
const skeletonHeights = [0.46, 0.72, 0.58, 0.34, 0.78, 0.52, 0.66, 0.4, 0.74, 0.49, 0.62, 0.38]
</script>

<template>
  <svg class="w-full h-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Loading bar chart">
    <defs>
      <linearGradient :id="`${chartId}-gradient`" x1="-640" x2="-320" y1="0" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#2a2a2e" stop-opacity="0.28" />
        <stop offset="42%" stop-color="#5c5d65" stop-opacity="0.5" />
        <stop offset="50%" stop-color="#fcf7f0" stop-opacity="0.74" />
        <stop offset="58%" stop-color="#5c5d65" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#2a2a2e" stop-opacity="0.28" />
        <animate attributeName="x1" from="-640" to="1280" :dur="`${durationSeconds}s`" repeatCount="indefinite" />
        <animate attributeName="x2" from="-320" to="1600" :dur="`${durationSeconds}s`" repeatCount="indefinite" />
      </linearGradient>
    </defs>
    <rect v-for="index in 5" :key="index" class="fill-chart-grid" :x="48" :y="24 + (index - 1) * 62.5" width="544" height="1" opacity="0.5" />
    <rect
      v-for="index in barCount"
      :key="`bar-${index}`"
      :x="48 + (index - 1) * (544 / barCount) + (544 / barCount) * 0.15"
      :y="274 - (skeletonHeights[(index - 1) % skeletonHeights.length] ?? 0.5) * 210"
      :width="(544 / barCount) * 0.7"
      :height="(skeletonHeights[(index - 1) % skeletonHeights.length] ?? 0.5) * 210"
      rx="2"
      :fill="`url(#${chartId}-gradient)`"
    />
  </svg>
</template>
