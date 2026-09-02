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

const clarityReview = computed(() => props.aiReview?.axisReviews?.find(review => review.axis === 'clarity'))
const clarityVerdictLabel = computed(() => {
  switch (clarityReview.value?.verdict) {
    case 'supports':
      return 'supports score'
    case 'softens':
      return 'softens score'
    case 'contradicts':
      return 'challenges score'
    case 'insufficient':
      return 'limited evidence'
    default:
      return 'not available'
  }
})
</script>

<template>
  <article :class="props.panelClass" class="p-6 rounded-[28px] transition-colors duration-300 lg:p-8 sm:p-8">
    <h2 class="text-2xl tracking-[-0.04em] font-body">
      Profile
    </h2>
    <BklitRadarChart class="mt-4" :data="brandedData" :metrics="props.data.metrics" :size="400" />
    <div v-if="props.clarityBreakdown || clarityReview" class="mt-4 pt-4 border-[1px] border-t border-white/8">
      <div v-if="props.clarityBreakdown" class="flex flex-wrap gap-2" aria-label="Clarity score signals">
        <span class="text-[10px] text-white/55 tracking-[0.08em] font-mono px-2.5 py-1 rounded-full bg-white/5 uppercase">
          Message {{ props.clarityBreakdown.messageSignal }}
        </span>
        <span class="text-[10px] text-white/55 tracking-[0.08em] font-mono px-2.5 py-1 rounded-full bg-white/5 uppercase">
          Names {{ props.clarityBreakdown.namingSignal }}
        </span>
        <span class="text-[10px] text-white/55 tracking-[0.08em] font-mono px-2.5 py-1 rounded-full bg-white/5 uppercase">
          Structure {{ props.clarityBreakdown.structureSignal }}
        </span>
        <span class="text-[10px] text-primary tracking-[0.08em] font-mono px-2.5 py-1 rounded-full bg-primary/10 uppercase">
          Cap {{ props.clarityBreakdown.evidenceCap }}
        </span>
      </div>
      <div v-if="clarityReview" class="mt-4 space-y-3">
        <div class="text-[11px] tracking-[0.08em] font-mono flex gap-3 uppercase items-center justify-between">
          <span class="text-white/45">AI second read</span>
          <span class="text-primary">{{ clarityVerdictLabel }} · {{ clarityReview.confidence }}%</span>
        </div>
        <p class="text-sm text-white/70 leading-6 max-w-[48ch]">
          {{ clarityReview.summary }}
        </p>
        <div v-if="clarityReview.evidence.length" class="space-y-2">
          <p class="text-[10px] text-white/35 tracking-[0.08em] font-mono uppercase">
            Patch evidence
          </p>
          <ul class="space-y-2">
            <li v-for="item in clarityReview.evidence" :key="`${item.commitSha}:${item.filename}`" class="text-xs text-white/55 leading-5">
              <span class="text-white/75 font-mono">{{ item.filename }}</span>
              <span class="text-white/25 mx-1">·</span>
              {{ item.observation }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </article>
</template>
