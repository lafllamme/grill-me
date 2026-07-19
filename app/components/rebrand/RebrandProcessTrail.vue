<script setup lang="ts">
import type { RebrandReasoningStep } from '~/components/rebrand/rebrand-reasoning.model'
import RebrandProcessStep from '~/components/rebrand/RebrandProcessStep.vue'

defineProps<{
  steps: RebrandReasoningStep[]
  fallback: string
}>()
</script>

<template>
  <div data-testid="test-2-process-trail" class="max-w-[58rem]">
    <TransitionGroup
      v-if="steps.length"
      tag="div"
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="opacity-0 translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
    >
      <RebrandProcessStep
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :is-last="index === steps.length - 1"
      />
    </TransitionGroup>

    <div v-else class="gap-x-4 grid grid-cols-[2rem_minmax(0,1fr)] items-center sm:gap-x-5 sm:grid-cols-[2.25rem_minmax(0,1fr)]">
      <span class="border-[1px] border-signal-red-500/45 rounded-full border-solid bg-signal-red-950/50 grid h-8 w-8 place-items-center animate-pulse sm:h-9 sm:w-9">
        <span class="rounded-full bg-signal-red-400 h-1.5 w-1.5 shadow-[0_0_12px_rgba(240,68,77,0.8)]" />
      </span>
      <p class="text-base text-explore-muted leading-relaxed font-body sm:text-lg">
        {{ fallback }}
      </p>
    </div>
  </div>
</template>
