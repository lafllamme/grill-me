<script setup lang="ts">
import RoastOneLab from '~/components/roast-one/RoastOneLab.vue'
import { roastOneRounds } from '~/data/roast-one'

useHead({
  title: 'Roast 01 — GrillMe',
  meta: [{ name: 'description', content: 'Evidence-backed roast result preview.' }],
})
</script>

<template>
  <div class="text-on-background px-4 py-5 bg-background min-h-screen lg:px-10 lg:py-7 sm:px-6">
    <div class="mx-auto max-w-[1600px]">
      <header class="pb-5 border-b border-divider flex flex-wrap gap-5 items-center justify-between">
        <div class="text-xl tracking-[-0.04em] font-body font-semibold sm:text-2xl">
          GrillMe <span class="text-primary">/roast-1</span>
        </div>
        <nav class="pb-1 flex gap-2 w-full order-3 overflow-x-auto lg:flex-1 lg:w-auto lg:justify-center lg:order-2" aria-label="Roast rounds">
          <span v-for="round in roastOneRounds" :key="round.number" class="text-[10px] tracking-[0.12em] font-meta px-2 py-2 border-b flex gap-2 min-w-18 uppercase items-center" :class="round.active ? 'border-primary text-primary' : 'border-divider text-on-surface-variant'"><b class="text-xl font-normal">{{ round.number }}</b><span>{{ round.label }}</span></span>
        </nav>
        <button type="button" class="text-[10px] text-on-background tracking-[0.12em] font-meta px-4 py-2 border border-outline rounded-full uppercase transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4 hover:border-primary">
          New roast
        </button>
      </header>

      <RoastOneLab class="mt-8" />

      <footer class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta mt-8 pt-4 border-t border-divider flex flex-wrap gap-3 uppercase justify-between">
        <span>GrillMe v1.0.0 · brutally honest</span><span>Roast without mercy. Improve without excuses.</span><span>Share your roast ↗</span>
      </footer>
    </div>
  </div>
</template>
