<script setup lang="ts">
import type { PrismGradientSettings, PrismGradientShaderSettings } from '~/models/prism-gradient'
import { useMouseInElement, usePreferredReducedMotion, useTimeoutFn } from '@vueuse/core'
import { motion } from 'motion-v'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { navigateTo } from '#app'
import { useHead, useSeoMeta } from '#imports'
import { WORDMARK_FONTS } from '~/components/grillme-wordmark-fonts'
import LandingEntryOverlay from '~/components/LandingEntryOverlay.vue'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import PrismGradientDevPanel from '~/components/PrismGradientDevPanel.vue'
import RebrandChapterShell from '~/components/rebrand/RebrandChapterShell.vue'
import RebrandFuelAbout from '~/components/rebrand/RebrandFuelAbout.vue'
import RebrandFuelArchive from '~/components/rebrand/RebrandFuelArchive.vue'
import RebrandFuelCta from '~/components/rebrand/RebrandFuelCta.vue'
import RebrandFuelEditorial from '~/components/rebrand/RebrandFuelEditorial.vue'
import RebrandFuelFeaturedReceipt from '~/components/rebrand/RebrandFuelFeaturedReceipt.vue'
import RebrandFuelFooter from '~/components/rebrand/RebrandFuelFooter.vue'
import RebrandFuelHeroNav from '~/components/rebrand/RebrandFuelHeroNav.vue'
import RebrandFuelLevels from '~/components/rebrand/RebrandFuelLevels.vue'
import RebrandFuelPipeline from '~/components/rebrand/RebrandFuelPipeline.vue'
import RebrandFuelPortfolio from '~/components/rebrand/RebrandFuelPortfolio.vue'
import RebrandFuelStats from '~/components/rebrand/RebrandFuelStats.vue'
import RebrandTargetStage from '~/components/rebrand/RebrandTargetStage.vue'
import { useFuelRoastViewModel } from '~/composables/useFuelRoastViewModel'
import { useLandingEntryOverlay } from '~/composables/useLandingEntryOverlay'
import { usePrismGradientSettings } from '~/composables/usePrismGradientSettings'
import { useRoast } from '~/composables/useRoast'
import { useRoastPreview } from '~/composables/useRoastPreview'
import { useSmoothScroll } from '~/composables/useSmoothScroll'
import { ROAST_INTENSITY_LEVELS } from '~/constants/roastIntensity'
import { AGGREGATE_STATS, PUBLIC_ROAST_RECEIPTS } from '~/data/rebrand-fuel'
import { PRISM_GRADIENT_DEFAULT_SHADER_SETTINGS } from '~/models/prism-gradient'
import { useRoastStore } from '~/stores/roastStore'
import { createEntryOverlayActions } from '~/utils/landing-entry-overlay'

definePageMeta({ layout: false })

useHead({ title: 'Grillme — Evidence-backed code roasts' })
useSeoMeta({ description: 'A Fuel-inspired Grillme longform concept built around public evidence, progressive roast states, and editorial chapters.' })

