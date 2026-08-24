<script setup lang="ts">
import { useId } from 'vue'
import BklitLoadingSweep from './BklitLoadingSweep.vue'

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
  <svg class="h-full w-full overflow-visible" viewBox="0 0 640 320" role="img" aria-label="Loading bar chart">
    <defs>
      <BklitLoadingSweep :id="`${chartId}-gradient`" :duration-seconds="durationSeconds" />
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
