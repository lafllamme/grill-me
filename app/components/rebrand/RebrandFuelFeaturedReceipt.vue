<script setup lang="ts">
import type { PublicRoastReceipt } from '~/models/rebrand-fuel'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'
import RebrandParallaxMedia from '~/components/rebrand/RebrandParallaxMedia.vue'
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'

defineProps<{
  receipt: PublicRoastReceipt
}>()
</script>

<template>
  <section class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] min-h-[105svh] lg:px-10 sm:px-6 lg:pb-48">
    <RebrandChapterMeta index="05" title="Featured public roast" />

    <div class="pt-24 gap-12 grid lg:gap-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <RebrandParallaxMedia class="border-[1px] border-basalt-950/18 rounded-4xl border-solid bg-basalt-950 min-h-[35rem] min-w-0">
        <template #media>
          <div class="bg-signal-red-950/70 inset-0 absolute" />
          <div class="bg-signal-red-700/28 h-[30rem] w-[30rem] right-[-10rem] top-[-10rem] absolute blur-[78px]" />
        </template>
        <div class="p-7 flex flex-col inset-0 justify-between absolute sm:p-10">
          <div class="flex gap-8 items-start justify-between">
            <div>
              <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                Public receipt / {{ receipt.status }}
              </p>
              <p class="text-2xl text-explore-copy tracking-[-0.02em] font-body mt-3">
                @{{ receipt.username }}
              </p>
            </div>
            <span class="text-[clamp(3.6rem,6vw,6rem)] text-signal-red-400 leading-none tracking-[-0.04em] font-body">
              {{ receipt.grade }}
            </span>
          </div>

          <div class="mx-auto max-w-[34rem] w-full">
            <div class="px-5 py-4 border-[1px] border-white/16 border-solid bg-black/36">
              <div class="flex gap-4 items-center justify-between">
                <span class="text-[10px] text-explore-muted font-mono">{{ receipt.commit.sha }}</span>
                <span class="text-xs text-signal-red-400 font-mono">+{{ receipt.commit.additions }} / -{{ receipt.commit.deletions }}</span>
              </div>
              <p class="text-lg text-explore-copy leading-snug font-body mt-5">
                {{ receipt.commit.message }}
              </p>
              <p class="text-[10px] text-explore-muted font-mono mt-4">
                {{ receipt.commit.repo }} · {{ receipt.commit.changedFiles }} files
              </p>
            </div>
            <div class="mt-3 gap-3 grid sm:grid-cols-2">
              <div v-for="file in receipt.files.slice(0, 2)" :key="file.filename" class="px-4 py-3 border-[1px] border-white/12 border-solid bg-black/28">
                <p class="text-[10px] text-explore-copy font-mono truncate">
                  {{ file.filename }}
                </p>
                <p class="text-[9px] text-signal-red-400 font-mono mt-2">
                  +{{ file.additions }} / -{{ file.deletions }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </RebrandParallaxMedia>

      <div class="min-w-0 fuel-view-reveal motion-reduce:[animation:none]">
        <p class="text-[10px] text-signal-red-700 tracking-[0.15em] font-meta uppercase">
          Verified example / stink {{ receipt.stinkScore }}
        </p>
        <RebrandScrollHeadline
          class="fuel-editorial-headline text-basalt-950 mt-8"
          :text="receipt.title"
        />
        <div class="mt-14 pt-6 border-t-[1px] border-basalt-950/18 border-solid gap-6 grid sm:grid-cols-[0.28fr_1fr]">
          <p class="text-xs text-basalt-500 font-meta">
            Evidence
          </p>
          <p class="text-base text-basalt-700 leading-relaxed font-body sm:text-lg">
            {{ receipt.evidenceClaim }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
