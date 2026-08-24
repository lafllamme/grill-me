<script setup lang="ts">
import type { RoastOneLabInsight } from '~/data/roast-one-lab'

defineProps<{ insights: RoastOneLabInsight[] }>()
</script>

<template>
  <div class="divide-y divide-divider">
    <article v-for="insight in insights" :key="insight.label" class="py-4 flex gap-4 justify-between">
      <div class="min-w-0"><div class="text-xs text-on-background font-semibold">{{ insight.label }}</div><p class="text-[11px] text-on-surface-variant leading-5 mt-1 max-w-[34rem]">{{ insight.detail }}</p></div>
      <div class="text-right shrink-0"><div class="text-xs text-primary font-meta">{{ insight.value }}</div><div class="text-[9px] text-on-surface-variant tracking-[0.08em] font-meta mt-1 uppercase">{{ insight.impact }}</div></div>
    </article>
  </div>
</template>
