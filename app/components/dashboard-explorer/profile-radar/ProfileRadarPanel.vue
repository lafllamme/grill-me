<script setup lang="ts">
import type { ProfileRadarPanelProps } from './types'
import { computed } from 'vue'
import BklitRadarChart from '~/components/dashboard/bklit/BklitRadarChart.vue'

const props = defineProps<ProfileRadarPanelProps>()

const brandedData = computed(() => props.data.data.map((item, index) => ({
  ...item,
  color: [
    'var(--color-primary-strong)',
    'color-mix(in srgb, var(--color-primary-strong) 78%, white)',
    'var(--color-primary)',
    'color-mix(in srgb, var(--color-primary-strong) 58%, black)',
  ][index % 4],
})))
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] transition-colors duration-300 lg:p-8 sm:p-8" data-testid="profile-radar-panel">
    <h2 class="text-2xl tracking-[-0.04em] font-body">
      Profile
    </h2>
    <BklitRadarChart class="mt-4" :data="brandedData" :metrics="props.data.metrics" :size="400" />
  </article>
</template>
