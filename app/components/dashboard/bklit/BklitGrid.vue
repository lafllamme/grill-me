<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ horizontal?: boolean, vertical?: boolean, fadeHorizontal?: boolean, fadeVertical?: boolean }>(), { horizontal: true, vertical: false, fadeHorizontal: true, fadeVertical: false })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitGrid must be rendered inside BklitBarChart')
}
const gridId = `bklit-grid-${useId()}`
const plotWidth = computed(() => context.chartWidth - context.plotLeft - context.plotRight)
const plotHeight = computed(() => context.chartHeight - context.plotTop - context.plotBottom)
</script>

<template>
  <defs v-if="props.horizontal && props.fadeHorizontal">
    <linearGradient :id="`${gridId}-fade`" :x1="context.plotLeft" :x2="context.chartWidth - context.plotRight" y1="0" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="white" stop-opacity="0" />
      <stop offset="10%" stop-color="white" stop-opacity="1" />
      <stop offset="90%" stop-color="white" stop-opacity="1" />
      <stop offset="100%" stop-color="white" stop-opacity="0" />
    </linearGradient>
    <mask :id="`${gridId}-mask`" maskUnits="userSpaceOnUse">
      <rect :x="context.plotLeft" :y="context.plotTop" :width="plotWidth" :height="plotHeight" :fill="`url(#${gridId}-fade)`" />
    </mask>
  </defs>
  <g v-if="props.horizontal" class="stroke-chart-grid" stroke-width="1" stroke-dasharray="3 6" :mask="props.fadeHorizontal ? `url(#${gridId}-mask)` : undefined">
    <line v-for="index in 5" :key="index" :x1="context.plotLeft" :x2="context.chartWidth - context.plotRight" :y1="context.plotTop + (index - 1) * ((context.chartHeight - context.plotTop - context.plotBottom) / 4)" :y2="context.plotTop + (index - 1) * ((context.chartHeight - context.plotTop - context.plotBottom) / 4)" :opacity="props.fadeHorizontal ? 0.72 + (1 - Math.abs(index - 3) / 2) * 0.28 : 1" />
  </g>
  <g v-if="props.vertical" class="stroke-chart-grid" stroke-width="1" stroke-dasharray="3 6">
    <line v-for="index in context.data.length" :key="index" :x1="context.xAt(index - 1)" :x2="context.xAt(index - 1)" :y1="context.plotTop" :y2="context.chartHeight - context.plotBottom" :opacity="props.fadeVertical ? 0.72 : 1" />
  </g>
</template>
