<script setup lang="ts">
import type { RoastOneLabDimension } from '~/data/roast-one-lab'

defineProps<{ dimensions: RoastOneLabDimension[] }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-px bg-divider sm:grid-cols-3">
    <div v-for="dimension in dimensions" :key="dimension.key" class="p-3 bg-surface">
      <div class="text-[9px] text-on-surface-variant tracking-[0.12em] font-meta uppercase">{{ dimension.label }}</div>
      <div class="text-2xl text-on-background tracking-[-0.06em] font-display mt-2">{{ dimension.value }}</div>
      <div class="text-[10px] text-on-surface-variant leading-4 mt-1">{{ dimension.signal }}</div>
      <div class="mt-3 h-1 rounded-full bg-surface-container"><div class="h-full rounded-full bg-primary" :style="{ width: `${dimension.value}%` }" /></div>
    </div>
  </div>
</template>
