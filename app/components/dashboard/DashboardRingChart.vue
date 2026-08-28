<script setup lang="ts">
import type { RoastDashboardRingDatum } from '~/data/roast-dashboard'
import BklitLegend from '~/components/dashboard/bklit/BklitLegend.vue'
import BklitRing from '~/components/dashboard/bklit/BklitRing.vue'
import BklitRingCenter from '~/components/dashboard/bklit/BklitRingCenter.vue'
import BklitRingChart from '~/components/dashboard/bklit/BklitRingChart.vue'

defineProps<{
  data: readonly RoastDashboardRingDatum[]
}>()
</script>

<template>
  <div class="rounded-none p-6 flex flex-col gap-8 items-center sm:flex-row sm:items-center">
    <BklitRingChart :data="data" :size="300">
      <BklitRing v-for="(_, index) in data" :key="index" :index="index" :show-glow="false" />
      <template #center>
        <BklitRingCenter default-label="Total Sessions" />
      </template>
      <template #legend>
        <div class="absolute left-[calc(100%+2rem)] top-1/2 w-[18rem] -translate-y-1/2">
          <BklitLegend heading="Sessions by Channel" />
        </div>
      </template>
    </BklitRingChart>
  </div>
</template>
