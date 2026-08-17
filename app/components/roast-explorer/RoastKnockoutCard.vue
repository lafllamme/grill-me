<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import { roastMetricDescriptors } from '~/data/roast-explorer'

const props = defineProps<{ fixture: RoastExplorerFixture, replayKey: number, isStreaming?: boolean }>()
const activeRound = ref(0)
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
  activeRound.value = 0
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

function nextRound() {
  activeRound.value = activeRound.value >= props.fixture.roastLines.length - 1 ? 0 : activeRound.value + 1
}
const damageFor = (index: number) => Math.min(5, Math.max(1, Math.round((props.fixture.metrics.stinkScore + index * 8) / 20)))
const verdict = computed(() => props.fixture.intensity.level >= 3 ? 'Technical knockout' : 'Split decision')
const isAnalysisVisible = computed(() => revealPhase.value >= 1 && revealPhase.value < 3)
const isCenterIdentityVisible = computed(() => revealPhase.value >= 3)
const isSkeletonVisible = computed(() => revealPhase.value <= 1)
const isSkeletonResolving = computed(() => revealPhase.value === 1)
const isGradeVisible = computed(() => revealPhase.value >= 4)
const isRoundsVisible = computed(() => revealPhase.value >= 4)
const areScoresVisible = computed(() => revealPhase.value >= 5)
</script>

<template>
  <div class="p-5 bg-background lg:p-12 sm:p-8">
    <div class="mx-auto min-h-[54rem] max-w-6xl">
      <div class="text-[10px] text-on-surface-variant tracking-[0.22em] font-meta flex gap-3 uppercase items-center justify-between">
        <span>Roast console / live assembly</span><span>{{ fixture.intensity.level }} rd. bout</span>
      </div>

      <div class="mt-8 gap-6 grid min-w-0 lg:grid-cols-[minmax(0,0.25fr)_minmax(0,0.5fr)_minmax(0,0.25fr)] lg:items-start">
        <aside class="order-2 min-h-[20rem] min-w-0 lg:order-1">
          <div class="p-5 border border-divider rounded-[1.4rem] bg-surface-container-low">
            <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
              Target
            </p>
            <div class="mt-5 min-h-[10rem]">
              <p class="text-[clamp(1.7rem,2.4vw,3rem)] text-on-surface leading-[0.9] tracking-[-0.06em] font-display break-words">
                @{{ fixture.username }}
              </p>
              <div class="mt-8 pt-4 border-t border-divider">
                <p class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">
                  {{ fixture.intensity.label.replaceAll('_', ' ') }}
                </p>
                <p class="text-xs text-on-surface-variant leading-relaxed font-meta mt-3">
                  Evidence pending
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

            <div class="mt-12 min-h-[17rem]">
              <p class="text-[10px] text-on-surface-variant tracking-[0.22em] font-meta text-center uppercase">
                Roast, round by round
              </p>
              <ol class="mt-5 border-t border-divider border-solid">
                <li v-for="(line, index) in fixture.roastLines" :key="line" class="min-h-[5rem] py-5 border-b border-divider border-solid gap-4 grid grid-cols-[2rem_1fr_auto] items-start transition-opacity duration-500" :class="index < revealedRounds && isRoundsVisible ? (index === activeRound ? 'opacity-100' : 'opacity-60') : 'opacity-35'">
                  <button type="button" class="text-xs font-meta border rounded-full flex h-8 w-8 items-center justify-center transition-colors" :class="index < revealedRounds && isRoundsVisible ? 'text-primary border-primary' : 'text-on-surface-variant border-divider'" :disabled="index >= revealedRounds || !isRoundsVisible" @click="activeRound = index">
                    {{ index + 1 }}
                  </button>
                  <p v-if="index < revealedRounds && isRoundsVisible" class="text-sm text-on-surface leading-relaxed font-body sm:text-base">
                    {{ line }}
                  </p>
                  <Skeleton v-else class="rounded-full h-3 mt-2 w-full" />
                  <div class="pt-2 flex gap-1">
                    <span v-for="dot in 5" :key="dot" class="rounded-full h-2 w-2" :class="index < revealedRounds && isRoundsVisible && dot <= damageFor(index) ? 'bg-primary' : 'bg-on-surface/20'" />
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </article>

        <aside class="order-3 min-h-[20rem] min-w-0">
          <div class="p-5 border border-divider rounded-[1.4rem] bg-surface-container-high">
            <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
              Judges’ scorecard
            </p>
            <div class="mt-5 min-h-[16rem] space-y-4">
              <div v-for="metric in roastMetricDescriptors" :key="metric.key" class="pb-4 border-b border-divider last:border-b-0 last:pb-0">
                <div class="text-3xl text-on-surface leading-none font-display transition-opacity duration-500 motion-reduce:transition-none">
                  <template v-if="areScoresVisible">
                    {{ fixture.metrics[metric.key] }}
                  </template>
                  <Skeleton v-else class="rounded-[0.35rem] h-8 w-14" label="Loading score" />
                </div>
                <p class="text-[9px] text-on-surface-variant tracking-[0.12em] font-meta mt-2 uppercase">
                  {{ metric.label }}
                </p>
                <p class="text-xs text-on-surface-variant leading-relaxed font-body mt-2">
                  {{ metric.descriptor }}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div class="mt-8 pt-5 border-t border-divider border-solid flex gap-4 items-center justify-between">
        <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
          {{ isStreaming && revealPhase < 5 ? 'Building evidence-backed verdict' : 'Verdict filed' }}
        </p>
        <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase hover:text-primary" @click="nextRound">
          Next round →
        </button>
      </div>
    </div>
  </div>
</template>
