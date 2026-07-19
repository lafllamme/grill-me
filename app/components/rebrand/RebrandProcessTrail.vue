<script setup lang="ts">
import type { RebrandReasoningStep } from '~/components/rebrand/rebrand-reasoning.model'
import { usePreferredReducedMotion, useResizeObserver, useTimeoutFn } from '@vueuse/core'
import { computed, nextTick, ref, watch } from 'vue'
import RebrandProcessStep from '~/components/rebrand/RebrandProcessStep.vue'

const props = defineProps<{
  steps: RebrandReasoningStep[]
  fallback: string
}>()

const trailRef = ref<HTMLElement | null>(null)
const canScrollUp = ref(false)
const canScrollDown = ref(false)
const reducedMotion = usePreferredReducedMotion()
const activeStepId = computed(() => props.steps.findLast(step => step.status === 'active')?.id ?? null)

function updateScrollFades() {
  const trail = trailRef.value
  if (!trail)
    return

  canScrollUp.value = trail.scrollTop > 4
  canScrollDown.value = trail.scrollTop + trail.clientHeight < trail.scrollHeight - 4
}

async function scrollToActiveStep() {
  const stepId = activeStepId.value
  if (!stepId)
    return

  await nextTick()
  const trail = trailRef.value
  const activeStep = trail?.querySelector<HTMLElement>(`[data-step-id="${stepId}"]`)
  if (!trail || !activeStep)
    return

  const targetTop = Math.max(0, activeStep.offsetTop - (trail.clientHeight - activeStep.offsetHeight) / 2)
  trail.scrollTo({
    top: targetTop,
    behavior: reducedMotion.value === 'reduce' ? 'auto' : 'smooth',
  })
  updateScrollFades()
}

const { start: scheduleSettledScroll } = useTimeoutFn(scrollToActiveStep, 450, { immediate: false })

watch(activeStepId, () => {
  void scrollToActiveStep()
  scheduleSettledScroll()
})

useResizeObserver(trailRef, updateScrollFades)
</script>

<template>
  <div data-testid="test-2-process-trail" class="max-w-[58rem] relative">
    <div
      ref="trailRef"
      class="pr-2 overscroll-contain scroll-smooth max-h-[55dvh] [scrollbar-width:none] overflow-y-auto sm:max-h-[26rem] [&::-webkit-scrollbar]:hidden"
      @scroll.passive="updateScrollFades"
    >
      <TransitionGroup
        v-if="steps.length"
        tag="div"
        class="pb-3"
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

    <span v-if="canScrollUp" class="h-5 pointer-events-none inset-x-0 top-0 absolute from-black/80 to-transparent bg-gradient-to-b" aria-hidden="true" />
    <span v-if="canScrollDown" class="h-7 pointer-events-none inset-x-0 bottom-0 absolute from-black/80 to-transparent bg-gradient-to-t" aria-hidden="true" />
  </div>
</template>
