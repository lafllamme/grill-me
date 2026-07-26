<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useLandingEntryOverlayRevealChrome } from '~/composables/useLandingEntryOverlay'
import { createCampfireAudioPlayer } from '~/utils/campfire-audio'

/**
 * Emits:
 * - `overlayContinue`: user accepts and wants to enter the landing flow.
 * - `overlayDecline`: user declines and wants to leave the app.
 */
const emit = defineEmits<{
  overlayContinue: []
  overlayDecline: []
}>()

const isEntryOverlayRevealChrome = useLandingEntryOverlayRevealChrome()
const isHydrated = ref(false)
const phase = ref<'dark' | 'question' | 'choices'>('dark')
const exitStage = ref<'idle' | 'content' | 'veil' | 'no_hold' | 'gone'>('idle')
const prefersReducedMotion = ref(false)

let questionTimer: ReturnType<typeof setTimeout> | null = null
let choicesTimer: ReturnType<typeof setTimeout> | null = null
let contentExitTimer: ReturnType<typeof setTimeout> | null = null
let actionTimer: ReturnType<typeof setTimeout> | null = null
const campfireAudioPlayer = createCampfireAudioPlayer()

onMounted(() => {
  isEntryOverlayRevealChrome.value = false
  isHydrated.value = true
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion.value) {
    phase.value = 'choices'
    return
  }

  questionTimer = setTimeout(() => {
    phase.value = 'question'
  }, 900)

  choicesTimer = setTimeout(() => {
    phase.value = 'choices'
  }, 2200)
})

onBeforeUnmount(() => {
  if (questionTimer)
    clearTimeout(questionTimer)
  if (choicesTimer)
    clearTimeout(choicesTimer)
  if (contentExitTimer)
    clearTimeout(contentExitTimer)
  if (actionTimer)
    clearTimeout(actionTimer)

  campfireAudioPlayer.releaseHandle()
})

/**
 * Triggered by the primary CTA. The parent decides how to dismiss the overlay.
 */
function handleContinue(): void {
  runExit('yes')
}

/**
 * Triggered by the secondary CTA. The parent decides where to navigate.
 */
function handleNotToday(): void {
  runExit('no')
}

async function playCampfireAudio(): Promise<void> {
  await campfireAudioPlayer.play()
}

function runExit(choice: 'yes' | 'no'): void {
  if (!isHydrated.value || exitStage.value !== 'idle')
    return

  exitStage.value = 'content'

  const contentToVeilDelay = prefersReducedMotion.value ? 1 : 480

  if (choice === 'yes') {
    void playCampfireAudio()
    const actionDelay = prefersReducedMotion.value ? 1 : 1100

    contentExitTimer = setTimeout(() => {
      exitStage.value = 'veil'
      isEntryOverlayRevealChrome.value = true
    }, contentToVeilDelay)

    actionTimer = setTimeout(() => {
      exitStage.value = 'gone'
      emit('overlayContinue')
    }, actionDelay)
    return
  }

  const noHoldDelay = prefersReducedMotion.value ? 1 : 760
  const noRedirectDelay = prefersReducedMotion.value ? 1 : 3200
  isEntryOverlayRevealChrome.value = false

  contentExitTimer = setTimeout(() => {
    exitStage.value = 'no_hold'
  }, noHoldDelay)

  actionTimer = setTimeout(async () => {
    emit('overlayDecline')
  }, noRedirectDelay)
}

function isExitActionBlocked(): boolean {
  return !isHydrated.value || exitStage.value !== 'idle'
}

function isContentExiting(): boolean {
  return exitStage.value === 'content' || exitStage.value === 'veil'
}

function overlayStyle(): CSSProperties {
  const isVeilStage = exitStage.value === 'veil'
  return {
    opacity: isVeilStage ? 0 : 1,
    transition: isVeilStage ? 'opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    pointerEvents: exitStage.value !== 'idle' ? 'none' : 'auto',
  }
}

function contentStyle(): CSSProperties {
  const exiting = isContentExiting() || exitStage.value === 'no_hold'
  return {
    transform: exiting ? 'translateY(-28px)' : 'translateY(0)',
    opacity: exiting ? 0 : 1,
    filter: exiting ? 'blur(12px)' : 'blur(0px)',
    transition: exiting
      ? 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease, filter 0.55s ease'
      : 'none',
  }
}

function questionStyle(): CSSProperties {
  return {
    opacity: phase.value === 'dark' ? 0 : 1,
    transition: 'opacity 1.2s ease',
  }
}

