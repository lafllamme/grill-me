<script setup lang="ts">
import { roastOneBarcodeBars, roastOneFixture, roastOneReceiptTeeth } from '~/data/roast-one'

const receipt = roastOneFixture
const firstCommit = receipt.evidence.commits[0] ?? {
  repo: '—',
  sha: '—',
  message: 'No commit recorded',
  author: '—',
  date: '—',
}
const orderId = `GM-${firstCommit.sha.toUpperCase()}`
const roastTime = '2026-08-20 14:37 UTC'
const duration = '00:00:28'
</script>

<template>
  <article class="text-basalt-950 px-4 pb-7 pt-3 rounded-[24px] bg-bone-50 shadow-[0_18px_40px_rgba(15,14,13,0.18)] relative sm:px-6 sm:pt-5">
    <div class="px-1 flex left-0 right-0 justify-between absolute overflow-hidden -top-2" aria-hidden="true">
      <span v-for="tooth in roastOneReceiptTeeth" :key="tooth" class="bg-bone-50 shrink-0 h-3 w-3 rotate-45" />
    </div>

    <header class="text-[10px] text-basalt-600 tracking-[0.18em] font-meta pb-5 text-center border-b border-basalt-400 border-dashed uppercase sm:text-[11px]">
      <div class="text-basalt-950 font-semibold mb-4 flex items-center justify-between">
        <span class="tracking-[0.12em] flex gap-2 items-center"><span class="rounded-full bg-primary h-2.5 w-2.5" />GrillMe</span>
        <span>Filed</span>
      </div>
      <h2 class="text-[18px] text-basalt-950 tracking-[0.2em] font-meta">
        Roast Receipt
      </h2>
      <p class="mt-2">
        Evidence-backed · damage verified
      </p>
      <p class="mt-3">
        @{{ receipt.username }} · {{ orderId }}
      </p>
    </header>

    <dl class="text-[11px] tracking-[0.1em] font-meta py-5 border-b border-basalt-400 border-dashed uppercase sm:text-xs">
      <div class="py-1.5 flex gap-4 justify-between">
        <dt class="text-basalt-500">
          Repo
        </dt><dd class="text-right">
          {{ firstCommit.repo }}
        </dd>
      </div>
      <div class="py-1.5 flex gap-4 justify-between">
        <dt class="text-basalt-500">
          Commit
        </dt><dd>{{ firstCommit.sha }}</dd>
      </div>
      <div class="py-1.5 flex gap-4 justify-between">
        <dt class="text-basalt-500">
          Branch
        </dt><dd>main</dd>
      </div>
      <div class="py-1.5 flex gap-4 justify-between">
        <dt class="text-basalt-500">
          Roast time
        </dt><dd class="text-right">
          {{ roastTime }}
        </dd>
      </div>
      <div class="py-1.5 flex gap-4 justify-between">
        <dt class="text-basalt-500">
          Duration
        </dt><dd>{{ duration }}</dd>
      </div>
    </dl>

    <section class="py-5 border-b border-basalt-400 border-dashed">
      <div class="text-[10px] text-basalt-500 tracking-[0.14em] font-meta mb-3 flex uppercase justify-between">
        <span>Category</span><span>Score</span>
      </div>
      <div
        v-for="row in [
          ['Complexity', receipt.metrics.spaghettiIndex],
          ['Code smell', receipt.metrics.stinkScore],
          ['Ego damage', receipt.metrics.egoDamage],
        ]" :key="row[0]" class="text-xs tracking-[0.08em] font-meta py-1.5 flex uppercase justify-between"
      >
        <span>{{ row[0] }}</span><span>${{ Number(row[1]).toFixed(2) }}</span>
      </div>
    </section>

    <section class="text-xs tracking-[0.08em] font-meta py-5 border-b border-basalt-400 border-dashed uppercase">
      <div class="text-basalt-500 flex justify-between">
        <span>Roast tax</span><span>$00.00</span>
      </div>
      <div class="font-semibold mt-3 flex justify-between">
        <span>Total damage</span><span>${{ (receipt.metrics.stinkScore + receipt.metrics.spaghettiIndex + receipt.metrics.egoDamage).toFixed(2) }}</span>
      </div>
    </section>

    <section class="text-xs tracking-[0.1em] font-meta py-5 uppercase">
      <div class="text-basalt-500 flex justify-between">
        <span>Grade</span><span class="text-primary">{{ receipt.metrics.grade }}</span>
      </div>
      <div class="mt-6 flex justify-center">
        <span class="text-xl text-primary border border-primary rounded-full flex h-20 w-20 items-center justify-center">{{ receipt.metrics.grade }}</span>
      </div>
      <div aria-hidden="true" class="mt-6 flex gap-[2px] h-10 items-end justify-center">
        <span v-for="(bar, index) in roastOneBarcodeBars" :key="index" class="bg-basalt-600 h-full" :style="{ width: `${bar}px` }" />
      </div>
      <p class="text-[10px] text-basalt-500 leading-5 mt-4 text-center">
        This code was grilled.<br>Handle the truth.
      </p>
    </section>
  </article>
</template>
