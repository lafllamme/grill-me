<script setup lang="ts">
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

defineProps<{
  model: FuelRoastViewModel
}>()
</script>

<template>
  <section class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] min-h-[118svh] lg:px-10 sm:px-6 lg:pb-48">
    <RebrandChapterMeta index="05" title="Featured verdict" />

    <div class="pt-24 gap-12 grid lg:gap-24 lg:grid-cols-[0.55fr_1.45fr]">
      <div class="border-[1px] border-basalt-950/18 border-solid bg-basalt-950 min-h-[31rem] relative overflow-hidden">
        <div class="rounded-full bg-signal-red-700/40 h-[27rem] w-[27rem] right-[-10rem] top-[-8rem] absolute blur-[70px]" />
        <div class="p-7 flex flex-col inset-0 justify-between absolute sm:p-9">
          <div class="flex items-start justify-between">
            <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
              Filed for @{{ model.username }}
            </p>
            <span class="text-[clamp(4rem,7vw,7rem)] text-signal-red-400 leading-none tracking-[-0.08em] font-display">{{ model.metrics.grade }}</span>
          </div>
          <div>
            <p class="text-[10px] text-explore-copy/75 tracking-[0.15em] font-meta uppercase">
              {{ model.metrics.specialTitle }}
            </p>
            <div class="mt-6 grid grid-cols-3">
              <div class="py-3 border-r-[1px] border-white/16 border-solid">
                <p class="text-3xl text-explore-copy font-display">
                  {{ Math.round(model.metrics.stinkScore) }}
                </p>
                <p class="text-[10px] text-explore-copy/75 font-body mt-1">
                  Stink
                </p>
              </div>
              <div class="px-4 py-3 border-r-[1px] border-white/16 border-solid">
                <p class="text-3xl text-explore-copy font-display">
                  {{ model.commits.length }}
                </p>
                <p class="text-[10px] text-explore-copy/75 font-body mt-1">
                  Commits
                </p>
              </div>
              <div class="py-3 pl-4">
                <p class="text-3xl text-explore-copy font-display">
                  {{ model.files.length }}
                </p>
                <p class="text-[10px] text-explore-copy/75 font-body mt-1">
                  Files
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <blockquote class="text-[clamp(3rem,5.7vw,6.6rem)] text-basalt-950 leading-[0.87] tracking-[-0.065em] font-display">
          “{{ model.roastLines[0] }}”
        </blockquote>
        <div class="mt-14 pt-6 border-t-[1px] border-basalt-950/18 border-solid grid grid-cols-3">
          <p class="text-xs text-basalt-500 font-meta">
            01
          </p>
          <p class="text-sm text-basalt-950 font-body col-span-2">
            {{ model.title }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
