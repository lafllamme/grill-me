<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ fixture: RoastExplorerFixture, replayKey: number }>()
const activeSlide = ref(0)
watch(() => props.replayKey, () => {
  activeSlide.value = 0
})
const totalSlides = computed(() => props.fixture.roastLines.length + 1)
const isGradeSlide = computed(() => activeSlide.value === props.fixture.roastLines.length)
function next() {
  activeSlide.value = (activeSlide.value + 1) % totalSlides.value
}
function previous() {
  activeSlide.value = (activeSlide.value - 1 + totalSlides.value) % totalSlides.value
}
</script>

<template>
  <div class="p-5 bg-surface-container-low lg:p-16 sm:p-10">
    <div class="mx-auto gap-10 grid max-w-5xl lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
      <div>
        <p class="text-[10px] text-primary tracking-[0.2em] font-meta uppercase">
          Roast reel
        </p><h2 class="text-[clamp(2.4rem,6vw,6rem)] text-on-surface leading-[0.86] tracking-[-0.07em] font-display mt-5">
          One burn at a time.
        </h2><p class="text-sm text-on-surface-variant leading-relaxed font-body mt-6 max-w-[34ch]">
          Tap through the evidence-backed roast. The verdict stays readable; the drama stays contained.
        </p><div class="mt-8 flex gap-3">
          <button type="button" aria-label="Previous roast slide" class="text-on-surface-variant font-meta border-[1px] border-divider rounded-full h-11 w-11 hover:text-primary hover:border-primary" @click="previous">
            ←
          </button><button type="button" aria-label="Next roast slide" class="text-primary font-meta border-[1px] border-primary rounded-full h-11 w-11 hover:text-background hover:bg-primary" @click="next">
            →
          </button>
        </div>
      </div>
      <div class="mx-auto max-w-2xl w-full">
        <div class="mb-5 flex gap-1 h-1" aria-label="Roast progress">
          <span v-for="slide in totalSlides" :key="slide" class="flex-1 h-full transition-colors duration-300" :class="slide - 1 === activeSlide ? 'bg-primary' : 'bg-surface-container-high'" />
        </div>
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out motion-reduce:transition-none"
          enter-from-class="opacity-0 translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in motion-reduce:transition-none"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <article :key="activeSlide" class="p-7 border-[1px] border-divider rounded-[1.5rem] border-solid bg-surface-container flex flex-col min-h-[25rem] justify-between sm:p-12 sm:min-h-[30rem]">
            <div class="flex gap-4 items-center justify-between">
              <span class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">@{{ fixture.username }}</span><span class="text-[10px] text-primary tracking-[0.16em] font-meta uppercase">{{ String(activeSlide + 1).padStart(2, '0') }} / {{ String(totalSlides).padStart(2, '0') }}</span>
            </div>
            <div v-if="!isGradeSlide">
              <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
                Round {{ String(activeSlide + 1).padStart(2, '0') }}
              </p><p class="text-[clamp(1.8rem,4vw,3.5rem)] text-on-surface leading-[1] tracking-[-0.05em] font-body mt-5">
                {{ fixture.roastLines[activeSlide] }}
              </p>
            </div>
            <div v-else>
              <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
                Final verdict
              </p><p class="text-[clamp(5rem,13vw,10rem)] text-primary leading-[0.75] tracking-[-0.1em] font-display mt-6">
                {{ fixture.metrics.grade }}
              </p><p class="text-xl text-on-surface font-body mt-6">
                {{ fixture.title }}
              </p>
            </div>
            <div class="pt-5 border-t-[1px] border-divider border-solid flex gap-4 items-end justify-between">
              <div>
                <p class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
                  Stink {{ fixture.metrics.stinkScore }}
                </p><p class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta mt-1 uppercase">
                  Spaghetti {{ fixture.metrics.spaghettiIndex }}
                </p>
              </div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">tap to continue →</span>
            </div>
          </article>
        </Transition>
      </div>
    </div>
  </div>
</template>
