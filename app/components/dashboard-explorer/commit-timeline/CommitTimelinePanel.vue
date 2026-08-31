<script setup lang="ts">
import type { CommitTimelinePanelProps } from './types'
import type { BklitLineMarker } from '~/components/dashboard/bklit/BklitLineChart.vue'
import { computed } from 'vue'
import BklitLineChart from '~/components/dashboard/bklit/BklitLineChart.vue'

const props = defineProps<CommitTimelinePanelProps>()
const defaultMarkers: readonly BklitLineMarker[] = [
  { date: new Date('2026-08-09T00:00:00Z'), icon: '✦', title: 'Design update', description: 'New color system' },
  { date: new Date('2026-08-17T00:00:00Z'), icon: '↗', title: 'Docs updated', description: 'Added examples' },
] as const
const markers = computed(() => props.markers ?? defaultMarkers)
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-w-0 w-full transition-colors duration-300 box-border sm:p-8 lg:col-span-6">
    <div class="flex flex-wrap gap-4 items-end justify-between">
      <h2 class="text-2xl tracking-[-0.05em] font-display">
        Commit rhythm
      </h2>
    </div>
    <BklitLineChart class="mt-8 min-w-0" :data="props.data" x-data-key="label" :markers="markers" :series="[{ dataKey: 'commits', label: 'commits', color: 'var(--color-primary-strong)' }, { dataKey: 'additions', label: 'additions', color: 'var(--color-primary)' }]" :status="props.chartStatus ?? 'ready'" loading-label="" />
  </article>
</template>
