<script setup lang="ts">
import type { RoastOneLabDimension } from '~/data/roast-one-lab'
import { computed } from 'vue'

const props = defineProps<{ dimensions: RoastOneLabDimension[] }>()
const center = 110
const radius = 78
const angle = (index: number) => (-Math.PI / 2) + (index * Math.PI * 2) / props.dimensions.length
const point = (index: number, value: number) => `${center + Math.cos(angle(index)) * radius * value / 100},${center + Math.sin(angle(index)) * radius * value / 100}`
const ring = (value: number) => props.dimensions.map((_, index) => point(index, value)).join(' ')
const profile = computed(() => props.dimensions.map((dimension, index) => point(index, dimension.value)).join(' '))
</script>

<template>
  <div class="flex gap-5 items-center">
    <svg class="h-44 w-44 shrink-0" viewBox="0 0 220 220" role="img" aria-label="Code profile radar">
      <polygon v-for="value in [25, 50, 75, 100]" :key="value" :points="ring(value)" fill="none" class="stroke-divider" stroke-width="1" />
      <line v-for="(_, index) in dimensions" :key="`axis-${index}`" :x1="center" :y1="center" :x2="point(index, 100).split(',')[0]" :y2="point(index, 100).split(',')[1]" class="stroke-divider" stroke-width="1" />
      <polygon :points="profile" class="fill-primary/20 stroke-primary" stroke-width="2" />
      <circle v-for="(dimension, index) in dimensions" :key="dimension.key" :cx="point(index, dimension.value).split(',')[0]" :cy="point(index, dimension.value).split(',')[1]" r="3" class="fill-primary" />
    </svg>
    <div class="min-w-0 space-y-2">
      <div v-for="dimension in dimensions.slice(0, 3)" :key="dimension.key" class="text-[10px] font-meta">
        <div class="text-on-surface-variant tracking-[0.1em] uppercase">{{ dimension.label }}</div>
        <div class="text-on-background mt-0.5 flex gap-2 items-baseline"><span class="text-lg">{{ dimension.value }}</span><span class="truncate">{{ dimension.signal }}</span></div>
      </div>
    </div>
  </div>
</template>
