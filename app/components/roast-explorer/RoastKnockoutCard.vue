<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import { roastMetricDescriptors } from '~/data/roast-explorer'

const props = defineProps<{ fixture: RoastExplorerFixture, replayKey: number, isStreaming?: boolean }>()
const activeEvidenceCard = ref(0)
const revealPhase = ref(0)
const revealedRounds = ref(0)
const revealedAnalysisSteps = ref(0)
const starFillPercent = ref(0)
const starRotation = ref(0)
let revealTimers: ReturnType<typeof setTimeout>[] = []
let starFillFrame: number | undefined
let starRevealStartedAt = 0

const analysisSteps = [
  'Fetching public commits',
  'Indexing changed files',
  'Comparing implementation patterns',
  'Preparing evidence-backed verdict',
]

interface RoastEvidenceCard {
  kind: 'roast' | 'feedback'
  label: string
  text: string
}

const evidenceCards = computed<RoastEvidenceCard[]>(() => [
  ...props.fixture.roastLines.map((text, index) => ({ kind: 'roast' as const, label: `Roast ${String(index + 1).padStart(2, '0')}`, text })),
  ...props.fixture.feedback.map((text, index) => ({ kind: 'feedback' as const, label: `Fix ${String(index + 1).padStart(2, '0')}`, text })),
])
const visibleEvidenceCards = computed(() => evidenceCards.value.slice(activeEvidenceCard.value, activeEvidenceCard.value + 3))

function clearRevealTimers() {
  revealTimers.forEach(timer => clearTimeout(timer))
  revealTimers = []
  if (starFillFrame !== undefined) {
    cancelAnimationFrame(starFillFrame)
    starFillFrame = undefined
  }
}

function scheduleReveal(callback: () => void, delay: number) {
  revealTimers.push(setTimeout(callback, delay))
}

function getStarFillPercent(elapsed: number) {
  const finishAt = 3200 + props.fixture.roastLines.length * 760 + 600
  const checkpoints = [
    [0, 0],
    [850, 18],
    [1450, 44],
    [2900, 72],
    [finishAt, 100],
  ] as const

  for (let index = 1; index < checkpoints.length; index++) {
    const endCheckpoint = checkpoints[index]
    const startCheckpoint = checkpoints[index - 1]
    if (!endCheckpoint || !startCheckpoint)
      continue

    const [endTime, endValue] = endCheckpoint
    const [startTime, startValue] = startCheckpoint

    if (elapsed <= endTime) {
      const progress = Math.max(0, Math.min(1, (elapsed - startTime) / (endTime - startTime)))
      return startValue + (endValue - startValue) * progress
    }
  }

  return 100
}

function startStarFill() {
  if (!import.meta.client)
    return

  starRevealStartedAt = performance.now()
  const updateStarFill = (now: number) => {
    if (revealPhase.value >= 5) {
      starFillPercent.value = 100
      starFillFrame = undefined
      return
    }

    if (revealPhase.value >= 4) {
      starFillPercent.value = 100
    }
    else {
      starFillPercent.value = getStarFillPercent(now - starRevealStartedAt)
      starRotation.value = 0
    }
    starFillFrame = requestAnimationFrame(updateStarFill)
  }

  starFillFrame = requestAnimationFrame(updateStarFill)
}

function replayEntrance(force = false) {
  clearRevealTimers()
  activeEvidenceCard.value = 0
  revealedRounds.value = 0
  revealedAnalysisSteps.value = 0

  if (!props.isStreaming && !force) {
    revealPhase.value = 5
    revealedRounds.value = props.fixture.roastLines.length
    starFillPercent.value = 100
    starRotation.value = -8
    return
  }

  revealPhase.value = 0
  starFillPercent.value = 0
  starRotation.value = 0
  startStarFill()
  scheduleReveal(() => {
    revealPhase.value = 1
  }, 850)
  scheduleReveal(() => {
    revealPhase.value = 2
  }, 1450)
  scheduleReveal(() => {
    revealPhase.value = 3
  }, 2900)

  analysisSteps.forEach((_, index) => {
    scheduleReveal(() => {
      revealedAnalysisSteps.value = index + 1
    }, 950 + index * 260)
  })

  props.fixture.roastLines.forEach((_, index) => {
    scheduleReveal(() => {
      revealedRounds.value = index + 1
    }, 3200 + index * 760)
  })

  scheduleReveal(() => {
    revealPhase.value = 4
    // Rotate forward once into the final -8deg pose (352deg is the same angle)
    // so the star never has to reverse direction or snap back into place.
    starRotation.value = 352
  }, 3200 + props.fixture.roastLines.length * 760 + 600)
  scheduleReveal(() => {
    revealPhase.value = 5
  }, 3200 + props.fixture.roastLines.length * 760 + 1250)
}

watch(() => props.replayKey, () => {
  replayEntrance(true)
})
watch(() => props.isStreaming, (isStreaming) => {
  if (isStreaming)
    replayEntrance()
})
onBeforeUnmount(clearRevealTimers)
onMounted(() => {
  replayEntrance(true)
})

