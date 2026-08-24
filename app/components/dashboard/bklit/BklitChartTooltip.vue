<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{
  showCrosshair?: boolean
  showDots?: boolean
}>(), { showCrosshair: true, showDots: true })

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitChartTooltip must be rendered inside BklitBarChart')
}

const tooltipStyle = computed(() => {
  if (context.tooltipX.value === null || context.tooltipY.value === null)
    return {}
  const flip = context.tooltipX.value > context.chartWidth * 0.68
  return {
    left: `${context.tooltipX.value / context.chartWidth * 100}%`,
    top: `${context.tooltipY.value / context.chartHeight * 100}%`,
    transform: `translate(${flip ? '-100%' : '0'}, -100%) ${flip ? 'translate(-16px, -16px)' : 'translate(16px, -16px)'}`,
  }
})

const seriesKeys = computed(() => Object.keys(context.data[0] ?? {}).filter(key => key !== context.xDataKey && typeof context.data[0]?.[key] === 'number'))
</script>

<template>
  <div v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'" class="text-on-background font-body px-5 py-4 rounded-none bg-chart-tooltip min-w-[190px] pointer-events-none shadow-[0_14px_28px_rgba(0,0,0,0.35)] transition-[left,top,transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] absolute" :style="tooltipStyle">
    <p class="text-base font-semibold">
      {{ context.data[context.hoveredIndex.value]?.[context.xDataKey] }}
    </p>
    <div v-for="key in seriesKeys" :key="key" class="text-sm text-on-surface-variant mt-4 flex gap-3 items-center">
      <span v-if="props.showDots" class="rounded-full shrink-0 h-3 w-3" :style="{ backgroundColor: context.seriesColors[key] ?? '#2a2a2e' }" />
      <span class="flex-1">{{ key }}</span>
      <strong class="text-on-background font-body">{{ Number(context.data[context.hoveredIndex.value]?.[key] ?? 0).toLocaleString() }}</strong>
    </div>
  </div>
</template>
