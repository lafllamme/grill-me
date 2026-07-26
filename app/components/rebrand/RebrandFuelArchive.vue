<script setup lang="ts">
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import { computed } from 'vue'

import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const props = defineProps<{
  model: FuelRoastViewModel
}>()

const archiveRows = computed(() => [
  { year: 'Now', username: props.model.username, title: props.model.title, commits: props.model.commits.slice(0, 3) },
  { year: '2026', username: 'torvalds', title: 'UAF fix in BPF? More like a quick patch for the inevitable.', commits: props.model.commits.slice(0, 2) },
  { year: '2026', username: 'sindresorhus', title: 'One utility package away from achieving package singularity.', commits: props.model.commits.slice(1, 3) },
  { year: '2025', username: 'gaearon', title: 'The abstraction is elegant. The migration guide is a cry for help.', commits: props.model.commits.slice(0, 1) },
])
</script>

<template>
  <section id="receipts" class="mx-auto px-4 pb-28 pt-8 max-w-[96rem] min-h-[92svh] scroll-mt-20 lg:px-10 sm:px-6 lg:pb-40">
    <RebrandChapterMeta index="06" title="Roast archive" />

    <div class="pt-20 border-t-[1px] border-basalt-950/16 border-solid">
      <article v-for="row in archiveRows" :key="`${row.username}-${row.title}`" class="py-7 border-b-[1px] border-basalt-950/16 border-solid gap-5 grid items-center lg:grid-cols-[0.3fr_1fr_1.55fr_1fr] sm:grid-cols-[0.35fr_1.1fr_1.5fr]">
        <p class="text-sm text-basalt-700 font-body">
          {{ row.year }}
        </p>
        <p class="text-[clamp(1.8rem,3vw,3.5rem)] text-basalt-950 leading-none tracking-[-0.05em] font-display">
          @{{ row.username }}
        </p>
        <p class="text-sm text-basalt-600 leading-relaxed font-body sm:text-base">
          {{ row.title }}
        </p>
        <div class="gap-2 hidden justify-end lg:flex">
          <span v-for="commit in row.commits" :key="commit.sha" class="text-[9px] text-basalt-700 font-mono px-3 py-2 border-[1px] border-basalt-950/16 border-solid bg-bone-100">
            {{ commit.sha.slice(0, 7) }} · +{{ commit.additions }}/-{{ commit.deletions }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>
