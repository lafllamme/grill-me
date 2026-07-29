<script setup lang="ts">
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'
import RebrandParallaxMedia from '~/components/rebrand/RebrandParallaxMedia.vue'
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'
import RebrandVelocityMarquee from '~/components/rebrand/RebrandVelocityMarquee.vue'

const evidenceTerms = ['PUBLIC COMMITS', 'DIFFS', 'EVIDENCE', 'VERDICT'] as const

const levels = [
  {
    index: '01',
    label: 'Rare',
    description: 'A restrained read of the strongest public signals.',
  },
  {
    index: '02',
    label: 'Medium Rare',
    description: 'More evidence, sharper writing, and useful corrective damage.',
  },
  {
    index: '03',
    label: 'Burned to Crisp',
    description: 'The broadest safe evidence window with maximum tonal heat.',
  },
] as const
</script>

<template>
  <section class="mx-auto px-4 pb-28 pt-8 max-w-[96rem] lg:px-10 sm:px-6 lg:pb-40">
    <RebrandChapterMeta index="01" title="About the product" />

    <div class="pt-[clamp(7rem,15vw,15rem)]">
      <RebrandScrollHeadline
        class="fuel-editorial-headline text-basalt-950"
        text="Public evidence becomes a verdict you can laugh at, verify, and improve from."
      />

      <div class="pt-[clamp(7rem,12vw,11rem)] gap-14 grid fuel-view-reveal lg:grid-cols-[0.78fr_1.22fr] motion-reduce:[animation:none] lg:items-start">
        <RebrandParallaxMedia class="border-[1px] border-basalt-950/16 border-solid bg-basalt-950 min-h-[27rem] min-w-0">
          <template #media>
            <div class="bg-basalt-950 inset-0 absolute" />
            <div class="bg-signal-red-950/38 h-[22rem] w-[22rem] right-[-7rem] top-[-8rem] absolute blur-[64px]" />
          </template>
          <div class="p-7 flex flex-col inset-0 justify-between absolute sm:p-9">
            <div class="flex items-start justify-between">
              <p class="text-[10px] text-signal-red-400 tracking-[0.15em] font-meta uppercase">
                Evidence window
              </p>
              <p class="text-[10px] text-explore-muted tracking-[0.12em] font-meta uppercase">
                Public only
              </p>
            </div>
            <div class="space-y-5">
              <div class="bg-signal-red-500 h-2 w-[82%]" />
              <div class="bg-white/28 h-2 w-[61%]" />
              <div class="bg-white/16 h-2 w-[74%]" />
              <div class="pt-5 border-t-[1px] border-white/16 border-solid flex items-end justify-between">
                <span class="text-xs text-explore-muted font-mono">commit → diff → context</span>
                <span class="text-5xl text-explore-copy leading-none tracking-[-0.05em] font-body">03</span>
              </div>
            </div>
          </div>
        </RebrandParallaxMedia>

        <div>
          <p class="text-base text-basalt-600 leading-relaxed font-body max-w-[38rem] sm:text-lg">
            Grillme ranks recent public engineering activity, keeps only useful evidence, and streams the result as each verified stage lands.
          </p>
          <div class="mt-14 border-t-[1px] border-basalt-950/18 border-solid">
            <article v-for="level in levels" :key="level.index" class="py-6 border-b-[1px] border-basalt-950/18 border-solid gap-5 grid sm:grid-cols-[3rem_0.55fr_1fr]">
              <span class="text-xs text-signal-red-700 font-mono">{{ level.index }}</span>
              <h3 class="text-xl text-basalt-950 tracking-[-0.02em] font-body sm:text-2xl">
                {{ level.label }}
              </h3>
              <p class="text-sm text-basalt-600 leading-relaxed font-body sm:text-base">
                {{ level.description }}
              </p>
            </article>
          </div>
        </div>
      </div>
    </div>

    <div class="pt-[clamp(7rem,13vw,13rem)]">
      <RebrandVelocityMarquee :items="evidenceTerms" />
    </div>
  </section>
</template>
