<script setup lang="ts">
import type { RepositorySunburstPanelProps } from './types'
import BklitSunburstChart from '~/components/dashboard/bklit/BklitSunburstChart.vue'

const props = defineProps<RepositorySunburstPanelProps>()
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-w-0 transition-colors duration-300 sm:p-8 lg:col-span-12">
    <div class="flex gap-4 items-start justify-between">
      <div>
        <h2 class="text-2xl tracking-[-0.05em] font-display">
          Repository anatomy
        </h2>
        <p :class="props.mutedClass" class="text-sm leading-6 mt-2">
          {{ props.description }}
        </p>
      </div>
      <span class="text-[10px] text-primary-strong tracking-[0.12em] font-meta uppercase">{{ props.isLive ? 'Live' : 'Mock' }}</span>
    </div>
    <BklitSunburstChart class="mt-6" :data="props.data" :size="560" />
  </article>
</template>
