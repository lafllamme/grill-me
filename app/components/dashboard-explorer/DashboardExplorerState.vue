<script setup lang="ts">
import type { DashboardAnalysisPhase } from './types'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  phase: DashboardAnalysisPhase
  panelClass: string
  mutedClass: string
  username?: string
  errorMessage?: string | null
}>(), {
  username: '',
  errorMessage: null,
})

const emit = defineEmits<{
  retry: []
}>()

const isLoading = computed(() => ['collecting-github', 'scoring', 'reviewing-ai', 'finalizing'].includes(props.phase))
const stateKind = computed<'idle' | 'loading' | 'empty' | 'error'>(() => {
  if (props.phase === 'error')
    return 'error'
  if (isLoading.value)
    return 'loading'
  if (props.phase === 'ready')
    return 'empty'
  return 'idle'
})
const stateCopy = computed(() => {
  if (stateKind.value === 'loading') {
    if (props.phase === 'scoring')
      return { eyebrow: '02 / Profile pass', title: 'Turning evidence into signals.', description: 'The GitHub sample is in. Now the deterministic profile rules are doing the boring, reliable part.' }
    if (props.phase === 'reviewing-ai')
      return { eyebrow: '03 / AI review', title: 'Reading the selected patches.', description: 'A bounded set of code changes is being checked for grounded context. The AI can explain findings; it does not invent the score.' }
    if (props.phase === 'finalizing')
      return { eyebrow: '04 / Profile filed', title: 'Filing the final read.', description: 'The reviewed signals are being merged into the same profile model that powers every chart.' }
    return { eyebrow: '01 / GitHub pass', title: 'Collecting the public trail.', description: props.username ? `Opening @${props.username}'s public activity and repository evidence.` : 'Opening the public activity and repository evidence.' }
  }
  if (stateKind.value === 'error')
    return { eyebrow: 'Analysis interrupted', title: 'The evidence pass hit a snag.', description: props.errorMessage || 'GitHub profile could not be analyzed. Try the request again when you are ready.' }
  if (stateKind.value === 'empty')
    return { eyebrow: 'No profile yet', title: 'There is nothing to chart.', description: 'The analysis finished without a renderable profile. No scores or placeholders are being made up.' }
  return { eyebrow: 'Ready for evidence', title: 'Pick a profile to inspect.', description: 'Choose a mock story or enter a GitHub username to build the profile from a bounded evidence pass.' }
})
const statusLabel = computed(() => {
  if (stateKind.value === 'loading')
    return 'Working'
  if (stateKind.value === 'error')
    return 'Needs attention'
  if (stateKind.value === 'empty')
    return 'Empty'
  return 'Idle'
})
</script>

<template>
  <section
    :class="props.panelClass"
    :data-state="stateKind"
    data-testid="dashboard-analysis-state"
    class="p-6 border-[1px] border-current/12 rounded-[28px] flex flex-col min-h-[22rem] justify-between sm:p-8"
    aria-live="polite"
  >
    <div class="flex gap-4 items-start justify-between">
      <p :class="props.mutedClass" class="text-[10px] tracking-[0.15em] font-meta uppercase">
        {{ stateCopy.eyebrow }}
      </p>
      <span :class="stateKind === 'error' ? 'text-primary' : props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
        {{ statusLabel }}
      </span>
    </div>

    <div>
      <div v-if="stateKind === 'loading'" aria-hidden="true" class="mb-8 opacity-55 gap-3 grid grid-cols-2 sm:grid-cols-4">
        <span v-for="index in 8" :key="index" :class="props.mutedClass" class="rounded-[6px] bg-current/12 h-2 animate-pulse" />
      </div>
      <h2 class="text-3xl leading-[0.98] tracking-[-0.055em] font-display max-w-[16ch] sm:text-5xl">
        {{ stateCopy.title }}
      </h2>
      <p :class="props.mutedClass" class="text-sm leading-6 mt-5 max-w-[38rem]">
        {{ stateCopy.description }}
      </p>
      <button
        v-if="stateKind === 'error'"
        class="text-xs text-primary-strong tracking-[0.1em] font-meta mt-8 px-4 border-[1px] border-primary rounded-[8px] h-10 uppercase transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:bg-primary"
        type="button"
        @click="emit('retry')"
      >
        Retry analysis
      </button>
    </div>
  </section>
</template>
