<script setup lang="ts">
import type { RoastHotspotDatum } from '~/data/roast-dashboard-explorer'

defineProps<{ hotspots: readonly RoastHotspotDatum[] }>()
</script>

<template>
  <div class="gap-8 grid lg:grid-cols-[1fr_0.8fr]">
    <div class="p-5 rounded-[18px] bg-background min-h-[280px]">
      <div class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mb-5 uppercase">
        Repository anatomy
      </div>
      <div class="gap-2 grid grid-cols-12 grid-rows-5 h-[220px]">
        <div class="text-[10px] text-on-primary-fixed font-meta p-3 rounded-[8px] bg-primary/75 col-span-7 row-span-3">
          app/<span class="text-[9px] mt-2 opacity-70 block">42% of observed change</span>
        </div>
        <div class="bg-secondary/70 text-[10px] text-on-background font-meta p-3 rounded-[8px] col-span-5 row-span-2">
          components/<span class="text-[9px] mt-2 opacity-70 block">28% · wrapper density</span>
        </div>
        <div class="bg-tertiary/70 text-[10px] text-on-background font-meta p-3 rounded-[8px] col-span-5 row-span-3">
          server/<span class="text-[9px] mt-2 opacity-70 block">17% · contract edge</span>
        </div>
        <div class="text-[10px] text-on-background font-meta p-3 rounded-[8px] bg-surface-bright col-span-7 row-span-2">
          docs + config<span class="text-[9px] mt-2 opacity-70 block">13% · relatively calm</span>
        </div>
      </div>
    </div>
    <div>
      <div class="text-[10px] text-primary-strong tracking-[0.16em] font-meta mb-4 uppercase">
        Hotspot register
      </div>
      <div class="divide-divider divide-y-[1px]">
        <div v-for="(item, index) in hotspots" :key="item.path" class="py-3 flex gap-3 items-start">
          <span class="text-[10px] text-on-surface-variant font-meta">0{{ index + 1 }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-on-background font-meta truncate">
              {{ item.path }}
            </p><p class="text-[10px] text-on-surface-variant mt-1">
              {{ item.signal }}
            </p>
          </div>
          <span class="text-xs text-on-background font-meta">{{ item.changes }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
