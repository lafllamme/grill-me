<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitDateTicker must be rendered inside BklitBarChart')
}
const tickerX = useBklitSpring(context.tooltipX)
const tickerY = useBklitSpring(computed(() => context.hoveredIndex.value === null ? 0 : -(context.hoveredIndex.value * 24)))
</script>

<template>
  <div v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'" class="pointer-events-none absolute z-20" :style="{ left: `${tickerX / context.chartWidth * 100}%`, bottom: '12px', transform: 'translateX(-50%)' }">
    <div class="relative h-6 overflow-hidden rounded-full bg-on-background px-4 py-1 text-sm font-medium text-background shadow-lg">
      <div class="flex flex-col transition-none" :style="{ transform: `translateY(${tickerY}px)` }">
        <span v-for="(item, index) in context.data" :key="`${item[context.xDataKey]}-${index}`" class="flex h-6 shrink-0 items-center justify-center whitespace-nowrap">
          {{ item[context.xDataKey] }}
        </span>
      </div>
    </div>
  </div>
</template>
