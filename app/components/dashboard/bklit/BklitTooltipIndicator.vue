<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{ fadeEdges?: 'both' | 'none' | 'top' | 'bottom', fadeLength?: number }>(), { fadeEdges: 'both', fadeLength: 10 })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitTooltipIndicator must be rendered inside BklitBarChart')
}
const x = useBklitSpring(context.tooltipX)
const gradientId = `bklit-tooltip-indicator-${useId()}`
const stops = computed(() => {
  const fade = Math.min(40, Math.max(2, props.fadeLength))
  const innerEnd = 100 - fade
  if (props.fadeEdges === 'none') {
    return [{ offset: '0%', opacity: 1 }]
  }
  if (props.fadeEdges === 'top') {
    return [{ offset: '0%', opacity: 0 }, { offset: `${fade}%`, opacity: 1 }, { offset: '100%', opacity: 1 }]
  }
  if (props.fadeEdges === 'bottom') {
    return [{ offset: '0%', opacity: 1 }, { offset: `${innerEnd}%`, opacity: 1 }, { offset: '100%', opacity: 0 }]
  }
  return [{ offset: '0%', opacity: 0 }, { offset: `${fade}%`, opacity: 1 }, { offset: '50%', opacity: 1 }, { offset: `${innerEnd}%`, opacity: 1 }, { offset: '100%', opacity: 0 }]
})
</script>

<template>
  <svg v-if="context.hoveredIndex.value !== null && context.status.value === 'ready'" class="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 640 320" aria-hidden="true">
    <defs>
      <linearGradient :id="gradientId" x1="0%" x2="0%" y1="0%" y2="100%">
        <stop v-for="stop in stops" :key="stop.offset" :offset="stop.offset" stop-color="#fcf7f0" :stop-opacity="stop.opacity" />
      </linearGradient>
    </defs>
    <rect :x="x - 0.5" :y="context.plotTop" width="1" :height="context.chartHeight - context.plotTop - context.plotBottom" :fill="props.fadeEdges === 'none' ? '#fcf7f0' : `url(#${gradientId})`" />
  </svg>
</template>
