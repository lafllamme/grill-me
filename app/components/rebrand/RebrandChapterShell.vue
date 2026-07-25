<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  edge?: 'rise-left' | 'rise-right' | 'flat'
  tone?: 'black' | 'ink' | 'paper'
}>(), {
  edge: 'rise-right',
  tone: 'black',
})

const surfaceClass = computed(() => {
  if (props.tone === 'paper')
    return 'bg-bone-50'

  return props.tone === 'ink' ? 'bg-explore-ink-soft' : 'bg-black'
})

const edgeClass = computed(() => {
  if (props.edge === 'rise-left')
    return 'chapter-cover-scroll [animation:chapter-cover-rise-left_linear_both] motion-reduce:[animation:none] motion-reduce:[transform:translateY(-27%)_skewY(7deg)]'
  if (props.edge === 'flat')
    return 'translate-y-0'
  return 'chapter-cover-scroll [animation:chapter-cover-rise-right_linear_both] motion-reduce:[animation:none] motion-reduce:[transform:translateY(-27%)_skewY(-7deg)]'
})
</script>

<template>
  <section class="relative isolate" :class="surfaceClass">
    <div
      v-if="edge !== 'flat'"
      aria-hidden="true"
      class="will-change-transform h-[110svh] pointer-events-none origin-center inset-x-[-6%] top-0 absolute"
      :class="[surfaceClass, edgeClass, tone === 'paper' ? '' : 'shadow-[0_-44px_110px_rgba(0,0,0,0.48)]']"
    />
    <div class="relative z-10">
      <slot />
    </div>
  </section>
</template>
