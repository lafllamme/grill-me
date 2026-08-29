<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed } from 'vue'

const props = defineProps<{
  path: string
  fill: string
  opacity: number
  delay: number
  replayKey?: string
}>()

const prefersReducedMotion = usePreferredReducedMotion()
const transition = computed(() => prefersReducedMotion.value === 'reduce'
  ? { duration: 0 }
  : { type: 'spring' as const, stiffness: 300, damping: 20, delay: props.delay })
</script>

<template>
  <motion.path
    :key="replayKey ?? 'default'"
    :d="path"
    :fill="fill"
    :fill-opacity="opacity"
    :initial="{ opacity: 0, scale: 0 }"
    :animate="{ opacity: 1, scale: 1 }"
    :transition="transition"
    :style="{ transformOrigin: '50% 50%' }"
  />
</template>
