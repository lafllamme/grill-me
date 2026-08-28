<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import BklitBar from '~/components/dashboard/bklit/BklitBar.vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitBarPortGallery from '~/components/dashboard/bklit/BklitBarPortGallery.vue'
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
    <div class="mx-auto px-5 pb-24 pt-6 max-w-[1440px] sm:px-8 lg:px-12">
      <header class="py-6 flex flex-col gap-6 border-b-[1px] border-divider border-solid lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Dashboard exploration / test page</p>
          <h1 class="max-w-[10ch] text-5xl tracking-[-0.08em] font-display leading-[0.88] mt-4 sm:text-7xl">Read the roast.</h1>
          <p class="max-w-[36rem] text-sm text-on-surface-variant leading-6 mt-6">One profile view for the mocked dashboard. The evidence is ready to test before we extend the API.</p>
        </div>
        <div class="text-left lg:text-right">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Test subject</p>
          <p class="text-sm text-on-background font-meta mt-2">@{{ fixture.username }} · {{ fixture.repository }}</p>
          <p class="text-[10px] text-primary-strong tracking-[0.14em] mt-3 font-meta uppercase">API contract unchanged</p>
        </div>
      </header>

      <div id="profile-panel" class="grid gap-4 mt-8 lg:grid-cols-12">
        <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-8 lg:p-10"><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Profile dimensions / radar chart</p><BklitRadarChart class="mt-8" :data="fixture.radarProfile.data" :metrics="fixture.radarProfile.metrics" :size="400" /><div class="space-y-3 border-t-[1px] border-divider pt-5 mt-6"><div v-for="item in fixture.profile" :key="item.label" class="flex gap-3 items-center"><span class="text-xs text-on-background flex-1">{{ item.label }}</span><span class="text-xs text-on-surface-variant font-meta">{{ item.value }}</span></div></div></article>
        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-4 lg:p-10">
          <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Verdict / headline</p>
          <p class="text-xs text-on-surface-variant font-meta mt-3">{{ fixture.identityTitle }}</p>
          <h2 class="max-w-[12ch] text-5xl tracking-[-0.08em] font-display leading-[0.9] mt-12 sm:text-7xl">{{ fixture.headline }}</h2>
          <p class="max-w-[34rem] text-base text-on-surface-variant leading-7 mt-8">{{ fixture.note }}</p>
          <div class="pt-6 mt-10 flex gap-10 border-t-[1px] border-divider border-solid"><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary-strong font-display block mt-2">{{ fixture.grade }}</strong></div><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Read</span><strong class="text-sm text-on-background font-meta block mt-4">{{ fixture.growthLevel }}</strong></div></div>
        </article>
        <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12"><div class="flex items-center justify-between"><p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">Supporting evidence</p><span class="text-[10px] text-primary-strong font-meta">MOCKED</span></div><DashboardRingChart class="mt-8" :data="fixture.ringProfile" /></article>
        <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-12"><div class="flex flex-wrap gap-4 items-end justify-between"><div><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Commit evidence / bar chart</p><h3 class="text-2xl tracking-[-0.05em] font-display mt-3">Change volume</h3></div><button class="text-[10px] text-on-surface-variant tracking-[0.12em] rounded-[8px] px-3 py-2 border-[1px] border-outline border-solid font-meta uppercase hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" @click="replayBarLoading">Replay loading</button></div><BklitBarChart class="mt-8" :data="explorerFixture.barChangeVolume" x-data-key="label" :series-count="2" :status="isBarLoading ? 'loading' : 'ready'"><template #grid><BklitGrid horizontal /></template><BklitBar data-key="additions" fill="var(--color-chart-line-primary)" /><BklitBar data-key="deletions" fill="var(--color-chart-line-secondary)" animation-type="fade" /><template #x-axis><BklitBarXAxis /></template></BklitBarChart><div class="text-[10px] text-on-surface-variant tracking-[0.14em] mt-5 flex gap-5 font-meta uppercase"><span><i class="rounded-full bg-chart-line-primary h-2 w-2 mr-2 inline-block" /> additions</span><span><i class="rounded-full bg-chart-line-secondary h-2 w-2 mr-2 inline-block" /> deletions</span></div></article>
        <BklitBarPortGallery class="lg:col-span-12" />
      </div>

      <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme · dashboard explorer</span><span>Profile view</span></footer>
    </div>
  </div>
</template>
