<script setup lang="ts">
import type { AggregateStat } from '~/models/rebrand-fuel'
import { useElementVisibility, usePreferredReducedMotion, useRafFn } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import RebrandChapterMeta from '~/components/rebrand/RebrandChapterMeta.vue'

const props = defineProps<{
  stats: readonly AggregateStat[]
}>()

const rootElement = ref<HTMLElement | null>(null)
const progress = ref(0)
const hasStarted = ref(false)
const startedAt = ref(0)
const isVisible = useElementVisibility(rootElement)
const reducedMotion = usePreferredReducedMotion()
const animationDuration = 1100

const { pause, resume } = useRafFn(({ timestamp }) => {
  progress.value = Math.min((timestamp - startedAt.value) / animationDuration, 1)

  if (progress.value >= 1)
    pause()
}, { immediate: false })

watch(isVisible, (isSectionVisible) => {
  if (!isSectionVisible || hasStarted.value)
    return

  hasStarted.value = true
  if (reducedMotion.value === 'reduce') {
    progress.value = 1
    return
  }

  startedAt.value = performance.now()
  resume()
}, { immediate: true })

const displayedStats = computed(() => props.stats.map(stat => ({
  ...stat,
  displayValue: Math.round(stat.value * progress.value),
})))

function formatValue(value: number) {
  return new Intl.NumberFormat('en', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 100000 ? 1 : 0,
  }).format(value)
}
</script>

<template>
  <section id="metrics" ref="rootElement" class="mx-auto px-4 pb-32 pt-8 max-w-[96rem] min-h-[100svh] scroll-mt-20 lg:px-10 sm:px-6">
    <RebrandChapterMeta index="08" title="Aggregate stats / preview" />

    <div class="pt-20 gap-x-20 gap-y-28 grid lg:grid-cols-2">
      <article v-for="stat in displayedStats" :key="stat.id" class="fuel-view-reveal motion-reduce:[animation:none]">
        <p class="text-[clamp(4.5rem,9vw,10rem)] text-basalt-950 leading-[0.92] tracking-[-0.045em] font-body">
          {{ formatValue(stat.displayValue) }}{{ stat.suffix }}
        </p>
        <div class="mt-6 pt-5 border-t-[1px] border-basalt-950/18 border-solid">
          <h3 class="text-xl text-basalt-950 tracking-[-0.02em] font-body sm:text-2xl">
            {{ stat.label }}
          </h3>
          <p class="text-sm text-basalt-500 leading-relaxed font-body mt-4 max-w-[32rem] sm:text-base">
            {{ stat.description }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>
