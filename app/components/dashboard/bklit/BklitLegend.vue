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
  <div class="w-full space-y-5 sm:min-w-[18rem]">
    <h3 class="text-base text-on-background font-display">{{ props.heading }}</h3>
    <div
      v-for="(item, index) in context.data"
      :key="item.label"
      class="-mx-3 gap-x-3 gap-y-1 grid grid-cols-[auto_1fr_auto_auto] items-baseline px-3 py-2 transition-colors duration-200"
      :class="context.hoveredIndex.value === index ? 'bg-chart-hover' : ''"
      @mouseenter="handleEnter(index)"
      @mouseleave="handleLeave"
    >
      <span class="rounded-full h-2 w-2" :class="!item.color ? ringToneClass(index) : ''" :style="item.color ? { backgroundColor: item.color } : undefined" aria-hidden="true" />
      <span class="text-sm text-on-background font-body">{{ item.label }}</span>
      <strong class="text-sm text-on-background font-meta">{{ item.value.toLocaleString() }}</strong>
      <span class="text-sm text-on-surface-variant font-meta">{{ Math.round((item.value / item.maxValue) * 100) }}%</span>
      <div class="rounded-full bg-surface-container-highest h-2 col-start-2 col-end-5 overflow-hidden">
        <div class="rounded-full h-full" :class="!item.color ? ringToneClass(index) : ''" :style="{ width: `${Math.min((item.value / item.maxValue) * 100, 100)}%`, backgroundColor: item.color }" />
      </div>
    </div>
  </div>
</template>
