<script setup lang="ts">
import type { DashboardProfileStreamGithubProgressEvent } from '~~/shared/dashboard/contracts'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { BklitLineSeries } from '~/components/dashboard/bklit/BklitLineChart.vue'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'
import { computed } from 'vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitGrid from '~/components/dashboard/bklit/BklitGrid.vue'
import BklitLineChart from '~/components/dashboard/bklit/BklitLineChart.vue'

type LoadingCardId = 'profile' | 'verdict' | 'evidence' | 'gauge' | 'volume' | 'rhythm' | 'anatomy'
type LoadingCardState = 'queued' | 'next' | 'captured'

interface LoadingCardDefinition {
  id: LoadingCardId
  label: string
  layoutClass: string
  readyAt: number
}

const props = withDefaults(defineProps<{
  panelClass: string
  mutedClass: string
  username?: string
  progress?: DashboardProfileStreamGithubProgressEvent | null
}>(), {
  username: '',
  progress: null,
})

const LOADING_CARD_DEFINITIONS: readonly LoadingCardDefinition[] = [
  { id: 'profile', label: 'Profile', layoutClass: 'lg:col-span-6 min-h-[31.5rem] lg:min-h-[29.5rem]', readyAt: 6 },
  { id: 'verdict', label: 'Verdict', layoutClass: 'lg:col-span-6 min-h-[29.5rem]', readyAt: 6 },
  { id: 'evidence', label: 'Evidence', layoutClass: 'lg:col-span-8 min-h-[44.5rem] lg:min-h-[31rem]', readyAt: 4 },
  { id: 'gauge', label: 'Commit frequency', layoutClass: 'lg:col-span-4 min-h-[31rem]', readyAt: 4 },
  { id: 'volume', label: 'Change volume', layoutClass: 'lg:col-span-6 min-h-[26.75rem]', readyAt: 4 },
  { id: 'rhythm', label: 'Commit rhythm', layoutClass: 'lg:col-span-6 min-h-[26.75rem]', readyAt: 4 },
  { id: 'anatomy', label: 'Repository anatomy', layoutClass: 'lg:col-span-12 min-h-[49rem] lg:min-h-[48.5rem]', readyAt: 4 },
] as const

const PHASE_RANK: Record<DashboardProfileStreamGithubProgressEvent['phase'], number> = {
  'profile': 1,
  'repositories': 2,
  'history': 3,
  'commits': 4,
  'pull-requests': 5,
  'checks': 6,
}

const EMPTY_COLLECTION_COUNTS = {
  repositories: 0,
  candidateCommits: 0,
  enrichedCommits: 0,
  usablePatches: 0,
  associatedPullRequests: 0,
  checkSummaries: 0,
} as const

const RADAR_SKELETON_LEVELS = [1, 2, 3] as const
const EMPTY_BAR_DATA: readonly BklitBarDatum[] = []
const EMPTY_TIMELINE_DATA: readonly RoastTimelineDatum[] = []
const LOADING_CHART_STATUS = 'loading' as const
const LOADING_TIMELINE_SERIES = [
  { dataKey: 'commits', label: 'commits', color: 'var(--color-primary-strong)' },
  { dataKey: 'additions', label: 'additions', color: 'var(--color-primary)' },
] as const satisfies readonly BklitLineSeries[]

const currentRank = computed(() => props.progress ? PHASE_RANK[props.progress.phase] : 0)
const counts = computed(() => props.progress?.counts ?? EMPTY_COLLECTION_COUNTS)
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

