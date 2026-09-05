<script setup lang="ts">
import type { DashboardProfileStreamGithubProgressEvent } from '~~/shared/dashboard/contracts'
import type { DashboardAnalysisPhase } from './types'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { BklitLineSeries } from '~/components/dashboard/bklit/BklitLineChart.vue'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
  analysisPhase?: DashboardAnalysisPhase
  progress?: DashboardProfileStreamGithubProgressEvent | null
}>(), {
  username: '',
  analysisPhase: 'collecting-github',
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

type ActiveAnalysisPhase = Exclude<DashboardAnalysisPhase, 'idle' | 'ready' | 'error'>

const LOADING_PROCESS_SEQUENCES: Record<ActiveAnalysisPhase, readonly string[]> = {
  'collecting-github': [
    'Finding the public trail',
    'Checking the repositories',
    'Reading the commit trail',
    'Analyzing the changes',
  ],
  'scoring': [
    'Turning evidence into signals',
    'Checking the profile shape',
    'Balancing the score',
  ],
  'reviewing-ai': [
    'Checking the selected patches',
    'Comparing the evidence',
    'Stress-testing the read',
  ],
  'finalizing': [
    'Preparing the roast',
    'Filing the final profile',
  ],
}
const PROCESS_ROTATION_INTERVAL_MS = 2_200
const PROCESS_BAND_SLOT_STYLES = {
  previous: { left: '-12%', opacity: '0.22', transform: 'translate(-50%, -50%)' },
  current: { left: '50%', opacity: '1', transform: 'translate(-50%, -50%)' },
  next: { left: '112%', opacity: '0.22', transform: 'translate(-50%, -50%)' },
} as const

const GITHUB_PROGRESS_PERCENTAGES: Record<DashboardProfileStreamGithubProgressEvent['phase'], number> = {
  'profile': 8,
  'repositories': 22,
  'history': 36,
  'commits': 48,
  'pull-requests': 56,
  'checks': 62,
}
const ANALYSIS_PROGRESS_PERCENTAGES: Partial<Record<DashboardAnalysisPhase, number>> = {
  'scoring': 70,
  'reviewing-ai': 84,
  'finalizing': 94,
}
const COLLECTION_PROGRESS_TARGETS = {
  repositories: 3,
  enrichedCommits: 12,
  usablePatches: 6,
  associatedPullRequests: 1,
  checkSummaries: 1,
} as const
const COLLECTION_PROGRESS_WEIGHTS = {
  repositories: 10,
  enrichedCommits: 13,
  usablePatches: 16,
  associatedPullRequests: 8,
  checkSummaries: 7,
} as const
const GITHUB_PROGRESS_BASE = 8
const GITHUB_PROGRESS_CAP = 62
const RADAR_GRID_POINTS = [
  '200,60 333,157 282,313 118,313 67,157',
  '200,95 300,170 262,278 138,278 100,170',
  '200,130 267,183 241,243 159,243 133,183',
  '200,165 233,195 220,208 180,208 167,195',
] as const
const RADAR_AXIS_POINTS = [
  { x: 200, y: 60 },
  { x: 333, y: 157 },
  { x: 282, y: 313 },
  { x: 118, y: 313 },
  { x: 67, y: 157 },
] as const
const EMPTY_BAR_DATA: readonly BklitBarDatum[] = []
const EMPTY_TIMELINE_DATA: readonly RoastTimelineDatum[] = []
const LOADING_CHART_STATUS = 'loading' as const
const LOADING_TIMELINE_SERIES = [
  { dataKey: 'commits', label: 'commits', color: 'var(--color-primary-strong)' },
  { dataKey: 'additions', label: 'additions', color: 'var(--color-primary)' },
] as const satisfies readonly BklitLineSeries[]

const currentRank = computed(() => props.progress ? PHASE_RANK[props.progress.phase] : 0)
const counts = computed(() => props.progress?.counts ?? EMPTY_COLLECTION_COUNTS)
const profileName = computed(() => props.username || 'profile')
const activeProcessPhase = computed<ActiveAnalysisPhase>(() => props.analysisPhase === 'error' || props.analysisPhase === 'idle' || props.analysisPhase === 'ready'
  ? 'collecting-github'
  : props.analysisPhase)
const processSequence = computed(() => LOADING_PROCESS_SEQUENCES[activeProcessPhase.value])
const processStepIndex = ref(0)
const processLabel = computed(() => processSequence.value[processStepIndex.value % processSequence.value.length])
const processBandItems = computed(() => {
  const sequence = processSequence.value
  const sequenceLength = sequence.length
  const currentIndex = processStepIndex.value % sequenceLength
  const previousIndex = (currentIndex - 1 + sequenceLength) % sequenceLength
  const nextIndex = (currentIndex + 1) % sequenceLength

  return [
    { key: `${activeProcessPhase.value}-${sequence[previousIndex]}`, label: sequence[previousIndex], slot: 'previous' as const },
    { key: `${activeProcessPhase.value}-${sequence[currentIndex]}`, label: sequence[currentIndex], slot: 'current' as const },
    { key: `${activeProcessPhase.value}-${sequence[nextIndex]}`, label: sequence[nextIndex], slot: 'next' as const },
  ]
})
const progressPercentage = computed(() => {
  if (props.analysisPhase !== 'collecting-github')
    return ANALYSIS_PROGRESS_PERCENTAGES[props.analysisPhase] ?? 0
  const collectionProgress = Object.entries(COLLECTION_PROGRESS_WEIGHTS).reduce((progress, [key, weight]) => {
    const typedKey = key as keyof typeof COLLECTION_PROGRESS_TARGETS
    const count = counts.value[typedKey]
    const target = COLLECTION_PROGRESS_TARGETS[typedKey]
    return progress + Math.min(count / target, 1) * weight
  }, GITHUB_PROGRESS_BASE)
  const phaseProgress = props.progress ? GITHUB_PROGRESS_PERCENTAGES[props.progress.phase] : GITHUB_PROGRESS_BASE
  return Math.min(GITHUB_PROGRESS_CAP, Math.max(phaseProgress, Math.round(collectionProgress)))
})
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

let processRotationTimer: ReturnType<typeof setInterval> | undefined

watch(activeProcessPhase, () => {
  processStepIndex.value = 0
}, { immediate: true })

onMounted(() => {
  processRotationTimer = setInterval(() => {
    processStepIndex.value = (processStepIndex.value + 1) % processSequence.value.length
  }, PROCESS_ROTATION_INTERVAL_MS)
})

onBeforeUnmount(() => {
  if (processRotationTimer)
    clearInterval(processRotationTimer)
})
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
          <div>
            <h2 class="text-2xl tracking-[-0.04em] font-body">
              Profile
            </h2>
          </div>

          <div class="mt-8 flex flex-1 flex-col gap-8 justify-center lg:flex-row lg:items-center">
            <div class="mx-auto shrink-0 h-56 w-56 relative sm:h-64 sm:w-64" aria-hidden="true">
              <svg class="text-current h-full w-full" viewBox="0 0 400 400" fill="none">
                <polygon v-for="points in RADAR_GRID_POINTS" :key="points" :class="props.mutedClass" :points="points" class="opacity-40" stroke="currentColor" stroke-width="1.5" />
                <line v-for="point in RADAR_AXIS_POINTS" :key="`${point.x}-${point.y}`" :class="props.mutedClass" x1="200" y1="200" :x2="point.x" :y2="point.y" class="opacity-35" stroke="currentColor" stroke-width="1.5" />
                <polygon :class="props.mutedClass" points="200,60 333,157 282,313 118,313 67,157" class="opacity-50" stroke="currentColor" stroke-width="1.5" />
              </svg>
            </div>
            <div class="min-w-0 lg:flex-1">
              <p class="text-[clamp(2.5rem,5vw,4rem)] leading-[0.9] tracking-[-0.06em] font-display max-w-full whitespace-nowrap truncate">
                {{ profileName }}
              </p>
              <div class="mt-6 border-y-[1px] border-current/10 h-14 relative overflow-hidden sm:h-16" aria-live="polite" :aria-label="processLabel">
                <TransitionGroup
                  tag="div"
                  class="h-full w-full pointer-events-none relative"
                  enter-active-class="transition-[opacity,filter] duration-500 ease-out motion-reduce:transition-none"
                  enter-from-class="opacity-0 blur-[2px]"
                  enter-to-class="opacity-20 blur-[1px]"
                  leave-active-class="transition-[opacity,filter] duration-500 ease-in motion-reduce:transition-none"
                  leave-from-class="opacity-20 blur-[1px]"
                  leave-to-class="opacity-0 blur-[2px]"
                >
                  <span
                    v-for="item in processBandItems"
                    :key="item.key"
                    :class="[
                      item.slot === 'current'
                        ? 'text-current font-medium drop-shadow-[0_0_10px_var(--color-primary-soft)]'
                        : `${props.mutedClass} blur-[1px]`,
                      item.slot === 'current' ? 'text-center' : 'text-left',
                    ]"
                    class="text-[11px] leading-none tracking-[-0.015em] font-body whitespace-nowrap transform-gpu transition-[left,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] top-1/2 absolute sm:text-xs motion-reduce:transition-none"
                    :style="PROCESS_BAND_SLOT_STYLES[item.slot]"
                  >
                    {{ item.label }}
                  </span>
                </TransitionGroup>
              </div>
            </div>
          </div>

          <div>
            <div class="flex gap-3 items-center justify-end">
              <p data-testid="dashboard-loading-collection-summary" :class="props.mutedClass" class="text-[10px] font-meta">
                {{ collectionSummary }}
              </p>
            </div>
            <div class="mt-3 rounded-full bg-current/10 h-1 overflow-hidden" aria-hidden="true">
              <div data-testid="dashboard-loading-progress" class="rounded-full bg-primary-strong h-full transition-[width] duration-700 ease-out motion-reduce:transition-none" :style="{ width: `${progressPercentage}%` }" />
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
