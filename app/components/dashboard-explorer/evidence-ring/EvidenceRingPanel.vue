<script setup lang="ts">
import type { EvidenceRingPanelProps } from './types'
import { computed } from 'vue'
import BklitLegend from '~/components/dashboard/bklit/BklitLegend.vue'
import BklitRing from '~/components/dashboard/bklit/BklitRing.vue'
import BklitRingCenter from '~/components/dashboard/bklit/BklitRingCenter.vue'
import BklitRingChart from '~/components/dashboard/bklit/BklitRingChart.vue'

const props = withDefaults(defineProps<EvidenceRingPanelProps>(), {
  heading: 'Profile signals',
  centerLabel: 'Profile score',
})

const brandedData = computed(() => props.data.map((item, index) => ({
  ...item,
  color: [
    'var(--color-primary-strong)',
    'var(--color-primary)',
    'color-mix(in srgb, var(--color-primary-strong) 82%, black)',
    'color-mix(in srgb, var(--color-primary) 74%, black)',
    'color-mix(in srgb, var(--color-primary-strong) 58%, black)',
    'color-mix(in srgb, var(--color-primary) 46%, black)',
  ][index % 6],
})))
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-h-[44.5rem] transition-colors duration-300 sm:p-8 lg:col-span-8 lg:min-h-[31rem]">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl tracking-[-0.04em] font-body">
        Evidence
      </h2>
      <span class="text-[10px] text-primary-strong font-meta uppercase">{{ props.isLive ? 'Live' : 'Mock' }}</span>
    </div>
    <div class="mt-8 p-6 rounded-none flex flex-col gap-8 items-center sm:flex-row sm:items-center">
      <BklitRingChart :data="brandedData" :size="320">
        <BklitRing v-for="(_, index) in brandedData" :key="index" :index="index" :show-glow="false" />
        <template #center>
          <BklitRingCenter :default-label="props.centerLabel" />
        </template>
        <template #legend>
          <div class="mt-6 w-full static sm:mt-0 sm:w-[18rem] sm:left-[calc(100%+2rem)] sm:top-1/2 sm:absolute sm:-translate-y-1/2">
            <BklitLegend :heading="props.heading" />
          </div>
        </template>
      </BklitRingChart>
    </div>
  </article>
</template>
