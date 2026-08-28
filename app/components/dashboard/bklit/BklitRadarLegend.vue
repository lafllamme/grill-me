<script setup lang="ts">
import type { BklitRadarData } from './radar-context'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  data: readonly BklitRadarData[]
  hoveredIndex?: number | null
  title?: string
}>(), { hoveredIndex: null, title: 'Campaign Performance' })

const emit = defineEmits<{ 'update:hoveredIndex': [index: number | null] }>()

function averageFor(values: Record<string, number>) {
  const entries = Object.values(values)
  return entries.length ? entries.reduce((sum, value) => sum + value, 0) / entries.length : 0
}

const legendItems = computed(() => props.data.map(series => ({ ...series, value: averageFor(series.values), maxValue: 100 })))
</script>

<template>
  <div class="legend-container flex flex-col gap-2">
    <h3 class="text-sm font-semibold mb-1" :style="{ color: 'var(--chart-text)' }">{{ props.title }}</h3>
    <div
      v-for="(item, index) in legendItems"
      :key="item.label"
      class="cursor-pointer rounded-none px-2 py-1.5 transition-all duration-150 ease-out gap-x-3 gap-y-1 grid grid-cols-[auto_1fr_auto] items-center"
      :class="[
        props.hoveredIndex === index ? 'bg-chart-hover' : '',
        props.hoveredIndex !== null && props.hoveredIndex !== index ? 'opacity-40' : '',
      ]"
      :data-hovered="props.hoveredIndex === index ? '' : undefined"
      @pointerenter="emit('update:hoveredIndex', index)"
      @pointerleave="emit('update:hoveredIndex', null)"
    >
      <span class="rounded-full shrink-0 h-2.5 w-2.5" :style="{ backgroundColor: item.color }" aria-hidden="true" />
      <span class="text-sm font-body font-medium" :style="{ color: 'var(--chart-text)' }">{{ item.label }}</span>
      <span class="text-sm flex items-center gap-2 font-meta tabular-nums" :style="{ color: 'var(--chart-label)' }">{{ item.value.toFixed(0) }}%</span>
    </div>
  </div>
</template>
