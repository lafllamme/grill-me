<script setup lang="ts">
import type { CommitTimelinePanelProps } from './types'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BklitLineChart from '~/components/dashboard/bklit/BklitLineChart.vue'

const props = defineProps<CommitTimelinePanelProps>()
const isLoading = ref(true)
let loadingTimer: ReturnType<typeof setTimeout> | undefined
const markers = [
  { date: new Date('2026-08-09T00:00:00Z'), icon: '✦', title: 'Design update', description: 'New color system' },
  { date: new Date('2026-08-17T00:00:00Z'), icon: '↗', title: 'Docs updated', description: 'Added examples' },
] as const

function replayLoading() {
  isLoading.value = true
  if (loadingTimer)
    clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => {
    isLoading.value = false
  }, 2800)
}

onMounted(replayLoading)
onBeforeUnmount(() => {
  if (loadingTimer)
    clearTimeout(loadingTimer)
})
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] min-w-0 w-full transition-colors duration-300 box-border sm:p-8 lg:col-span-6">
    <div class="flex flex-wrap gap-4 items-end justify-between">
      <h2 class="text-2xl tracking-[-0.05em] font-display">
        Commit rhythm
      </h2>
      <button :class="props.mutedClass" class="text-[10px] tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-current/30 rounded-[8px] border-solid uppercase focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:opacity-80" type="button" @click="replayLoading">
        Replay loading
      </button>
    </div>
    <BklitLineChart class="mt-8 min-w-0" :data="props.data" x-data-key="label" :markers="markers" :series="[{ dataKey: 'commits', label: 'commits', color: 'var(--color-primary-strong)' }, { dataKey: 'additions', label: 'additions', color: 'var(--color-primary)' }]" :status="isLoading ? 'loading' : 'ready'" loading-label="" />
  </article>
</template>
