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
    <h3 class="text-sm text-on-background font-semibold mb-1">{{ props.title }}</h3>
    <div
      v-for="(item, index) in legendItems"
      :key="item.label"
      class="cursor-pointer rounded-lg px-2 py-1.5 gap-3 flex items-center transition-all duration-150 ease-out"
      :class="props.hoveredIndex === index ? 'bg-surface-bright' : ''"
      :data-hovered="props.hoveredIndex === index ? '' : undefined"
      @pointerenter="emit('update:hoveredIndex', index)"
      @pointerleave="emit('update:hoveredIndex', null)"
    >
      <span class="rounded-full shrink-0 h-2.5 w-2.5" :style="{ backgroundColor: item.color }" aria-hidden="true" />
      <span class="text-sm text-on-background flex-1 font-medium">{{ item.label }}</span>
      <span class="text-sm text-on-surface-variant tabular-nums"><span>{{ item.value.toFixed(0) }}%</span></span>
    </div>
  </div>
</template>
