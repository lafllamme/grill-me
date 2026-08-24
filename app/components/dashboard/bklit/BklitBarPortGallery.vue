<script setup lang="ts">
import { computed, ref } from 'vue'
import BklitBar from './BklitBar.vue'
import BklitBarChart from './BklitBarChart.vue'
import BklitBarDepthBack from './BklitBarDepthBack.vue'
import BklitBarDepthFront from './BklitBarDepthFront.vue'
import BklitBarPulse from './BklitBarPulse.vue'
import BklitBarSquares from './BklitBarSquares.vue'
import BklitBarXAxis from './BklitBarXAxis.vue'
import BklitGrid from './BklitGrid.vue'

const data = [
  { label: 'Jan', additions: 522, deletions: 101 },
  { label: 'Feb', additions: 249, deletions: 38 },
  { label: 'Mar', additions: 314, deletions: 72 },
  { label: 'Apr', additions: 438, deletions: 126 },
  { label: 'May', additions: 366, deletions: 84 },
  { label: 'Jun', additions: 487, deletions: 154 },
]

const modes = ['default', 'stacked', 'squares', 'pattern', 'depth', 'loading'] as const
type GalleryMode = typeof modes[number]
const mode = ref<GalleryMode>('default')
const isLoading = computed(() => mode.value === 'loading')
</script>

<template>
  <article class="p-6 rounded-[28px] bg-surface lg:p-10 sm:p-8">
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
          Bklit port / component gallery
        </p>
        <h3 class="text-3xl tracking-[-0.06em] font-display mt-3">
          Every requested bar variant.
        </h3>
        <p class="text-sm text-on-surface-variant leading-6 mt-4 max-w-[34rem]">
          The dashboard uses the default mode above. This gallery keeps the remaining Bklit primitives visible for direct visual comparison.
        </p>
      </div>
      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Bklit bar variants">
        <button v-for="item in modes" :key="item" type="button" role="tab" :aria-selected="mode === item" class="text-[10px] tracking-[0.12em] font-meta px-3 py-2 border-[1px] border-outline rounded-[8px] border-solid uppercase transition-colors" :class="mode === item ? 'bg-on-background text-background' : 'text-on-surface-variant hover:text-on-background'" @click="mode = item">
          {{ item }}
        </button>
      </div>
    </div>

    <div class="mt-8 p-4 rounded-[16px] bg-surface-container-low sm:p-6">
      <BklitBarChart :key="mode" :data="data" x-data-key="label" :series-count="2" :stacked="mode === 'stacked'" :status="isLoading ? 'loading' : 'ready'" aspect-ratio="2 / 1">
        <template #grid>
          <BklitGrid horizontal />
        </template>
        <template v-if="mode === 'squares' || mode === 'pattern'">
          <BklitBarSquares data-key="additions" :pattern-preset="mode === 'pattern' ? 'diagonal' : 'none'" fill="var(--color-chart-line-primary)" />
          <BklitBarSquares data-key="deletions" :pattern-preset="mode === 'pattern' ? 'crosshatch' : 'none'" fill="var(--color-chart-line-secondary)" />
        </template>
        <template v-else-if="mode === 'depth'">
          <BklitBarDepthBack data-key="additions" />
          <BklitBarDepthBack data-key="deletions" fill="var(--color-chart-line-secondary)" />
          <BklitBar data-key="additions" fill="var(--color-chart-line-primary)" />
          <BklitBar data-key="deletions" fill="var(--color-chart-line-secondary)" animation-type="fade" />
          <BklitBarDepthFront data-key="additions" />
          <BklitBarPulse data-key="additions" />
        </template>
        <template v-else-if="mode !== 'loading'">
          <BklitBar data-key="additions" fill="var(--color-chart-line-primary)" :animate="mode !== 'default'" />
          <BklitBar data-key="deletions" fill="var(--color-chart-line-secondary)" animation-type="fade" />
        </template>
        <template #x-axis>
          <BklitBarXAxis />
        </template>
      </BklitBarChart>
    </div>
  </article>
</template>
