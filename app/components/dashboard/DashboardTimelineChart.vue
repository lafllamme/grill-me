<script setup lang="ts">
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'

const props = defineProps<{ data: readonly RoastTimelineDatum[] }>()
const maxAdditions = Math.max(...props.data.map(item => item.additions))
const maxCommits = Math.max(...props.data.map(item => item.commits))

function getBarHeight(value: number, maximum: number, minimum: number) {
  return `${Math.max(minimum, value / maximum * 100)}%`
}

function getFileHeight(value: number) {
  return `${Math.max(7, value / 18 * 76)}%`
}

function getLinePoints() {
  return props.data.map((item, index) => {
    const x = index * 100 / (props.data.length - 1)
    const y = 100 - (item.commits / maxCommits) * 68
    return `${x},${y}`
  }).join(' ')
}
</script>

<template>
  <figure aria-label="Mocked commit rhythm over time">
    <div class="h-56 relative">
      <div class="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between"><span v-for="line in 4" :key="line" class="border-t-[1px] border-divider border-dashed" /></div>
      <div class="absolute inset-x-0 top-0 bottom-8 flex gap-3 items-end">
        <div v-for="item in data" :key="item.label" class="flex-1 h-full flex gap-1 items-end group">
          <span class="rounded-t-[3px] bg-primary/70 w-full transition-transform duration-200 group-hover:scale-y-105 origin-bottom" :style="{ height: getBarHeight(item.additions, maxAdditions, 10) }" />
          <span class="rounded-t-[3px] bg-surface-bright w-full transition-transform duration-200 group-hover:scale-y-105 origin-bottom" :style="{ height: getFileHeight(item.files) }" />
        </div>
      </div>
      <svg class="absolute inset-x-0 top-0 bottom-8 w-full h-[calc(100%-2rem)] overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="getLinePoints()" fill="none" class="stroke-on-background" stroke-width="1.2" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="absolute inset-x-0 bottom-0 flex justify-between"><span v-for="item in data" :key="item.label" class="text-[9px] text-on-surface-variant font-meta">{{ item.label }}</span></div>
    </div>
    <figcaption class="text-[10px] text-on-surface-variant tracking-[0.14em] mt-5 flex gap-5 font-meta uppercase"><span><i class="rounded-full bg-primary h-2 w-2 mr-2 inline-block" /> additions</span><span><i class="rounded-full bg-surface-bright h-2 w-2 mr-2 inline-block" /> files changed</span><span><i class="rounded-full bg-on-background h-2 w-2 mr-2 inline-block" /> commits</span></figcaption>
  </figure>
</template>
