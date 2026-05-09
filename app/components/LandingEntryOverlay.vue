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
    <main class="px-6 flex flex-col h-full w-full items-center justify-center relative md:px-12">
      <div class="flex flex-col max-w-[78rem] w-full relative z-10 md:items-center">
        <header>
          <div class="gap-y-8 grid">
            <h1
              id="entry-overlay-title"
              class="text-[clamp(2.2rem,6.7vw,6.2rem)] text-on-background leading-[0.9] tracking-[-0.012em] font-black font-display text-center uppercase"
            >
              <span
                v-for="line in headlineLines"
                :key="line"
                class="block"
              >
                {{ line }}
              </span>
            </h1>
            <p class="text-xs text-on-surface-variant tracking-[0.12em] font-medium font-mono mx-auto text-center max-w-3xl uppercase md:text-sm">
              System Check: Unhandled feelings may occur.
              <br>
              Proceed at own risk.
            </p>
          </div>
        </header>

        <div class="mt-10 gap-x-3 grid grid-cols-2 md:gap-x-4">
          <button
            type="button"
            data-testid="entry-overlay-continue"
            class="text-sm text-black tracking-[0.01em] font-display font-semibold px-8 rounded-full bg-primary h-12 w-[10.75rem] uppercase transition-all duration-300 hover:bg-primary-container hover:shadow-[0_0_22px_rgba(255,51,0,0.2)] active:scale-95"
            @click="handleContinue"
          >
            Grill me
          </button>
          <button
            type="button"
            data-testid="entry-overlay-not-today"
            class="text-sm text-on-surface tracking-[0.01em] font-display font-semibold px-8 border border-neutral-700 rounded-full bg-transparent h-12 w-[10.75rem] uppercase transition-all duration-300 hover:border-on-surface-variant hover:bg-surface/40 active:scale-95"
            @click="handleNotToday"
          >
            Not today
          </button>
        </div>
      </div>
    </main>
  </section>
</template>
