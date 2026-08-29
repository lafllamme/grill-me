<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { bklitBarContextKey } from './bar-context'
import { useBklitSpring } from './use-bklit-spring'

const props = withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number }>(), { showAllLabels: false, maxLabels: 12 })
const injectedContext = inject(bklitBarContextKey)
if (!injectedContext) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
const context = injectedContext

const tickerHalfWidth = 50
const activeIndex = computed(() => context.hoveredIndex.value)
const activeLabel = computed(() => {
  const index = activeIndex.value
  return index === null ? '' : String(context.data[index]?.[context.xDataKey] ?? '')
})
const activeTickerWidth = computed(() => Math.max(84, activeLabel.value.length * 8 + 36))
const tickerY = useBklitSpring(computed(() => activeIndex.value === null ? 0 : -(activeIndex.value * 24)), { stiffness: 400, damping: 35 })
const tickerClipId = `bklit-bar-ticker-${useId()}`

function labelOpacity(index: number) {
  if (context.tooltipX.value === null)
    return 1

  const animatedX = context.animatedTooltipX.value
  if (animatedX === null)
    return 1

  const distance = Math.abs(context.xAt(index) - animatedX)
  const fadeRadius = tickerHalfWidth + 20

  if (distance < tickerHalfWidth)
    return 0

  if (distance < fadeRadius)
    return (distance - tickerHalfWidth) / 20

  return 1
}
</script>

<template>
  <g>
    <template v-for="(item, index) in context.data" :key="index">
      <template v-if="props.showAllLabels || context.data.length <= props.maxLabels || index === context.hoveredIndex.value || index % Math.max(1, Math.ceil(context.data.length / props.maxLabels)) === 0">
        <text :x="context.xAt(index)" y="304" text-anchor="middle" :opacity="labelOpacity(index)" class="font-body text-[12px]" :style="{ fill: 'var(--chart-label)' }">
          {{ item[context.xDataKey] }}
        </text>
      </template>
    </template>
    <g
      v-if="activeIndex !== null && context.status.value === 'ready' && context.animatedTooltipX.value !== null"
      class="pointer-events-none"
      :transform="`translate(${context.animatedTooltipX.value}, 284)`"
    >
      <defs>
        <clipPath :id="tickerClipId">
          <rect :x="-activeTickerWidth / 2" y="0" :width="activeTickerWidth" height="32" rx="16" />
        </clipPath>
      </defs>
      <rect
        :x="-activeTickerWidth / 2"
        y="0"
        :width="activeTickerWidth"
        height="32"
        rx="16"
        fill="var(--chart-axis-badge-background, #f5f5f5)"
      />
      <g :clip-path="`url(#${tickerClipId})`">
        <g :transform="`translate(0, ${tickerY})`">
          <text
            v-for="(item, index) in context.data"
            :key="`${item[context.xDataKey]}-${index}`"
            :y="20 + index * 24"
            text-anchor="middle"
            class="font-body text-sm font-medium"
            fill="var(--chart-axis-badge-foreground, #171717)"
          >
            {{ item[context.xDataKey] }}
          </text>
        </g>
      </g>
    </g>
  </g>
</template>
