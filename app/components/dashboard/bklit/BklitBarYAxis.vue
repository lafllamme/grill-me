<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number }>(), { showAllLabels: true, maxLabels: 20 })
const context = inject(bklitBarContextKey)
if (!context)
  throw new Error('BklitBarYAxis must be rendered inside BklitBarChart')
</script>

<template>
  <g class="text-[10px] font-meta" :style="{ fill: 'var(--chart-label)' }">
    <template v-for="step in 5" :key="step">
      <text :x="context.plotLeft - 10" :y="context.chartHeight - context.plotBottom - (step - 1) * ((context.chartHeight - context.plotTop - context.plotBottom) / 4) + 4" text-anchor="end">
        {{ Math.round((step - 1) * 25) }}
      </text>
    </template>
  </g>
</template>
