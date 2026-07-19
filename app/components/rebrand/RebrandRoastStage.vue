<script setup lang="ts">
import { computed, ref } from 'vue'

const intensityLevels = ['Rare', 'Medium rare', 'Burned'] as const
type IntensityLevel = typeof intensityLevels[number]

const username = ref('lafllamme')
const selectedIntensity = ref<IntensityLevel>('Medium rare')

const statusCopy = computed(() => {
  if (selectedIntensity.value === 'Rare')
    return 'Constructive pressure'
  if (selectedIntensity.value === 'Burned')
    return 'No ego survives'
  return 'Sharp, still useful'
})
</script>

<template>
  <section id="roast-stage" class="mx-auto px-4 max-w-[88rem] lg:px-10 sm:px-6">
    <div class="p-2 border-[1px] border-explore-border rounded-[2.25rem] border-solid bg-explore-panel/75 shadow-[0_32px_120px_var(--explore-shadow)] backdrop-blur-2xl sm:rounded-[3rem]">
      <div class="border-[1px] border-explore-border rounded-[1.75rem] border-solid bg-explore-ink-soft/88 overflow-hidden sm:rounded-[2.5rem]">
        <div class="px-5 py-4 border-b-[1px] border-explore-border border-solid flex gap-4 items-center justify-between sm:px-7">
          <div class="flex gap-3 items-center">
            <span class="rounded-full bg-explore-signal-bright h-2.5 w-2.5 shadow-[0_0_18px_var(--explore-glow)]" />
            <p class="text-[10px] text-explore-muted tracking-[0.18em] font-meta uppercase sm:text-xs">
              live roast chamber
            </p>
          </div>
          <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase sm:text-xs">
            encrypted / streaming
          </p>
        </div>

        <div class="grid lg:grid-cols-[0.78fr_1.22fr]">
          <div class="p-5 border-b-[1px] border-explore-border border-solid lg:p-8 lg:border-b-0 lg:border-r-[1px]">
            <p class="text-[10px] text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
              source target
            </p>
            <label for="research-username" class="text-2xl text-explore-copy tracking-[-0.035em] font-display mt-4 block sm:text-3xl">
              GitHub username
            </label>
            <div class="mt-5 p-1.5 border-[1px] border-explore-border-high rounded-2xl border-solid bg-black/30 flex gap-2 transition-colors items-center focus-within:border-explore-signal-bright/70">
              <span class="text-explore-muted font-meta pl-3">@</span>
              <input
                id="research-username"
                v-model="username"
                class="text-base text-explore-copy font-body outline-none bg-transparent flex-1 min-w-0"
                autocomplete="off"
                spellcheck="false"
              >
              <button class="text-xs text-explore-copy tracking-[0.08em] font-label px-5 py-3 rounded-xl bg-explore-signal uppercase transition-all duration-200 hover:text-explore-ink hover:bg-explore-signal-bright active:scale-[0.98]">
                Grill
              </button>
            </div>

            <div class="mt-8">
              <div class="flex gap-4 items-end justify-between">
                <div>
                  <p class="text-[10px] text-explore-muted tracking-[0.18em] font-meta uppercase">
                    roast intensity
                  </p>
                  <p class="text-sm text-explore-copy font-body mt-2">
                    {{ statusCopy }}
                  </p>
                </div>
                <span class="text-xs text-explore-signal-bright font-meta">02 / 03</span>
              </div>
              <div class="mt-4 p-1 border-[1px] border-explore-border rounded-2xl border-solid bg-black/25 grid grid-cols-3">
                <button
                  v-for="level in intensityLevels"
                  :key="level"
                  class="text-[10px] tracking-[0.08em] font-meta px-2 py-3 rounded-xl uppercase transition-all duration-200 sm:text-xs"
                  :class="selectedIntensity === level ? 'text-explore-copy bg-explore-panel-high shadow-[0_8px_24px_var(--explore-shadow)]' : 'text-explore-muted hover:text-explore-copy'"
                  @click="selectedIntensity = level"
                >
                  {{ level }}
                </button>
              </div>
            </div>

            <div class="mt-8 pt-5 border-t-[1px] border-explore-border border-solid grid grid-cols-3">
              <div>
                <p class="text-lg text-explore-copy font-display">
                  26
                </p>
                <p class="text-[9px] text-explore-muted tracking-[0.12em] font-meta mt-1 uppercase">
                  commits
                </p>
              </div>
              <div>
                <p class="text-lg text-explore-copy font-display">
                  14
                </p>
                <p class="text-[9px] text-explore-muted tracking-[0.12em] font-meta mt-1 uppercase">
                  files
                </p>
              </div>
              <div>
                <p class="text-lg text-explore-copy font-display">
                  1.8s
                </p>
                <p class="text-[9px] text-explore-muted tracking-[0.12em] font-meta mt-1 uppercase">
                  first byte
                </p>
              </div>
            </div>
          </div>

          <div class="p-5 min-h-[31rem] relative sm:p-8">
            <div class="bg-[radial-gradient(circle_at_85%_15%,var(--explore-glow),transparent_38%)] pointer-events-none inset-0 absolute" />
            <div class="relative">
              <div class="flex gap-4 items-start justify-between">
                <div>
                  <p class="text-[10px] text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
                    analysis stream
                  </p>
                  <h2 class="text-3xl text-explore-copy leading-[0.95] tracking-[-0.045em] font-display mt-4 sm:text-5xl">
                    @{{ username || 'someone' }}, your abstractions need adult supervision.
                  </h2>
                </div>
                <span class="text-[10px] text-explore-muted tracking-[0.12em] font-meta px-3 py-1.5 border-[1px] border-explore-border rounded-full border-solid bg-black/20 uppercase">live</span>
              </div>

              <div class="mt-9 space-y-3">
                <div class="p-4 border-[1px] border-explore-border rounded-2xl border-solid bg-black/22 flex gap-4 items-start">
                  <span class="text-explore-signal-bright font-meta">01</span>
                  <div>
                    <p class="text-sm text-explore-copy leading-relaxed font-mono">
                      Fetching public commit history...
                    </p>
                    <p class="text-xs text-explore-muted font-body mt-1">
                      Six repositories found. Regret density above average.
                    </p>
                  </div>
                </div>
                <div class="p-4 border-[1px] border-explore-border rounded-2xl border-solid bg-black/22 flex gap-4 items-start">
                  <span class="text-explore-signal-bright font-meta">02</span>
                  <div>
                    <p class="text-sm text-explore-copy leading-relaxed font-mono">
                      Reading `refactor-final-v2.ts`...
                    </p>
                    <p class="text-xs text-explore-muted font-body mt-1">
                      The filename has already testified against you.
                    </p>
                  </div>
                </div>
                <div class="p-4 border-[1px] border-explore-signal/35 rounded-2xl border-solid bg-explore-signal-deep/20 flex gap-4 shadow-[0_14px_38px_var(--explore-shadow)] items-start">
                  <span class="text-explore-signal-bright font-meta">03</span>
                  <div>
                    <p class="text-sm text-explore-copy leading-relaxed font-mono">
                      Composing evidence-backed roast
                    </p>
                    <div class="mt-3 rounded-full bg-white/8 h-1.5 overflow-hidden">
                      <div class="rounded-full bg-explore-signal-bright h-full w-3/4 shadow-[0_0_18px_var(--explore-glow)] animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              <blockquote class="text-lg text-explore-copy/90 leading-relaxed font-accent mt-8 max-w-[44rem] italic sm:text-xl">
                “You did not remove complexity. You moved it somewhere with fewer witnesses.”
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
