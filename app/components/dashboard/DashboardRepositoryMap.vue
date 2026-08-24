<script setup lang="ts">
import type { RoastHotspotDatum } from '~/data/roast-dashboard-explorer'

defineProps<{ hotspots: readonly RoastHotspotDatum[] }>()
</script>

<template>
  <div class="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
    <div class="rounded-[18px] bg-background p-5 min-h-[280px]">
      <div class="text-[10px] text-on-surface-variant tracking-[0.16em] mb-5 font-meta uppercase">Repository anatomy</div>
      <div class="grid gap-2 grid-cols-12 grid-rows-5 h-[220px]">
        <div class="rounded-[8px] bg-primary/75 p-3 text-[10px] text-on-primary-fixed col-span-7 row-span-3 font-meta">app/<span class="block text-[9px] opacity-70 mt-2">42% of observed change</span></div>
        <div class="rounded-[8px] bg-secondary/70 p-3 text-[10px] text-on-background col-span-5 row-span-2 font-meta">components/<span class="block text-[9px] opacity-70 mt-2">28% · wrapper density</span></div>
        <div class="rounded-[8px] bg-tertiary/70 p-3 text-[10px] text-on-background col-span-5 row-span-3 font-meta">server/<span class="block text-[9px] opacity-70 mt-2">17% · contract edge</span></div>
        <div class="rounded-[8px] bg-surface-bright p-3 text-[10px] text-on-background col-span-7 row-span-2 font-meta">docs + config<span class="block text-[9px] opacity-70 mt-2">13% · relatively calm</span></div>
      </div>
    </div>
    <div>
      <div class="text-[10px] text-primary-strong tracking-[0.16em] mb-4 font-meta uppercase">Hotspot register</div>
      <div class="divide-divider divide-y-[1px]">
        <div v-for="(item, index) in hotspots" :key="item.path" class="py-3 flex gap-3 items-start">
          <span class="text-[10px] text-on-surface-variant font-meta">0{{ index + 1 }}</span>
          <div class="min-w-0 flex-1"><p class="text-xs text-on-background truncate font-meta">{{ item.path }}</p><p class="text-[10px] text-on-surface-variant mt-1">{{ item.signal }}</p></div>
          <span class="text-xs text-on-background font-meta">{{ item.changes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
