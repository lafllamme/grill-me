<script setup lang="ts">
import type { PrismGradientSettings, PrismGradientShaderSettings } from '~/models/prism-gradient'
import { computed, nextTick, onMounted, ref } from 'vue'
import { navigateTo } from '#app'
import { useHead, useSeoMeta } from '#imports'
import LandingEntryOverlay from '~/components/LandingEntryOverlay.vue'
import LandingTopNav from '~/components/LandingTopNav.vue'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import RebrandChapterShell from '~/components/rebrand/RebrandChapterShell.vue'
import RebrandFuelAbout from '~/components/rebrand/RebrandFuelAbout.vue'
import RebrandFuelArchive from '~/components/rebrand/RebrandFuelArchive.vue'
import RebrandFuelCta from '~/components/rebrand/RebrandFuelCta.vue'
import RebrandFuelEditorial from '~/components/rebrand/RebrandFuelEditorial.vue'
import RebrandFuelFooter from '~/components/rebrand/RebrandFuelFooter.vue'
import RebrandFuelLevels from '~/components/rebrand/RebrandFuelLevels.vue'
import RebrandFuelPipeline from '~/components/rebrand/RebrandFuelPipeline.vue'
import RebrandFuelPortfolio from '~/components/rebrand/RebrandFuelPortfolio.vue'
import RebrandFuelStats from '~/components/rebrand/RebrandFuelStats.vue'
import RebrandFuelVerdict from '~/components/rebrand/RebrandFuelVerdict.vue'
import RebrandTargetStage from '~/components/rebrand/RebrandTargetStage.vue'
import { useFuelRoastViewModel } from '~/composables/useFuelRoastViewModel'
import { useLandingEntryOverlay } from '~/composables/useLandingEntryOverlay'
import { usePrismGradientSettings } from '~/composables/usePrismGradientSettings'
import { useRoast } from '~/composables/useRoast'
import { useRoastPreview } from '~/composables/useRoastPreview'
import { ROAST_INTENSITY_LEVELS } from '~/constants/roastIntensity'
import { PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS } from '~/models/prism-gradient'
import { useRoastStore } from '~/stores/roastStore'
import { createEntryOverlayActions } from '~/utils/landing-entry-overlay'

definePageMeta({ layout: false })

useHead({ title: 'Grillme — Evidence-backed code roasts' })
useSeoMeta({ description: 'A Fuel-inspired Grillme longform concept built around public evidence, progressive roast states, and editorial chapters.' })

const isEntryOverlayVisible = useLandingEntryOverlay()
const { onContinue, onNotToday } = createEntryOverlayActions({
  isOverlayVisible: isEntryOverlayVisible,
  navigateTo,
})

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
  storageKey: 'grillme:prism-gradient:homepage:settings:v1',
  panelOpenStorageKey: 'grillme:prism-gradient:homepage:panel-open:v1',
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
const selectedIntensity = computed({
  get: () => roastStore.roastIntensity,
  set: value => roastStore.setRoastIntensity(value),
})
const selectedIntensityLabel = computed(() =>
  ROAST_INTENSITY_LEVELS.find(level => level.value === roastStore.roastIntensity)?.label ?? 'Medium Rare',
)
const fuelRoast = useFuelRoastViewModel({
  username: () => roastStore.trimmedUsername,
  title: displayedTitle,
  roastLines: displayedRoastLines,
  feedback: displayedFeedback,
  statuses: displayedStatuses,
  evidence: displayedEvidence,
  metrics: displayedMetrics,
  intensityLabel: selectedIntensityLabel,
  isPending: isRoastPending,
  isStreaming: displayedStreaming,
  error: displayedError,
  isActive: isLiveRoastActive,
})

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

function updateUsername(value: string) {
  roastStore.setUsername(value)
}
</script>

<template>
  <div>
    <LandingEntryOverlay
      v-if="isEntryOverlayVisible"
      @overlay-continue="onContinue"
      @overlay-decline="onNotToday"
    />

    <div
      data-testid="homepage-root"
      class="text-explore-copy bg-black min-h-screen selection:text-explore-copy selection:bg-signal-red-700"
      :aria-hidden="isEntryOverlayVisible"
      :inert="isEntryOverlayVisible || undefined"
    >
      <LandingTopNav v-if="!isEntryOverlayVisible" variant="signal" surface="dark" />

      <main class="relative overflow-clip">
        <section class="bg-black relative z-0 isolate">
          <div class="h-[100svh] pointer-events-none top-0 sticky overflow-hidden">
            <div class="[animation:hero-scroll-drift_linear_both] inset-x-[-5%] bottom-[-180px] top-[-5%] absolute hero-scroll-parallax motion-reduce:[animation:none]">
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
          <RebrandFuelAbout />
          <div ref="liveRoastStage">
            <RebrandFuelPortfolio
              :model="fuelRoast"
              :is-active="isLiveRoastActive"
              :is-preview="isPreviewActive"
              :error="displayedError"
            />
          </div>
        </RebrandChapterShell>

        <RebrandChapterShell edge="rise-right" tone="black" class="z-30">
          <RebrandFuelPipeline />
        </RebrandChapterShell>

        <RebrandChapterShell edge="rise-right" tone="paper" class="z-40">
          <RebrandFuelLevels v-model="selectedIntensity" />
          <RebrandFuelVerdict :model="fuelRoast" />
          <RebrandFuelArchive :model="fuelRoast" />
          <RebrandFuelCta
            :username="roastStore.githubUsername"
            :is-pending="isRoastPending"
            @update:username="updateUsername"
            @submit="startRoast"
          />
          <RebrandFuelStats :model="fuelRoast" />
          <RebrandFuelEditorial />
        </RebrandChapterShell>

        <RebrandChapterShell edge="rise-right" edge-profile="footer" tone="black" class="z-50">
          <RebrandFuelFooter />
        </RebrandChapterShell>
      </main>

      <PrismGradientDevPanel
        v-if="!isEntryOverlayVisible"
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
  </div>
</template>
