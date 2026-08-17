<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'

const props = defineProps<{ fixture: RoastExplorerFixture, isStreaming: boolean }>()
const damageFor = (index: number) => (props.fixture.metrics.stinkScore * 0.12 + index * 7.5 + 8).toFixed(2)
const totalDamage = () => (props.fixture.roastLines.reduce((sum, _, index) => sum + Number(damageFor(index)), 0) + props.fixture.metrics.egoDamage * 0.1).toFixed(2)
</script>

<template>
  <div class="text-basalt-950 p-4 bg-bone-100 lg:p-14 sm:p-8">
    <div class="mx-auto px-6 pb-10 pt-9 bg-bone-50 max-w-[720px] sm:px-12 sm:pb-14">
      <div class="pb-7 text-center border-b-[1px] border-basalt-950/25 border-dashed">
        <div class="text-3xl text-primary-strong font-display">
          ✳
        </div>
        <p class="text-xl tracking-[-0.04em] font-display font-semibold mt-2">
          GRILLME
        </p>
        <p class="text-[10px] text-basalt-600 tracking-[0.22em] font-meta mt-2 uppercase">
          {{ isStreaming ? 'Printing receipt…' : 'Official roast receipt' }}
        </p>
      </div>
      <div class="text-xs font-meta pt-6 gap-3 grid grid-cols-2">
        <span class="text-basalt-600">Customer</span><strong class="text-right">@{{ fixture.username }}</strong>
        <span class="text-basalt-600">Repo</span><strong class="text-right">{{ fixture.evidence.commits[0]?.repo }}</strong>
        <span class="text-basalt-600">Severity</span><strong class="text-right">{{ fixture.intensity.label.replaceAll('_', ' ') }}</strong>
        <span class="text-basalt-600">Order #</span><strong class="text-right">{{ fixture.evidence.commits[0]?.sha.toUpperCase() }}</strong>
      </div>
      <div class="mt-7 pt-5 border-t-[1px] border-basalt-950/25 border-dashed">
        <div class="text-[10px] text-basalt-600 tracking-[0.18em] font-meta flex uppercase justify-between">
          <span>Item</span><span>Damage</span>
        </div>
        <TransitionGroup
          tag="div"
          enter-active-class="transition-all duration-400 ease-out motion-reduce:transition-none"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div v-for="(line, index) in fixture.roastLines" :key="line" class="py-5 border-b-[1px] border-basalt-950/20 border-dashed gap-5 grid grid-cols-[1fr_auto]">
            <p class="text-sm leading-relaxed font-mono">
              <span class="text-basalt-500">{{ String(index + 1).padStart(2, '0') }}. </span>{{ line }}
            </p>
            <span class="text-sm font-mono whitespace-nowrap">${{ damageFor(index) }}</span>
          </div>
        </TransitionGroup>
      </div>
      <div class="text-sm font-mono mt-6 pt-5 border-t-[1px] border-basalt-950/40 border-solid space-y-2">
        <div class="flex justify-between">
          <span class="text-basalt-600">Spaghetti tax</span><span>${{ (fixture.metrics.spaghettiIndex * 0.1).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-basalt-600">Stink surcharge</span><span>${{ (fixture.metrics.stinkScore * 0.1).toFixed(2) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-basalt-600">Ego damage fee</span><span>${{ (fixture.metrics.egoDamage * 0.1).toFixed(2) }}</span>
        </div>
        <div class="text-lg font-bold mt-4 pt-4 border-t-[1px] border-basalt-950/40 border-solid flex justify-between">
          <span class="tracking-[0.14em] uppercase">Total damage</span><span>${{ totalDamage() }}</span>
        </div>
      </div>
      <div class="mt-10 text-center">
        <div class="mx-auto border-[3px] border-primary-strong rounded-full flex h-28 w-28 rotate-[-8deg] items-center justify-center">
          <div>
            <p class="text-4xl text-primary-strong font-display">
              {{ fixture.metrics.grade }}
            </p><p class="text-[8px] text-primary tracking-[0.16em] font-meta uppercase">
              final grade
            </p>
          </div>
        </div>
      </div>
      <div class="mt-10 pt-5 border-t-[1px] border-basalt-950/25 border-dashed">
        <p class="text-[10px] text-basalt-600 tracking-[0.18em] font-meta uppercase">
          Suggested exchanges (final sale)
        </p>
        <ul class="text-sm leading-relaxed font-mono mt-4 space-y-3">
          <li v-for="item in fixture.feedback" :key="item">
            · {{ item }}
          </li>
        </ul>
      </div>
      <div class="mt-10 pt-6 text-center border-t-[1px] border-basalt-950/25 border-dashed">
        <p class="text-[10px] text-basalt-600 tracking-[0.2em] font-meta uppercase">
          Thank you for committing
        </p><p class="text-[9px] text-basalt-500 tracking-[0.15em] font-meta mt-2 uppercase">
          No refunds · No re-reviews
        </p>
      </div>
    </div>
  </div>
</template>
