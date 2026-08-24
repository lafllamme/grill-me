<script setup lang="ts">
import type { RoastOneLayout } from '~/data/roast-one-lab'
import { computed, ref } from 'vue'
import RoastOneAnimatedReceipt from '~/components/roast-one/RoastOneAnimatedReceipt.vue'
import RoastOneGradeStar from '~/components/roast-one/RoastOneGradeStar.vue'
import RoastOneLayoutSwitcher from '~/components/roast-one/RoastOneLayoutSwitcher.vue'
import RoastOneScoreMatrix from '~/components/roast-one/RoastOneScoreMatrix.vue'
import { roastOneFixture } from '~/data/roast-one'
import {
  roastOneLabDimensions,
  roastOneLabEvidence,
  roastOneLabLayouts,
  roastOneLabMetrics,
} from '~/data/roast-one-lab'

const activeLayout = ref<RoastOneLayout>('01')
const selectedLabel = computed(() => roastOneLabLayouts.find(layout => layout.id === activeLayout.value)?.label ?? '')
const roastLevel = computed(() => roastOneFixture.intensity.label.replace('_', ' '))
const roastQuote = computed(() => roastOneFixture.roastLines[0] ?? roastOneFixture.roast)
const primaryFeedback = computed(() => roastOneFixture.feedback.slice(0, 3))
const evidenceCommitCount = computed(() => roastOneFixture.evidence.commits.length)
const changedFileCount = computed(() => roastOneFixture.evidence.commits.reduce((total, commit) => total + commit.changedFiles, 0))