function cardState(card: LoadingCardDefinition): LoadingCardState {
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
  <div class="gap-4 grid lg:col-span-12 lg:grid-cols-12" data-testid="dashboard-loading-grid">
    <TransitionGroup
      tag="div"
      class="contents"
      appear
      enter-active-class="transition-[opacity,transform,filter] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
      enter-from-class="opacity-0 translate-y-3 blur-sm"
      enter-to-class="opacity-100 translate-y-0 blur-0"
    >
      <article
        v-for="(card, index) in LOADING_CARD_DEFINITIONS"
        :key="card.id"
        :style="{ transitionDelay: `${index * 55}ms` }"
        :class="[props.panelClass, card.layoutClass]"
        class="p-6 rounded-[28px] flex flex-col min-w-0 justify-between sm:p-8"
        :data-testid="`dashboard-loading-card-${card.id}`"
        :aria-label="`${card.label} loading`"
      >
        <template v-if="card.id === 'profile'">
          <div class="flex gap-4 items-start justify-between">
            <div>
              <p :class="props.mutedClass" class="text-[10px] tracking-[0.15em] font-meta uppercase">
                01 / GitHub pass
              </p>
              <h2 class="text-2xl tracking-[-0.04em] font-body mt-3">
                Profile
              </h2>
            </div>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ progressLabel }}
            </span>
          </div>

          <div class="mt-8 flex flex-col gap-6 items-center lg:flex-row lg:items-center">
            <div class="mx-auto border-[1px] border-current/10 rounded-full shrink-0 h-56 w-56 relative sm:h-64 sm:w-64" aria-hidden="true">
              <span v-for="level in RADAR_SKELETON_LEVELS" :key="level" :class="props.mutedClass" class="border-[1px] border-current/10 rounded-full absolute" :style="{ inset: `${level * 16}px` }" />
              <span :class="props.mutedClass" class="rounded-full bg-current/15 h-2 w-2 left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div class="max-w-[18rem] lg:flex-1">
              <p class="text-xl leading-[1.05] tracking-[-0.04em] font-display">
                {{ progressTitle }}
              </p>
              <p :class="props.mutedClass" class="text-sm leading-6 mt-4">
                {{ progressMessage }}
              </p>
            </div>
          </div>

          <div>
            <div class="flex gap-3 items-center justify-between">
              <p :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
                Collection scope
              </p>
              <p :class="props.mutedClass" class="text-[10px] font-meta">
                {{ collectionSummary }}
              </p>
            </div>
            <div class="mt-3 rounded-full bg-current/10 h-1 overflow-hidden" aria-hidden="true">
              <div :class="props.mutedClass" class="rounded-full bg-current h-full transition-[width] duration-700 ease-out motion-reduce:transition-none" :style="{ width: `${Math.max(10, Math.round((currentRank / 6) * 100))}%` }" />
            </div>
          </div>
        </template>

        <template v-else-if="card.id === 'verdict'">
          <div class="flex gap-4 items-start justify-between">
            <h2 class="text-2xl tracking-[-0.04em] font-body">
              Verdict
            </h2>
            <span :class="props.mutedClass" class="border-[1px] border-current/10 rounded-full bg-current/5 h-12 w-12" aria-hidden="true" />
          </div>
          <div class="mt-6">
            <span :class="props.mutedClass" class="rounded-full bg-current/10 h-7 w-28 inline-block" aria-hidden="true" />
            <div class="mt-6 gap-3 grid" aria-hidden="true">
              <span v-for="width in ['w-full', 'w-4/5', 'w-3/5']" :key="width" :class="[props.mutedClass, width]" class="rounded-[6px] bg-current/10 h-7" />
            </div>
            <div class="mt-7 gap-3 grid max-w-[34rem]" aria-hidden="true">
              <span :class="props.mutedClass" class="rounded-[6px] bg-current/10 h-3 w-full" />
              <span :class="props.mutedClass" class="rounded-[6px] bg-current/10 h-3 w-4/5" />
            </div>
          </div>
          <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
            {{ cardStateLabel(cardState(card)) }}
          </span>
        </template>

        <template v-else-if="card.id === 'evidence'">
          <div class="flex gap-4 items-center justify-between">
            <h2 class="text-2xl tracking-[-0.04em] font-body">
              Evidence
            </h2>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ cardStateLabel(cardState(card)) }}
            </span>
          </div>
          <div class="mt-8 flex flex-col gap-8 items-center sm:flex-row">
            <div class="border-[10px] border-current/10 rounded-full shrink-0 h-64 w-64 relative" aria-hidden="true">
              <span :class="props.mutedClass" class="border-[10px] border-current/10 rounded-full inset-6 absolute" />
              <span :class="props.mutedClass" class="border-[10px] border-current/10 rounded-full inset-12 absolute" />
              <span :class="props.mutedClass" class="border-[10px] border-current/10 rounded-full inset-18 absolute" />
            </div>
            <div class="gap-4 grid w-full" aria-hidden="true">
              <p :class="props.mutedClass" class="text-[10px] tracking-[0.14em] font-meta uppercase">
                Profile signals
              </p>
              <span v-for="width in ['w-full', 'w-4/5', 'w-3/5', 'w-2/3', 'w-5/6']" :key="width" :class="[props.mutedClass, width]" class="rounded-[6px] bg-current/10 h-3" />
            </div>
          </div>
          <p :class="props.mutedClass" class="text-sm leading-6 mt-6 max-w-[34rem]">
            {{ collectionSummary }} · GitHub evidence is arriving in bounded stages.
          </p>
        </template>

        <template v-else-if="card.id === 'gauge'">
          <div class="flex gap-4 items-center justify-between">
            <h2 class="text-2xl tracking-[-0.05em] font-display">
              Commit frequency
            </h2>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ cardStateLabel(cardState(card)) }}
            </span>
          </div>
          <div class="mt-10 flex flex-col items-center">
            <div class="border-[12px] border-current/10 rounded-full h-52 w-52 relative" aria-hidden="true">
              <span :class="props.mutedClass" class="border-[12px] border-current/15 border-b-transparent rounded-t-full inset-[-12px] absolute" />
            </div>
            <p :class="props.mutedClass" class="text-sm leading-6 mt-8 max-w-[26rem]">
              Waiting for the observed activity count.
            </p>
          </div>
          <p :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
            {{ collectionSummary }}
          </p>
        </template>

        <template v-else-if="card.id === 'volume'">
          <div class="flex gap-4 items-end justify-between">
            <h2 class="text-2xl tracking-[-0.05em] font-display">
              Change volume
            </h2>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ cardStateLabel(cardState(card)) }}
            </span>
          </div>
          <BklitBarChart class="mt-8 min-w-0" :data="EMPTY_BAR_DATA" x-data-key="label" :series-count="2" :status="LOADING_CHART_STATUS">
            <template #grid>
              <BklitGrid horizontal />
            </template>
          </BklitBarChart>
        </template>

        <template v-else-if="card.id === 'rhythm'">
          <div class="flex gap-4 items-end justify-between">
            <h2 class="text-2xl tracking-[-0.05em] font-display">
              Commit rhythm
            </h2>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ cardStateLabel(cardState(card)) }}
            </span>
          </div>
          <BklitLineChart class="mt-8 min-w-0" :data="EMPTY_TIMELINE_DATA" x-data-key="label" :series="LOADING_TIMELINE_SERIES" :status="LOADING_CHART_STATUS" loading-label="" />
        </template>

        <template v-else>
          <div class="flex gap-4 items-start justify-between">
            <div>
              <h2 class="text-2xl tracking-[-0.05em] font-display">
                Repository anatomy
              </h2>
              <p :class="props.mutedClass" class="text-sm leading-6 mt-2">
                Files and folders sized by changed lines.
              </p>
            </div>
            <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">
              {{ cardStateLabel(cardState(card)) }}
            </span>
          </div>
          <div class="mx-auto mt-8 border-[12px] border-current/10 rounded-full h-72 w-72 relative sm:h-80 sm:w-80" aria-hidden="true">
            <span :class="props.mutedClass" class="border-[10px] border-current/10 rounded-full inset-12 absolute" />
            <span :class="props.mutedClass" class="border-[8px] border-current/10 rounded-full inset-24 absolute" />
            <span :class="props.mutedClass" class="rounded-full bg-current/10 inset-32 absolute" />
          </div>
        </template>
      </article>
    </TransitionGroup>
  </div>
</template>
