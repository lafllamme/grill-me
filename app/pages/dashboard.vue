<script setup lang="ts">
import { useHead, useSeoMeta } from '#imports'
import DashboardCommitBars from '~/components/dashboard/DashboardCommitBars.vue'
import DashboardRingChart from '~/components/dashboard/DashboardRingChart.vue'
import { roastDashboardFixture } from '~/data/roast-dashboard'

useHead({ title: 'Roast Dashboard Explorer' })
useSeoMeta({
  title: 'Roast Dashboard Explorer · grillme',
  description: 'A visual exploration of evidence-backed roast result components.',
})

const fixture = roastDashboardFixture
</script>

<template>
  <div class="text-on-background bg-background min-h-[100dvh] overflow-x-hidden">
    <div class="mx-auto px-5 pb-24 pt-6 max-w-[1440px] lg:px-12 sm:px-8">
      <header class="py-6 border-b-[1px] border-divider border-solid flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
            Dashboard exploration / v0
          </p>
          <h1 class="text-4xl text-on-background tracking-[-0.07em] font-display mt-4 sm:text-6xl">
            Roast case file
          </h1>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Mock source
          </p>
          <p class="text-sm text-on-background font-meta mt-2">
            @{{ fixture.username }} · {{ fixture.repository }}
          </p>
        </div>
      </header>

      <section class="mt-6 gap-4 grid lg:grid-cols-12">
        <article class="p-6 rounded-[28px] bg-surface lg:p-10 sm:p-8 lg:col-span-7">
          <div class="flex gap-4 items-start justify-between">
            <div>
              <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
                Verdict / headline
              </p>
              <p class="text-xs text-on-surface-variant font-meta mt-3">
                {{ fixture.identityTitle }}
              </p>
            </div>
            <span class="text-[10px] text-on-surface-variant tracking-[0.12em] px-3 py-2 border-[1px] border-outline border-solid uppercase">{{ fixture.growthLevel }}</span>
          </div>
          <h2 class="text-5xl text-on-background leading-[0.9] tracking-[-0.08em] font-display mt-14 max-w-[12ch] sm:text-7xl">
            {{ fixture.headline }}
          </h2>
          <p class="text-base text-on-surface-variant leading-7 mt-8 max-w-[34rem]">
            {{ fixture.note }}
          </p>
          <div class="mt-10 pt-6 border-t-[1px] border-divider border-solid flex flex-wrap gap-x-8 gap-y-4">
            <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary-strong tracking-[-0.08em] font-display mt-2 block">{{ fixture.grade }}</strong></div>
            <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Roast title</span><strong class="text-sm text-on-background font-meta mt-4 block">{{ fixture.identityTitle }}</strong></div>
          </div>
        </article>

        <article class="text-on-background p-6 rounded-[28px] bg-surface lg:p-10 sm:p-8 lg:col-span-12">
          <div class="flex items-center justify-between">
            <p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
              Code profile
            </p><span class="text-[10px] text-primary-strong font-meta">MOCKED</span>
          </div>
          <DashboardRingChart class="mt-8" :data="fixture.bklitProfile" />
        </article>

        <article class="p-6 rounded-[28px] bg-surface-container sm:p-8 lg:col-span-5">
          <div class="flex items-end justify-between">
            <div>
              <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
                Commit evidence
              </p><h2 class="text-2xl text-on-background tracking-[-0.05em] font-display mt-3">
                Change volume
              </h2>
            </div><span class="text-3xl text-on-background tracking-[-0.08em] font-display">{{ fixture.evidence.files }}<small class="text-xs text-on-surface-variant tracking-normal font-meta ml-1">files</small></span>
          </div>
          <DashboardCommitBars class="mt-10" :data="fixture.commits" />
        </article>

        <article class="text-on-primary-fixed p-6 rounded-[28px] bg-primary sm:p-8 lg:col-span-7">
          <p class="text-[10px] tracking-[0.18em] font-meta uppercase">
            The note / actionable aftermath
          </p>
          <div class="mt-8 divide-primary-strong/30 divide-y">
            <div v-for="(item, index) in fixture.feedback" :key="item" class="py-4 flex gap-4">
              <span class="text-sm text-on-primary-fixed/60 font-meta">0{{ index + 1 }}</span>
              <p class="text-base leading-6 max-w-[38rem]">
                {{ item }}
              </p>
            </div>
          </div>
        </article>

        <article class="p-6 rounded-[28px] bg-surface sm:p-8 lg:col-span-12">
          <div class="flex flex-wrap gap-4 items-baseline justify-between">
            <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">
              Evidence receipt
            </p><p class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
              {{ fixture.evidence.commits }} commits · +{{ fixture.evidence.additions }} / -{{ fixture.evidence.deletions }}
            </p>
          </div>
          <div class="mt-6 gap-3 grid md:grid-cols-2">
            <div v-for="commit in fixture.commits" :key="commit.label" class="px-4 py-4 rounded-[18px] bg-surface-container-low flex gap-4 items-center">
              <span class="text-xs text-primary-strong font-meta">{{ commit.label }}</span><span class="text-sm text-on-surface-variant">Evidence selected from commit history</span><span class="text-xs text-on-background font-meta ml-auto">{{ commit.files }} files</span>
            </div>
          </div>
        </article>
      </section>

      <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-8 flex flex-wrap gap-4 uppercase justify-between">
        <span>Grillme · evidence-backed roast</span><span>Exploration fixture · API contract unchanged</span>
      </footer>
    </div>
  </div>
</template>
