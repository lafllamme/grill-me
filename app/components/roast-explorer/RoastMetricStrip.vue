<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import Skeleton from '~/components/ui/Skeleton.vue'
import { roastMetricDescriptors } from '~/data/roast-explorer'

const props = defineProps<{ fixture: RoastExplorerFixture, tone?: 'dark' | 'light', isStreaming?: boolean }>()
</script>

<template>
  <div class="gap-2 grid grid-cols-3">
    <div v-for="metric in roastMetricDescriptors" :key="metric.key" class="p-3 border-[1px] border-divider rounded-[1rem] border-solid" :class="tone === 'light' ? 'border-basalt-950/20' : ''">
      <p v-if="!props.isStreaming" class="text-2xl leading-none font-body font-medium" :class="tone === 'light' ? 'text-basalt-950' : 'text-on-surface'">
        {{ props.fixture.metrics[metric.key] }}
      </p>
      <Skeleton v-else class="rounded-full h-7 w-10" label="Loading metric" />
      <p class="text-[9px] tracking-[0.14em] font-meta mt-2 uppercase" :class="tone === 'light' ? 'text-basalt-600' : 'text-on-surface-variant'">
        {{ metric.label }}
      </p>
      <p class="text-[9px] leading-tight font-body mt-1" :class="tone === 'light' ? 'text-basalt-500' : 'text-on-surface-variant/70'">
        {{ metric.descriptor }}
      </p>
    </div>
  </div>
</template>
