<script setup lang="ts">
import type { PublicRoastReceipt } from '~/models/rebrand-fuel'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

defineProps<{
  receipts: readonly PublicRoastReceipt[]
}>()
</script>

<template>
  <section id="receipts" class="mx-auto px-4 pb-28 pt-8 max-w-[96rem] min-h-[92svh] scroll-mt-20 lg:px-10 sm:px-6 lg:pb-40">
    <RebrandChapterMeta index="06" title="Roast archive" />

    <div class="pt-20 border-t-[1px] border-basalt-950/16 border-solid">
      <article v-for="receipt in receipts" :key="receipt.id" class="py-8 border-b-[1px] border-basalt-950/16 border-solid gap-5 grid items-center fuel-view-reveal lg:grid-cols-[0.3fr_0.85fr_1.55fr_1fr] sm:grid-cols-[0.35fr_0.85fr_1.5fr] motion-reduce:[animation:none]">
        <p class="text-sm text-basalt-700 font-body">
          {{ receipt.year }}
        </p>
        <div>
          <p class="text-[clamp(1.7rem,2.6vw,3rem)] text-basalt-950 leading-none tracking-[-0.035em] font-body">
            @{{ receipt.username }}
          </p>
          <p class="text-[9px] text-signal-red-700 tracking-[0.12em] font-meta mt-3 uppercase">
            {{ receipt.status }} / {{ receipt.grade }}
          </p>
        </div>
        <p class="text-base text-basalt-700 leading-relaxed font-body sm:text-lg">
          {{ receipt.title }}
        </p>
        <div class="gap-2 hidden justify-end lg:flex">
          <span class="text-[9px] text-basalt-700 font-mono px-3 py-2 border-[1px] border-basalt-950/16 border-solid bg-[#fbfcfc]">
            {{ receipt.commit.sha }} · +{{ receipt.commit.additions }}/-{{ receipt.commit.deletions }}
          </span>
          <span v-if="receipt.files[0]" class="text-[9px] text-basalt-700 font-mono px-3 py-2 border-[1px] border-basalt-950/16 border-solid bg-[#fbfcfc] max-w-[12rem] truncate">
            {{ receipt.files[0].filename }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
