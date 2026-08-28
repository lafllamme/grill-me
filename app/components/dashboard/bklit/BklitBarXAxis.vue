<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number, tickerHalfWidth?: number }>(), { showAllLabels: false, maxLabels: 12, tickerHalfWidth: 50 })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
const context = injectedContext

function labelOpacity(index: number) {
  if (context.hoveredIndex.value === index)
    return 0

  if (context.tooltipX.value === null)
    return 1

  const distance = Math.abs(context.xAt(index) - context.tooltipX.value)
  const fadeRadius = props.tickerHalfWidth + 20

  if (distance < props.tickerHalfWidth)
    return 0

  if (distance < fadeRadius)
    return (distance - props.tickerHalfWidth) / 20

  return 1
}
</script>

<template>
  <g>
    <template v-for="(item, index) in context.data" :key="index">
      <template v-if="props.showAllLabels || context.data.length <= props.maxLabels || index === context.hoveredIndex.value || index % Math.max(1, Math.ceil(context.data.length / props.maxLabels)) === 0">
        <text :x="context.xAt(index)" y="299" text-anchor="middle" :opacity="labelOpacity(index)" class="font-body text-[12px]" :style="{ fill: 'var(--chart-label)' }">
          {{ item[context.xDataKey] }}
        </text>
      </template>
    </template>
  </g>
</template>
