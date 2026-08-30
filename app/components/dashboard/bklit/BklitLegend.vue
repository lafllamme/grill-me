<script setup lang="ts">
import { inject } from 'vue'
import { bklitRingContextKey } from './ring-context'

const props = withDefaults(defineProps<{
  heading?: string
}>(), {
  heading: 'Sessions by Channel',
})

const injectedContext = inject(bklitRingContextKey)

if (!injectedContext) {
  throw new Error('BklitLegend must be rendered inside BklitRingChart')
}

const context = injectedContext

function handleEnter(index: number) {
  context.setHoveredIndex(index)
}

function handleLeave() {
  context.clearHoveredIndex()
}

function ringToneClass(index: number) {
  return index === 0 ? 'bg-primary-strong' : index === 1 ? 'bg-primary' : 'bg-primary/70'
}
</script>

<template>
  <div class="legend-container flex flex-col gap-2 w-full sm:min-w-[18rem]">
    <h3 class="text-sm font-semibold mb-1" :style="{ color: 'var(--chart-text)' }">
      {{ props.heading }}
    </h3>
    <div
      v-for="(item, index) in context.data"
      :key="item.label"
      class="px-2 py-1.5 rounded-lg gap-x-3 gap-y-1 grid grid-cols-[auto_1fr_auto] cursor-pointer transition-all duration-150 ease-out items-center"
      :class="[
        context.hoveredIndex.value === index ? 'bg-chart-hover' : '',
        context.hoveredIndex.value !== null && context.hoveredIndex.value !== index ? 'opacity-40' : '',
      ]"
      @mouseenter="handleEnter(index)"
      @mouseleave="handleLeave"
    >
      <span class="rounded-full shrink-0 h-2.5 w-2.5" :class="!item.color ? ringToneClass(index) : ''" :style="item.color ? { backgroundColor: item.color } : undefined" aria-hidden="true" />
      <span class="text-sm font-body font-medium" :style="{ color: 'var(--chart-text)' }">{{ item.label }}</span>
      <span class="text-sm font-meta flex gap-2 items-center tabular-nums" :style="{ color: 'var(--chart-label)' }">
        <span>{{ item.value.toLocaleString() }}</span>
        <span>{{ Math.round((item.value / item.maxValue) * 100) }}%</span>
      </span>
      <div class="rounded-full bg-surface-container-highest col-span-full h-1.5 w-full overflow-hidden">
        <div class="rounded-full h-full transition-all duration-500" :class="!item.color ? ringToneClass(index) : ''" :style="{ width: `${Math.min((item.value / item.maxValue) * 100, 100)}%`, backgroundColor: item.color }" />
      </div>
    </div>
  </div>
</template>