const isEntryOverlayVisible = useLandingEntryOverlay()
const route = useRoute()
const activeWordmarkFont = computed(() => {
  const raw = route.query.font
  const fontId = typeof raw === 'string' ? raw : 'jakarta'
  return WORDMARK_FONTS[fontId] ?? WORDMARK_FONTS.jakarta!
})
const reducedMotion = usePreferredReducedMotion()
const heroEntryInitial = computed(() => reducedMotion.value === 'reduce' ? false : 'hidden')
const heroCopyItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}
const heroCopyLineVariants = {
  hidden: { y: '125%' },
  visible: { y: '0%' },
}
const heroWordmarkVariants = {
  hidden: { opacity: 0, y: 170 },
  visible: { opacity: 1, y: 0 },
}
const heroBackgroundVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}
const heroCopyItemTransition = { duration: 0.68, ease: [0.22, 1, 0.36, 1] as const }
const heroCopyLineTransition = { duration: 0.7, ease: [0.44, 0, 0.34, 0.98] as const }
const heroWordmarkTransition = { duration: 1.35, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 }
const heroBackgroundTransition = { duration: 1.1, ease: [0.4, 0, 0.2, 1] as const, delay: 0.55 }
const heroBackgroundFallbackDelay = 1500
const timeRulerMarkerCount = 11
const timeRulerRef = ref<HTMLElement | null>(null)
const { elementX: timeRulerElementX, elementWidth: timeRulerElementWidth, isOutside: isTimeRulerOutside } = useMouseInElement(timeRulerRef, { touch: false })
const heroCopyLines = [
  'Public code leaves a trail of decisions,',
  'shortcuts become evidence.',
  'Grillme keeps receipts.',
] as const
const timeRulerMarkers = computed(() => {
  const defaultMarkers = Array.from({ length: timeRulerMarkerCount }, (_, index) => ({
    height: index === 5 ? 40 : 10,
    opacity: 0.5,
  }))

  if (isTimeRulerOutside.value || reducedMotion.value === 'reduce' || timeRulerElementWidth.value <= 0)
    return defaultMarkers

  const step = timeRulerElementWidth.value / (timeRulerMarkerCount - 1)
  const activeIndex = Math.round(Math.min(Math.max(timeRulerElementX.value, 0), timeRulerElementWidth.value) / step)

  const hoverMarkers = defaultMarkers.map(() => ({
    height: 10,
    opacity: 0.5,
  }))

  return hoverMarkers.map((marker, index) => {
    const distance = Math.abs(index - activeIndex)

    if (distance === 0)
      return { height: 40, opacity: 0.85 }
    if (distance === 1)
      return { height: 22, opacity: 0.7 }
    if (distance === 2)
      return { height: 15, opacity: 0.6 }

    return marker
  })
})
const isHeroBackgroundMounted = ref(false)
const isHeroBackgroundVisible = ref(false)
let heroBackgroundRevealFrame: number | null = null
const { start: startHeroBackgroundFallback, stop: stopHeroBackgroundFallback } = useTimeoutFn(() => {
  isHeroBackgroundVisible.value = true
}, heroBackgroundFallbackDelay, { immediate: false })
const heroAnimationState = computed(() => {
  if (reducedMotion.value === 'reduce')
    return 'visible'

  return isEntryOverlayVisible.value ? 'hidden' : 'visible'
})
const heroBackgroundAnimationState = computed(() => {
  if (reducedMotion.value === 'reduce')
    return 'visible'

  return isHeroBackgroundVisible.value ? 'visible' : 'hidden'
})
const { onContinue, onNotToday } = createEntryOverlayActions({
  isOverlayVisible: isEntryOverlayVisible,
  navigateTo,
})
const {
  lenis,
  scrollTo,
  scrollToTop,
  start: startSmoothScroll,
  stop: stopSmoothScroll,
} = useSmoothScroll()

async function revealHomepage() {
  scrollToTop({ force: true, immediate: true })
  onContinue()
  await nextTick()
  startSmoothScroll()
}

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
const shouldShowAggregateStats = computed(() => import.meta.dev || isPreviewActive.value)
const featuredReceipt = PUBLIC_ROAST_RECEIPTS[0]!
const archiveReceipts = PUBLIC_ROAST_RECEIPTS.slice(1)
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

function scheduleHeroBackgroundReveal() {
  if (isEntryOverlayVisible.value || isHeroBackgroundMounted.value || !import.meta.client)
    return

  heroBackgroundRevealFrame = window.requestAnimationFrame(() => {
    isHeroBackgroundMounted.value = true
    startHeroBackgroundFallback()
    heroBackgroundRevealFrame = null
  })
}

function revealHeroBackground() {
  isHeroBackgroundVisible.value = true
  stopHeroBackgroundFallback()
}

function cancelHeroBackgroundRevealFrame() {
  if (!import.meta.client || heroBackgroundRevealFrame === null)
    return

  window.cancelAnimationFrame(heroBackgroundRevealFrame)
  heroBackgroundRevealFrame = null
}

