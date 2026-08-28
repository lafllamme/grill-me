<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed, inject, useId } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitLoadingSweep from './BklitLoadingSweep.vue'

const props = withDefaults(defineProps<{
  barCount?: number
  durationSeconds?: number
}>(), {
  barCount: 12,
  durationSeconds: 2,
})

const chartId = `bklit-bar-sweep-${useId()}`
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitBarChartLoading must be rendered inside BklitBarChart')
}
const isReducedMotion = usePreferredReducedMotion()
const skeletonHeights = computed(() => Array.from({ length: props.barCount }, (_, index) => {
  const x = Math.sin((index + 1) * 12.9898) * 43758.5453
  const fraction = x - Math.floor(x)
  return 20 + Math.floor(fraction * 60)
}))
const sweepDuration = computed(() => isReducedMotion.value === 'reduce' ? 0 : props.durationSeconds)
const plotWidth = computed(() => context.chartWidth - context.plotLeft - context.plotRight)
const plotHeight = computed(() => context.chartHeight - context.plotTop - context.plotBottom)
const barStep = computed(() => plotWidth.value / Math.max(props.barCount, 1))
const barWidth = computed(() => barStep.value * 0.7)
</script>

<template>
  <g role="img" aria-label="Loading bar chart">
    <defs v-if="sweepDuration > 0">
      <BklitLoadingSweep :id="`${chartId}-gradient`" />
      <pattern :id="`${chartId}-pattern`" width="3" height="1" patternUnits="objectBoundingBox" patternContentUnits="objectBoundingBox" patternTransform="rotate(25)">
        <rect x="-1" y="0" width="1" height="1" :fill="`url(#${chartId}-gradient)`">
          <animate attributeName="x" from="-1" to="2" :dur="`${sweepDuration}s`" repeatCount="indefinite" />
        </rect>
      </pattern>
      <mask :id="`${chartId}-mask`" maskUnits="userSpaceOnUse">
        <rect x="0" y="0" :width="plotWidth" :height="plotHeight" :fill="`url(#${chartId}-pattern)`" />
      </mask>
    </defs>
    <g :transform="`translate(${context.plotLeft} ${context.plotTop})`" :mask="sweepDuration > 0 ? `url(#${chartId}-mask)` : undefined">
      <rect
        v-for="index in barCount"
        :key="`bar-${index}`"
        :x="(index - 1) * barStep + barStep * 0.15"
        :y="plotHeight - (skeletonHeights[index - 1] ?? 20) / 100 * plotHeight"
        :width="barWidth"
        :height="(skeletonHeights[index - 1] ?? 20) / 100 * plotHeight"
        rx="2"
        fill="var(--color-on-background)"
        fill-opacity="0.45"
      />
    </g>
  </g>
</template>
