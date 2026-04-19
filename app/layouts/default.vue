<script setup lang="ts">
const INTRO_FADE_MS = 1200
const INTRO_FADE_DELAY_MS = 140
const INTRO_FADE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'
type PixelBlastVariant = 'square' | 'circle' | 'triangle' | 'diamond'

const isCurtainVisible = ref(true)
const isCurtainMounted = ref(true)
const selectedPattern = ref<PixelBlastVariant>('square')

function handlePixelBlastReady() {
  isCurtainVisible.value = false
}

function handleCurtainTransitionEnd() {
  if (!isCurtainVisible.value)
    isCurtainMounted.value = false
}
</script>

<template>
  <div class="text-on-surface bg-black min-h-screen selection:text-on-surface selection:bg-primary">
    <div class="pointer-events-none inset-0 fixed z-0">
      <div class="bg-black inset-0 absolute" />
      <PixelBlastBackground
        class-name="inset-0 absolute opacity-100"
        :transparent="false"
        color="#FF5633"
        :variant="selectedPattern"
        @ready="handlePixelBlastReady"
      />
      <div
        v-if="isCurtainMounted"
        aria-hidden="true"
        class="bg-black transition-opacity ease-out inset-0 absolute"
        :class="isCurtainVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'"
        :style="{
          transitionDuration: `${INTRO_FADE_MS}ms`,
          transitionDelay: `${INTRO_FADE_DELAY_MS}ms`,
          transitionTimingFunction: INTRO_FADE_EASING,
        }"
        @transitionend="handleCurtainTransitionEnd"
      />
    </div>

    <div class="relative z-10">
      <LandingTopNav />
      <main>
        <slot />
      </main>
    </div>

    <!-- Pattern menu intentionally disabled for now.
    <div class="pointer-events-none right-4 top-20 fixed z-30">
      <div class="p-2 border border-zinc-800/80 rounded-xl bg-black/70 pointer-events-auto backdrop-blur-md">
        <div class="text-[10px] text-zinc-400 tracking-[0.12em] px-2 pb-2 uppercase">
          Pattern
        </div>
        <div class="flex gap-2">
          <button
            v-for="variant in PATTERN_VARIANTS"
            :key="variant"
            type="button"
            class="text-[11px] tracking-wide px-2 py-1 border rounded-md uppercase transition-colors duration-200"
            :class="variant === selectedPattern
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-zinc-700 bg-zinc-950/70 text-zinc-300 hover:border-zinc-500 hover:text-zinc-100'"
            @click="selectedPattern = variant"
          >
            {{ variant }}
          </button>
        </div>
      </div>
    </div>
    -->
  </div>
</template>
