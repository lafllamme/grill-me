<script setup lang="ts">
import type { VerdictPanelProps } from './types'
import RoastOneGradeStar from '~/components/roast-one/RoastOneGradeStar.vue'

const props = defineProps<VerdictPanelProps>()
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] transition-colors duration-300 lg:p-8 sm:p-8">
    <div class="flex gap-4 items-start justify-between">
      <h2 class="text-2xl tracking-[-0.04em] font-body">
        Verdict
      </h2>
      <RoastOneGradeStar :grade="props.grade" grade-size="xs" size="sm" />
    </div>
    <span class="text-[11px] text-primary-strong tracking-[0.08em] font-meta mt-6 px-3 py-1.5 border-[1px] border-primary/30 rounded-full border-solid inline-flex uppercase">{{ props.growthLevel }}</span>
    <h3 class="text-4xl leading-[0.94] tracking-[-0.06em] font-display mt-5 max-w-[12ch] sm:text-5xl">
      {{ props.headline }}
    </h3>
    <p :class="props.mutedClass" class="text-base leading-7 mt-6 max-w-[34rem]">
      {{ props.note }}
    </p>
  </article>
</template>
