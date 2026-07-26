<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  edge?: 'rise-left' | 'rise-right' | 'flat'
  edgeProfile?: 'chapter' | 'footer'
  tone?: 'black' | 'ink' | 'paper'
}>(), {
  edge: 'rise-right',
  edgeProfile: 'chapter',
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

  const timelineClass = props.edgeProfile === 'footer'
    ? 'chapter-cover-scroll-compact'
    : 'chapter-cover-scroll'

  return `${timelineClass} [animation:chapter-cover-rise_linear_both] motion-reduce:[animation:none] motion-reduce:[transform:translateY(-220px)_skewY(-7deg)]`
})

const edgeHeightClass = computed(() =>
  props.edgeProfile === 'footer' ? 'h-[530px]' : 'h-[834px]',
)
</script>

<template>
  <section class="relative overflow-visible isolate chapter-shell-timeline" :class="surfaceClass">
    <div
      v-if="edge !== 'flat'"
      aria-hidden="true"
      class="pointer-events-none inset-x-0 top-0 absolute overflow-visible"
      :class="edgeHeightClass"
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