function nextEvidenceCard() {
  activeEvidenceCard.value = activeEvidenceCard.value >= evidenceCards.value.length - 1 ? 0 : activeEvidenceCard.value + 1
}
const verdict = computed(() => props.fixture.intensity.level >= 3 ? 'Technical knockout' : 'Split decision')
const isAnalysisVisible = computed(() => revealPhase.value >= 1 && revealPhase.value < 3)
const isCenterIdentityVisible = computed(() => revealPhase.value >= 3)
const isSkeletonVisible = computed(() => revealPhase.value <= 1)
const isSkeletonResolving = computed(() => revealPhase.value === 1)
const isGradeVisible = computed(() => revealPhase.value >= 4)
const areScoresVisible = computed(() => revealPhase.value >= 5)
</script>

<template>
  <div class="p-5 bg-background lg:p-12 sm:p-8">
    <div class="mx-auto min-h-[54rem] max-w-6xl">
      <div class="text-[10px] text-on-surface-variant tracking-[0.22em] font-meta flex gap-3 uppercase items-center justify-between">
        <span>Roast console / live assembly</span><span>{{ fixture.intensity.level }} rd. bout</span>
      </div>

      <div class="mt-8 gap-6 grid min-w-0 lg:grid-cols-[minmax(13rem,0.27fr)_minmax(0,0.45fr)_minmax(18rem,0.38fr)] lg:items-start">
        <aside class="order-2 min-w-0 gap-4 grid lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:order-1">
          <div class="p-5 border border-divider rounded-[1.5rem] bg-surface-container">
            <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
              Target
            </p>
            <div class="mt-5 min-h-[10rem] flex flex-col">
              <p class="text-[clamp(1.7rem,2.4vw,3rem)] text-on-surface leading-[0.9] tracking-[-0.06em] font-display break-words">
                @{{ fixture.username }}
              </p>
              <div class="mt-auto pt-4 border-t border-divider">
                <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
                  {{ fixture.intensity.label.replaceAll('_', ' ') }}
                </p>
                <p class="text-xs text-on-surface-variant leading-relaxed font-meta mt-3">
                  Evidence pending
                </p>
              </div>
            </div>
          </div>

          <div class="p-5 border border-divider rounded-[1.5rem] bg-surface-container">
            <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
              Judges’ scorecard
            </p>
            <div class="mt-4 divide-y divide-divider">
              <div v-for="metric in roastMetricDescriptors" :key="metric.key" class="py-3 first:pt-0 last:pb-0">
                <div class="flex gap-3 items-start justify-between">
                  <p class="text-[9px] text-on-surface-variant tracking-[0.12em] font-meta uppercase">
                    {{ metric.label }}
                  </p>
                  <div class="text-2xl text-on-surface leading-none font-display shrink-0">
                    <template v-if="areScoresVisible">
                      {{ fixture.metrics[metric.key] }}
                    </template>
                    <Skeleton v-else class="rounded-[0.35rem] h-7 w-10" label="Loading score" />
                  </div>
                </div>
                <p class="text-[11px] text-on-surface-variant leading-relaxed font-body mt-2">
                  {{ metric.descriptor }}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <article class="order-1 min-h-[41rem] min-w-0 lg:order-2">
          <div class="p-6 border border-divider rounded-[2rem] bg-surface-container sm:p-10">
            <div class="mt-2 min-h-[16rem] relative text-center">
              <div class="inset-0 absolute flex items-start justify-center transition-[opacity,transform,filter] duration-800 ease-out motion-reduce:transition-none" :class="isSkeletonVisible ? (isSkeletonResolving ? 'opacity-0 scale-[0.96] blur-sm pointer-events-none' : 'opacity-100 scale-100 blur-0') : 'opacity-0 scale-[0.96] blur-sm pointer-events-none'" :aria-hidden="!isSkeletonVisible">
                <div class="mx-auto max-w-[24rem] space-y-6 pt-5 w-full" aria-label="Loading roast identity">
                  <Skeleton class="rounded-full h-8 w-3/4 mx-auto" />
                  <Skeleton class="rounded-full h-4 w-1/2 mx-auto" />
                </div>
              </div>

              <div class="inset-0 absolute mx-auto max-w-[24rem] text-left pt-1 transition-[opacity,transform,filter,max-height] duration-800 ease-out motion-reduce:transition-none" :class="isAnalysisVisible ? 'opacity-100 translate-y-0 blur-0 max-h-[16rem]' : 'opacity-0 translate-y-[0.35rem] blur-sm max-h-0 pointer-events-none'" :aria-hidden="!isAnalysisVisible" aria-label="Assembly analysis">
                <p class="text-[10px] text-primary tracking-[0.2em] font-meta uppercase">
                  Evidence assembly
                </p>
                <ol class="mt-5 space-y-4">
                  <li v-for="(step, index) in analysisSteps" :key="step" class="text-sm text-on-surface-variant leading-relaxed font-meta flex gap-3 items-center transition-opacity duration-300" :class="index < revealedAnalysisSteps ? 'opacity-100' : 'opacity-25'">
                    <span class="text-primary text-[10px]">{{ index < revealedAnalysisSteps ? String(index + 1).padStart(2, '0') : '··' }}</span>
                    <span>{{ step }}</span>
                  </li>
                </ol>
              </div>

              <div class="inset-0 absolute flex flex-col items-center transition-[opacity,transform,filter] duration-800 ease-out motion-reduce:transition-none" :class="isCenterIdentityVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-[0.5rem] blur-sm pointer-events-none'" :aria-hidden="!isCenterIdentityVisible">
                <h2 class="text-[clamp(2.1rem,4.5vw,4.25rem)] text-on-surface leading-[0.88] tracking-[-0.07em] font-display">
                  {{ fixture.title }}
                </h2>
                <p class="text-lg text-on-surface-variant font-body mt-4">
                  Evidence-backed verdict
                </p>
              </div>
            </div>

            <div class="mt-2 min-h-[12rem] text-center">
              <div class="relative mx-auto flex h-52 w-52 items-center justify-center">
                <div class="inset-0 absolute transition-transform duration-1000 ease-out motion-reduce:transition-none [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" :style="{ transform: `rotate(${starRotation}deg)` }" role="status" aria-label="Loading grade">
                  <div class="h-full w-full bg-surface-container-highest" />
                  <div class="inset-0 absolute overflow-hidden transition-[clip-path] duration-800 ease-out motion-reduce:transition-none" :style="{ clipPath: `inset(${100 - starFillPercent}% 0 0 0)` }">
                    <div class="h-full w-full bg-primary [clip-path:polygon(50%_0%,61%_35%,98%_35%,68%_57%,79%_91%,50%_70%,21%_91%,32%_57%,2%_35%,39%_35%)]" />
                  </div>
                </div>
                <span class="text-5xl text-background font-display relative z-10 transition-all duration-700 motion-reduce:transition-none" :class="isGradeVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'">{{ fixture.metrics.grade }}</span>
              </div>
              <p class="text-[10px] text-primary tracking-[0.2em] font-meta mt-6 px-3 py-2 border border-primary border-solid inline-block uppercase transition-opacity duration-500" :class="isGradeVisible ? 'opacity-100' : 'opacity-0'">
                {{ verdict }}
              </p>
            </div>

          </div>
        </article>

        <aside class="order-3 min-w-0">
          <div class="flex gap-3 items-center justify-between">
            <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
              Roast, round by round
            </p>
            <span class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta uppercase">
              {{ activeEvidenceCard + 1 }} / {{ evidenceCards.length }}
            </span>
          </div>

          <div class="mt-5 min-h-[30rem] relative">
            <TransitionGroup
              tag="div"
              enter-active-class="transition-all duration-400 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0 translate-x-4"
              enter-to-class="opacity-100 translate-x-0"
              leave-active-class="transition-all duration-300 ease-in motion-reduce:transition-none"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-4"
            >
              <button v-for="(card, index) in visibleEvidenceCards" :key="`${card.label}-${activeEvidenceCard}`" type="button" class="p-6 text-left border-[1px] rounded-[1.5rem] border-solid inset-x-0 top-0 absolute min-h-[22rem] sm:p-7" :class="[card.kind === 'roast' ? 'border-primary bg-surface-container-high' : 'border-divider bg-surface-container', index === 0 ? 'cursor-pointer' : 'pointer-events-none']" :style="{ transform: `translateY(${index * 1.1}rem) scale(${1 - index * 0.04})`, zIndex: 3 - index, opacity: 1 - index * 0.16 }" :aria-label="`${card.label}: ${card.text}`" @click="index === 0 && nextEvidenceCard()">
                <div class="flex gap-3 items-center justify-between">
                  <span class="text-[10px] tracking-[0.2em] font-meta uppercase" :class="card.kind === 'roast' ? 'text-primary' : 'text-on-surface-variant'">
                    {{ card.label }}
                  </span>
                  <span class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta uppercase">
                    {{ index === 0 ? 'active' : 'queued' }}
                  </span>
                </div>
                <p v-if="(card.kind === 'roast' && activeEvidenceCard + index < revealedRounds) || (card.kind === 'feedback' && areScoresVisible)" class="text-xl text-on-surface leading-[1.08] tracking-[-0.03em] font-body mt-12 sm:text-2xl">
                  {{ card.text }}
                </p>
                <Skeleton v-else class="rounded-[0.4rem] h-4 mt-12 w-full" label="Loading evidence" />
                <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta bottom-5 left-5 absolute uppercase sm:left-6">
                  {{ card.kind === 'roast' ? 'damage logged' : 'exchange suggested' }}
                </span>
              </button>
            </TransitionGroup>
          </div>
          <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-5 uppercase hover:text-primary" @click="nextEvidenceCard">
            Next card →
          </button>
        </aside>
      </div>

      <div class="mt-8 pt-5 border-t border-divider border-solid flex gap-4 items-center justify-between">
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
          {{ isStreaming && revealPhase < 5 ? 'Building evidence-backed verdict' : 'Verdict filed' }}
        </p>
        <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase hover:text-primary" @click="nextEvidenceCard">
          Next evidence →
        </button>
      </div>
    </div>
  </div>
</template>
