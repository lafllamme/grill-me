<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { computed } from 'vue'
import { useBklitEnter } from './use-bklit-enter'

const props = defineProps<{
  path: string
  fill: string
  opacity: number
  xCenter: number
  yCenter: number
  delay: number
  replayKey?: string
}>()

const prefersReducedMotion = usePreferredReducedMotion()
const revealProgress = useBklitEnter(prefersReducedMotion.value !== 'reduce', props.delay, () => props.replayKey ?? '', { type: 'spring', stiffness: 300, damping: 20 })
const clampedProgress = computed(() => Math.min(1, Math.max(0, revealProgress.value)))
const transform = computed(() => `translate(${props.xCenter} ${props.yCenter}) scale(${clampedProgress.value}) translate(${-props.xCenter} ${-props.yCenter})`)
</script>

<template>
  <path :d="path" :fill="fill" :fill-opacity="opacity" :style="{ opacity: revealProgress }" :transform="transform" />
</template>
