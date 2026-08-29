<script setup lang="ts">
import type { RoastDashboardRingDatum } from '~/data/roast-dashboard'
import { computed } from 'vue'
import BklitLegend from '~/components/dashboard/bklit/BklitLegend.vue'
import BklitRing from '~/components/dashboard/bklit/BklitRing.vue'
import BklitRingCenter from '~/components/dashboard/bklit/BklitRingCenter.vue'
import BklitRingChart from '~/components/dashboard/bklit/BklitRingChart.vue'

const props = defineProps<{
  data: readonly RoastDashboardRingDatum[]
}>()

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
  <div class="p-6 rounded-none flex flex-col gap-8 items-center sm:flex-row sm:items-center">
    <BklitRingChart :data="brandedData" :size="300">
      <BklitRing v-for="(_, index) in brandedData" :key="index" :index="index" :show-glow="false" />
      <template #center>
        <BklitRingCenter default-label="Total Sessions" />
      </template>
      <template #legend>
        <div class="mt-6 w-full static sm:mt-0 sm:w-[18rem] sm:left-[calc(100%+2rem)] sm:top-1/2 sm:absolute sm:-translate-y-1/2">
          <BklitLegend heading="Sessions by Channel" />
        </div>
      </template>
    </BklitRingChart>
  </div>
</template>
