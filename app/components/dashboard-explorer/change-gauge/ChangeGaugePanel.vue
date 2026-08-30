<script setup lang="ts">
import type { ChangeGaugePanelProps } from './types'
import BklitGaugeChart from '~/components/dashboard/bklit/BklitGaugeChart.vue'

const props = defineProps<ChangeGaugePanelProps>()
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-w-0 transition-colors duration-300 sm:p-8 lg:col-span-4">
    <div class="flex gap-4 items-center justify-between">
      <h2 class="text-2xl tracking-[-0.05em] font-display">
        Change pressure
      </h2>
      <span :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">Mock</span>
    </div>
    <BklitGaugeChart class="mt-6" :value="props.value" :center-value="props.value" default-label="Commit" active-fill="var(--color-primary)" inactive-fill="var(--color-chart-track)" :replay-key="String(props.value)" />
    <p :class="props.mutedClass" class="text-sm leading-6 mt-2 max-w-[26rem]">
      {{ props.description }}
    </p>
  </article>
</template>
