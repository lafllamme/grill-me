<script setup lang="ts">
import { inject } from 'vue'
import { bklitBarContextKey } from './bar-context'

withDefaults(defineProps<{ showAllLabels?: boolean, maxLabels?: number }>(), { showAllLabels: false, maxLabels: 12 })
const context = inject(bklitBarContextKey)
if (!context) {
  throw new Error('BklitBarXAxis must be rendered inside BklitBarChart')
}
</script>

<template>
  <g>
    <template v-for="(item, index) in context.data" :key="index">
      <rect v-if="context.hoveredIndex.value === index" :x="context.xAt(index) - 32" y="278" width="64" height="32" rx="16" class="fill-on-background" />
      <text :x="context.xAt(index)" y="299" text-anchor="middle" :class="context.hoveredIndex.value === index ? 'fill-background font-body font-semibold' : 'fill-on-surface-variant font-body'" class="text-[12px]">{{ item[context.xDataKey] }}</text>
    </template>
  </g>
</template>
