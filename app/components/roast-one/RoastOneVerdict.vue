<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'

defineProps<{ roast: RoastExplorerFixture }>()
</script>

<template>
  <section class="text-on-background px-6 py-7 border border-outline rounded-[24px] bg-surface flex flex-col h-full sm:px-8 sm:py-9">
    <div class="text-xs text-on-surface-variant tracking-[0.16em] font-meta pb-4 border-b border-divider flex gap-3 uppercase items-center">
      <span class="text-primary">/</span> Verdict
    </div>
    <div class="mt-8">
      <p class="text-xs text-on-surface-variant tracking-[0.16em] font-meta uppercase">
        Round 01 · {{ roast.intensity.label.replace('_', ' ') }}
      </p>
      <h1 class="text-[clamp(4rem,8vw,8.5rem)] text-bone-50 leading-[0.82] tracking-[-0.08em] font-display font-semibold mt-4 max-w-[9ch] uppercase">
        Ego damage
      </h1>
    </div>
    <div class="mt-9 py-7 border-y border-divider">
      <div class="flex gap-5 items-end justify-between">
        <span class="text-[clamp(7rem,14vw,12rem)] text-primary leading-[0.7] tracking-[-0.12em] font-display font-semibold">{{ roast.metrics.grade }}</span>
        <p class="text-sm text-on-surface-variant leading-6 font-meta pb-2 max-w-[17rem]">
          {{ roast.roast }}<br><br>{{ roast.feedback[0] }}
        </p>
      </div>
    </div>
    <div class="font-meta mt-auto pt-7 text-center grid grid-cols-3 uppercase divide-divider divide-x">
      <div class="px-2">
        <span class="text-2xl text-bone-50 block">{{ roast.evidence.commits.reduce((sum, commit) => sum + commit.changedFiles, 0) }}</span><span class="text-[9px] text-on-surface-variant tracking-[0.12em] mt-2 block">Files</span>
      </div>
      <div class="px-2">
        <span class="text-2xl text-bone-50 block">{{ roast.metrics.spaghettiIndex }}</span><span class="text-[9px] text-on-surface-variant tracking-[0.12em] mt-2 block">Complexity</span>
      </div>
      <div class="px-2">
        <span class="text-2xl text-bone-50 block">{{ roast.metrics.egoDamage }}</span><span class="text-[9px] text-on-surface-variant tracking-[0.12em] mt-2 block">Damage</span>
      </div>
    </div>
  </section>
</template>
