<script setup lang="ts">
import type { ChangeVolumePanelProps } from './types'
import BklitBar from '~/components/dashboard/bklit/BklitBar.vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitBarXAxis from '~/components/dashboard/bklit/BklitBarXAxis.vue'
import BklitGrid from '~/components/dashboard/bklit/BklitGrid.vue'

const props = defineProps<ChangeVolumePanelProps>()
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-w-0 transition-colors duration-300 sm:p-8 lg:col-span-6">
    <div class="flex flex-wrap gap-4 items-end justify-between">
      <h2 class="text-2xl tracking-[-0.05em] font-display">
        Change volume
      </h2>
    </div>
    <BklitBarChart class="mt-8 min-w-0" :data="props.data" x-data-key="label" :series-count="2" :status="props.chartStatus ?? 'ready'">
      <template #grid>
        <BklitGrid horizontal />
      </template>
      <BklitBar data-key="additions" fill="var(--color-primary-strong)" />
      <BklitBar data-key="deletions" fill="var(--color-primary)" />
      <template #x-axis>
        <BklitBarXAxis />
      </template>
    </BklitBarChart>
  </article>
</template>
