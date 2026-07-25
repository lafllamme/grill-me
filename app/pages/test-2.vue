<script setup lang="ts">
import type { PrismGradientSettings, PrismGradientShaderSettings } from '~/models/prism-gradient'
import { computed, nextTick, onMounted, ref } from 'vue'
import { NuxtLink } from '#components'
import { useHead, useSeoMeta } from '#imports'
import LandingTopNav from '~/components/LandingTopNav.vue'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import RebrandAnalysisStage from '~/components/rebrand/RebrandAnalysisStage.vue'
import RebrandChapterShell from '~/components/rebrand/RebrandChapterShell.vue'
import RebrandLiveRoastStage from '~/components/rebrand/RebrandLiveRoastStage.vue'
import RebrandTargetStage from '~/components/rebrand/RebrandTargetStage.vue'
import { usePrismGradientSettings } from '~/composables/usePrismGradientSettings'
import { useRoast } from '~/composables/useRoast'
import { useRoastPreview } from '~/composables/useRoastPreview'
import { PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS } from '~/models/prism-gradient'
import { useRoastStore } from '~/stores/roastStore'

definePageMeta({ layout: false })

useHead({ title: 'Grillme Rebrand Exploration 02' })
useSeoMeta({ description: 'A stage-first Grillme homepage concept using Signal Red, dark glass, and progressive roast states.' })

const testPagePrismDefaults: PrismGradientSettings = {
  ...PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS,
  speed: 0.476,
  noiseOpacity: 0.065,
  noiseScale: 1.2,
  ambientOpacity: 0.14,
  radius: '0px',
  darkColors: ['#110205', '#7E1D26', '#F0444D'],
  lightColors: ['#110205', '#981B27', '#F0444D'],
}

const {
  settings: prismSettings,
  isPanelOpen: isPrismPanelOpen,
  isPanelVisible: isPrismPanelVisible,
  togglePanel: togglePrismPanel,
  resetSettings: resetPrismSettings,
  closePanel: closePrismPanel,
  showPanel: showPrismPanel,
} = usePrismGradientSettings({
  defaults: testPagePrismDefaults,
  storageKey: 'grillme:prism-gradient:test-2:settings:v1',
  panelOpenStorageKey: 'grillme:prism-gradient:test-2:panel-open:v1',
})

const prismShaderSettings = computed<PrismGradientShaderSettings>(() => ({
  rotation: prismSettings.rotation,
  proportion: prismSettings.proportion,
  scale: prismSettings.scale,
  distortion: prismSettings.distortion,
  swirl: prismSettings.swirl,
  swirlIterations: prismSettings.swirlIterations,
  softness: prismSettings.softness,
  offset: prismSettings.offset,
  shapeSize: prismSettings.shapeSize,
}))

function applyPrismSettings(nextSettings: PrismGradientSettings) {
  Object.assign(prismSettings, nextSettings)
}

const roastStore = useRoastStore()
const liveRoastStage = ref<HTMLElement | null>(null)
const isLiveRoastActive = ref(false)
const isPageInteractive = ref(false)
const activeRoastSource = ref<'api' | 'preview'>('api')
const {
  result,
  pending,
  error,
  isStreaming,
  partialTitle,
  partialRoastLines,
  streamStatus,
  streamEvidence,
  partialFeedback,
  streamError,
  roastUsername,
} = useRoast()

const preview = useRoastPreview()
const isPreviewActive = computed(() => activeRoastSource.value === 'preview')
const isRoastPending = computed(() => isPreviewActive.value ? preview.isPending.value : pending.value)
const displayedStreaming = computed(() => isPreviewActive.value ? preview.isStreaming.value : isStreaming.value)
const displayedTitle = computed(() => isPreviewActive.value ? preview.title.value : partialTitle.value)
const displayedRoastLines = computed(() => isPreviewActive.value ? preview.roastLines.value : partialRoastLines.value)
const displayedFeedback = computed(() => isPreviewActive.value ? preview.feedback.value : partialFeedback.value)
const displayedMetrics = computed(() => isPreviewActive.value ? preview.metrics.value : result.value?.metrics ?? null)
const displayedStatuses = computed(() => isPreviewActive.value ? preview.statuses.value : streamStatus.value)
const displayedEvidence = computed(() => isPreviewActive.value ? preview.evidence.value : streamEvidence.value)
const displayedError = computed(() => isPreviewActive.value ? null : streamError.value || error.value)

