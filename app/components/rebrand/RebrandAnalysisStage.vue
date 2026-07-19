<script setup lang="ts">
const analysisSteps = [
  { state: 'complete', label: 'Reading the public trail', detail: 'Repositories and recent commits found' },
  { state: 'complete', label: 'Selecting the evidence', detail: 'The suspicious decisions have been isolated' },
  { state: 'active', label: 'Writing the verdict', detail: 'Turning technical debt into emotional debt' },
] as const
</script>

<template>
  <section id="how-it-works" class="mx-auto px-4 py-24 max-w-[88rem] lg:px-10 lg:py-40 sm:px-6">
    <div class="gap-14 grid lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
      <div>
        <p class="text-xs text-signal-red-500 tracking-[0.2em] font-meta uppercase">
          Analysis in motion
        </p>
        <h2 class="text-[clamp(3.5rem,7vw,7.5rem)] text-explore-copy leading-[0.86] tracking-[-0.065em] font-display mt-7 max-w-[8ch]">
          The wait should say something.
        </h2>
        <p class="text-base text-explore-muted leading-relaxed font-body mt-7 max-w-[34rem] sm:text-lg">
          No fake percentage. Each streamed event explains what the agent has actually finished while the final roast is still forming.
        </p>
      </div>

      <div class="p-6 border-[1px] border-explore-border rounded-[2rem] border-solid bg-black/55 min-h-[34rem] shadow-[0_32px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl lg:p-12 sm:p-10 sm:rounded-[2.75rem]">
        <div class="flex items-center justify-between">
          <p class="text-[10px] text-explore-muted tracking-[0.18em] font-meta uppercase">
            @lafllamme / live
          </p>
          <span class="text-[10px] text-signal-red-400 tracking-[0.14em] font-meta uppercase">streaming</span>
        </div>
        <div class="mt-16 space-y-8">
          <div v-for="(step, index) in analysisSteps" :key="step.label" class="gap-5 grid grid-cols-[auto_1fr]">
            <div class="flex flex-col items-center">
              <span class="rounded-full h-3 w-3" :class="step.state === 'active' ? 'bg-signal-red-500 shadow-[0_0_24px_var(--explore-glow)] animate-pulse' : 'bg-explore-copy/50'" />
              <span v-if="index < analysisSteps.length - 1" class="bg-white/10 h-16 w-px" />
            </div>
            <div class="pb-7">
              <p class="text-xl text-explore-copy tracking-[-0.025em] font-display sm:text-2xl">
                {{ step.label }}
              </p>
              <p class="text-sm text-explore-muted font-body mt-2">
                {{ step.detail }}
              </p>
            </div>
          </div>
        </div>
        <p class="text-lg text-explore-copy/80 leading-relaxed font-accent mt-8 max-w-[34rem] italic sm:text-xl">
          “The filename `final-final-v2.ts` has entered the evidence locker.”
        </p>
      </div>
    </div>
  </section>
</template>
