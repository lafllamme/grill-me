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
    <text v-for="(item, index) in context.data" :key="index" :x="context.xAt(index)" y="298" text-anchor="middle" class="fill-on-surface-variant text-[12px] font-body">{{ item[context.xDataKey] }}</text>
  </g>
</template>
