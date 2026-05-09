<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * Emits:
 * - `overlayContinue`: user accepts and wants to enter the landing flow.
 * - `overlayDecline`: user declines and wants to leave the app.
 */
const emit = defineEmits<{
  overlayContinue: []
  overlayDecline: []
}>()

const isEntryOverlayVisible = useLandingEntryOverlay()
const isEntryOverlayRevealChrome = useLandingEntryOverlayRevealChrome()
const isHydrated = ref(false)
const phase = ref<'dark' | 'question' | 'choices'>('dark')
const exitStage = ref<'idle' | 'content' | 'veil' | 'no_hold' | 'gone'>('idle')
const localChoice = ref<'yes' | 'no' | null>(null)
const prefersReducedMotion = ref(false)

let questionTimer: ReturnType<typeof setTimeout> | null = null
let choicesTimer: ReturnType<typeof setTimeout> | null = null
let contentExitTimer: ReturnType<typeof setTimeout> | null = null
let actionTimer: ReturnType<typeof setTimeout> | null = null

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

function runExit(choice: 'yes' | 'no'): void {
  if (!isHydrated.value || exitStage.value !== 'idle')
    return

  localChoice.value = choice
  exitStage.value = 'content'

  const contentToVeilDelay = prefersReducedMotion.value ? 1 : 480

  if (choice === 'yes') {
    const actionDelay = prefersReducedMotion.value ? 1 : 1100

    contentExitTimer = setTimeout(() => {
      exitStage.value = 'veil'
      isEntryOverlayRevealChrome.value = true
    }, contentToVeilDelay)

    actionTimer = setTimeout(() => {
      exitStage.value = 'gone'
      isEntryOverlayVisible.value = false
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

function dividerStyle(): CSSProperties {
  return {
    opacity: phase.value === 'choices' ? 1 : 0,
    transition: 'opacity 0.6s ease 0.2s',
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
    class="bg-black flex flex-col select-none items-center inset-0 justify-center fixed z-60 overflow-hidden"
    aria-labelledby="entry-overlay-title"
    aria-modal="true"
    role="dialog"
    data-testid="entry-overlay-dialog"
    :style="overlayStyle()"
  >
    <svg class="entry-overlay-grain h-full w-full pointer-events-none inset-0 absolute" aria-hidden="true">
      <filter id="entry-overlay-grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#entry-overlay-grain-filter)" />
    </svg>

    <div class="flex min-h-[24rem] w-full items-center justify-center relative">
      <div class="flex flex-col items-center" :style="contentStyle()">
        <div class="px-6 text-center" :style="questionStyle()">
          <h1
            id="entry-overlay-title"
            class="text-on-surface leading-[0.9] tracking-[-0.03em] font-black font-display mx-auto max-w-[13ch]"
            :style="{ fontSize: 'clamp(2.8rem, 10vw, 9rem)' }"
          >
            Are you sure
            <br>
            you wanna
            <br>
            <span class="text-primary">enter ?</span>
          </h1>
        </div>

        <div
          class="mb-12 mt-16 bg-stone-800 h-12 w-px"
          :style="dividerStyle()"
          aria-hidden="true"
        />

        <div class="flex gap-24" :style="choicesStyle()">
          <button
            type="button"
            data-testid="entry-overlay-continue"
            :disabled="isExitActionBlocked()"
            class="entry-option group text-on-surface"
            @click="handleContinue"
          >
            YES
            <span class="entry-option-underline bg-primary" />
          </button>

          <button
            type="button"
            data-testid="entry-overlay-not-today"
            :disabled="isExitActionBlocked()"
            class="entry-option group text-primary/55 hover:text-primary/80"
            @click="handleNotToday"
          >
            NO
            <span class="entry-option-underline bg-primary/65" />
          </button>
        </div>
      </div>

      <div class="px-6 text-center flex items-center inset-0 justify-center absolute" :style="noHoldTextStyle()">
        <div>
          <p
            class="text-on-surface leading-[0.9] tracking-[-0.03em] font-black font-display"
            :style="{ fontSize: 'clamp(2rem, 6.8vw, 5.4rem)' }"
          >
            Decision recorded.
            <br>
            <span class="text-primary/80">Confidence level: low.</span>
          </p>
          <p class="text-xs text-on-surface-variant/70 tracking-[0.14em] font-mono mt-6 uppercase">
            Sending you somewhere more comfortable...
          </p>
        </div>
      </div>
    </div>

    <span
      class="text-[10px] text-on-surface-variant/50 tracking-widest font-mono uppercase bottom-6 right-8 fixed"
      :style="exitStage === 'no_hold' ? { opacity: 0, transition: 'opacity 200ms ease' } : cornerLabelStyle()"
    >
      T3 / Mist
      <span v-if="localChoice" class="text-primary"> · {{ localChoice.toUpperCase() }}</span>
    </span>
  </section>
</template>

<style scoped>
.entry-option {
  position: relative;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: clamp(1.4rem, 3.5vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
  text-transform: uppercase;
  min-height: 44px;
  min-width: 44px;
  padding: 4px 6px;
  transition: color 0.5s ease;
  touch-action: manipulation;
}

.entry-option:focus-visible {
  outline: 2px solid color-mix(in srgb, #FF3300 65%, #fff 35%);
  outline-offset: 0.35rem;
  border-radius: 0.35rem;
}

.entry-option:active {
  transform: scale(0.92);
}

.entry-option:disabled {
  cursor: default;
}

.entry-option-underline {
  position: absolute;
  left: 0;
  bottom: -0.25rem;
  width: 100%;
  height: 1px;
  transform-origin: left;
  transform: scaleX(0);
  transition: transform 300ms;
}

.group:hover .entry-option-underline,
.group:focus-visible .entry-option-underline {
  transform: scaleX(1);
}

@media (prefers-reduced-motion: reduce) {
  .entry-option,
  .entry-option-underline {
    transition-duration: 1ms;
  }
}

.entry-overlay-grain {
  opacity: 0.018;
}

@media (max-width: 768px) {
  .entry-overlay-grain {
    opacity: 0.012;
  }
}
</style>
