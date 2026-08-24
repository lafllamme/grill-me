<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number, tickerHalfWidth?: number }>(), { showAllLabels: false, maxLabels: 12, tickerHalfWidth: 32 })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
</script>

<template>
  <g>
    <template v-for="(item, index) in context.data" :key="index">
      <template v-if="props.showAllLabels || context.data.length <= props.maxLabels || index === context.hoveredIndex.value || index % Math.max(1, Math.ceil(context.data.length / props.maxLabels)) === 0">
        <rect v-if="context.hoveredIndex.value === index" :x="context.xAt(index) - props.tickerHalfWidth" y="278" :width="props.tickerHalfWidth * 2" height="32" rx="16" class="fill-on-background" />
        <text :x="context.xAt(index)" y="299" text-anchor="middle" :class="context.hoveredIndex.value === index ? 'fill-background font-body font-semibold' : 'fill-on-surface-variant font-body'" class="text-[12px]">
          {{ item[context.xDataKey] }}
        </text>
      </template>
    </template>
  </g>
</template>