onMounted(() => {
  isPageInteractive.value = true
  scheduleHeroBackgroundReveal()
})

watch([isEntryOverlayVisible, lenis], ([isVisible, lenisInstance]) => {
  if (!lenisInstance)
    return

  if (isVisible) {
    stopSmoothScroll()
    scrollToTop({ force: true, immediate: true })
    return
  }

  startSmoothScroll()
}, { immediate: true })

watch(isEntryOverlayVisible, (isVisible) => {
  if (!isVisible)
    scheduleHeroBackgroundReveal()
})

onBeforeUnmount(() => {
  cancelHeroBackgroundRevealFrame()
  stopHeroBackgroundFallback()
  startSmoothScroll()
})

async function scrollToLiveStage() {
  await nextTick()
  if (liveRoastStage.value)
    scrollTo(liveRoastStage.value)
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
      @overlay-continue="revealHomepage"
      @overlay-decline="onNotToday"
    />

    <div
      data-testid="homepage-root"
      class="text-explore-copy bg-black selection:text-explore-copy selection:bg-signal-red-700"
      :class="isEntryOverlayVisible ? 'fixed inset-0 overflow-hidden' : 'relative min-h-screen'"
      :aria-hidden="isEntryOverlayVisible"
      :inert="isEntryOverlayVisible || undefined"
    >
      <RebrandFuelHeroNav v-if="!isEntryOverlayVisible" />

      <main class="relative overflow-clip">
        <section class="bg-black relative z-0 isolate">
          <div class="h-[100svh] pointer-events-none top-0 sticky overflow-hidden">
            <motion.div
              aria-hidden="true"
              class="inset-0 absolute"
              :initial="heroEntryInitial"
              :animate="heroBackgroundAnimationState"
              :variants="heroBackgroundVariants"
              :transition="heroBackgroundTransition"
            >
              <div class="inset-x-[-5%] bottom-[-180px] top-[-5%] absolute fuel-hero-background motion-reduce:[animation:none]">
                <PrismGradientBackground
                  v-if="isHeroBackgroundMounted"
                  class="scale-[1.05] inset-0 absolute motion-reduce:scale-100"
                  :speed="prismSettings.speed"
                  :ambient-opacity="prismSettings.ambientOpacity"
                  :radius="prismSettings.radius"
                  :noise="{ opacity: prismSettings.noiseOpacity, scale: prismSettings.noiseScale }"
                  :colors="{ dark: prismSettings.darkColors, light: prismSettings.lightColors }"
                  :shader="prismShaderSettings"
                  @error="revealHeroBackground"
                  @ready="revealHeroBackground"
                />
              </div>
            </motion.div>
            <div class="bg-black/8 inset-0 absolute" />
            <div class="inset-0 absolute from-transparent to-black/25 via-transparent bg-gradient-to-br" />
            <div class="h-[24svh] inset-x-0 bottom-0 absolute from-transparent to-black/8 bg-gradient-to-b" />
          </div>

          <div class="relative z-10 fuel-hero-exit -mt-[100svh] motion-reduce:[animation:none]">
            <section
              id="top"
              class="px-[clamp(1.5rem,1.5vw,2rem)] pb-5 pt-24 flex flex-col min-h-[100svh] w-full justify-between relative lg:pb-7 sm:pt-28"
            >
              <div
                class="fuel-hero-copy pt-[13svh] flex flex-1 items-start md:pt-[11.25svh]"
              >
                <div class="w-fit max-w-full">
                  <p class="text-[clamp(1rem,1.25vw,1.25rem)] text-explore-copy leading-[1.26] tracking-[-0.035em] font-body font-normal">
                    <span
                      v-for="(line, lineIndex) in heroCopyLines"
                      :key="line"
                      class="py-[0.12em] block overflow-hidden -my-[0.12em]"
                    >
                      <motion.span
                        class="align-top inline-block whitespace-pre-wrap sm:whitespace-nowrap"
                        :class="lineIndex === heroCopyLines.length - 1 ? 'text-explore-copy/52' : ''"
                        :initial="heroEntryInitial"
                        :animate="heroAnimationState"
                        :variants="heroCopyLineVariants"
                        :transition="{ ...heroCopyLineTransition, delay: 1.1 + lineIndex * 0.12 }"
                      >
                        {{ line }}
                      </motion.span>
                    </span>
                  </p>
                  <motion.a
                    href="#target"
                    class="group text-base text-explore-copy font-body font-normal mt-10 pb-3 border-b-[1px] border-explore-copy/85 border-solid flex w-full transition-colors duration-300 ease-out items-center justify-between hover:text-explore-copy/75 hover:border-explore-copy/70"
                    :initial="heroEntryInitial"
                    :animate="heroAnimationState"
                    :variants="heroCopyItemVariants"
                    :transition="{ ...heroCopyItemTransition, delay: 1.6 }"
                  >
                    Grill now
                    <span aria-hidden="true" class="border-t-[1px] border-r-[1px] border-explore-copy/85 h-2.5 w-2.5 border-solid transition-colors duration-300 ease-out group-hover:border-explore-copy/70" />
                  </motion.a>
                </div>
              </div>

              <div class="mt-[1.1rem]">
                <motion.h1
                  aria-label="Grill me"
                  class="text-[clamp(4.65rem,16.8vw,21rem)] text-explore-copy leading-[0.64] pb-[0.04em] text-right whitespace-nowrap origin-right ml-auto w-full max-w-none"
                  :initial="heroEntryInitial"
                  :animate="heroAnimationState"
                  :variants="heroWordmarkVariants"
                  :transition="heroWordmarkTransition"
                  :style="{
                    fontFamily: activeWordmarkFont.family,
                    fontWeight: activeWordmarkFont.weight,
                    letterSpacing: activeWordmarkFont.letterSpacing,
                  }"
                >
                  GRILL ME
                </motion.h1>
              </div>

              <motion.div
                class="left-[clamp(1.5rem,1.5vw,2rem)] bottom-6 absolute h-[46px] flex items-end"
                :initial="heroEntryInitial"
                :animate="heroAnimationState"
                :variants="heroCopyItemVariants"
                :transition="{ ...heroCopyItemTransition, delay: 2.35 }"
                :style="{
                  fontFamily: activeWordmarkFont.family,
                  fontWeight: 400,
                  letterSpacing: '-0.02em',
                }"
              >
                <p class="text-base text-explore-copy/80 leading-[1.26] font-body w-[56px] shrink-0">
                  © 2026
                </p>
                <div ref="timeRulerRef" class="ml-2.5 flex gap-[9px] h-[46px] shrink-0 pb-[6px] box-border items-end cursor-ew-resize">
                  <span
                    v-for="(marker, markerIndex) in timeRulerMarkers"
                    :key="markerIndex"
                    class="bg-explore-copy w-[1px] transition-[height,opacity] duration-300 ease-out"
                    :style="{ height: `${marker.height}px`, opacity: marker.opacity }"
                  />
                </div>
                <p class="text-base text-explore-copy/80 leading-[1.26] font-body w-[20px] shrink-0 ml-2.5">
                  19'
                </p>
              </motion.div>
            </section>

            <div class="pb-[clamp(6rem,10vw,10rem)]">
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
          <div id="evidence" ref="liveRoastStage" class="scroll-mt-20">
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
          <RebrandFuelFeaturedReceipt :receipt="featuredReceipt" />
          <RebrandFuelArchive :receipts="archiveReceipts" />
          <RebrandFuelCta
            :username="roastStore.githubUsername"
            :is-pending="isRoastPending"
            @update:username="updateUsername"
            @submit="startRoast"
          />
          <RebrandFuelStats v-if="shouldShowAggregateStats" :stats="AGGREGATE_STATS" />
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
