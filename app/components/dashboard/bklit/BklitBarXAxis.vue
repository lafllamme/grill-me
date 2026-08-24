<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number, tickerHalfWidth?: number }>(), { showAllLabels: false, maxLabels: 12, tickerHalfWidth: 50 })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
</script>

<template>
  <g>
    <template v-for="(item, index) in context.data" :key="index">
      <template v-if="props.showAllLabels || context.data.length <= props.maxLabels || index === context.hoveredIndex.value || index % Math.max(1, Math.ceil(context.data.length / props.maxLabels)) === 0">
        <text :x="context.xAt(index)" y="299" text-anchor="middle" :opacity="context.hoveredIndex.value === index || context.tooltipX.value === null ? 1 : Math.min(1, Math.max(0, (Math.abs(context.xAt(index) - context.tooltipX.value) - props.tickerHalfWidth) / 20))" :class="context.hoveredIndex.value === index ? 'fill-on-surface-variant font-body font-medium' : 'fill-on-surface-variant font-body'" class="text-[12px]">
          {{ item[context.xDataKey] }}
        </text>
      </template>
    </template>
  </g>
</template>
