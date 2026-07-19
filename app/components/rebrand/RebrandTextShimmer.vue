<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  duration?: number
  spread?: number
}>(), {
  duration: 2,
  spread: 2,
})

const reducedMotion = usePreferredReducedMotion()

const dynamicSpread = computed(() => Math.max(24, props.text.length * props.spread))

const shimmerStyle = computed(() => {
  const spread = dynamicSpread.value
  const innerSpread = Math.round(spread * 0.42)
  const signalColor = 'var(--explore-accent-bright, #f0444d)'
  const baseColor = 'color-mix(in srgb, var(--explore-muted, #c5b2b4) 62%, transparent)'

  if (reducedMotion.value === 'reduce') {
    return {
      color: baseColor,
      WebkitTextFillColor: baseColor,
    }
  }

  return {
    backgroundImage: [
      `linear-gradient(90deg, transparent calc(50% - ${spread}px), color-mix(in srgb, ${signalColor} 72%, transparent) calc(50% - ${innerSpread}px), ${signalColor} 50%, color-mix(in srgb, ${signalColor} 72%, transparent) calc(50% + ${innerSpread}px), transparent calc(50% + ${spread}px))`,
      `linear-gradient(${baseColor}, ${baseColor})`,
    ].join(', '),
    backgroundRepeat: 'no-repeat, no-repeat',
    backgroundSize: '250% 100%, 100% 100%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  }
})

const shimmerTransition = computed(() => ({
  duration: Math.min(8, Math.max(0.8, props.duration)),
  ease: 'linear' as const,
  repeat: Infinity,
}))
</script>

<template>
  <motion.span
    class="text-transparent font-medium min-w-0 inline-block relative"
    :animate="{ backgroundPosition: '0% center' }"
    :initial="{ backgroundPosition: '100% center' }"
    :style="shimmerStyle"
    :transition="shimmerTransition"
  >
    {{ text }}
  </motion.span>
</template>
