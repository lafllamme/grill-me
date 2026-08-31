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
      <div class="flex flex-col inset-x-0 bottom-8 top-0 justify-between absolute">
        <span v-for="line in 4" :key="line" class="border-t-[1px] border-divider border-dashed" />
      </div>
      <div class="flex gap-3 items-end inset-x-0 bottom-8 top-0 absolute">
        <div v-for="item in data" :key="item.label" class="group flex flex-1 gap-1 h-full items-end">
          <span class="rounded-t-[3px] bg-primary/70 w-full origin-bottom transition-transform duration-200 group-hover:scale-y-105" :style="{ height: getBarHeight(item.additions, maxAdditions, 10) }" />
          <span class="rounded-t-[3px] bg-surface-bright w-full origin-bottom transition-transform duration-200 group-hover:scale-y-105" :style="{ height: getFileHeight(item.files) }" />
        </div>
      </div>
      <svg class="h-[calc(100%-2rem)] w-full inset-x-0 bottom-8 top-0 absolute overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="getLinePoints()" fill="none" class="stroke-on-background" stroke-width="1.2" vector-effect="non-scaling-stroke" />
      </svg>
      <div class="flex inset-x-0 bottom-0 justify-between absolute">
        <span v-for="item in data" :key="item.label" class="text-[9px] text-on-surface-variant font-meta">{{ item.label }}</span>
      </div>
    </div>
    <figcaption class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta mt-5 flex gap-5 uppercase">
      <span><i class="mr-2 rounded-full bg-primary h-2 w-2 inline-block" /> additions</span><span><i class="mr-2 rounded-full bg-surface-bright h-2 w-2 inline-block" /> files changed</span><span><i class="mr-2 rounded-full bg-on-background h-2 w-2 inline-block" /> commits</span>
    </figcaption>
  </figure>
</template>
