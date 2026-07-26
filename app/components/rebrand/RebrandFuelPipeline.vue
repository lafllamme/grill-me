<script setup lang="ts">
import { Icon } from '#components'

const pipelineSteps = [
  {
    index: '01',
    icon: 'ph:github-logo',
    title: 'Fetch the public trail',
    description: 'Recent commits, repositories, pull requests, and file-level diffs become the evidence pool.',
  },
  {
    index: '02',
    icon: 'ph:funnel',
    title: 'Separate signal from dependency noise',
    description: 'Code-heavy commits outrank lockfiles, generated output, and changes with nothing useful to say.',
  },
  {
    index: '03',
    icon: 'ph:brackets-curly',
    title: 'Build a compact case file',
    description: 'Messages, filenames, diff statistics, and safe patch excerpts are packed into a bounded prompt.',
  },
  {
    index: '04',
    icon: 'ph:sparkle',
    title: 'Stream the verdict as it lands',
    description: 'Reasoning status, title, roast points, fixes, and metrics arrive progressively instead of behind one spinner.',
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

    <div class="pt-[clamp(8rem,17vw,18rem)]">
      <div class="gap-10 grid lg:grid-cols-[0.23fr_1.77fr] lg:items-start">
        <div class="border-[1px] border-signal-red-500/28 border-solid bg-signal-red-950/55 min-h-[19rem] relative overflow-hidden">
          <div class="rounded-full bg-signal-red-600/35 h-56 w-56 left-[-5rem] top-[-4rem] absolute blur-[45px]" />
          <div class="p-6 flex flex-col inset-0 justify-between absolute">
            <Icon class="text-4xl text-signal-red-400" name="ph:flame" />
            <p class="text-[10px] text-explore-muted tracking-[0.15em] font-meta uppercase">
              Evidence engine
            </p>
          </div>
        </div>

        <h2 class="text-[clamp(3.8rem,7.8vw,9rem)] text-explore-copy leading-[0.83] tracking-[-0.075em] font-display">
          An investigation pipeline built to make the joke technically defensible.
        </h2>
      </div>
    </div>

    <div class="pb-20 pt-[clamp(8rem,14vw,14rem)] lg:ml-[25%]">
      <div class="border-t-[1px] border-white/18 border-solid">
        <article v-for="step in pipelineSteps" :key="step.index" class="py-9 border-b-[1px] border-white/18 border-solid gap-6 grid lg:py-12 sm:grid-cols-[3rem_3rem_minmax(0,1fr)]">
          <span class="text-xs text-signal-red-400 font-mono">{{ step.index }}</span>
          <Icon class="text-2xl text-explore-muted" :name="step.icon" />
          <div class="gap-5 grid lg:grid-cols-[0.8fr_1.2fr]">
            <h3 class="text-2xl text-explore-copy leading-tight tracking-[-0.035em] font-display sm:text-3xl">
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
