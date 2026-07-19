<script setup lang="ts">
import type { RebrandReasoningStep } from '~/components/rebrand/rebrand-reasoning.model'
import { useIntervalFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { Icon } from '#components'
import RebrandTextShimmer from '~/components/rebrand/RebrandTextShimmer.vue'

const props = defineProps<{
  step: RebrandReasoningStep
  isLast: boolean
}>()

const isOpen = ref(props.step.status === 'active')
const activityIndex = ref(0)
const hasDetails = computed(() => Boolean(props.step.description || props.step.evidence.length))
const hasActivityTicker = computed(() => props.step.status === 'active' && props.step.activities.length > 0)
const currentActivity = computed(() => props.step.activities[activityIndex.value] ?? props.step.description)

const { pause: pauseActivities, resume: resumeActivities } = useIntervalFn(() => {
  if (props.step.activities.length === 0) {
    return
  }

  activityIndex.value = (activityIndex.value + 1) % props.step.activities.length
}, 2200, { immediate: false })

watch(() => props.step.status, (status) => {
  isOpen.value = status === 'active'
})

watch(() => [props.step.status, props.step.activities.join('|')] as const, ([status]) => {
  activityIndex.value = 0

  if (status === 'active' && props.step.activities.length > 1) {
    resumeActivities()
    return
  }

  pauseActivities()
}, { immediate: true })

function evidenceIcon(kind: RebrandReasoningStep['evidence'][number]['kind']) {
  return {
    repository: 'ph:github-logo',
    commit: 'ph:git-commit',
    file: 'ph:file-code',
    prompt: 'ph:terminal-window',
  }[kind]
}
</script>

<template>
  <article
    class="gap-x-4 grid grid-cols-[2rem_minmax(0,1fr)] relative sm:gap-x-5 sm:grid-cols-[2.25rem_minmax(0,1fr)]"
    :data-step-id="step.id"
    :data-step-status="step.status"
  >
    <div class="flex flex-col items-center">
      <span
        class="border-[1px] rounded-full border-solid shrink-0 grid h-8 w-8 transition-colors duration-300 place-items-center sm:h-9 sm:w-9"
        :class="step.status === 'active' ? 'border-signal-red-500/55 bg-signal-red-950/55 shadow-[0_0_24px_rgba(240,68,77,0.16)]' : 'border-explore-border bg-black/50'"
      >
        <Icon class="text-sm sm:text-base" :class="step.status === 'active' ? 'text-signal-red-400' : 'text-explore-muted/75'" :name="step.icon" />
      </span>
      <span v-if="!isLast" class="bg-explore-border flex-1 min-h-7 w-px" />
    </div>

    <div class="min-w-0 transition-[padding] duration-400" :class="step.status === 'active' ? 'pb-7 sm:pb-9' : 'pb-4 sm:pb-5'">
      <button
        type="button"
        class="group text-left flex gap-3 min-h-8 w-full items-center justify-between"
        :aria-expanded="isOpen"
        :disabled="!hasDetails"
        @click="isOpen = !isOpen"
      >
        <RebrandTextShimmer v-if="step.status === 'active'" class="text-base font-body sm:text-lg" :text="step.label" />
        <span v-else class="text-base text-explore-copy/78 leading-snug font-body transition-colors sm:text-lg group-hover:text-explore-copy">
          {{ step.label }}
        </span>
        <Icon v-if="hasDetails" class="text-sm text-explore-muted/65 shrink-0 transition-transform duration-300" :class="isOpen ? 'rotate-180' : ''" name="ph:caret-down" />
      </button>

      <div class="grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]" :class="isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
        <div class="overflow-hidden">
          <Transition
            v-if="hasActivityTicker"
            mode="out-in"
            enter-active-class="transition duration-350 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <p :key="currentActivity" class="text-sm text-explore-muted/78 leading-relaxed font-body mt-2 flex gap-2.5 max-w-[48rem] items-center sm:text-base" aria-hidden="true">
              <span class="rounded-full bg-signal-red-400 shrink-0 h-1.5 w-1.5 shadow-[0_0_12px_rgba(240,68,77,0.7)] animate-pulse" />
              {{ currentActivity }}
            </p>
          </Transition>
          <p v-else class="text-sm text-explore-muted/70 leading-relaxed font-body mt-2 max-w-[48rem] sm:text-base">
            {{ step.description }}
          </p>
          <div v-if="step.evidence.length" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="evidence in step.evidence"
              :key="`${evidence.kind}-${evidence.label}`"
              class="text-[10px] text-explore-muted tracking-[-0.01em] font-mono px-2.5 py-1.5 border-[1px] border-explore-border rounded-lg border-solid bg-white/[0.035] inline-flex gap-1.5 items-center sm:text-xs"
            >
              <Icon class="text-signal-red-400/80" :name="evidenceIcon(evidence.kind)" />
              {{ evidence.label }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