function choicesStyle(): CSSProperties {
  return {
    opacity: phase.value === 'choices' ? 1 : 0,
    transition: 'opacity 0.6s ease 0.4s',
  }
}

function cornerLabelStyle(): CSSProperties {
  return {
    opacity: phase.value === 'choices' ? 1 : 0,
    transition: 'opacity 1s ease 1s',
  }
}

function noHoldTextStyle(): CSSProperties {
  return {
    opacity: exitStage.value === 'no_hold' ? 1 : 0,
    transform: exitStage.value === 'no_hold' ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 620ms ease, transform 620ms ease',
    pointerEvents: 'none',
  }
}
</script>

<template>
  <section
    v-if="exitStage !== 'gone'"
    class="text-explore-copy overscroll-none bg-black flex select-none inset-0 fixed z-60 overflow-hidden touch-none"
    aria-labelledby="entry-overlay-title"
    aria-modal="true"
    role="dialog"
    data-testid="entry-overlay-dialog"
    :style="overlayStyle()"
  >
    <svg class="opacity-[0.016] h-full w-full pointer-events-none inset-0 absolute" aria-hidden="true">
      <filter id="entry-overlay-grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#entry-overlay-grain-filter)" />
    </svg>

    <div class="px-6 py-12 flex w-full items-center justify-center relative min-h-svh">
      <div class="flex flex-col items-center" :style="contentStyle()">
        <div class="text-center" :style="questionStyle()">
          <h1
            id="entry-overlay-title"
            class="text-[clamp(3.1rem,9.2vw,9rem)] text-explore-copy leading-[0.82] tracking-[-0.065em] font-display font-semibold mx-auto max-w-[10ch]"
          >
            Are you sure
            <br>
            you want to
            <br>
            <span class="text-signal-red-500">enter ?</span>
          </h1>
        </div>

        <div
          class="my-12 bg-basalt-800 h-14 w-px sm:my-16"
          :style="choicesStyle()"
          aria-hidden="true"
        />

        <div class="flex gap-14 items-center sm:gap-24" :style="choicesStyle()">
          <button
            type="button"
            data-testid="entry-overlay-continue"
            :disabled="isExitActionBlocked()"
            class="group text-[clamp(1.5rem,3.2vw,2.8rem)] text-basalt-200 leading-none tracking-[-0.035em] font-display font-semibold px-2 bg-transparent min-h-11 transition-colors relative focus-visible:text-explore-copy hover:text-explore-copy focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-6 disabled:opacity-50"
            @click="handleContinue"
          >
            YES
            <span class="bg-signal-red-500 h-px pointer-events-none origin-left scale-x-0 transition-transform duration-300 inset-x-2 absolute group-focus-visible:scale-x-100 group-hover:scale-x-100 -bottom-2" />
          </button>

          <button
            type="button"
            data-testid="entry-overlay-not-today"
            :disabled="isExitActionBlocked()"
            class="group text-[clamp(1.5rem,3.2vw,2.8rem)] text-signal-red-800 leading-none tracking-[-0.035em] font-display font-semibold px-2 bg-transparent min-h-11 transition-colors relative focus-visible:text-signal-red-600 hover:text-signal-red-600 focus-visible:outline-2 focus-visible:outline-signal-red-500 focus-visible:outline-offset-6 disabled:opacity-50"
            @click="handleNotToday"
          >
            NO
            <span class="bg-signal-red-700 h-px pointer-events-none origin-left scale-x-0 transition-transform duration-300 inset-x-2 absolute group-focus-visible:scale-x-100 group-hover:scale-x-100 -bottom-2" />
          </button>
        </div>
      </div>

      <div class="px-6 text-center flex items-center inset-0 justify-center absolute" :style="noHoldTextStyle()">
        <div>
          <p class="text-[clamp(2.6rem,6.5vw,6rem)] text-explore-copy leading-[0.88] tracking-[-0.055em] font-display font-semibold">
            Decision recorded.
            <br>
            <span class="text-signal-red-500">Confidence remains questionable.</span>
          </p>
          <p class="text-[10px] text-basalt-400 tracking-[0.16em] font-meta mt-7 uppercase">
            Opening the evidence room anyway
          </p>
        </div>
      </div>
    </div>

    <span
      class="text-[10px] text-basalt-500 tracking-[0.16em] font-meta uppercase bottom-6 right-7 absolute sm:bottom-8 sm:right-9"
      :style="exitStage === 'no_hold' ? { opacity: 0, transition: 'opacity 200ms ease' } : cornerLabelStyle()"
    >
      Grillme / Session entry
    </span>
  </section>
</template>