onMounted(() => {
  isPageInteractive.value = true
})

async function scrollToLiveStage() {
  await nextTick()
  liveRoastStage.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

async function startRoast() {
  if (!roastStore.canSubmit || pending.value)
    return

  preview.stop()
  activeRoastSource.value = 'api'
  isLiveRoastActive.value = true
  void roastUsername(roastStore.trimmedUsername, {
    roastIntensity: roastStore.roastIntensity,
  })

  await scrollToLiveStage()
}

async function startPreview() {
  if (pending.value)
    return

  activeRoastSource.value = 'preview'
  isLiveRoastActive.value = true
  preview.play()
  await scrollToLiveStage()
}

const evidenceModules = [
  { id: 'receipt', label: 'Receipts, not vibes', title: 'Every punchline keeps the commit that earned it.' },
  { id: 'heat', label: 'Controlled heat', title: 'Choose how useful the emotional damage should be.' },
  { id: 'artifact', label: 'Built to land', title: 'The result becomes the page, not another terminal row.' },
] as const
</script>

<template>
  <div data-testid="rebrand-test-2-root" class="text-explore-copy bg-black min-h-screen selection:text-explore-copy selection:bg-signal-red-700">
    <LandingTopNav variant="signal" surface="dark" />

    <main class="relative overflow-clip">
      <section class="bg-black relative z-0 isolate">
        <div class="h-[100svh] pointer-events-none [animation:hero-scroll-drift_linear_both] top-0 sticky overflow-hidden hero-scroll-parallax motion-reduce:[animation:none]">
          <div class="inset-[-5%] absolute">
            <PrismGradientBackground
              class="scale-[1.05] inset-0 absolute motion-reduce:scale-100"
              :speed="prismSettings.speed"
              :ambient-opacity="prismSettings.ambientOpacity"
              :radius="prismSettings.radius"
              :noise="{ opacity: prismSettings.noiseOpacity, scale: prismSettings.noiseScale }"
              :colors="{ dark: prismSettings.darkColors, light: prismSettings.lightColors }"
              :shader="prismShaderSettings"
            />
          </div>
          <div class="bg-black/8 inset-0 absolute" />
          <div class="inset-0 absolute from-transparent to-black/25 via-transparent bg-gradient-to-br" />
          <div class="h-[24svh] inset-x-0 bottom-0 absolute from-transparent to-black/8 bg-gradient-to-b" />
        </div>

        <div class="relative z-10 -mt-[100svh]">
          <section class="mx-auto px-4 pb-16 pt-36 flex flex-col max-w-[88rem] min-h-[92svh] justify-end lg:px-10 sm:px-6 lg:pb-20 sm:pt-44">
            <p class="text-xs text-signal-red-400 tracking-[0.22em] font-meta uppercase">
              Public commits. Private consequences.
            </p>
            <div class="mt-8 gap-10 grid lg:gap-16 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
              <h1 class="text-[clamp(3.8rem,9vw,9rem)] text-explore-copy leading-[0.78] tracking-[-0.08em] font-display font-semibold max-w-[7.5ch] sm:leading-[0.75]">
                Your code remembers.
              </h1>
              <div class="pb-3 max-w-[35rem] lg:ml-auto lg:pb-5">
                <p class="text-lg text-explore-copy leading-relaxed font-body sm:text-xl">
                  Give us a GitHub username. The agent finds the evidence, streams the investigation, and returns a roast that can cite its sources.
                </p>
                <a href="#target" class="text-xs text-explore-copy tracking-[0.12em] font-label mt-7 inline-flex uppercase">Choose a target ↓</a>
              </div>
            </div>
          </section>

          <div class="pb-[clamp(8rem,15vw,16rem)]">
            <RebrandTargetStage :is-pending="isRoastPending" @submit="startRoast">
              <template #preview>
                <button
                  type="button"
                  data-testid="test-2-preview-button"
                  class="text-[10px] text-explore-copy tracking-[0.1em] font-meta px-4 py-2.5 border-[1px] border-signal-red-500/30 rounded-xl border-solid bg-signal-red-950/35 inline-flex gap-2 uppercase transition-colors items-center hover:border-signal-red-500/55 hover:bg-signal-red-950/60 disabled:opacity-45 disabled:cursor-wait"
                  :disabled="isRoastPending || !isPageInteractive"
                  @click="startPreview"
                >
                  <span class="rounded-full bg-signal-red-500 h-1.5 w-1.5 shadow-[0_0_10px_var(--explore-glow)]" />
                  Run sample roast · no API
                </button>
              </template>
            </RebrandTargetStage>
          </div>
        </div>

        <div aria-hidden="true" class="h-[100svh]" />
      </section>

      <RebrandChapterShell edge="rise-right" tone="paper" class="z-20 -mt-[100svh]">
        <div class="mx-auto px-4 pt-6 max-w-[88rem] lg:px-10 sm:px-6">
          <div class="py-5 border-b-[1px] border-basalt-950/16 border-solid grid grid-cols-[1fr_auto] items-center">
            <p class="text-[10px] text-basalt-500 tracking-[0.16em] font-meta uppercase">
              01 / Investigation
            </p>
            <p class="text-[10px] text-signal-red-700 tracking-[0.16em] font-meta uppercase">
              Public evidence
            </p>
          </div>
        </div>

        <div v-if="isLiveRoastActive" ref="liveRoastStage">
          <RebrandLiveRoastStage
            :username="roastStore.trimmedUsername"
            :is-pending="isRoastPending"
            :is-streaming="displayedStreaming"
            :title="displayedTitle"
            :roast-lines="displayedRoastLines"
            :feedback="displayedFeedback"
            :statuses="displayedStatuses"
            :error="displayedError"
            :is-preview="isPreviewActive"
            :evidence="displayedEvidence"
            :metrics="displayedMetrics"
          />
        </div>

        <RebrandAnalysisStage tone="light" />
      </RebrandChapterShell>

      <RebrandChapterShell edge="flat" tone="paper" class="z-30">
        <div class="mx-auto px-4 pb-36 max-w-[88rem] lg:px-10 sm:px-6 lg:pb-52">
          <div class="mb-20 py-5 border-b-[1px] border-basalt-950/16 border-solid grid grid-cols-[1fr_auto] items-center">
            <p class="text-[10px] text-basalt-500 tracking-[0.16em] font-meta uppercase">
              02 / Product structure
            </p>
            <p class="text-[10px] text-signal-red-700 tracking-[0.16em] font-meta uppercase">
              Receipts over decoration
            </p>
          </div>
          <div class="mb-20 gap-8 grid lg:mb-28 lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <p class="text-xs text-signal-red-500 tracking-[0.2em] font-meta uppercase">
              Product structure
            </p>
            <h2 class="text-[clamp(3.3rem,6.5vw,6.75rem)] text-basalt-950 leading-[0.86] tracking-[-0.065em] font-display max-w-[10ch]">
              Three jobs. Nothing ornamental.
            </h2>
          </div>
          <div class="border-t-[1px] border-basalt-950/16 border-solid">
            <article v-for="(module, index) in evidenceModules" :key="module.title" class="py-12 border-b-[1px] border-basalt-950/16 border-solid gap-10 grid lg:py-20 lg:gap-16 lg:grid-cols-[5rem_0.65fr_1.1fr]">
              <p class="text-xs text-basalt-500 tracking-[0.12em] font-meta pt-1">
                {{ String(index + 1).padStart(2, '0') }}
              </p>

              <div>
                <p class="text-[10px] text-signal-red-500 tracking-[0.18em] font-meta uppercase">
                  {{ module.label }}
                </p>
                <h3 class="text-3xl text-basalt-950 leading-[0.95] tracking-[-0.045em] font-display mt-6 max-w-[13ch] sm:text-5xl">
                  {{ module.title }}
                </h3>
              </div>

              <div v-if="module.id === 'receipt'" class="p-5 border-[1px] border-explore-border border-solid bg-explore-ink max-w-[38rem] lg:ml-auto sm:p-7">
                <div class="flex gap-4 items-center justify-between">
                  <p class="text-[10px] text-explore-muted tracking-[0.12em] font-meta uppercase">
                    refactor-final-v2.ts
                  </p>
                  <span class="text-[10px] text-signal-red-400 font-meta">+84 / -3</span>
                </div>
                <p class="text-sm text-explore-copy/85 leading-relaxed font-mono mt-7 sm:text-base">
                  + export const createUniversalManagerFactory =
                </p>
                <p class="text-sm text-signal-red-400 leading-relaxed font-mono mt-1 sm:text-base">
                  + () =&gt; createManager(createManagerConfig())
                </p>
                <p class="text-xs text-explore-muted font-body mt-6">
                  Exhibit A: abstraction as witness protection.
                </p>
              </div>

              <div v-else-if="module.id === 'heat'" class="pt-3 w-full lg:ml-auto lg:max-w-[38rem]">
                <div class="flex items-end justify-between">
                  <span class="text-[10px] text-basalt-500 tracking-[0.14em] font-meta uppercase">Rare</span>
                  <span class="text-[10px] text-signal-red-700 tracking-[0.14em] font-meta uppercase">Burned</span>
                </div>
                <div class="mt-5 rounded-full bg-basalt-950/16 h-2 relative">
                  <div class="rounded-full h-full w-[68%] from-signal-red-900 to-signal-red-500 bg-gradient-to-r" />
                  <span class="border-4 border-bone-50 rounded-full border-solid bg-signal-red-500 h-6 w-6 shadow-[0_0_24px_var(--explore-glow)] left-[64%] top-1/2 absolute -translate-y-1/2" />
                </div>
                <p class="text-sm text-basalt-800 font-body mt-5">
                  Medium rare. Sharp, still useful.
                </p>
              </div>

              <div v-else class="max-w-[42rem] lg:ml-auto">
                <p class="text-2xl text-basalt-800 leading-tight tracking-[-0.03em] font-accent italic sm:text-4xl">
                  “Your test suite has excellent coverage of code nobody should have written.”
                </p>
                <div class="mt-6 flex gap-3">
                  <span class="text-[9px] text-basalt-600 tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-basalt-950/18 border-solid uppercase">Share receipt</span>
                  <span class="text-[9px] text-basalt-600 tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-basalt-950/18 border-solid uppercase">06 commits cited</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </RebrandChapterShell>

      <RebrandChapterShell edge="rise-right" tone="black" class="min-h-[28rem] z-40 overflow-hidden">
        <div class="rounded-full bg-signal-red-900/14 h-[34rem] w-[82vw] pointer-events-none bottom-[-26rem] right-[-24vw] absolute blur-[140px]" />
        <div class="rounded-full bg-signal-red-950/22 h-[24rem] w-[54vw] pointer-events-none bottom-[-20rem] left-[-20vw] absolute blur-[120px]" />

        <footer class="mx-auto px-4 pb-12 pt-64 flex gap-4 max-w-[88rem] items-center justify-between relative z-20 lg:px-10 sm:px-6 sm:pt-72">
          <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
            Grillme / homepage exploration 02
          </p>
          <NuxtLink to="/test-1" class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase hover:text-explore-copy">
            View direction 01
          </NuxtLink>
        </footer>
      </RebrandChapterShell>
    </main>

    <PrismGradientDevPanel
      :settings="prismSettings"
      :defaults="testPagePrismDefaults"
      :is-panel-open="isPrismPanelOpen"
      :is-panel-visible="isPrismPanelVisible"
      @update:settings="applyPrismSettings"
      @toggle="togglePrismPanel"
      @reset="resetPrismSettings"
      @close="closePrismPanel"
      @show="showPrismPanel"
    />
  </div>
</template>
