<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'

defineProps<{ roast: RoastExplorerFixture }>()
</script>

<template>
  <section class="text-basalt-950 p-5 rounded-[24px] bg-bone-100 sm:p-7">
    <div class="text-xs tracking-[0.14em] font-meta pb-4 border-b border-basalt-300 flex uppercase items-center justify-between">
      <span><span class="text-primary mr-2">/</span> Roast quote</span><span>01 / 06</span>
    </div>
    <blockquote class="text-[clamp(1.7rem,3vw,3rem)] leading-[0.98] tracking-[-0.04em] font-accent mt-7 max-w-[34rem]">
      “{{ roast.roastLines[0] }}”
    </blockquote>
    <p class="text-xs text-basalt-600 tracking-[0.12em] font-meta mt-5 uppercase">
      — GrillMe / evidence-backed
    </p>

    <div class="mt-8 pt-5 border-t border-basalt-300">
      <div class="text-xs tracking-[0.14em] font-meta flex uppercase items-center justify-between">
        <span><span class="text-primary mr-2">/</span> Evidence</span><span>Impact</span>
      </div>
      <div v-for="(commit, index) in roast.evidence.commits" :key="commit.sha" class="mt-4 pb-4 border-b border-basalt-300">
        <div class="text-[11px] font-meta gap-3 grid grid-cols-[2.5rem_1fr_auto] uppercase items-start">
          <span class="text-primary px-1 py-1 text-center border border-basalt-400 rounded-full">{{ index === 0 ? 'H' : 'M' }}</span>
          <div>
            <p class="tracking-normal font-semibold normal-case">
              {{ commit.message }}
            </p><p class="text-[10px] text-basalt-600 mt-1">
              {{ commit.repo }} · {{ commit.sha }}
            </p>
          </div>
          <span class="text-primary">-{{ commit.deletions }}</span>
        </div>
      </div>
    </div>

    <div class="mt-8 pt-5 border-t border-basalt-300">
      <div class="text-xs tracking-[0.14em] font-meta uppercase">
        <span class="text-primary mr-2">/</span> Fix preview
      </div>
      <div class="mt-4 gap-3 grid sm:grid-cols-2">
        <div class="text-[10px] text-bone-200 leading-5 font-meta p-3 rounded-xl bg-basalt-900">
          <div class="text-basalt-400 mb-2 pb-2 border-b border-basalt-700">
            before
          </div><pre class="whitespace-pre-wrap">watch(status, () =&gt; syncReasoning())</pre>
        </div>
        <div class="text-[10px] text-bone-100 leading-5 font-meta p-3 rounded-xl bg-basalt-800">
          <div class="text-bone-400 mb-2 pb-2 border-b border-basalt-600">
            after
          </div><pre class="whitespace-pre-wrap">const reasoning = computed(() =&gt; getReasoning(status))</pre>
        </div>
      </div>
      <div class="text-[10px] text-basalt-700 tracking-[0.1em] font-meta mt-4 px-4 py-3 border border-basalt-300 rounded-xl uppercase">
        Impact: fewer wrappers, one typed source of truth.
      </div>
    </div>
  </section>
</template>
