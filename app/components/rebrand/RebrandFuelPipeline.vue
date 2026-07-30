<script setup lang="ts">
import { Icon } from '#components'
import RebrandScrollHeadline from '~/components/rebrand/RebrandScrollHeadline.vue'

const pipelineSteps = [
  {
    index: '01',
    icon: 'ph:github-logo',
    title: 'Fetch',
    description: 'Open the public activity trail and resolve the commit references worth inspecting.',
  },
  {
    index: '02',
    icon: 'ph:funnel',
    title: 'Select',
    description: 'Rank code-heavy changes above lockfiles, generated output, and dependency noise.',
  },
  {
    index: '03',
    icon: 'ph:brackets-curly',
    title: 'Pack',
    description: 'Build a bounded evidence file from messages, filenames, diff statistics, and safe excerpts.',
  },
  {
    index: '04',
    icon: 'ph:sparkle',
    title: 'Generate',
    description: 'Stream the title, roast points, fixes, and metrics as each structured field becomes available.',
  },
] as const
</script>

<template>
  <section id="pipeline" class="mx-auto px-4 pb-36 pt-8 max-w-[96rem] scroll-mt-20 lg:px-10 sm:px-6 lg:pb-52">
    <header class="py-5 border-t-[1px] border-white/18 border-solid gap-6 grid grid-cols-[1fr_auto] sm:grid-cols-3">
      <p class="text-[10px] text-explore-muted tracking-[0.12em] font-meta uppercase">
        ◆ (03)
      </p>
      <p class="text-[10px] text-explore-copy font-body sm:text-center">
        (Agent pipeline)
      </p>
      <p class="text-[10px] text-explore-muted tracking-[0.08em] font-meta text-right hidden uppercase sm:block">
        © Grillme
      </p>
    </header>

    <div class="pt-[clamp(8rem,15vw,16rem)]">
      <div class="gap-10 grid lg:grid-cols-[0.23fr_1.77fr] lg:items-start">
        <div class="pt-2">
          <Icon class="text-4xl text-signal-red-400" name="ph:flame" />
          <p class="text-[10px] text-explore-muted tracking-[0.15em] font-meta mt-8 uppercase">
            Evidence engine
          </p>
        </div>

        <RebrandScrollHeadline
          class="fuel-editorial-headline text-explore-copy"
          text="The joke lands because the investigation came first: public commits are fetched, noisy changes are filtered, and every punchline stays attached to evidence."
        />
      </div>
    </div>

    <div class="pb-20 pt-[clamp(8rem,14vw,14rem)] lg:ml-[25%]">
      <div class="border-t-[1px] border-white/18 border-solid">
        <article v-for="step in pipelineSteps" :key="step.index" class="py-9 border-b-[1px] border-white/18 border-solid gap-6 grid lg:py-12 sm:grid-cols-[3rem_3rem_minmax(0,1fr)]">
          <span class="text-xs text-signal-red-400 font-mono">{{ step.index }}</span>
          <Icon class="text-2xl text-explore-muted" :name="step.icon" />
          <div class="gap-5 grid lg:grid-cols-[0.8fr_1.2fr]">
            <h3 class="text-2xl text-explore-copy leading-tight tracking-[-0.02em] font-body sm:text-3xl">
              {{ step.title }}
            </h3>
            <p class="text-base text-explore-muted leading-relaxed font-body sm:text-lg">
              {{ step.description }}
            </p>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
