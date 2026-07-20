<script setup lang="ts">
import { onScopeDispose, reactive, ref } from 'vue'
import { Icon } from '#components'
import RebrandTextShimmer from '~/components/rebrand/RebrandTextShimmer.vue'

type DirectionId = 'scoreboard' | 'editorial' | 'bento'

interface DemoState {
  isRunning: boolean
  phase: 'idle' | 'thinking' | 'verdict' | 'points' | 'feedback'
  visiblePoints: number
}

const roastPoints = [
  {
    title: 'Abstraction as witness protection',
    copy: 'You did not remove complexity. You gave it aliases and hoped nobody would check the imports.',
    source: 'useManagerFactory.ts',
    delta: '+84 / -3',
  },
  {
    title: 'A wrapper with onboarding needs',
    copy: 'That helper wraps a one-line API so thoroughly it now needs its own documentation.',
    source: 'useRequestBridge.ts',
    delta: '+42 / -1',
  },
  {
    title: 'Architecture diagram, soup boundaries',
    copy: 'State crosses three layers to toggle one boolean, but every layer has an excellent name.',
    source: 'RoastWorkspace.vue',
    delta: '+118 / -27',
  },
] as const

const feedback = [
  'Delete pass-through wrappers that own neither state nor policy.',
  'Move request state into one typed composable with an explicit contract.',
  'Add a behavior-level test before introducing the next factory.',
] as const

const metrics = [
  { label: 'Grade', value: 'C-' },
  { label: 'Stink score', value: '78' },
  { label: 'Commits', value: '06' },
  { label: 'Files', value: '14' },
] as const

const revealSteps = ['Verdict', 'Roast points', 'Feedback'] as const
const directionTabs = [
  { id: 'scoreboard', label: 'Compact scoreboard', index: '01' },
  { id: 'editorial', label: 'Editorial flow', index: '02' },
  { id: 'bento', label: 'Focused bento', index: '03' },
] as const

const selectedDirection = ref<DirectionId>('scoreboard')
const demoStates = reactive<Record<DirectionId, DemoState>>({
  scoreboard: { isRunning: false, phase: 'idle', visiblePoints: 0 },
  editorial: { isRunning: false, phase: 'idle', visiblePoints: 0 },
  bento: { isRunning: false, phase: 'idle', visiblePoints: 0 },
})

const demoTimers = new Map<DirectionId, ReturnType<typeof setTimeout>[]>()
const phaseOrder = ['idle', 'thinking', 'verdict', 'points', 'feedback'] as const

function clearDemoTimers(direction: DirectionId) {
  demoTimers.get(direction)?.forEach(timer => clearTimeout(timer))
  demoTimers.set(direction, [])
}

function scheduleDemoStep(direction: DirectionId, delay: number, callback: () => void) {
  const timer = setTimeout(callback, delay)
  demoTimers.get(direction)?.push(timer)
}

function runDemo(direction: DirectionId) {
  clearDemoTimers(direction)
  Object.assign(demoStates[direction], { isRunning: true, phase: 'thinking', visiblePoints: 0 })

  scheduleDemoStep(direction, 900, () => {
    demoStates[direction].phase = 'verdict'
  })

  roastPoints.forEach((_, index) => {
    scheduleDemoStep(direction, 1900 + index * 650, () => {
      demoStates[direction].phase = 'points'
      demoStates[direction].visiblePoints = index + 1
    })
  })

  scheduleDemoStep(direction, 4200, () => {
    Object.assign(demoStates[direction], { isRunning: false, phase: 'feedback' })
  })
}

function hasReachedPhase(direction: DirectionId, phase: DemoState['phase']) {
  return phaseOrder.indexOf(demoStates[direction].phase) >= phaseOrder.indexOf(phase)
}

function demoButtonLabel(direction: DirectionId) {
  if (demoStates[direction].isRunning)
    return 'Restart demo'

  return demoStates[direction].phase === 'idle' ? 'Play result' : 'Replay result'
}

onScopeDispose(() => {
  demoTimers.forEach((_, direction) => clearDemoTimers(direction))
})
</script>

