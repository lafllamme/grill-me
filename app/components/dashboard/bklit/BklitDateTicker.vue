<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitDateTicker must be rendered inside BklitBarChart')
}
const tickerX = useBklitSpring(context.tooltipX)
const label = computed(() => context.hoveredIndex.value === null ? '' : String(context.data[context.hoveredIndex.value]?.[context.xDataKey] ?? ''))
</script>

<template>
  <div v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'" class="pointer-events-none absolute z-20" :style="{ left: `${tickerX / context.chartWidth * 100}%`, bottom: '4px', transform: 'translateX(-50%)' }">
    <div class="flex h-6 items-center justify-center overflow-hidden rounded-full bg-on-background px-4 py-1 text-sm font-medium text-background shadow-[0_12px_24px_rgba(0,0,0,0.28)]">
      {{ label }}
    </div>
  </div>
</template>
