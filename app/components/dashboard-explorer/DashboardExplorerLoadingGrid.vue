<script setup lang="ts">
import type { DashboardProfileStreamGithubProgressEvent } from '~~/shared/dashboard/contracts'
import { computed } from 'vue'

type LoadingCardId = 'profile' | 'verdict' | 'evidence' | 'gauge' | 'volume' | 'rhythm' | 'anatomy'
type LoadingCardState = 'queued' | 'next' | 'captured'

const props = withDefaults(defineProps<{
  panelClass: string
  mutedClass: string
  username?: string
  progress?: DashboardProfileStreamGithubProgressEvent | null
}>(), {
  username: '',
  progress: null,
})

const loadingCards: readonly {
  id: LoadingCardId
  label: string
  description: string
  layoutClass: string
  readyAt: number
}[] = [
  { id: 'profile', label: 'Profile', description: 'Five signals from the public code trail.', layoutClass: 'lg:col-span-6 min-h-[20rem]', readyAt: 1 },
  { id: 'verdict', label: 'Verdict', description: 'The role and roast land after the review pass.', layoutClass: 'lg:col-span-6 min-h-[20rem]', readyAt: 7 },
  { id: 'evidence', label: 'Evidence', description: 'The selected changes become readable signals.', layoutClass: 'lg:col-span-8 min-h-[25rem]', readyAt: 4 },
  { id: 'gauge', label: 'Commit frequency', description: 'Activity is scoped to the observed window.', layoutClass: 'lg:col-span-4 min-h-[25rem]', readyAt: 4 },
  { id: 'volume', label: 'Change volume', description: 'Additions and deletions, without the theatre.', layoutClass: 'lg:col-span-6 min-h-[20rem]', readyAt: 4 },
  { id: 'rhythm', label: 'Commit rhythm', description: 'The shape of the working cadence.', layoutClass: 'lg:col-span-6 min-h-[20rem]', readyAt: 4 },
  { id: 'anatomy', label: 'Repository anatomy', description: 'Files and folders sized by changed lines.', layoutClass: 'lg:col-span-12 min-h-[24rem]', readyAt: 4 },
] as const

const phaseRank: Record<DashboardProfileStreamGithubProgressEvent['phase'], number> = {
  'profile': 1,
  'repositories': 2,
  'history': 3,
  'commits': 4,
  'pull-requests': 5,
  'checks': 6,
}

const currentRank = computed(() => props.progress ? phaseRank[props.progress.phase] : 0)
const counts = computed(() => props.progress?.counts ?? {
  repositories: 0,
  candidateCommits: 0,
  enrichedCommits: 0,
  usablePatches: 0,
  associatedPullRequests: 0,
  checkSummaries: 0,
})
const progressTitle = computed(() => {
  if (!props.progress)
    return props.username ? `Opening @${props.username}'s public trail.` : 'Opening the public trail.'

  if (props.progress.phase === 'repositories')
    return 'Mapping the repository surface.'
  if (props.progress.phase === 'history')
    return 'Following the personal commit trail.'
  if (props.progress.phase === 'commits')
    return 'Turning commits into evidence.'
  if (props.progress.phase === 'pull-requests')
    return 'Adding the review context.'
  if (props.progress.phase === 'checks')
    return 'The GitHub pass is complete.'
  return 'Identity confirmed. Starting the evidence pass.'
})
const progressMessage = computed(() => props.progress?.message ?? 'GitHub evidence is arriving in bounded stages.')
const progressLabel = computed(() => props.progress ? `${props.progress.phase.replace('-', ' ')} · live` : 'github pass · live')
const collectionSummary = computed(() => [
  `${counts.value.repositories} repos`,
  `${counts.value.enrichedCommits} commits`,
  `${counts.value.usablePatches} patches`,
].join('  /  '))

function cardState(card: typeof loadingCards[number]): LoadingCardState {
  if (currentRank.value >= card.readyAt)
    return 'captured'
  if (currentRank.value + 1 >= card.readyAt)
    return 'next'
  return 'queued'
}

function cardStateLabel(state: LoadingCardState): string {
  if (state === 'captured')
    return 'evidence in'
  if (state === 'next')
    return 'next up'
  return 'queued'
}
</script>

