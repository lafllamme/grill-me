<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{ dataKey: string, color?: string, size?: number }>(), { size: 5 })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitTooltipDot must be rendered inside BklitBarChart')
}
const xTarget = computed(() => context.tooltipX.value === null ? null : context.xPositions.value[props.dataKey] ?? context.tooltipX.value)
const yTarget = computed(() => context.hoveredIndex.value === null ? null : context.yPositions.value[props.dataKey] ?? null)
const x = useBklitSpring(xTarget)
const y = useBklitSpring(yTarget)
</script>

<template>
  <circle v-if="context.hoveredIndex.value !== null && context.status.value === 'ready' && yTarget !== null" :cx="x" :cy="y" :r="props.size" :fill="props.color ?? context.seriesColors[props.dataKey] ?? '#2a2a2e'" class="stroke-chart-track" stroke-width="2" />
</template>
