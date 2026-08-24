<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

defineProps<{ horizontal?: boolean, vertical?: boolean }>()
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitGrid must be rendered inside BklitBarChart')
}
</script>

<template>
  <g v-if="horizontal !== false" class="stroke-chart-grid" stroke-width="1" stroke-dasharray="3 6">
    <line v-for="index in 5" :key="index" :x1="context.plotLeft" :x2="context.chartWidth - context.plotRight" :y1="context.plotTop + (index - 1) * ((context.chartHeight - context.plotTop - context.plotBottom) / 4)" :y2="context.plotTop + (index - 1) * ((context.chartHeight - context.plotTop - context.plotBottom) / 4)" />
  </g>
</template>
