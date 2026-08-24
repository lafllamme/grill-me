<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import RoastReceiptPrinter from '~/components/roast-explorer/RoastReceiptPrinter.vue'
import { roastOneFixture } from '~/data/roast-one'

const revealPhase = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealPhase.value = 5
    return
  }

  const phases = [
    [900, 1],
    [2500, 2],
    [4100, 3],
    [5700, 4],
    [7300, 5],
  ] as const

  phases.forEach(([delay, phase]) => {
    timers.push(setTimeout(() => {
      revealPhase.value = phase
    }, delay))
  })
})

onBeforeUnmount(() => {
  timers.forEach(timer => clearTimeout(timer))
})
</script>

<template>
  <RoastReceiptPrinter :fixture="roastOneFixture" :reveal-phase="revealPhase" />
</template>
