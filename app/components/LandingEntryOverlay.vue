<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ENTRY_OVERLAY_NOT_TODAY_URL } from '~/utils/landing-entry-overlay'

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
const isHydrated = ref(false)
const phase = ref<'dark' | 'question' | 'choices'>('dark')

let questionTimer: ReturnType<typeof setTimeout> | null = null
let choicesTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  isHydrated.value = true
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
})

/**
 * Triggered by the primary CTA. The parent decides how to dismiss the overlay.
 */
function handleContinue(): void {
  isEntryOverlayVisible.value = false
  emit('overlayContinue')
}

/**
 * Triggered by the secondary CTA. The parent decides where to navigate.
 */
async function handleNotToday(): Promise<void> {
  emit('overlayDecline')
  await navigateTo(ENTRY_OVERLAY_NOT_TODAY_URL, { external: true })
}
</script>

<template>
  <section
    class="bg-black flex flex-col select-none items-center inset-0 justify-center fixed z-60 overflow-hidden"
    aria-labelledby="entry-overlay-title"
    aria-modal="true"
    role="dialog"
    data-testid="entry-overlay-dialog"
  >
    <svg class="entry-overlay-grain h-full w-full pointer-events-none inset-0 absolute" aria-hidden="true">
      <filter id="entry-overlay-grain-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#entry-overlay-grain-filter)" />
    </svg>

    <div
      class="px-6 text-center"
      :style="{
        opacity: phase === 'dark' ? 0 : 1,
        transition: 'opacity 1.2s ease',
      }"
    >
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
      :style="{
        opacity: phase === 'choices' ? 1 : 0,
        transition: 'opacity 0.6s ease 0.2s',
      }"
      aria-hidden="true"
    />

    <div
      class="flex gap-24"
      :style="{
        opacity: phase === 'choices' ? 1 : 0,
        transition: 'opacity 0.6s ease 0.4s',
      }"
    >
      <button
        type="button"
        data-testid="entry-overlay-continue"
        :disabled="!isHydrated"
        class="entry-option group text-on-surface"
        @click="handleContinue"
      >
        YES
        <span class="entry-option-underline bg-primary" />
      </button>

      <button
        type="button"
        data-testid="entry-overlay-not-today"
        :disabled="!isHydrated"
        class="entry-option group text-primary/55 hover:text-primary/80"
        @click="handleNotToday"
      >
        NO
        <span class="entry-option-underline bg-primary/65" />
      </button>
    </div>

    <span
      class="text-[10px] text-on-surface-variant/50 tracking-widest font-mono uppercase bottom-6 right-8 fixed"
      :style="{ opacity: phase === 'choices' ? 1 : 0, transition: 'opacity 1s ease 1s' }"
    >
        Access Request
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
