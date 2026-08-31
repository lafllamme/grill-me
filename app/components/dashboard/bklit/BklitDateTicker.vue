<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitDateTicker must be rendered inside BklitBarChart')
}
const tickerLeft = computed(() => `${(context.animatedTooltipX.value / context.chartWidth) * 100}%`)
const tickerY = useBklitSpring(computed(() => context.hoveredIndex.value === null ? 0 : -(context.hoveredIndex.value * 24)))
</script>

<template>
  <div v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'" class="pointer-events-none absolute z-20" :style="{ left: tickerLeft, bottom: '12px', transform: 'translateX(-50%)' }">
    <div class="text-sm text-background font-medium px-4 py-1 rounded-full bg-on-background h-6 shadow-lg relative overflow-hidden">
      <div class="flex flex-col transition-none" :style="{ transform: `translateY(${tickerY}px)` }">
        <span v-for="(item, index) in context.data" :key="`${item[context.xDataKey]}-${index}`" class="flex shrink-0 h-6 whitespace-nowrap items-center justify-center">
          {{ item[context.xDataKey] }}
        </span>
      </div>
    </div>
  </div>
</template>