function selectLayout(layout: RoastOneLayout) {
  activeLayout.value = layout
}
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
    <header class="mb-8 flex flex-col gap-5 border-b border-divider pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Roast 1 / composition lab</p>
        <h1 class="text-4xl text-on-background tracking-[-0.06em] font-display mt-3 sm:text-6xl">Four ways to read the damage.</h1>
        <p class="text-sm text-on-surface-variant mt-3">{{ selectedLabel }} · same evidence, different editorial frame.</p>
      </div>
      <RoastOneLayoutSwitcher :active-layout="activeLayout" @select="selectLayout" />
    </header>

    <div v-if="activeLayout === '01'" class="grid gap-4 lg:grid-cols-12">
      <div class="rounded-[32px] bg-bone-50 p-4 sm:p-6 lg:col-span-3 lg:p-7"><RoastOneAnimatedReceipt /></div>
      <div class="rounded-[32px] bg-surface p-6 sm:p-8 lg:col-span-5 lg:p-10">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Verdict / {{ roastLevel }}</p>
        <h2 class="max-w-[11ch] text-5xl text-on-background tracking-[-0.08em] font-display leading-[0.88] mt-8 sm:text-7xl">{{ roastOneFixture.title }}</h2>
        <div class="mt-10 border-y border-divider py-5 flex items-end justify-between"><span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Grade</span><strong class="text-7xl text-primary tracking-[-0.1em] font-display">{{ roastOneFixture.metrics.grade }}</strong></div>
        <RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="sm" />
      </div>
      <div class="rounded-[32px] bg-surface-container p-6 sm:p-8 lg:col-span-4 lg:p-10">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Roast note</p>
        <blockquote class="text-2xl text-on-background tracking-[-0.04em] leading-tight mt-8 sm:text-4xl">“{{ roastQuote }}”</blockquote>
        <div class="divide-y divide-divider mt-10"><div v-for="(line, index) in primaryFeedback" :key="line" class="py-4 flex gap-4"><span class="text-xs text-primary font-meta">0{{ index + 1 }}</span><p class="text-sm text-on-surface-variant leading-6">{{ line }}</p></div></div>
      </div>
      <div class="rounded-[24px] bg-surface px-5 py-4 lg:col-span-12 flex flex-wrap gap-x-8 gap-y-3 items-center justify-between"><span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Evidence trail</span><span class="text-xs text-on-background font-meta">{{ evidenceCommitCount }} commits · {{ changedFileCount }} changed files</span><span class="text-xs text-primary font-meta">{{ roastOneFixture.metrics.specialTitle }}</span></div>
    </div>

    <div v-else-if="activeLayout === '02'" class="rounded-[36px] bg-bone-50 p-3 sm:p-5 lg:p-6">
      <div class="grid gap-4 lg:grid-cols-12">
        <div class="rounded-[28px] bg-surface p-4 sm:p-6 lg:col-span-4"><RoastOneAnimatedReceipt /></div>
        <div class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-5 lg:p-10"><p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Main read / roast 01</p><h2 class="max-w-[10ch] text-6xl text-on-background tracking-[-0.08em] font-display leading-[0.88] mt-8 sm:text-8xl">{{ roastOneFixture.title }}</h2><p class="max-w-[30rem] text-base text-on-surface-variant leading-7 mt-8">{{ roastOneFixture.roast }}</p><div class="border-t-[1px] border-divider mt-8 pt-6 flex items-center gap-5"><RoastOneGradeStar :grade="roastOneFixture.metrics.grade" size="sm" /><div><p class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">Grade</p><p class="text-2xl text-primary font-display mt-2">{{ roastOneFixture.metrics.grade }}</p></div></div></div>
        <div class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-3"><p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Profile</p><div class="mt-5 space-y-5"><div v-for="metric in roastOneLabMetrics" :key="metric.key"><div class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta uppercase flex justify-between"><span>{{ metric.label }}</span><span>{{ metric.value }}</span></div><div class="h-1 rounded-full bg-surface-container mt-2"><div class="h-full rounded-full bg-primary" :style="{ width: `${metric.value}%` }" /></div><p class="text-[10px] text-on-surface-variant mt-2">{{ metric.descriptor }}</p></div></div></div>
        <div class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-8"><p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Quote / the short version</p><blockquote class="max-w-[34rem] text-2xl text-on-background tracking-[-0.04em] leading-tight mt-5 sm:text-4xl">“{{ roastQuote }}”</blockquote></div>
        <div class="rounded-[28px] bg-primary p-6 text-basalt-950 sm:p-8 lg:col-span-4"><p class="text-[10px] tracking-[0.18em] font-meta uppercase">Fix direction</p><p class="text-lg tracking-[-0.03em] leading-6 mt-5">{{ primaryFeedback[0] }}</p><span class="text-[10px] tracking-[0.14em] font-meta block mt-8 uppercase">Make it less tangled.</span></div>
      </div>
    </div>

    <div v-else-if="activeLayout === '03'" class="grid gap-4 lg:grid-cols-12">
      <div class="rounded-[32px] bg-surface p-4 sm:p-6 lg:col-span-4 lg:p-8"><p class="text-[10px] text-primary tracking-[0.18em] font-meta mb-5 uppercase">Code profile</p><RoastOneScoreMatrix :dimensions="roastOneLabDimensions" /><RoastOneAnimatedReceipt class="mt-6" /></div>
      <div class="rounded-[32px] bg-bone-50 p-6 text-basalt-950 sm:p-8 lg:col-span-3 lg:p-10"><p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Roast level</p><p class="text-sm tracking-[0.16em] font-meta mt-8 uppercase">{{ roastLevel }}</p><strong class="text-8xl text-primary tracking-[-0.12em] font-display leading-none block mt-10">{{ roastOneFixture.metrics.grade }}</strong><p class="text-sm text-basalt-600 leading-6 mt-8">{{ roastOneFixture.metrics.specialTitle }}</p><RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="sm" tone="light" /></div>
      <div class="rounded-[32px] bg-surface-container p-6 sm:p-8 lg:col-span-5 lg:p-10"><p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">The read</p><blockquote class="text-3xl text-on-background tracking-[-0.05em] leading-tight mt-8 sm:text-5xl">“{{ roastQuote }}”</blockquote><div class="border-t border-divider mt-10 pt-6"><p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Why it landed</p><p class="text-sm text-on-background leading-6 mt-4">{{ roastOneFixture.feedback[1] }}</p></div></div>
      <div class="rounded-[24px] bg-surface p-5 lg:col-span-12"><div class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mb-3 uppercase">Evidence, in plain sight</div><div class="grid gap-3 md:grid-cols-3"><div v-for="item in roastOneLabEvidence" :key="item.id" class="border-l-2 border-primary pl-4"><p class="text-xs text-on-background font-semibold">{{ item.title }}</p><p class="text-[10px] text-on-surface-variant mt-2">{{ item.files }} files · {{ item.impact }} impact</p></div></div></div>
    </div>

    <div v-else class="rounded-[36px] bg-bone-50 p-3 sm:p-5 lg:p-6">
      <div class="rounded-[30px] bg-surface-container p-4 sm:p-6 lg:p-8">
        <div class="grid gap-4 lg:grid-cols-12">
          <div class="lg:col-span-4"><RoastOneAnimatedReceipt /></div>
          <div class="rounded-[26px] bg-surface p-6 sm:p-8 lg:col-span-8 lg:p-10">
            <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Roast service / active case</p>
            <h2 class="max-w-[12ch] text-6xl text-on-background tracking-[-0.08em] font-display leading-[0.88] mt-8 sm:text-8xl">{{ roastOneFixture.title }}</h2>
            <div class="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary font-display block mt-2">{{ roastOneFixture.metrics.grade }}</strong></div>
              <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Intensity</span><strong class="text-lg text-on-background font-meta block mt-3 uppercase">{{ roastLevel }}</strong></div>
            </div>
            <RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="md" />
          </div>
        </div>
      </div>
      <div class="grid gap-4 mt-4 lg:grid-cols-12">
        <div class="rounded-[26px] bg-surface p-6 lg:col-span-7">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">What the code says</p>
          <blockquote class="max-w-[32rem] text-2xl text-on-background tracking-[-0.04em] leading-tight mt-6 sm:text-4xl">“{{ roastQuote }}”</blockquote>
          <div class="divide-y divide-divider mt-8"><p v-for="line in primaryFeedback" :key="line" class="text-sm text-on-surface-variant leading-6 py-4">{{ line }}</p></div>
        </div>
        <div class="rounded-[26px] bg-surface p-6 lg:col-span-5">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">Service log</p>
          <div class="divide-y divide-divider mt-4"><div v-for="item in roastOneLabEvidence" :key="item.id" class="py-4 flex gap-4 justify-between"><span class="text-xs text-on-background">{{ item.index }} / {{ item.repo }}</span><span class="text-[10px] text-on-surface-variant text-right">{{ item.files }} files<br>{{ item.impact }} impact</span></div></div>
        </div>
      </div>
    </div>

    <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-8 flex flex-wrap gap-4 justify-between uppercase"><span>GrillMe · evidence-backed roast</span><span>Four compositions · one payload · no fake certainty</span></footer>
  </section>
</template>
