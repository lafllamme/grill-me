<script setup lang="ts">
import type { RoastExplorerFixture } from '~/data/roast-explorer'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ fixture: RoastExplorerFixture, replayKey: number }>()
const activeCard = ref(0)
watch(() => props.replayKey, () => {
  activeCard.value = 0
})

const cards = computed(() => [
  ...props.fixture.roastLines.map((text, index) => ({ kind: 'roast', label: `Roast ${String(index + 1).padStart(2, '0')}`, text })),
  ...props.fixture.feedback.map((text, index) => ({ kind: 'fix', label: `Fix ${String(index + 1).padStart(2, '0')}`, text })),
])
const visibleCards = computed(() => cards.value.slice(activeCard.value, activeCard.value + 3))
function nextCard() {
  activeCard.value = activeCard.value >= cards.value.length - 1 ? 0 : activeCard.value + 1
}
</script>

<template>
  <div class="p-5 bg-surface-container-low lg:p-12 sm:p-8">
    <div class="gap-8 grid lg:grid-cols-[0.35fr_0.65fr] lg:items-start">
      <aside>
        <p class="text-[10px] text-on-surface-variant tracking-[0.2em] font-meta uppercase">
          Grillme records
        </p>
        <p class="text-[clamp(3rem,7vw,7rem)] text-primary leading-[0.8] tracking-[-0.08em] font-display mt-8">
          {{ fixture.metrics.grade }}
        </p>
        <p class="text-sm text-on-surface font-body mt-5">
          Certified roast
        </p>
        <p class="text-xs text-on-surface-variant font-meta mt-2">
          @{{ fixture.username }} · {{ fixture.intensity.label.replaceAll('_', ' ') }}
        </p>
        <button type="button" class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta mt-10 uppercase hover:text-primary" @click="nextCard">
          Tap to continue →
        </button>
      </aside>
      <div class="min-h-[24rem] relative sm:min-h-[27rem]">
        <TransitionGroup
          tag="div"
          enter-active-class="transition-all duration-400 ease-out motion-reduce:transition-none"
          enter-from-class="opacity-0 translate-y-3"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-300 ease-in motion-reduce:transition-none"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-6"
        >
          <button v-for="(card, index) in visibleCards" :key="`${card.label}-${activeCard}`" type="button" class="p-6 text-left border-[1px] rounded-[1.5rem] border-solid bg-surface-container min-h-[21rem] inset-x-0 top-0 absolute sm:p-10" :class="[card.kind === 'roast' ? 'border-primary' : 'border-divider', index === 0 ? 'cursor-pointer' : 'pointer-events-none']" :style="{ transform: `translateY(${index * 1.25}rem) scale(${1 - index * 0.045})`, zIndex: 3 - index, opacity: 1 - index * 0.18 }" @click="index === 0 && nextCard()">
            <p class="text-[10px] tracking-[0.2em] font-meta uppercase" :class="card.kind === 'roast' ? 'text-primary' : 'text-on-surface-variant'">
              {{ card.label }}
            </p>
            <p class="text-[clamp(1.5rem,3.5vw,3rem)] text-on-surface leading-[1.05] tracking-[-0.04em] font-body mt-14 max-w-[22ch]">
              {{ card.text }}
            </p>
            <span class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase bottom-7 right-8 absolute">{{ card.kind === 'roast' ? 'damage logged' : 'exchange suggested' }}</span>
          </button>
        </TransitionGroup>
      </div>
    </div>
    <div class="mt-10 pt-5 border-t-[1px] border-divider border-solid flex gap-4 items-center justify-between">
      <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">
        {{ activeCard + 1 }} / {{ cards.length }} cards
      </p>
      <div class="bg-surface-container-high flex-1 h-1 max-w-64">
        <div class="bg-primary h-full transition-all duration-500" :style="{ width: `${((activeCard + 1) / cards.length) * 100}%` }" />
      </div>
    </div>
  </div>
</template>
