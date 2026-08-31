<script setup lang="ts">
import type { RoastDashboardCommitDatum } from '~/data/roast-dashboard'

defineProps<{ data: readonly RoastDashboardCommitDatum[] }>()

const maxValue = (data: readonly RoastDashboardCommitDatum[]) => Math.max(...data.flatMap(item => [item.additions, item.deletions]), 1)
</script>

<template>
  <div class="space-y-6" role="img" aria-label="Mocked commit change volume">
    <div v-for="item in data" :key="item.label" class="gap-4 grid grid-cols-[4.5rem_1fr] items-center">
      <div>
        <p class="text-[10px] text-on-background font-meta">
          {{ item.label }}
        </p>
        <p class="text-[10px] text-on-surface-variant font-meta mt-1">
          {{ item.files }} files
        </p>
      </div>
      <div class="space-y-2">
        <div class="flex gap-2 h-3 items-center">
          <span class="rounded-r-full bg-primary h-full block" :style="{ width: `${Math.max(8, item.additions / maxValue(data) * 100)}%` }" />
          <span class="text-[10px] text-on-surface-variant font-meta">+{{ item.additions }}</span>
        </div>
        <div class="flex gap-2 h-3 items-center">
          <span class="rounded-r-full bg-surface-bright h-full block" :style="{ width: `${Math.max(8, item.deletions / maxValue(data) * 100)}%` }" />
          <span class="text-[10px] text-on-surface-variant font-meta">-{{ item.deletions }}</span>
        </div>
      </div>
    </div>
    <div class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta pt-2 border-t-[1px] border-divider border-solid flex gap-5 uppercase">
      <span><i class="mr-2 rounded-full bg-primary h-2 w-2 inline-block" /> additions</span>
      <span><i class="mr-2 rounded-full bg-surface-bright h-2 w-2 inline-block" /> deletions</span>
    </div>
  </div>
</template>
