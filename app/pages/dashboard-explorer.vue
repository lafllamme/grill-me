<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import BklitBar from '~/components/dashboard/bklit/BklitBar.vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitBarXAxis from '~/components/dashboard/bklit/BklitBarXAxis.vue'
import BklitGrid from '~/components/dashboard/bklit/BklitGrid.vue'
import BklitRadarChart from '~/components/dashboard/bklit/BklitRadarChart.vue'
import DashboardRingChart from '~/components/dashboard/DashboardRingChart.vue'
import { roastDashboardFixture } from '~/data/roast-dashboard'
import { roastDashboardExplorerFixture } from '~/data/roast-dashboard-explorer'

const fixture = roastDashboardFixture
const explorerFixture = roastDashboardExplorerFixture
const isBarLoading = ref(true)
let barLoadingTimer: ReturnType<typeof setTimeout> | undefined

function replayBarLoading() {
  isBarLoading.value = true
  if (barLoadingTimer) {
    clearTimeout(barLoadingTimer)
  }
  barLoadingTimer = setTimeout(() => {
    isBarLoading.value = false
  }, 1400)
}

onMounted(replayBarLoading)
onBeforeUnmount(() => {
  if (barLoadingTimer) {
    clearTimeout(barLoadingTimer)
  }
})

useHead({ title: 'Dashboard Explorer · Grillme' })
useSeoMeta({ title: 'Dashboard Explorer · Grillme', description: 'A mocked profile view for the roast dashboard.' })
</script>

<template>
  <div class="text-on-background bg-background min-h-[100dvh] overflow-x-hidden">
    <div class="mx-auto px-5 pb-24 max-w-[1440px] sm:px-8 lg:px-12">
      <header class="py-6 flex flex-col gap-6 border-b-[1px] border-divider border-solid">
        <div>
          <h1 class="max-w-[10ch] text-5xl tracking-[-0.08em] font-display leading-[0.88] mt-4 sm:text-7xl">Read the roast.</h1>
          <p class="max-w-[42rem] text-base text-on-surface leading-7 mt-6">A profile read built from the commits, changes, and patterns that shape this repository.</p>
        </div>
      </header>

      <div id="profile-panel" class="grid gap-4 mt-8 lg:grid-cols-12">
        <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-8 lg:p-10"><h2 class="text-2xl tracking-[-0.04em] font-body">Profile</h2><BklitRadarChart class="mt-8" :data="fixture.radarProfile.data" :metrics="fixture.radarProfile.metrics" :size="460" /></article>
        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-4 lg:p-10">
          <h2 class="text-2xl tracking-[-0.04em] font-body">Verdict</h2>
          <h3 class="max-w-[12ch] text-4xl tracking-[-0.06em] font-display leading-[0.92] mt-12 sm:text-6xl">{{ fixture.headline }}</h3>
          <p class="max-w-[34rem] text-base text-on-surface leading-7 mt-8">{{ fixture.note }}</p>
          <div class="pt-6 mt-10 flex gap-10 border-t-[1px] border-divider border-solid"><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary-strong font-display block mt-2">{{ fixture.grade }}</strong></div><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Read</span><strong class="text-sm text-on-background font-meta block mt-4">{{ fixture.growthLevel }}</strong></div></div>
        </article>
        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12"><div class="flex items-center justify-between"><h2 class="text-2xl tracking-[-0.04em] font-body">Evidence</h2><span class="text-[10px] text-primary-strong font-meta uppercase">Mock</span></div><DashboardRingChart class="mt-8" :data="fixture.ringProfile" /></article>
        <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-12"><div class="flex flex-wrap gap-4 items-end justify-between"><div><h2 class="text-2xl tracking-[-0.05em] font-display">Change volume</h2></div><button class="text-[10px] text-on-surface-variant tracking-[0.12em] rounded-[8px] px-3 py-2 border-[1px] border-outline border-solid font-meta uppercase hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" @click="replayBarLoading">Replay loading</button></div><BklitBarChart class="mt-8" :data="explorerFixture.barChangeVolume" x-data-key="label" :series-count="2" :status="isBarLoading ? 'loading' : 'ready'"><template #grid><BklitGrid horizontal /></template><BklitBar data-key="additions" fill="var(--color-chart-line-primary)" /><BklitBar data-key="deletions" fill="var(--color-chart-line-secondary)" animation-type="fade" /><template #x-axis><BklitBarXAxis /></template></BklitBarChart><div class="text-[10px] text-on-surface-variant tracking-[0.14em] mt-5 flex gap-5 font-meta uppercase"><span><i class="rounded-full bg-chart-line-primary h-2 w-2 mr-2 inline-block" /> additions</span><span><i class="rounded-full bg-chart-line-secondary h-2 w-2 mr-2 inline-block" /> deletions</span></div></article>
      </div>

      <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme</span><span>Profile view</span></footer>
    </div>
  </div>
</template>
