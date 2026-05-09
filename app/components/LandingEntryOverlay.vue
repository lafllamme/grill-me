<script setup lang="ts">
/**
 * Emits:
 * - `overlayContinue`: user accepts and wants to enter the landing flow.
 * - `overlayDecline`: user declines and wants to leave the app.
 */
const emit = defineEmits<{
  overlayContinue: []
  overlayDecline: []
}>()

const headlineLines = [
  'Warning:',
  'This code review may',
  'damage your ego.',
  'Do you want to',
  'continue?',
] as const

/**
 * Triggered by the primary CTA. The parent decides how to dismiss the overlay.
 */
function handleContinue(): void {
  emit('overlayContinue')
}

/**
 * Triggered by the secondary CTA. The parent decides where to navigate.
 */
function handleNotToday(): void {
  emit('overlayDecline')
}
</script>

<template>
  <section
    class="bg-black inset-0 fixed z-60 overflow-hidden"
    aria-labelledby="entry-overlay-title"
    aria-modal="true"
    role="dialog"
    data-testid="entry-overlay-dialog"
  >
    <main class="flex h-full w-full items-center justify-center -mt-12 md:-mt-4">
      <div class="text-center flex flex-col w-full items-center relative z-10 md:max-w-[72rem]">
        <h1
          id="entry-overlay-title"
          class="text-[clamp(1.9rem,6.7vw,6.2rem)] text-on-background leading-[0.9] tracking-[-0.012em] font-black font-display text-nowrap uppercase"
        >
          <span
            v-for="(line, idx) in headlineLines"
            :key="line"
            class="block"
            :class="idx === 0 && 'underline underline-offset-2 md:underline-offset-4 decoration-orange-600'"
          >
            {{ line }}
          </span>
        </h1>

        <div class="mt-8 flex flex-col gap-4 max-w-[42rem] w-full items-center">
          <p class="text-xs text-on-surface-variant tracking-[0.12em] font-medium font-mono max-w-3xl uppercase md:text-sm">
            System Check: Unhandled feelings may occur.
            <br>
            Proceed at own risk.
          </p>

          <div class="gap-3 grid grid-cols-1 w-full <md:px-8 sm:gap-4 sm:grid-cols-2 md:max-w-[32rem]">
            <button
              type="button"
              data-testid="entry-overlay-continue"
              class="text-sm text-black tracking-[0.01em] font-display font-semibold px-6 rounded-full bg-primary h-11 w-full uppercase transition-all duration-300 hover:bg-primary-container active:scale-95"
              @click="handleContinue"
            >
              Grill me
            </button>
            <button
              type="button"
              data-testid="entry-overlay-not-today"
              class="text-sm text-on-surface tracking-[0.01em] font-display font-semibold px-6 border border-neutral-700 rounded-full bg-transparent h-11 w-full uppercase transition-all duration-300 hover:border-on-surface-variant hover:bg-surface/40 active:scale-95"
              @click="handleNotToday"
            >
              Not today
            </button>
          </div>
        </div>
      </div>
    </main>
  </section>
</template>
