<script setup lang="ts">
withDefaults(defineProps<{ id: string, durationSeconds?: number }>(), { durationSeconds: 2 })
</script>

<template>
  <linearGradient :id="id" x1="-640" x2="-320" y1="0" y2="0" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="#2a2a2e" stop-opacity="0.28" />
    <stop offset="42%" stop-color="#5c5d65" stop-opacity="0.5" />
    <stop offset="50%" stop-color="#fcf7f0" stop-opacity="0.74" />
    <stop offset="58%" stop-color="#5c5d65" stop-opacity="0.5" />
    <stop offset="100%" stop-color="#2a2a2e" stop-opacity="0.28" />
    <animate attributeName="x1" from="-640" to="1280" :dur="`${durationSeconds}s`" repeatCount="indefinite" />
    <animate attributeName="x2" from="-320" to="1600" :dur="`${durationSeconds}s`" repeatCount="indefinite" />
  </linearGradient>
</template>
