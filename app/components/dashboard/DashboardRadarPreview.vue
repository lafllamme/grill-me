<script setup lang="ts">
import type { RoastDashboardRingDatum } from '~/data/roast-dashboard'

const props = defineProps<{ data: readonly RoastDashboardRingDatum[] }>()
const center = 120
const radius = 82
function points(level: number) {
  return props.data.map((_, index) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / props.data.length
    const value = radius * level
    return `${center + Math.cos(angle) * value},${center + Math.sin(angle) * value}`
  }).join(' ')
}
const labels = props.data.map((item, index) => {
  const angle = -Math.PI / 2 + (index * Math.PI * 2) / props.data.length
  return { ...item, x: center + Math.cos(angle) * 105, y: center + Math.sin(angle) * 105 }
})
</script>

<template>
  <figure class="min-w-0" aria-label="Mocked code profile radar">
    <svg class="w-full h-auto max-w-[300px] mx-auto" viewBox="0 0 240 240" role="img">
      <polygon v-for="level in [1, .75, .5, .25]" :key="level" :points="points(level)" class="fill-none stroke-outline" stroke-width="1" />
      <polygon :points="points(1)" class="fill-primary/10 stroke-primary" stroke-width="2" />
      <polygon :points="points(.42)" class="fill-primary/25 stroke-primary-strong" stroke-width="1" />
      <text x="120" y="116" text-anchor="middle" class="fill-on-background text-[14px] font-display">37</text>
      <text x="120" y="133" text-anchor="middle" class="fill-on-surface-variant text-[7px] tracking-[1.5px] font-meta">PROFILE INDEX</text>
      <text v-for="item in labels" :key="item.label" :x="item.x" :y="item.y" text-anchor="middle" class="fill-on-surface-variant text-[7px] font-meta">{{ item.label.split(' ')[0] }}</text>
    </svg>
    <figcaption class="text-[10px] text-on-surface-variant tracking-[0.14em] text-center font-meta uppercase">One profile, three readable dimensions</figcaption>
  </figure>
</template>
