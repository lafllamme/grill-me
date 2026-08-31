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
  <section class="mx-auto px-4 pb-20 pt-8 max-w-[1440px] lg:px-8 sm:px-6 lg:pt-12">
    <header class="mb-8 pb-6 border-b border-divider flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
          Roast 1 / composition lab
        </p>
        <h1 class="text-4xl text-on-background tracking-[-0.06em] font-display mt-3 sm:text-6xl">
          Four ways to read the damage.
        </h1>
        <p class="text-sm text-on-surface-variant mt-3">
          {{ selectedLabel }} · same evidence, different editorial frame.
        </p>
      </div>
      <RoastOneLayoutSwitcher :active-layout="activeLayout" @select="selectLayout" />
    </header>

    <div v-if="activeLayout === '01'" class="gap-4 grid lg:grid-cols-12">
      <div class="p-4 rounded-[32px] bg-bone-50 lg:p-7 sm:p-6 lg:col-span-3">
        <RoastOneAnimatedReceipt />
      </div>
      <div class="p-6 rounded-[32px] bg-surface lg:p-10 sm:p-8 lg:col-span-5">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
          Verdict / {{ roastLevel }}
        </p>
        <h2 class="text-5xl text-on-background leading-[0.88] tracking-[-0.08em] font-display mt-8 max-w-[11ch] sm:text-7xl">
          {{ roastOneFixture.title }}
        </h2>
        <div class="mt-10 py-5 border-y border-divider flex items-end justify-between">
          <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Grade</span><strong class="text-7xl text-primary tracking-[-0.1em] font-display">{{ roastOneFixture.metrics.grade }}</strong>
        </div>
        <RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="sm" />
      </div>
      <div class="p-6 rounded-[32px] bg-surface-container lg:p-10 sm:p-8 lg:col-span-4">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
          Roast note
        </p>
        <blockquote class="text-2xl text-on-background leading-tight tracking-[-0.04em] mt-8 sm:text-4xl">
          “{{ roastQuote }}”
        </blockquote>
        <div class="mt-10 divide-divider divide-y">
          <div v-for="(line, index) in primaryFeedback" :key="line" class="py-4 flex gap-4">
            <span class="text-xs text-primary font-meta">0{{ index + 1 }}</span><p class="text-sm text-on-surface-variant leading-6">
              {{ line }}
            </p>
          </div>
        </div>
      </div>
      <div class="px-5 py-4 rounded-[24px] bg-surface flex flex-wrap gap-x-8 gap-y-3 items-center justify-between lg:col-span-12">
        <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Evidence trail</span><span class="text-xs text-on-background font-meta">{{ evidenceCommitCount }} commits · {{ changedFileCount }} changed files</span><span class="text-xs text-primary font-meta">{{ roastOneFixture.metrics.specialTitle }}</span>
      </div>
    </div>

    <div v-else-if="activeLayout === '02'" class="p-3 rounded-[36px] bg-bone-50 lg:p-6 sm:p-5">
      <div class="gap-4 grid lg:grid-cols-12">
        <div class="p-4 rounded-[28px] bg-surface sm:p-6 lg:col-span-4">
          <RoastOneAnimatedReceipt />
        </div>
        <div class="p-6 rounded-[28px] bg-surface-container lg:p-10 sm:p-8 lg:col-span-5">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
            Main read / roast 01
          </p><h2 class="text-6xl text-on-background leading-[0.88] tracking-[-0.08em] font-display mt-8 max-w-[10ch] sm:text-8xl">
            {{ roastOneFixture.title }}
          </h2><p class="text-base text-on-surface-variant leading-7 mt-8 max-w-[30rem]">
            {{ roastOneFixture.roast }}
          </p><div class="mt-8 pt-6 border-t-[1px] border-divider flex gap-5 items-center">
            <RoastOneGradeStar :grade="roastOneFixture.metrics.grade" size="sm" /><div>
              <p class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">
                Grade
              </p><p class="text-2xl text-primary font-display mt-2">
                {{ roastOneFixture.metrics.grade }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-6 rounded-[28px] bg-surface sm:p-8 lg:col-span-3">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
            Profile
          </p><div class="mt-5 space-y-5">
            <div v-for="metric in roastOneLabMetrics" :key="metric.key">
              <div class="text-[10px] text-on-surface-variant tracking-[0.12em] font-meta flex uppercase justify-between">
                <span>{{ metric.label }}</span><span>{{ metric.value }}</span>
              </div><div class="mt-2 rounded-full bg-surface-container h-1">
                <div class="rounded-full bg-primary h-full" :style="{ width: `${metric.value}%` }" />
              </div><p class="text-[10px] text-on-surface-variant mt-2">
                {{ metric.descriptor }}
              </p>
            </div>
          </div>
        </div>
        <div class="p-6 rounded-[28px] bg-surface sm:p-8 lg:col-span-8">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
            Quote / the short version
          </p><blockquote class="text-2xl text-on-background leading-tight tracking-[-0.04em] mt-5 max-w-[34rem] sm:text-4xl">
            “{{ roastQuote }}”
          </blockquote>
        </div>
        <div class="text-basalt-950 p-6 rounded-[28px] bg-primary sm:p-8 lg:col-span-4">
          <p class="text-[10px] tracking-[0.18em] font-meta uppercase">
            Fix direction
          </p><p class="text-lg leading-6 tracking-[-0.03em] mt-5">
            {{ primaryFeedback[0] }}
          </p><span class="text-[10px] tracking-[0.14em] font-meta mt-8 block uppercase">Make it less tangled.</span>
        </div>
      </div>
    </div>

    <div v-else-if="activeLayout === '03'" class="gap-4 grid lg:grid-cols-12">
      <div class="p-4 rounded-[32px] bg-surface lg:p-8 sm:p-6 lg:col-span-4">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta mb-5 uppercase">
          Code profile
        </p><RoastOneScoreMatrix :dimensions="roastOneLabDimensions" /><RoastOneAnimatedReceipt class="mt-6" />
      </div>
      <div class="text-basalt-950 p-6 rounded-[32px] bg-bone-50 lg:p-10 sm:p-8 lg:col-span-3">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
          Roast level
        </p><p class="text-sm tracking-[0.16em] font-meta mt-8 uppercase">
          {{ roastLevel }}
        </p><strong class="text-8xl text-primary leading-none tracking-[-0.12em] font-display mt-10 block">{{ roastOneFixture.metrics.grade }}</strong><p class="text-sm text-basalt-600 leading-6 mt-8">
          {{ roastOneFixture.metrics.specialTitle }}
        </p><RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="sm" tone="light" />
      </div>
      <div class="p-6 rounded-[32px] bg-surface-container lg:p-10 sm:p-8 lg:col-span-5">
        <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
          The read
        </p><blockquote class="text-3xl text-on-background leading-tight tracking-[-0.05em] mt-8 sm:text-5xl">
          “{{ roastQuote }}”
        </blockquote><div class="mt-10 pt-6 border-t border-divider">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
            Why it landed
          </p><p class="text-sm text-on-background leading-6 mt-4">
            {{ roastOneFixture.feedback[1] }}
          </p>
        </div>
      </div>
      <div class="p-5 rounded-[24px] bg-surface lg:col-span-12">
        <div class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mb-3 uppercase">
          Evidence, in plain sight
        </div><div class="gap-3 grid md:grid-cols-3">
          <div v-for="item in roastOneLabEvidence" :key="item.id" class="pl-4 border-l-2 border-primary">
            <p class="text-xs text-on-background font-semibold">
              {{ item.title }}
            </p><p class="text-[10px] text-on-surface-variant mt-2">
              {{ item.files }} files · {{ item.impact }} impact
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-3 rounded-[36px] bg-bone-50 lg:p-6 sm:p-5">
      <div class="p-4 rounded-[30px] bg-surface-container lg:p-8 sm:p-6">
        <div class="gap-4 grid lg:grid-cols-12">
          <div class="lg:col-span-4">
            <RoastOneAnimatedReceipt />
          </div>
          <div class="p-6 rounded-[26px] bg-surface lg:p-10 sm:p-8 lg:col-span-8">
            <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
              Roast service / active case
            </p>
            <h2 class="text-6xl text-on-background leading-[0.88] tracking-[-0.08em] font-display mt-8 max-w-[12ch] sm:text-8xl">
              {{ roastOneFixture.title }}
            </h2>
            <div class="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary font-display mt-2 block">{{ roastOneFixture.metrics.grade }}</strong></div>
              <div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Intensity</span><strong class="text-lg text-on-background font-meta mt-3 block uppercase">{{ roastLevel }}</strong></div>
            </div>
            <RoastOneGradeStar class="mt-8" :grade="roastOneFixture.metrics.grade" size="md" />
          </div>
        </div>
      </div>
      <div class="mt-4 gap-4 grid lg:grid-cols-12">
        <div class="p-6 rounded-[26px] bg-surface lg:col-span-7">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
            What the code says
          </p>
          <blockquote class="text-2xl text-on-background leading-tight tracking-[-0.04em] mt-6 max-w-[32rem] sm:text-4xl">
            “{{ roastQuote }}”
          </blockquote>
          <div class="mt-8 divide-divider divide-y">
            <p v-for="line in primaryFeedback" :key="line" class="text-sm text-on-surface-variant leading-6 py-4">
              {{ line }}
            </p>
          </div>
        </div>
        <div class="p-6 rounded-[26px] bg-surface lg:col-span-5">
          <p class="text-[10px] text-primary tracking-[0.18em] font-meta uppercase">
            Service log
          </p>
          <div class="mt-4 divide-divider divide-y">
            <div v-for="item in roastOneLabEvidence" :key="item.id" class="py-4 flex gap-4 justify-between">
              <span class="text-xs text-on-background">{{ item.index }} / {{ item.repo }}</span><span class="text-[10px] text-on-surface-variant text-right">{{ item.files }} files<br>{{ item.impact }} impact</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-8 flex flex-wrap gap-4 uppercase justify-between">
      <span>GrillMe · evidence-backed roast</span><span>Four compositions · one payload · no fake certainty</span>
    </footer>
  </section>
</template>
