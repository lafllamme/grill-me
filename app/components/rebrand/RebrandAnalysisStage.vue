<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  tone?: 'dark' | 'light'
}>(), {
  tone: 'dark',
})

const isLight = computed(() => props.tone === 'light')

const analysisSteps = [
  { state: 'complete', label: 'Reading the public trail', detail: 'Repositories and recent commits found' },
  { state: 'complete', label: 'Selecting the evidence', detail: 'The suspicious decisions have been isolated' },
  { state: 'active', label: 'Writing the verdict', detail: 'Turning technical debt into emotional debt' },
] as const
</script>

<template>
  <section id="how-it-works" class="mx-auto px-4 pb-36 pt-28 max-w-[88rem] lg:px-10 sm:px-6 lg:pb-52 lg:pt-44">
    <div class="gap-16 grid lg:gap-24 lg:grid-cols-[0.7fr_1.3fr]">
      <div>
        <p class="text-xs text-signal-red-500 tracking-[0.2em] font-meta uppercase">
          Analysis in motion
        </p>
        <h2 class="text-[clamp(3.25rem,6vw,6.5rem)] leading-[0.86] tracking-[-0.065em] font-display mt-7 max-w-[8ch]" :class="isLight ? 'text-basalt-950' : 'text-explore-copy'">
          The wait should say something.
        </h2>
        <p class="text-base leading-relaxed font-body mt-7 max-w-[34rem] sm:text-lg" :class="isLight ? 'text-basalt-600' : 'text-explore-muted'">
          No fake percentage. Each streamed event explains what the agent has actually finished while the final roast is still forming.
        </p>
      </div>

      <div class="border-t-[1px] border-solid" :class="isLight ? 'border-basalt-950/16' : 'border-white/12'">
        <div class="py-5 border-b-[1px] border-solid flex items-center justify-between" :class="isLight ? 'border-basalt-950/16' : 'border-white/12'">
          <p class="text-[10px] tracking-[0.18em] font-meta uppercase" :class="isLight ? 'text-basalt-500' : 'text-explore-muted'">
            @lafllamme / live
          </p>
          <span class="text-[10px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">streaming</span>
        </div>
        <div>
          <div v-for="(step, index) in analysisSteps" :key="step.label" class="py-8 border-b-[1px] border-solid gap-6 grid grid-cols-[auto_minmax(0,1fr)] sm:py-10 sm:grid-cols-[5rem_minmax(0,1fr)]" :class="isLight ? 'border-basalt-950/16' : 'border-white/12'">
            <div class="flex gap-3 items-center sm:items-start">
              <span class="text-[10px] tracking-[0.12em] font-meta pt-1" :class="isLight ? 'text-basalt-500' : 'text-explore-muted'">{{ String(index + 1).padStart(2, '0') }}</span>
              <span class="rounded-full shrink-0 h-2 w-2" :class="step.state === 'active' ? 'bg-signal-red-500 shadow-[0_0_24px_var(--explore-glow)] animate-pulse' : isLight ? 'bg-basalt-950/35' : 'bg-explore-copy/40'" />
            </div>
            <div>
              <p class="text-xl tracking-[-0.025em] font-display sm:text-3xl" :class="isLight ? 'text-basalt-950' : 'text-explore-copy'">
                {{ step.label }}
              </p>
              <p class="text-sm leading-relaxed font-body mt-2 sm:text-base" :class="isLight ? 'text-basalt-600' : 'text-explore-muted'">
                {{ step.detail }}
              </p>
            </div>
          </div>
        </div>
        <p class="text-lg leading-relaxed font-accent mt-10 max-w-[38rem] italic sm:text-2xl" :class="isLight ? 'text-basalt-800' : 'text-explore-copy/80'">
          “The filename `final-final-v2.ts` has entered the evidence locker.”
        </p>
      </div>
    </div>
  </section>
</template>
