<script setup lang="ts">
import type { LenisOptions } from 'lenis'
import { usePreferredReducedMotion } from '@vueuse/core'
import { useLenis, VueLenis } from 'lenis/vue'
import { cancelFrame, frame } from 'motion-v'
import { computed, onBeforeUnmount, onMounted } from 'vue'

const reducedMotion = usePreferredReducedMotion()
const lenis = useLenis()

const options = computed<LenisOptions>(() => ({
  autoRaf: false,
  anchors: true,
  duration: 2,
  smoothWheel: reducedMotion.value !== 'reduce',
  stopInertiaOnNavigate: true,
  syncTouch: false,
}))

function updateLenis({ timestamp }: { timestamp: number }) {
  lenis.value?.raf(timestamp)
}

onMounted(() => {
  frame.update(updateLenis, true)
})

onBeforeUnmount(() => {
  cancelFrame(updateLenis)
})
</script>

<template>
  <VueLenis root :options="options">
    <slot />
  </VueLenis>
</template>
