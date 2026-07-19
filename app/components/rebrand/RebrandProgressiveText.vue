<script setup lang="ts">
import { useIntervalFn, usePreferredReducedMotion } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  text: string
  as?: 'h2' | 'p' | 'span'
  interval?: number
  wordsPerTick?: number
}>(), {
  as: 'span',
  interval: 32,
  wordsPerTick: 1,
})

const reducedMotion = usePreferredReducedMotion()
const visibleWordCount = ref(0)
const words = computed(() => props.text.trim().split(/\s+/).filter(Boolean))
const visibleWords = computed(() => words.value.slice(0, visibleWordCount.value))

const { pause, resume } = useIntervalFn(() => {
  visibleWordCount.value = Math.min(
    words.value.length,
    visibleWordCount.value + props.wordsPerTick,
  )

  if (visibleWordCount.value >= words.value.length)
    pause()
}, props.interval, { immediate: false })

async function restart() {
  pause()
  visibleWordCount.value = reducedMotion.value === 'reduce' ? words.value.length : 0

  if (visibleWordCount.value >= words.value.length)
    return

  await nextTick()
  resume()
}

watch(() => props.text, restart, { immediate: true })
</script>

<template>
  <component :is="props.as" :aria-label="props.text">
    <TransitionGroup
      enter-active-class="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      enter-from-class="opacity-0 translate-y-[0.18em] blur-[2px]"
      enter-to-class="opacity-100 translate-y-0 blur-0"
    >
      <span
        v-for="(word, index) in visibleWords"
        :key="`${index}-${word}`"
        aria-hidden="true"
      >{{ word }}{{ index < words.length - 1 ? ' ' : '' }}</span>
    </TransitionGroup>
  </component>
</template>
