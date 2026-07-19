<script setup lang="ts">
const phases = [
  {
    number: '01',
    eyebrow: 'target',
    title: 'One input. No dashboard ceremony.',
    copy: 'The GitHub handle is the beginning of the product, not a small form buried inside a marketing hero.',
    meta: ['public profile', 'commit graph', 'repository signal'],
    topClass: 'top-[5.5rem]',
  },
  {
    number: '02',
    eyebrow: 'analysis',
    title: 'Make the wait legible.',
    copy: 'Repository discovery, commit selection, and model reasoning arrive as a controlled stream. Progress becomes atmosphere and proof.',
    meta: ['fetching', 'selecting evidence', 'composing'],
    topClass: 'top-[6.65rem]',
  },
  {
    number: '03',
    eyebrow: 'reveal',
    title: 'The roast owns the room.',
    copy: 'Everything quiets down when the result lands. Supporting UI recedes so the writing and evidence have maximum impact.',
    meta: ['roast', 'technical feedback', 'shareable receipt'],
    topClass: 'top-[7.8rem]',
  },
] as const
</script>

<template>
  <section class="mx-auto px-4 py-28 max-w-[88rem] lg:px-10 lg:py-40 sm:px-6">
    <div class="mb-14 gap-8 grid lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
      <p class="text-xs text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
        scroll narrative
      </p>
      <h2 class="text-4xl text-explore-copy leading-[0.95] tracking-[-0.05em] font-display lg:text-7xl sm:text-6xl">
        Three beats. One controlled escalation.
      </h2>
    </div>

    <div class="space-y-6">
      <article
        v-for="phase in phases"
        :key="phase.number"
        class="p-6 border-[1px] border-explore-border rounded-[2rem] border-solid bg-explore-panel-high shadow-[0_-24px_80px_rgba(8,7,8,0.72)] sticky backdrop-blur-2xl lg:p-12 sm:p-9 sm:rounded-[2.75rem]"
        :class="phase.topClass"
      >
        <div class="gap-10 grid lg:grid-cols-[0.62fr_1.38fr] lg:items-end">
          <div>
            <p class="text-xs text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
              {{ phase.number }} / {{ phase.eyebrow }}
            </p>
            <p class="text-[clamp(5rem,13vw,11rem)] text-explore-copy/5 leading-none tracking-[-0.08em] font-display mt-3">
              {{ phase.number }}
            </p>
          </div>
          <div>
            <h3 class="text-3xl text-explore-copy leading-[1] tracking-[-0.045em] font-display lg:text-6xl sm:text-5xl">
              {{ phase.title }}
            </h3>
            <p class="text-base text-explore-muted leading-relaxed font-body mt-5 max-w-[60ch] sm:text-lg">
              {{ phase.copy }}
            </p>
            <div class="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <span v-for="item in phase.meta" :key="item" class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
                {{ item }}
              </span>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
