<script setup lang="ts">
import { defaultWindow, useIntersectionObserver, usePreferredReducedMotion, useRafFn, useScroll } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

withDefaults(defineProps<{
  items: readonly string[]
  secondaryItems?: readonly string[]
  label?: string
}>(), {
  secondaryItems: () => [],
  label: 'Evidence vocabulary',
})

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const primaryOffset = ref(0)
const secondaryOffset = ref(0)
const scrollDirection = ref(1)
const scrollBoost = ref(0)
const { y: scrollY } = useScroll(defaultWindow)
const previousScrollY = ref(0)
const reducedMotion = usePreferredReducedMotion()
const defaultVelocity = 0.65
const trackCopies = 8
const marqueeTextClass = 'text-[clamp(2.2rem,5vw,5.8rem)] text-basalt-950 leading-none tracking-[-0.045em] font-body whitespace-nowrap'
const toWrappedPercent = (value: number) => `${(((value % 12.5) + 12.5) % 12.5) - 12.5}%`

const trackStyle = computed(() => ({
  transform: `translateX(${toWrappedPercent(primaryOffset.value)})`,
}))
const reverseTrackStyle = computed(() => {
  return {
    transform: `translateX(${toWrappedPercent(secondaryOffset.value)})`,
  }
})

let lastTimestamp = 0

const { pause, resume } = useRafFn(({ timestamp }) => {
  if (!isVisible.value || reducedMotion.value === 'reduce')
    return

  const delta = lastTimestamp ? timestamp - lastTimestamp : 16
  lastTimestamp = timestamp
  const scrollDelta = scrollY.value - previousScrollY.value
  previousScrollY.value = scrollY.value

  if (Math.abs(scrollDelta) > 0.25)
    scrollDirection.value = Math.sign(scrollDelta)

  const frameSeconds = delta / 1000
  const targetBoost = Math.min(Math.abs(scrollDelta) / 5, 5)
  scrollBoost.value += (targetBoost - scrollBoost.value) * Math.min(frameSeconds * 8, 1)
  const move = defaultVelocity * (1 + scrollBoost.value) * frameSeconds
  primaryOffset.value += scrollDirection.value * move
  secondaryOffset.value -= scrollDirection.value * move
}, { immediate: false })

useIntersectionObserver(sectionRef, ([entry]) => {
  isVisible.value = Boolean(entry?.isIntersecting)
  if (isVisible.value && reducedMotion.value !== 'reduce') {
    previousScrollY.value = scrollY.value
    resume()
  }
  else {
    pause()
  }
})

watch(reducedMotion, (preference) => {
  if (preference === 'reduce') {
    primaryOffset.value = 0
    secondaryOffset.value = 0
    scrollDirection.value = 1
    scrollBoost.value = 0
    lastTimestamp = 0
    pause()
  }
  else if (isVisible.value) {
    resume()
  }
})
</script>

<template>
  <div ref="sectionRef" class="relative left-1/2 py-8 border-y-[1px] border-basalt-950/16 border-solid w-screen -translate-x-1/2 overflow-hidden" :aria-label="label">
    <div class="space-y-6">
      <div class="will-change-transform w-max motion-reduce:transform-none" :style="trackStyle">
        <div v-for="copyIndex in trackCopies" :key="`forward-copy-${copyIndex}`" class="pr-10 inline-flex gap-10" :aria-hidden="copyIndex > 1">
          <span v-for="(item, index) in items" :key="`forward-copy-${index}-${item}`" :class="marqueeTextClass">
            {{ item }}
            <svg class="text-signal-red-700 ml-10 inline-block size-[0.62em] translate-y-[-0.04em]" viewBox="0 0 256 256" aria-hidden="true">
              <path fill="currentColor" d="M152 70.059 201.539 20.519 235.48 54.461 185.941 104H256v48h-70.059l49.539 49.539-33.941 33.941L152 185.941V256h-48v-70.059l-49.54 49.539-33.94-33.941L70.059 152H0v-48h70.059L20.519 54.46 54.461 20.52 104 70.059V0h48z" />
            </svg>
          </span>
        </div>
      </div>
      <div class="will-change-transform w-max motion-reduce:transform-none" :style="reverseTrackStyle" aria-hidden="true">
        <div v-for="copyIndex in trackCopies" :key="`reverse-copy-${copyIndex}`" class="pr-10 inline-flex gap-10">
          <span v-for="(item, index) in secondaryItems" :key="`reverse-first-${index}-${item}`" :class="marqueeTextClass">
            {{ item }}
            <svg class="text-signal-red-700 ml-10 inline-block size-[0.62em] translate-y-[-0.04em]" viewBox="0 0 256 256" aria-hidden="true">
              <path fill="currentColor" d="M152 70.059 201.539 20.519 235.48 54.461 185.941 104H256v48h-70.059l49.539 49.539-33.941 33.941L152 185.941V256h-48v-70.059l-49.54 49.539-33.94-33.941L70.059 152H0v-48h70.059L20.519 54.46 54.461 20.52 104 70.059V0h48z" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
