<script setup lang="ts">
defineProps<{ id: string }>()

const gradientStops = [
  ['0%', '0.050'],
  ['6%', '0.082'],
  ['13%', '0.174'],
  ['19%', '0.312'],
  ['25%', '0.475'],
  ['31%', '0.638'],
  ['38%', '0.776'],
  ['44%', '0.868'],
  ['50%', '0.900'],
  ['56%', '0.868'],
  ['63%', '0.776'],
  ['69%', '0.638'],
  ['75%', '0.475'],
  ['81%', '0.312'],
  ['88%', '0.174'],
  ['94%', '0.082'],
  ['100%', '0.050'],
].map(([offset, opacity]) => ({ offset, opacity }))
</script>

<template>
  <linearGradient :id="id" x1="0" x2="1" y1="0" y2="0">
    <stop v-for="stop in gradientStops" :key="stop.offset" :offset="stop.offset" stop-color="white" :stop-opacity="stop.opacity" />
  </linearGradient>
</template>
