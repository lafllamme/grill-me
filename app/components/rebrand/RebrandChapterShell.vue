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
  if (props.edge === 'flat')
    return 'translate-y-0'

  return 'chapter-cover-scroll [animation:chapter-cover-rise_linear_both] motion-reduce:[animation:none] motion-reduce:[transform:translateY(-220px)_skewY(-7deg)]'
})
</script>

<template>
  <section class="relative overflow-visible isolate chapter-shell-timeline" :class="surfaceClass">
    <div
      v-if="edge !== 'flat'"
      aria-hidden="true"
      class="h-[834px] pointer-events-none inset-x-0 top-0 absolute overflow-visible"
    >
      <div
        class="will-change-transform h-full w-full origin-center"
        :class="[surfaceClass, edgeClass]"
      />
    </div>
    <div class="relative z-10">
      <slot />
    </div>
  </section>
</template>
