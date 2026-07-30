<script setup lang="ts">
import type { RoastIntensityValue } from '~/constants/roastIntensity'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const selectedIntensity = defineModel<RoastIntensityValue>({ required: true })

const levels = [
  {
    value: 1 as const,
    label: 'Rare',
    tone: 'Dry, restrained, still safe for stand-up.',
    evidence: 'A compact pass over the strongest recent commits.',
    result: 'A concise verdict with actionable technical feedback.',
  },
  {
    value: 2 as const,
    label: 'Medium Rare',
    tone: 'Sharp enough to share. Useful enough to keep.',
    evidence: 'A balanced evidence window across commits, files, and diffs.',
    result: 'A specific roast with a clear technical recovery plan.',
  },
  {
    value: 4 as const,
    label: 'Burned to Crisp',
    tone: 'Maximum heat. No emotional warranty.',
    evidence: 'The broadest safe evidence window the prompt budget allows.',
    result: 'A longer verdict with more angles, receipts, and fixes.',
  },
] as const
</script>

<template>
  <section id="levels" class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] min-h-[112svh] scroll-mt-20 lg:px-10 sm:px-6 lg:pb-44">
    <RebrandChapterMeta index="04" title="Roast levels" />

    <div class="pt-24 gap-4 grid lg:grid-cols-3">
      <button
        v-for="(level, index) in levels"
        :key="level.label"
        type="button"
        class="p-7 text-left border-[1px] border-basalt-950/16 rounded-[24px] border-solid flex flex-col min-h-[31rem] transition-[transform,background-color,color] duration-300 justify-between fuel-view-reveal sm:p-9 motion-reduce:[animation:none]"
        :class="[
          selectedIntensity === level.value ? 'bg-basalt-950 text-explore-copy' : 'bg-basalt-50 text-basalt-950 hover:bg-bone-100',
          index === 1 ? 'lg:translate-y-12' : index === 2 ? 'lg:translate-y-24' : '',
        ]"
        @click="selectedIntensity = level.value"
      >
        <div>
          <div class="flex gap-6 items-start justify-between">
            <p class="text-2xl tracking-[-0.02em] font-body">
              {{ level.label }}
            </p>
            <span class="text-xs font-mono opacity-60">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <p class="text-base leading-relaxed font-body mt-7 max-w-[20rem]" :class="selectedIntensity === level.value ? 'text-explore-muted' : 'text-basalt-600'">
            {{ level.tone }}
          </p>
        </div>
        <div class="pt-6 border-t-[1px] border-solid space-y-7" :class="selectedIntensity === level.value ? 'border-white/18' : 'border-basalt-950/18'">
          <div>
            <p class="text-[10px] tracking-[0.14em] font-meta uppercase" :class="selectedIntensity === level.value ? 'text-signal-red-400' : 'text-signal-red-700'">
              Evidence depth
            </p>
            <p class="text-sm leading-relaxed font-body mt-2" :class="selectedIntensity === level.value ? 'text-explore-muted' : 'text-basalt-600'">
              {{ level.evidence }}
            </p>
          </div>
          <div>
            <p class="text-[10px] tracking-[0.14em] font-meta uppercase" :class="selectedIntensity === level.value ? 'text-signal-red-400' : 'text-signal-red-700'">
              Expected result
            </p>
            <p class="text-sm leading-relaxed font-body mt-2" :class="selectedIntensity === level.value ? 'text-explore-muted' : 'text-basalt-600'">
              {{ level.result }}
            </p>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
