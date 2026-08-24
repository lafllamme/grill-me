<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import BklitDateTicker from './BklitDateTicker.vue'
import BklitTooltipDot from './BklitTooltipDot.vue'
import BklitTooltipIndicator from './BklitTooltipIndicator.vue'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{
  showCrosshair?: boolean
  showDots?: boolean
}>(), { showCrosshair: true, showDots: true })

const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitChartTooltip must be rendered inside BklitBarChart')
}

const seriesKeys = computed(() => Object.keys(context.data[0] ?? {}).filter(key => key !== context.xDataKey && typeof context.data[0]?.[key] === 'number'))
const isFlipped = computed(() => (context.tooltipX.value ?? 0) > context.chartWidth * 0.68)
const tooltipX = useBklitSpring(context.tooltipX)
const tooltipStyle = computed(() => ({
  left: `${tooltipX.value / context.chartWidth * 100}%`,
  top: '16px',
  transform: isFlipped.value ? 'translateX(calc(-100% - 16px))' : 'translateX(16px)',
}))
</script>

<template>
  <template v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'">
    <BklitTooltipIndicator v-if="props.showCrosshair" />
    <svg v-if="props.showDots" class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 640 320" aria-hidden="true">
      <BklitTooltipDot v-for="key in seriesKeys" :key="key" :data-key="key" :color="context.seriesColors[key]" />
    </svg>
    <BklitDateTicker />
    <div class="pointer-events-none absolute z-30 min-w-[140px] overflow-hidden rounded-lg bg-chart-tooltip text-on-background shadow-lg backdrop-blur-md" :style="tooltipStyle">
      <div class="px-3 py-2.5">
        <p class="mb-2 text-xs font-medium">{{ context.data[context.hoveredIndex.value]?.[context.xDataKey] }}</p>
        <div class="space-y-1.5">
          <div v-for="key in seriesKeys" :key="key" class="flex items-center justify-between gap-4 text-sm">
            <span class="flex min-w-0 items-center gap-2 text-on-surface-variant">
              <span class="h-2.5 w-2.5 shrink-0 rounded-full" :style="{ backgroundColor: context.seriesColors[key] ?? '#2a2a2e' }" />
              <span>{{ key }}</span>
            </span>
            <strong class="shrink-0 tabular-nums text-on-background font-medium">{{ Number(context.data[context.hoveredIndex.value]?.[key] ?? 0).toLocaleString() }}</strong>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>