<template>
  <section id="result-directions" class="py-28 bg-black relative lg:py-48 sm:py-36">
    <div class="mx-auto px-4 max-w-[88rem] lg:px-10 sm:px-6">
      <header class="pb-16 border-b-[1px] border-explore-border border-solid gap-10 grid sm:pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p class="text-[10px] text-signal-red-400 tracking-[0.2em] font-meta uppercase">
            Result system study / round 02
          </p>
          <h2 class="text-[clamp(3rem,6vw,6.25rem)] text-explore-copy leading-[0.88] tracking-[-0.065em] font-display mt-6 max-w-[10ch]">
            Less chrome. More verdict.
          </h2>
        </div>
        <div class="lg:justify-self-end">
          <p class="text-base text-explore-muted leading-relaxed font-body max-w-[38rem] sm:text-lg">
            Three systems built around the first glance: title, grade, evidence, roast points, and useful feedback. No card per file and no duplicate index.
          </p>
          <ol aria-label="Planned result reveal order" class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            <li v-for="(step, index) in revealSteps" :key="step" class="text-[9px] text-explore-muted tracking-[0.12em] font-meta flex gap-2 uppercase items-center">
              <span class="rounded-full bg-signal-red-400 h-1.5 w-1.5" />
              {{ index + 1 }} / {{ step }}
            </li>
          </ol>
        </div>
      </header>

      <nav class="pt-10" aria-label="Result design directions">
        <div class="p-1 border-[1px] border-explore-border rounded-full border-solid bg-white/[0.02] inline-flex gap-1 max-w-full overflow-x-auto" role="tablist">
          <button
            v-for="direction in directionTabs"
            :id="`direction-tab-${direction.id}`"
            :key="direction.id"
            type="button"
            class="text-[9px] tracking-[0.1em] font-meta px-4 py-3 rounded-full flex gap-2 whitespace-nowrap uppercase transition-colors items-center sm:px-5"
            :class="selectedDirection === direction.id ? 'text-explore-copy bg-signal-red-950/70' : 'text-explore-muted hover:text-explore-copy hover:bg-white/[0.035]'"
            role="tab"
            :aria-controls="`direction-panel-${direction.id}`"
            :aria-selected="selectedDirection === direction.id"
            @click="selectedDirection = direction.id"
          >
            <span :class="selectedDirection === direction.id ? 'text-signal-red-400' : 'text-explore-muted'">{{ direction.index }}</span>
            {{ direction.label }}
          </button>
        </div>
      </nav>

      <div class="pt-16 sm:pt-24">
        <Transition mode="out-in" enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-3" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
          <!-- Direction 01: one compact scoreboard with a single reading axis. -->
          <article v-if="selectedDirection === 'scoreboard'" id="direction-panel-scoreboard" key="scoreboard" role="tabpanel" aria-labelledby="direction-tab-scoreboard">
            <div class="mb-10 gap-6 grid lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
              <div>
                <p class="text-[10px] text-signal-red-400 tracking-[0.18em] font-meta uppercase">
                  Direction 01 / Compact scoreboard
                </p>
                <p class="text-xs text-explore-muted font-body mt-3">
                  Editorial clarity, softened edges
                </p>
              </div>
              <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <h3 id="direction-scoreboard" class="text-[clamp(2.4rem,4.5vw,5rem)] text-explore-copy leading-[0.9] tracking-[-0.055em] font-display max-w-[14ch]">
                  Everything important before the first scroll.
                </h3>
                <button type="button" class="text-[9px] text-explore-copy tracking-[0.12em] font-meta px-4 py-3 border-[1px] border-explore-border-high rounded-full border-solid bg-white/[0.025] flex shrink-0 gap-2 uppercase transition-colors items-center hover:border-signal-red-400/60 hover:bg-signal-red-950/35" @click="runDemo('scoreboard')">
                  <Icon class="text-sm text-signal-red-400" :name="demoStates.scoreboard.phase === 'idle' ? 'ph:play' : 'ph:arrow-counter-clockwise'" />
                  {{ demoButtonLabel('scoreboard') }}
                </button>
              </div>
            </div>

            <div class="border-[1px] border-explore-border rounded-[2rem] border-solid bg-explore-panel overflow-hidden" aria-live="polite">
              <div class="p-6 border-b-[1px] border-explore-border border-solid gap-8 grid lg:p-12 sm:p-9 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <div>
                  <div class="flex gap-3 items-center">
                    <Icon class="text-base text-signal-red-400" :class="demoStates.scoreboard.phase === 'thinking' ? 'animate-pulse' : ''" name="ph:brain" />
                    <p class="text-[9px] text-explore-muted tracking-[0.14em] font-meta uppercase">
                      <RebrandTextShimmer v-if="demoStates.scoreboard.phase === 'thinking'" text="Checking the commit alibis..." />
                      <span v-else-if="hasReachedPhase('scoreboard', 'verdict')">Thought for 7 seconds / @lafllamme</span>
                      <span v-else>Ready to preview / @lafllamme</span>
                    </p>
                  </div>
                  <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-5" enter-to-class="opacity-100 translate-y-0">
                    <p v-if="hasReachedPhase('scoreboard', 'verdict')" class="text-[clamp(2.8rem,5.4vw,6.4rem)] text-explore-copy leading-[0.88] tracking-[-0.065em] font-display mt-8 max-w-[13ch]">
                      You moved complexity somewhere with fewer witnesses.
                    </p>
                  </Transition>
                </div>
                <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                  <div v-if="hasReachedPhase('scoreboard', 'verdict')" class="flex gap-7 md:pb-1 md:text-right">
                    <div v-for="metric in metrics" :key="metric.label">
                      <p class="text-[8px] text-explore-muted tracking-[0.12em] font-meta uppercase">
                        {{ metric.label }}
                      </p>
                      <p class="text-2xl text-explore-copy leading-none font-display mt-2" :class="metric.label === 'Grade' ? 'text-signal-red-400' : ''">
                        {{ metric.value }}
                      </p>
                    </div>
                  </div>
                </Transition>
              </div>

              <div class="px-6 lg:px-12 sm:px-9">
                <TransitionGroup enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                  <div v-for="point in roastPoints.slice(0, demoStates.scoreboard.visiblePoints)" :key="point.title" class="py-7 border-b-[1px] border-explore-border border-solid gap-4 grid sm:py-8 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                    <div>
                      <h4 class="text-xl text-explore-copy tracking-[-0.025em] font-display sm:text-2xl">
                        {{ point.title }}
                      </h4>
                      <p class="text-sm text-explore-muted leading-relaxed font-body mt-2 max-w-[48rem] sm:text-base">
                        {{ point.copy }}
                      </p>
                    </div>
                    <div class="flex gap-3 items-center md:justify-end">
                      <span class="text-[9px] text-explore-muted font-meta">{{ point.source }}</span>
                      <span class="text-[9px] text-signal-red-400 font-meta">{{ point.delta }}</span>
                    </div>
                  </div>
                </TransitionGroup>
              </div>

              <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                <div v-if="hasReachedPhase('scoreboard', 'feedback')" class="px-6 py-6 border-t-[1px] border-explore-border border-solid bg-black/25 flex flex-wrap gap-x-8 gap-y-3 lg:px-12 sm:px-9">
                  <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                    Useful damage
                  </p>
                  <p v-for="item in feedback" :key="item" class="text-xs text-explore-muted leading-relaxed font-body max-w-[22rem]">
                    {{ item }}
                  </p>
                </div>
              </Transition>
            </div>
          </article>

          <!-- Direction 02: the page is the surface; only hierarchy creates containment. -->
          <article v-else-if="selectedDirection === 'editorial'" id="direction-panel-editorial" key="editorial" role="tabpanel" aria-labelledby="direction-tab-editorial">
            <div class="mb-10 gap-6 grid lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
              <div>
                <p class="text-[10px] text-signal-red-400 tracking-[0.18em] font-meta uppercase">
                  Direction 02 / Editorial flow
                </p>
                <p class="text-xs text-explore-muted font-body mt-3">
                  No result card, no nested surfaces
                </p>
              </div>
              <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <h3 id="direction-editorial-flow" class="text-[clamp(2.4rem,4.5vw,5rem)] text-explore-copy leading-[0.9] tracking-[-0.055em] font-display max-w-[14ch]">
                  The page itself holds the result.
                </h3>
                <button type="button" class="text-[9px] text-explore-copy tracking-[0.12em] font-meta px-4 py-3 border-[1px] border-explore-border-high rounded-full border-solid bg-white/[0.025] flex shrink-0 gap-2 uppercase transition-colors items-center hover:border-signal-red-400/60 hover:bg-signal-red-950/35" @click="runDemo('editorial')">
                  <Icon class="text-sm text-signal-red-400" :name="demoStates.editorial.phase === 'idle' ? 'ph:play' : 'ph:arrow-counter-clockwise'" />
                  {{ demoButtonLabel('editorial') }}
                </button>
              </div>
            </div>

            <div class="py-10 border-y-[1px] border-explore-border border-solid sm:py-14" aria-live="polite">
              <div class="gap-10 grid lg:gap-20 lg:grid-cols-[0.48fr_1.52fr]">
                <aside>
                  <div class="flex gap-3 items-center">
                    <Icon class="text-base text-signal-red-400" :class="demoStates.editorial.phase === 'thinking' ? 'animate-pulse' : ''" name="ph:brain" />
                    <p class="text-[9px] text-explore-muted tracking-[0.13em] font-meta uppercase">
                      <RebrandTextShimmer v-if="demoStates.editorial.phase === 'thinking'" text="Reading the suspicious abstractions..." />
                      <span v-else-if="hasReachedPhase('editorial', 'verdict')">Investigation complete</span>
                      <span v-else>Ready to preview</span>
                    </p>
                  </div>
                  <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                    <div v-if="hasReachedPhase('editorial', 'verdict')" class="mt-9 gap-x-8 gap-y-6 grid grid-cols-2">
                      <div v-for="metric in metrics" :key="metric.label">
                        <p class="text-[8px] text-explore-muted tracking-[0.12em] font-meta uppercase">
                          {{ metric.label }}
                        </p>
                        <p class="text-4xl text-explore-copy leading-none font-display mt-2" :class="metric.label === 'Grade' ? 'text-signal-red-400' : ''">
                          {{ metric.value }}
                        </p>
                      </div>
                    </div>
                  </Transition>
                </aside>

                <div>
                  <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-5" enter-to-class="opacity-100 translate-y-0">
                    <p v-if="hasReachedPhase('editorial', 'verdict')" class="text-[clamp(3rem,6vw,7rem)] text-explore-copy leading-[0.86] tracking-[-0.07em] font-display max-w-[12ch]">
                      Complexity with fewer witnesses.
                    </p>
                  </Transition>
                  <div class="mt-12 border-t-[1px] border-explore-border border-solid">
                    <TransitionGroup enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                      <div v-for="point in roastPoints.slice(0, demoStates.editorial.visiblePoints)" :key="point.title" class="py-6 border-b-[1px] border-explore-border border-solid gap-4 grid md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline">
                        <p class="text-base text-explore-copy leading-relaxed font-body sm:text-lg">
                          <strong class="font-medium">{{ point.title }}.</strong> {{ point.copy }}
                        </p>
                        <p class="text-[9px] text-explore-muted font-meta whitespace-nowrap">
                          {{ point.source }} <span class="text-signal-red-400 ml-2">{{ point.delta }}</span>
                        </p>
                      </div>
                    </TransitionGroup>
                  </div>
                </div>
              </div>

              <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                <div v-if="hasReachedPhase('editorial', 'feedback')" class="mt-10 pt-8 border-t-[1px] border-explore-border border-solid gap-5 grid lg:gap-20 lg:grid-cols-[0.48fr_1.52fr]">
                  <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                    What to fix next
                  </p>
                  <div class="gap-4 grid md:grid-cols-3">
                    <p v-for="item in feedback" :key="item" class="text-sm text-explore-muted leading-relaxed font-body">
                      {{ item }}
                    </p>
                  </div>
                </div>
              </Transition>
            </div>
          </article>

          <!-- Direction 03: three macro modules, never a tile per fact. -->
          <article v-else id="direction-panel-bento" key="bento" role="tabpanel" aria-labelledby="direction-tab-bento">
            <div class="mb-10 gap-6 grid lg:grid-cols-[0.55fr_1.45fr] lg:items-end">
              <div>
                <p class="text-[10px] text-signal-red-400 tracking-[0.18em] font-meta uppercase">
                  Direction 03 / Focused bento
                </p>
                <p class="text-xs text-explore-muted font-body mt-3">
                  Three macro modules, one visual hierarchy
                </p>
              </div>
              <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <h3 id="direction-focused-bento" class="text-[clamp(2.4rem,4.5vw,5rem)] text-explore-copy leading-[0.9] tracking-[-0.055em] font-display max-w-[14ch]">
                  Bento structure without bento noise.
                </h3>
                <button type="button" class="text-[9px] text-explore-copy tracking-[0.12em] font-meta px-4 py-3 border-[1px] border-explore-border-high rounded-full border-solid bg-white/[0.025] flex shrink-0 gap-2 uppercase transition-colors items-center hover:border-signal-red-400/60 hover:bg-signal-red-950/35" @click="runDemo('bento')">
                  <Icon class="text-sm text-signal-red-400" :name="demoStates.bento.phase === 'idle' ? 'ph:play' : 'ph:arrow-counter-clockwise'" />
                  {{ demoButtonLabel('bento') }}
                </button>
              </div>
            </div>

            <div class="gap-3 grid lg:grid-cols-12" aria-live="polite">
              <section class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-explore-panel-high flex flex-col min-h-[28rem] justify-between sm:p-10 lg:col-span-8">
                <div class="flex gap-6 items-start justify-between">
                  <div>
                    <p class="text-[9px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                      The verdict / @lafllamme
                    </p>
                    <p class="text-[9px] text-explore-muted tracking-[0.1em] font-meta mt-2 uppercase">
                      <RebrandTextShimmer v-if="demoStates.bento.phase === 'thinking'" text="Building a case from public evidence..." />
                      <span v-else-if="hasReachedPhase('bento', 'verdict')">Thought for 7 seconds</span>
                      <span v-else>Ready to preview</span>
                    </p>
                  </div>
                  <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 scale-90" enter-to-class="opacity-100 scale-100">
                    <span v-if="hasReachedPhase('bento', 'verdict')" class="text-6xl text-signal-red-400 leading-none tracking-[-0.07em] font-display sm:text-8xl">C-</span>
                  </Transition>
                </div>
                <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-5" enter-to-class="opacity-100 translate-y-0">
                  <p v-if="hasReachedPhase('bento', 'verdict')" class="text-[clamp(3rem,6vw,7rem)] text-explore-copy leading-[0.86] tracking-[-0.07em] font-display max-w-[10ch]">
                    Complexity with fewer witnesses.
                  </p>
                </Transition>
              </section>

              <aside class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-white/[0.025] flex flex-col justify-between sm:p-9 lg:col-span-4">
                <p class="text-[9px] text-explore-muted tracking-[0.14em] font-meta uppercase">
                  Evidence at a glance
                </p>
                <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                  <div v-if="hasReachedPhase('bento', 'verdict')" class="mt-10 space-y-5">
                    <div v-for="metric in metrics.slice(1)" :key="metric.label" class="pb-5 border-b-[1px] border-explore-border border-solid flex items-end justify-between last:border-b-0">
                      <p class="text-xs text-explore-muted font-body">
                        {{ metric.label }}
                      </p>
                      <p class="text-3xl text-explore-copy leading-none font-display">
                        {{ metric.value }}
                      </p>
                    </div>
                  </div>
                </Transition>
              </aside>

              <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-5" enter-to-class="opacity-100 translate-y-0">
                <section v-if="demoStates.bento.visiblePoints > 0" class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-black/55 sm:p-10 lg:col-span-12">
                  <div class="gap-8 grid lg:gap-16 lg:grid-cols-[1.45fr_0.55fr]">
                    <div>
                      <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                        Roast points
                      </p>
                      <div class="mt-5 border-t-[1px] border-explore-border border-solid">
                        <TransitionGroup enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                          <div v-for="point in roastPoints.slice(0, demoStates.bento.visiblePoints)" :key="point.title" class="py-5 border-b-[1px] border-explore-border border-solid gap-4 grid md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                            <p class="text-sm text-explore-copy leading-relaxed font-body sm:text-base">
                              {{ point.copy }}
                            </p>
                            <p class="text-[9px] text-explore-muted font-meta whitespace-nowrap">
                              {{ point.source }} <span class="text-signal-red-400 ml-2">{{ point.delta }}</span>
                            </p>
                          </div>
                        </TransitionGroup>
                      </div>
                    </div>
                    <Transition enter-active-class="transition-all duration-500 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
                      <div v-if="hasReachedPhase('bento', 'feedback')">
                        <p class="text-[9px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">
                          Useful damage
                        </p>
                        <div class="mt-5 space-y-4">
                          <p v-for="item in feedback" :key="item" class="text-sm text-explore-muted leading-relaxed font-body flex gap-3">
                            <Icon class="text-sm text-signal-red-400 mt-1 shrink-0" name="ph:arrow-up-right" />
                            {{ item }}
                          </p>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </section>
              </Transition>
            </div>
          </article>
        </Transition>
      </div>
    </div>
  </section>
</template>