<template>
  <div class="gap-4 grid lg:col-span-12" data-testid="dashboard-loading-grid">
    <section :class="props.panelClass" class="p-6 rounded-[28px] flex flex-col min-h-[15rem] justify-between sm:p-8 lg:col-span-8" aria-live="polite">
      <div class="flex gap-4 items-start justify-between">
        <p :class="props.mutedClass" class="text-[10px] tracking-[0.15em] font-meta uppercase">
          01 / GitHub pass
        </p>
        <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
          {{ progressLabel }}
        </span>
      </div>
      <div>
        <Transition mode="out-in" enter-active-class="transition duration-500 ease-out motion-reduce:transition-none" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in motion-reduce:transition-none" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <h2 :key="progressTitle" class="text-3xl leading-[0.98] tracking-[-0.055em] font-display max-w-[16ch] sm:text-5xl">
            {{ progressTitle }}
          </h2>
        </Transition>
        <p :class="props.mutedClass" class="text-sm leading-6 mt-5 max-w-[38rem]">
          {{ progressMessage }}
        </p>
        <div class="mt-7 rounded-full bg-current/10 h-1 overflow-hidden" aria-hidden="true">
          <div :class="props.mutedClass" class="rounded-full bg-current h-full transition-[width] duration-700 ease-out motion-reduce:transition-none" :style="{ width: `${Math.max(10, Math.round((currentRank / 6) * 100))}%` }" />
        </div>
      </div>
    </section>

    <section :class="props.panelClass" class="p-6 rounded-[28px] flex flex-col min-h-[15rem] justify-between sm:p-8 lg:col-span-4">
      <div class="flex gap-4 items-start justify-between">
        <p :class="props.mutedClass" class="text-[10px] tracking-[0.15em] font-meta uppercase">
          Collection scope
        </p>
        <Icon class="text-primary animate-pulse motion-reduce:animate-none" name="ph:dot-outline" aria-hidden="true" />
      </div>
      <div>
        <p class="text-2xl tracking-[-0.04em] font-body">
          {{ collectionSummary }}
        </p>
        <p :class="props.mutedClass" class="text-sm leading-6 mt-3">
          Counts update as GitHub evidence clears each boundary. Patch content stays server-side.
        </p>
      </div>
    </section>

    <TransitionGroup
      tag="div"
      class="contents"
      appear
      enter-active-class="transition-[opacity,transform,filter] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      enter-from-class="opacity-0 translate-y-3 blur-sm"
      enter-to-class="opacity-100 translate-y-0 blur-0"
    >
      <article v-for="(card, index) in loadingCards" :key="card.id" :style="{ transitionDelay: `${index * 55}ms` }" :class="[props.panelClass, card.layoutClass]" class="p-6 rounded-[28px] flex flex-col justify-between sm:p-8" :data-testid="`dashboard-loading-card-${card.id}`" :aria-label="`${card.label} loading`">
        <div class="flex gap-4 items-start justify-between">
          <div>
            <p :class="props.mutedClass" class="text-[10px] tracking-[0.15em] font-meta uppercase">
              {{ card.id === 'verdict' ? '04 / AI review' : 'dashboard signal' }}
            </p>
            <h2 class="text-2xl tracking-[-0.05em] font-display mt-3">
              {{ card.label }}
            </h2>
          </div>
          <span :class="cardState(card) === 'captured' ? 'text-primary-strong' : props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
            {{ cardStateLabel(cardState(card)) }}
          </span>
        </div>

        <div class="mt-10" aria-hidden="true">
          <div v-if="card.id === 'profile'" class="mx-auto border-[1px] border-current/10 rounded-full h-36 w-36 relative">
            <span :class="props.mutedClass" class="border-[1px] border-current/10 rounded-full inset-4 absolute" />
            <span :class="props.mutedClass" class="border-[1px] border-current/10 rounded-full inset-9 absolute" />
          </div>
          <div v-else-if="card.id === 'gauge'" class="mx-auto border-[10px] border-current/10 rounded-full h-32 w-32 relative">
            <span :class="props.mutedClass" class="border-[10px] border-b-0 border-current/10 rounded-t-full inset-[-10px] absolute" />
          </div>
          <div v-else class="gap-3 grid">
            <span v-for="line in 4" :key="line" :class="[props.mutedClass, line === 1 ? 'w-3/4' : line === 2 ? 'w-1/2' : 'w-full']" class="rounded-[6px] bg-current/10 h-2 animate-pulse motion-reduce:animate-none" />
          </div>
        </div>

        <p :class="props.mutedClass" class="text-sm leading-6 mt-8 max-w-[30rem]">
          {{ card.description }}
        </p>
      </article>
    </TransitionGroup>
  </div>
</template>
