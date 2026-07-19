<script setup lang="ts">
import { NuxtLink } from '#components'
import { useHead, useSeoMeta } from '#imports'
import LandingTopNav from '~/components/LandingTopNav.vue'
import PrismGradientBackground from '~/components/PrismGradientBackground.client.vue'
import RebrandPhaseStack from '~/components/rebrand/RebrandPhaseStack.vue'
import RebrandRoastStage from '~/components/rebrand/RebrandRoastStage.vue'

definePageMeta({ layout: false })

useHead({ title: 'Grillme Rebrand Exploration 01' })
useSeoMeta({
  description: 'Internal Grillme rebrand exploration: soft geometry, Signal Red, and a stage-first roast experience.',
})

const prismColors = {
  dark: ['#050202', '#981B27', '#F0444D'],
  light: ['#050202', '#981B27', '#F0444D'],
} as const

const designPrinciples = [
  {
    index: 'A',
    title: 'Macro softness',
    copy: 'Rounding belongs first to the stage and section shell. Inner controls tighten progressively so hierarchy remains visible.',
    className: 'lg:col-span-7',
  },
  {
    index: 'B',
    title: 'Signal, not wallpaper',
    copy: 'Red marks activity, pressure, and reveal. Its exact temperature can change while warm black still carries the readable product surface.',
    className: 'lg:col-span-5',
  },
  {
    index: 'C',
    title: 'Atmosphere survives',
    copy: 'Content floats in a small number of dark shells. Gutters and masked transitions let the animated background breathe.',
    className: 'lg:col-span-5',
  },
  {
    index: 'D',
    title: 'The product is the image',
    copy: 'Commit evidence, streaming state, and the roast itself replace generic illustrations. The interface becomes the hero artifact.',
    className: 'lg:col-span-7',
  },
] as const
</script>

<template>
  <div data-testid="rebrand-exploration-root" class="text-explore-copy bg-explore-ink min-h-screen selection:text-explore-copy selection:bg-explore-signal">
    <div class="pointer-events-none inset-0 fixed z-0">
      <PrismGradientBackground
        class="inset-0 absolute"
        :speed="0.72"
        radius="0px"
        :noise="{ opacity: 0.07, scale: 1.25 }"
        :colors="prismColors"
      />
      <div class="bg-black/18 inset-0 absolute" />
    </div>

    <LandingTopNav variant="signal" />

    <div class="relative z-10 overflow-clip">
      <main>
        <section class="mx-auto px-4 pb-24 pt-24 flex flex-col max-w-[88rem] min-h-[82dvh] justify-between lg:px-10 sm:px-6 lg:pb-32 sm:pt-32">
          <div class="gap-10 grid lg:grid-cols-[1.24fr_0.76fr] lg:items-end">
            <div>
              <p class="text-xs text-explore-signal-bright tracking-[0.22em] font-meta uppercase">
                public commits / private consequences
              </p>
              <h1 class="text-[clamp(4.4rem,12vw,10.5rem)] text-explore-copy leading-[0.78] tracking-[-0.075em] font-display font-semibold mt-8 max-w-[9ch]">
                Your code remembers.
              </h1>
            </div>
            <div class="pb-2 lg:pb-6">
              <p class="text-lg text-explore-copy/90 leading-relaxed font-body max-w-[34rem] sm:text-xl">
                Grillme reads the trail you left on GitHub, then turns it into a roast with receipts.
              </p>
              <p class="text-base text-explore-muted leading-relaxed font-body mt-5 max-w-[34rem]">
                No chat window. No dashboard prelude. One target, a visible analysis stream, and a result built to land.
              </p>
              <div class="mt-8 flex gap-6 items-center">
                <a href="#roast-stage" class="text-xs text-explore-copy tracking-[0.12em] font-label px-6 py-3.5 rounded-xl bg-explore-signal uppercase shadow-[0_16px_44px_var(--explore-shadow)] transition-all duration-200 hover:text-explore-ink hover:bg-explore-signal-bright active:translate-y-0 hover:-translate-y-0.5">
                  choose a target
                </a>
                <span class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">scroll to inspect</span>
              </div>
            </div>
          </div>
        </section>

        <RebrandRoastStage />

        <div class="h-40 pointer-events-none relative z-10 from-transparent to-explore-ink via-explore-ink/78 bg-gradient-to-b -mt-14" />

        <section class="bg-explore-ink relative">
          <div class="mx-auto px-4 pb-24 pt-14 max-w-[88rem] lg:px-10 sm:px-6 lg:pb-36 lg:pt-20">
            <div class="gap-10 grid lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
              <div class="lg:top-24 lg:sticky">
                <p class="text-xs text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
                  the working language
                </p>
                <h2 class="text-4xl text-explore-copy leading-[0.95] tracking-[-0.05em] font-display mt-5 sm:text-6xl">
                  Soft structure. Sharp outcome.
                </h2>
              </div>
              <div class="gap-4 grid lg:grid-cols-12">
                <article
                  v-for="principle in designPrinciples"
                  :key="principle.index"
                  class="p-6 border-[1px] border-explore-border rounded-[2rem] border-solid bg-explore-panel flex flex-col min-h-64 justify-between backdrop-blur-xl sm:p-8"
                  :class="principle.className"
                >
                  <span class="text-xs text-explore-signal-bright font-meta">{{ principle.index }}</span>
                  <div>
                    <h3 class="text-2xl text-explore-copy tracking-[-0.035em] font-display sm:text-3xl">
                      {{ principle.title }}
                    </h3>
                    <p class="text-sm text-explore-muted leading-relaxed font-body mt-4 max-w-[48ch] sm:text-base">
                      {{ principle.copy }}
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section class="pt-12 relative from-explore-ink to-transparent via-explore-ink/92 bg-gradient-to-b">
          <RebrandPhaseStack />
        </section>

        <section class="mx-auto px-4 pb-6 max-w-[88rem] lg:px-10 sm:px-6">
          <div class="px-6 py-16 border-[1px] border-explore-border rounded-[2.5rem] border-solid bg-explore-panel/68 shadow-[0_28px_120px_var(--explore-shadow)] backdrop-blur-2xl lg:px-16 sm:px-10 sm:py-24 sm:rounded-[3.5rem]">
            <p class="text-xs text-explore-signal-bright tracking-[0.2em] font-meta uppercase">
              final reveal
            </p>
            <div class="mt-8 gap-10 grid lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
              <h2 class="text-5xl text-explore-copy leading-[0.88] tracking-[-0.06em] font-display lg:text-8xl sm:text-7xl">
                Let the result be the loudest thing on the page.
              </h2>
              <div>
                <p class="text-base text-explore-muted leading-relaxed font-body max-w-[34rem]">
                  The background returns, the chrome recedes, and the roast lands as a shareable artifact rather than another terminal response.
                </p>
                <a href="#roast-stage" class="text-xs text-explore-copy tracking-[0.12em] font-label mt-7 inline-flex uppercase">
                  return to chamber →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer class="mx-auto px-4 py-10 flex gap-4 max-w-[88rem] items-center justify-between lg:px-10 sm:px-6">
        <p class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase">
          Grillme / rebrand exploration
        </p>
        <NuxtLink to="/test" class="text-[10px] text-explore-muted tracking-[0.14em] font-meta uppercase hover:text-explore-copy">
          previous token lab
        </NuxtLink>
      </footer>
    </div>
  </div>
</template>
