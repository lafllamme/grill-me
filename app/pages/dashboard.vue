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
    <div class="mx-auto px-5 pb-24 pt-6 max-w-[1440px] sm:px-8 lg:px-12">
      <header class="py-6 flex flex-col gap-5 border-b-[1px] border-divider border-solid sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Dashboard exploration / v0</p>
          <h1 class="text-4xl text-on-background tracking-[-0.07em] font-display mt-4 sm:text-6xl">Roast case file</h1>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Mock source</p>
          <p class="text-sm text-on-background font-meta mt-2">@{{ fixture.username }} · {{ fixture.repository }}</p>
        </div>
      </header>

      <section class="grid gap-4 mt-6 lg:grid-cols-12">
        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-7 lg:p-10">
          <div class="flex gap-4 items-start justify-between">
            <div>
              <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Verdict / headline</p>
              <p class="text-xs text-on-surface-variant font-meta mt-3">{{ fixture.identityTitle }}</p>
            </div>
            <span class="text-[10px] text-on-surface-variant tracking-[0.12em] px-3 py-2 border-[1px] border-outline border-solid uppercase">{{ fixture.growthLevel }}</span>
          </div>
          <h2 class="max-w-[12ch] text-5xl text-on-background tracking-[-0.08em] font-display leading-[0.9] mt-14 sm:text-7xl">{{ fixture.headline }}</h2>
          <p class="max-w-[34rem] text-base text-on-surface-variant leading-7 mt-8">{{ fixture.note }}</p>
          <div class="pt-6 mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t-[1px] border-divider border-solid">
            <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary-strong tracking-[-0.08em] font-display block mt-2">{{ fixture.grade }}</strong></div>
            <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Roast title</span><strong class="text-sm text-on-background font-meta block mt-4">{{ fixture.identityTitle }}</strong></div>
          </div>
        </article>

        <article class="rounded-[28px] bg-surface p-6 text-on-background sm:p-8 lg:col-span-12 lg:p-10">
          <div class="flex items-center justify-between"><p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">Code profile</p><span class="text-[10px] text-primary-strong font-meta">MOCKED</span></div>
          <DashboardRingChart class="mt-8" :data="fixture.bklitProfile" />
        </article>

        <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-5">
          <div class="flex items-end justify-between"><div><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Commit evidence</p><h2 class="text-2xl text-on-background tracking-[-0.05em] font-display mt-3">Change volume</h2></div><span class="text-3xl text-on-background tracking-[-0.08em] font-display">{{ fixture.evidence.files }}<small class="text-xs text-on-surface-variant tracking-normal ml-1 font-meta">files</small></span></div>
          <DashboardCommitBars class="mt-10" :data="fixture.commits" />
        </article>

        <article class="rounded-[28px] bg-primary p-6 text-on-primary-fixed sm:p-8 lg:col-span-7">
          <p class="text-[10px] tracking-[0.18em] font-meta uppercase">The note / actionable aftermath</p>
          <div class="divide-primary-strong/30 divide-y mt-8">
            <div v-for="(item, index) in fixture.feedback" :key="item" class="py-4 flex gap-4">
              <span class="text-sm text-on-primary-fixed/60 font-meta">0{{ index + 1 }}</span>
              <p class="max-w-[38rem] text-base leading-6">{{ item }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12">
          <div class="flex flex-wrap gap-4 items-baseline justify-between"><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Evidence receipt</p><p class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">{{ fixture.evidence.commits }} commits · +{{ fixture.evidence.additions }} / -{{ fixture.evidence.deletions }}</p></div>
          <div class="grid gap-3 mt-6 md:grid-cols-2"><div v-for="commit in fixture.commits" :key="commit.label" class="rounded-[18px] bg-surface-container-low px-4 py-4 flex gap-4 items-center"><span class="text-xs text-primary-strong font-meta">{{ commit.label }}</span><span class="text-sm text-on-surface-variant">Evidence selected from commit history</span><span class="text-xs text-on-background ml-auto font-meta">{{ commit.files }} files</span></div></div>
        </article>
      </section>

      <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme · evidence-backed roast</span><span>Exploration fixture · API contract unchanged</span></footer>
    </div>
  </div>
</template>
