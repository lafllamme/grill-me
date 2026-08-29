<script setup lang="ts">
import { computed, inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

const props = withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number }>(), { showAllLabels: false, maxLabels: 12 })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
const context = injectedContext

const activeIndex = computed(() => context.hoveredIndex.value)
const activeLabel = computed(() => {
  const index = activeIndex.value
  if (index === null)
    return ''

  return String(context.data[index]?.[context.xDataKey] ?? '')
})

const activeTickerWidth = computed(() => tickerWidth(activeLabel.value))

function labelOpacity(index: number) {
  if (context.tooltipX.value === null)
    return 1

  const animatedX = context.animatedTooltipX.value
  if (animatedX === null)
    return 1

  const distance = Math.abs(context.xAt(index) - animatedX)
  const tickerHalfWidth = activeTickerWidth.value / 2
  const fadeRadius = tickerHalfWidth + 20

  if (distance < tickerHalfWidth)
    return 0

  if (distance < fadeRadius)
    return (distance - tickerHalfWidth) / 20

  return 1
}

function tickerWidth(label: string) {
  return Math.max(72, label.length * 8 + 24)
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

    <g
      v-if="activeIndex !== null && context.status.value === 'ready' && context.animatedTooltipX.value !== null"
      class="pointer-events-none"
      :transform="`translate(${context.animatedTooltipX.value}, 288)`"
    >
      <rect
        :x="-activeTickerWidth / 2"
        y="0"
        :width="activeTickerWidth"
        height="22"
        rx="11"
        fill="var(--chart-axis-badge-background, #f5f5f5)"
      />
      <text
        :y="16"
        text-anchor="middle"
        class="font-body text-[12px] font-medium"
        fill="var(--chart-axis-badge-foreground, #171717)"
      >
        {{ activeLabel }}
      </text>
    </g>
  </g>
</template>
