<script setup lang="ts">
import { defaultWindow, useIntersectionObserver, usePreferredReducedMotion, useRafFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

withDefaults(defineProps<{
  items: readonly string[]
  label?: string
}>(), {
  label: 'Evidence vocabulary',
})

const sectionRef = ref<HTMLElement | null>(null)
const firstGroupRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const offset = ref(0)
const scrollImpulse = ref(0)
const lastScrollPosition = ref(0)
const reducedMotion = usePreferredReducedMotion()

const trackStyle = computed(() => ({
  transform: `translate3d(${-offset.value}px, 0, 0)`,
}))
const reverseTrackStyle = computed(() => {
  const groupWidth = firstGroupRef.value?.offsetWidth ?? 0
  return {
    transform: `translate3d(${offset.value - groupWidth}px, 0, 0)`,
  }
})

const wrapOffset = (value: number, width: number) => ((value % width) + width) % width

const { pause, resume } = useRafFn(({ delta }) => {
  const groupWidth = firstGroupRef.value?.offsetWidth ?? 0
  if (!groupWidth || !isVisible.value || reducedMotion.value === 'reduce')
    return

  const frameScale = Math.min(delta, 32) / 16.67
  const currentScrollPosition = defaultWindow?.scrollY ?? lastScrollPosition.value
  scrollImpulse.value = currentScrollPosition - lastScrollPosition.value
  lastScrollPosition.value = currentScrollPosition
  const speed = 0.42 + Math.min(Math.abs(scrollImpulse.value) * 0.045, 3.2)
  offset.value = wrapOffset(offset.value + speed * frameScale, groupWidth)
  scrollImpulse.value *= 0.88
}, { immediate: false })

useIntersectionObserver(sectionRef, ([entry]) => {
  isVisible.value = Boolean(entry?.isIntersecting)
  if (isVisible.value && reducedMotion.value !== 'reduce') {
    lastScrollPosition.value = defaultWindow?.scrollY ?? 0
    resume()
  }
  else {
    pause()
  }
})

watch(reducedMotion, (preference) => {
  if (preference === 'reduce') {
    offset.value = 0
    pause()
  }
  else if (isVisible.value) {
    resume()
  }
})
</script>

<template>
  <div ref="sectionRef" class="py-8 border-y-[1px] border-basalt-950/16 border-solid overflow-hidden" :aria-label="label">
    <div class="space-y-3">
      <div class="will-change-transform w-max motion-reduce:transform-none" :style="trackStyle">
        <div ref="firstGroupRef" class="pr-10 inline-flex gap-10">
          <span v-for="(item, index) in items" :key="`forward-first-${index}-${item}`" class="text-[clamp(2.2rem,5vw,5.8rem)] text-basalt-950 leading-none tracking-[-0.045em] font-body whitespace-nowrap">
            {{ item }}
            <span class="text-signal-red-600 ml-10">◆</span>
          </span>
        </div>
        <div class="pr-10 inline-flex gap-10" aria-hidden="true">
          <span v-for="(item, index) in items" :key="`forward-copy-${index}-${item}`" class="text-[clamp(2.2rem,5vw,5.8rem)] text-basalt-950 leading-none tracking-[-0.045em] font-body whitespace-nowrap">
            {{ item }}
            <span class="text-signal-red-600 ml-10">◆</span>
          </span>
        </div>
      </div>
      <div class="will-change-transform w-max motion-reduce:transform-none" :style="reverseTrackStyle" aria-hidden="true">
        <div v-for="copyIndex in 2" :key="`reverse-copy-${copyIndex}`" class="pr-10 inline-flex gap-10">
          <span v-for="(item, index) in items" :key="`reverse-${copyIndex}-${index}-${item}`" class="text-[clamp(1rem,2vw,2rem)] text-basalt-500 tracking-[0.14em] font-meta whitespace-nowrap uppercase">
            {{ item }}
            <span class="text-signal-red-600 ml-10">/</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
