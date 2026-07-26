<script setup lang="ts">
import type { FuelRoastViewModel } from '~/models/rebrand-fuel'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const props = defineProps<{
  model: FuelRoastViewModel
}>()

const stats = [
  { value: () => `${Math.round(props.model.metrics.stinkScore)}/100`, label: 'Stink score', description: 'A deterministic score derived from the generated verdict and its evidence window.' },
  { value: () => String(props.model.commits.length).padStart(2, '0'), label: 'Commits inspected', description: 'The selected public commits that survived ranking and context limits.' },
  { value: () => String(props.model.files.length).padStart(2, '0'), label: 'Files cited', description: 'Prompt-relevant files retained after generated and dependency noise was removed.' },
  { value: () => `${props.model.diffLineCount}+`, label: 'Changed lines', description: 'Additions and deletions represented by the current evidence set.' },
] as const
</script>

<template>
  <section class="mx-auto px-4 pb-32 pt-8 max-w-[96rem] min-h-[100svh] lg:px-10 sm:px-6">
    <RebrandChapterMeta index="07" title="Evidence stats" />

    <div class="pt-20 gap-x-20 gap-y-28 grid lg:grid-cols-2">
      <article v-for="stat in stats" :key="stat.label">
        <p class="text-[clamp(4.5rem,9vw,10rem)] text-basalt-950 leading-none tracking-[-0.08em] font-display">
          {{ stat.value() }}
        </p>
        <div class="mt-6 pt-5 border-t-[1px] border-basalt-950/18 border-solid">
          <h3 class="text-xl text-basalt-950 tracking-[-0.025em] font-display sm:text-2xl">
            {{ stat.label }}
          </h3>
          <p class="text-sm text-basalt-500 leading-relaxed font-body mt-4 max-w-[32rem] sm:text-base">
            {{ stat.description }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
