<script setup lang="ts">
import type { PrismGradientSettings, PrismGradientShaderSettings } from '~/models/prism-gradient'
import { computed, nextTick, onMounted, ref } from 'vue'
import { NuxtLink } from '#components'
import { useHead, useSeoMeta } from '#imports'
import LandingTopNav from '~/components/LandingTopNav.vue'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import RebrandAnalysisStage from '~/components/rebrand/RebrandAnalysisStage.vue'
import RebrandLiveRoastStage from '~/components/rebrand/RebrandLiveRoastStage.vue'
import RebrandResultDirections from '~/components/rebrand/RebrandResultDirections.vue'
import RebrandResultReveal from '~/components/rebrand/RebrandResultReveal.vue'
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
  { id: 'receipt', label: 'Receipts, not vibes', title: 'Every punchline keeps the commit that earned it.', className: 'lg:col-span-7 lg:min-h-[34rem]' },
  { id: 'heat', label: 'Controlled heat', title: 'Choose how useful the emotional damage should be.', className: 'lg:col-span-5 lg:min-h-[34rem]' },
  { id: 'artifact', label: 'Built to land', title: 'The result becomes the page, not another terminal row.', className: 'lg:col-span-12 lg:min-h-[28rem]' },
] as const
</script>

<template>
  <div data-testid="rebrand-test-2-root" class="text-explore-copy bg-black min-h-screen selection:text-explore-copy selection:bg-signal-red-700">
    <LandingTopNav variant="signal" />

    <main class="relative overflow-clip">
      <div class="bg-black relative overflow-hidden isolate">
        <div class="pointer-events-none [mask-image:linear-gradient(to_bottom,#000_0%,#000_50%,rgba(0,0,0,0.96)_62%,rgba(0,0,0,0.46)_82%,transparent_100%)] inset-0 absolute z-0">
          <PrismGradientBackground
            class="inset-0 absolute"
            :speed="prismSettings.speed"
            :ambient-opacity="prismSettings.ambientOpacity"
            :radius="prismSettings.radius"
            :noise="{ opacity: prismSettings.noiseOpacity, scale: prismSettings.noiseScale }"
            :colors="{ dark: prismSettings.darkColors, light: prismSettings.lightColors }"
            :shader="prismShaderSettings"
          />
          <div class="bg-black/20 inset-0 absolute" />
        </div>
        <div class="pointer-events-none inset-0 absolute z-[1] from-transparent to-black/75 via-transparent bg-gradient-to-br" />

        <div class="relative z-10">
          <section class="mx-auto px-4 pb-16 pt-36 flex flex-col max-w-[88rem] min-h-[80dvh] justify-end lg:px-10 sm:px-6 lg:pb-20 sm:pt-44">
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

        <div class="h-48 pointer-events-none inset-x-0 bottom-0 absolute z-20 from-transparent to-black via-black/80 bg-gradient-to-b" />
      </div>

      <section class="bg-black relative z-10">
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
          />
        </div>

        <RebrandAnalysisStage />

        <div class="mx-auto px-4 pb-32 max-w-[88rem] lg:px-10 sm:px-6 lg:pb-48">
          <div class="mb-14 gap-8 grid lg:grid-cols-[0.65fr_1.35fr] lg:items-end">
            <p class="text-xs text-signal-red-500 tracking-[0.2em] font-meta uppercase">
              Product structure
            </p>
            <h2 class="text-[clamp(3.3rem,7vw,7.5rem)] text-explore-copy leading-[0.86] tracking-[-0.065em] font-display max-w-[10ch]">
              Three jobs. Nothing ornamental.
            </h2>
          </div>
          <div class="gap-5 grid lg:grid-cols-12">
            <article v-for="module in evidenceModules" :key="module.title" class="p-7 border-[1px] border-explore-border rounded-[2rem] border-solid bg-white/[0.025] flex flex-col min-h-[22rem] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] justify-between sm:p-10 sm:rounded-[2.75rem]" :class="module.className">
              <div v-if="module.id === 'receipt'" class="p-5 border-[1px] border-explore-border rounded-2xl border-solid bg-black/55 max-w-[34rem] shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-6">
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

              <div v-else-if="module.id === 'heat'" class="w-full">
                <div class="flex items-end justify-between">
                  <span class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">Rare</span>
                  <span class="text-[10px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">Burned</span>
                </div>
                <div class="mt-5 rounded-full bg-white/8 h-2 relative">
                  <div class="rounded-full h-full w-[68%] from-signal-red-900 to-signal-red-500 bg-gradient-to-r" />
                  <span class="border-4 border-black rounded-full border-solid bg-signal-red-500 h-6 w-6 shadow-[0_0_24px_var(--explore-glow)] left-[64%] top-1/2 absolute -translate-y-1/2" />
                </div>
                <p class="text-sm text-explore-copy font-body mt-5">
                  Medium rare. Sharp, still useful.
                </p>
              </div>

              <div v-else class="max-w-[55rem]">
                <p class="text-2xl text-explore-copy/85 leading-tight tracking-[-0.03em] font-accent italic sm:text-4xl">
                  “Your test suite has excellent coverage of code nobody should have written.”
                </p>
                <div class="mt-6 flex gap-3">
                  <span class="text-[9px] text-explore-muted tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-explore-border rounded-lg border-solid uppercase">Share receipt</span>
                  <span class="text-[9px] text-explore-muted tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-explore-border rounded-lg border-solid uppercase">06 commits cited</span>
                </div>
              </div>

              <div class="mt-14">
                <p class="text-[10px] text-signal-red-500 tracking-[0.18em] font-meta uppercase">
                  {{ module.label }}
                </p>
                <h3 class="text-3xl text-explore-copy leading-[0.95] tracking-[-0.045em] font-display mt-6 max-w-[15ch] sm:text-5xl">
                  {{ module.title }}
                </h3>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="bg-black relative overflow-hidden isolate">
        <div class="pointer-events-none inset-0 absolute from-black to-black via-signal-red-950/55 bg-gradient-to-br" />
        <div class="rounded-full bg-signal-red-900/20 h-[28rem] w-[68vw] pointer-events-none right-[-18vw] top-[16rem] absolute blur-[100px]" />
        <div class="h-80 pointer-events-none [clip-path:polygon(0_0,100%_0,100%_82%,0_100%)] relative z-10 from-black to-transparent via-black/88 bg-gradient-to-b" />

        <RebrandResultReveal class="relative z-10" />

        <RebrandResultDirections class="relative z-10" />

        <footer class="mx-auto px-4 py-10 flex gap-4 max-w-[88rem] items-center justify-between relative z-10 lg:px-10 sm:px-6">
          <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
            Grillme / homepage exploration 02
          </p>
          <NuxtLink to="/test-1" class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase hover:text-explore-copy">
            View direction 01
          </NuxtLink>
        </footer>
      </section>
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
