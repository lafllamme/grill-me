<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'

defineProps<{ fixture: RoastExplorerFixture, isStreaming: boolean }>()
</script>

<template>
  <div class="p-5 bg-surface-container-low lg:p-12 sm:p-8">
    <div class="border-[1px] border-divider rounded-[1.5rem] border-solid grid overflow-hidden lg:grid-cols-[0.36fr_0.64fr]">
      <aside class="p-6 bg-background sm:p-9">
        <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
          Grillme records
        </p>
        <span class="text-[9px] text-on-surface-variant tracking-[0.14em] font-meta mt-10 px-2 py-1 border-[1px] border-outline border-solid inline-block uppercase">Explicit roast</span>
        <p class="text-xs text-primary tracking-[0.16em] font-meta mt-12 uppercase">
          @{{ fixture.username }}
        </p>
        <h2 class="text-[clamp(2.2rem,5vw,5rem)] text-on-surface leading-[0.86] tracking-[-0.065em] font-display mt-5">
          {{ fixture.title }}
        </h2>
        <p class="text-sm text-on-surface-variant font-body mt-5">
          {{ fixture.evidence.commits[0]?.repo }}
        </p>
        <div class="mt-12 flex gap-4 items-end">
          <span class="text-5xl text-primary leading-none font-display">{{ fixture.metrics.grade }}</span><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta uppercase">certified roast</span>
        </div>
      </aside>
      <section class="bg-surface-container">
        <div class="p-5 border-b-[1px] border-divider border-solid flex gap-4 items-center justify-between sm:p-7">
          <p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
            Tracklist
          </p><span class="text-[10px] text-on-surface-variant font-meta">{{ isStreaming ? 'streaming' : `${fixture.roastLines.length} tracks` }}</span>
        </div>
        <ol>
          <li v-for="(line, index) in fixture.roastLines" :key="line" class="px-5 py-6 border-b-[1px] border-divider border-solid gap-4 grid grid-cols-[2rem_1fr] sm:px-7 sm:grid-cols-[2rem_1fr_auto]">
            <span class="text-sm text-primary font-meta">{{ String(index + 1).padStart(2, '0') }}</span>
            <p class="text-base text-on-surface leading-relaxed font-body">
              {{ line }}
            </p>
            <span class="text-[10px] text-on-surface-variant font-meta hidden sm:block">0:{{ String(30 + index * 7).padStart(2, '0') }}</span>
          </li>
        </ol>
        <div class="p-5 sm:p-7">
          <p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">
            Producer notes
          </p><ul class="mt-4 space-y-3">
            <li v-for="item in fixture.feedback" :key="item" class="text-sm text-on-surface-variant leading-relaxed font-body">
              <span class="text-primary mr-2">·</span>{{ item }}
            </li>
          </ul>
        </div>
        <div class="mx-5 mb-5 bg-surface-container-high h-1 sm:mx-7 sm:mb-7">
          <div class="bg-primary h-full" :style="{ width: `${Math.min(100, fixture.roastLines.length * 22)}%` }" />
        </div>
      </section>
    </div>
  </div>
</template>
