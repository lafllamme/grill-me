<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import BklitBar from '~/components/dashboard/bklit/BklitBar.vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitBarXAxis from '~/components/dashboard/bklit/BklitBarXAxis.vue'
import BklitGrid from '~/components/dashboard/bklit/BklitGrid.vue'
import DashboardCommitBars from '~/components/dashboard/DashboardCommitBars.vue'
import DashboardRadarPreview from '~/components/dashboard/DashboardRadarPreview.vue'
import DashboardRepositoryMap from '~/components/dashboard/DashboardRepositoryMap.vue'
import DashboardRingChart from '~/components/dashboard/DashboardRingChart.vue'
import DashboardTimelineChart from '~/components/dashboard/DashboardTimelineChart.vue'
import { roastDashboardFixture } from '~/data/roast-dashboard'
import { roastDashboardExplorerFixture } from '~/data/roast-dashboard-explorer'

type VariantId = 'profile' | 'timeline' | 'anatomy'

const variants = [
  { id: 'profile' as const, index: 0, label: 'A / Profile', kicker: 'Verdict first', description: 'The roast as a personal code profile.' },
  { id: 'timeline' as const, index: 1, label: 'B / Timeline', kicker: 'Evidence first', description: 'The roast as a story of change.' },
  { id: 'anatomy' as const, index: 2, label: 'C / Anatomy', kicker: 'Structure first', description: 'The roast as a map of pressure.' },
]

const activeVariant = ref<VariantId>('profile')
const activeIndex = computed(() => variants.findIndex(item => item.id === activeVariant.value))
const fixture = roastDashboardFixture
const explorerFixture = roastDashboardExplorerFixture
const isBarLoading = ref(true)
let barLoadingTimer: ReturnType<typeof setTimeout> | undefined

function selectVariant(id: VariantId) {
  activeVariant.value = id
}

function moveVariant(direction: -1 | 1) {
  const nextIndex = (activeIndex.value + direction + variants.length) % variants.length
  activeVariant.value = variants[nextIndex]!.id
}

function handleTabKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    moveVariant(1)
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    moveVariant(-1)
  }
  if (event.key === 'Home') {
    event.preventDefault()
    activeVariant.value = variants[0]!.id
  }
  if (event.key === 'End') {
    event.preventDefault()
    activeVariant.value = variants[variants.length - 1]!.id
  }
}

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
useSeoMeta({ title: 'Dashboard Explorer · Grillme', description: 'Three mocked information architectures for the roast dashboard.' })
</script>

<template>
  <div class="text-on-background bg-background min-h-[100dvh] overflow-x-hidden">
    <div class="mx-auto px-5 pb-24 pt-6 max-w-[1440px] sm:px-8 lg:px-12">
      <header class="py-6 flex flex-col gap-6 border-b-[1px] border-divider border-solid lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Dashboard exploration / test page</p>
          <h1 class="max-w-[10ch] text-5xl tracking-[-0.08em] font-display leading-[0.88] mt-4 sm:text-7xl">Three ways to read the roast.</h1>
          <p class="max-w-[36rem] text-sm text-on-surface-variant leading-6 mt-6">One result, three possible information architectures. The evidence is mocked to test the shape before we extend the API.</p>
        </div>
        <div class="text-left lg:text-right">
          <p class="text-[10px] text-on-surface-variant tracking-[0.16em] font-meta uppercase">Test subject</p>
          <p class="text-sm text-on-background font-meta mt-2">@{{ fixture.username }} · {{ fixture.repository }}</p>
          <p class="text-[10px] text-primary-strong tracking-[0.14em] mt-3 font-meta uppercase">API contract unchanged</p>
        </div>
      </header>

      <nav class="py-5 flex gap-2 overflow-x-auto" role="tablist" aria-label="Dashboard variants" @keydown="handleTabKeydown">
        <button v-for="variant in variants" :key="variant.id" :id="`${variant.id}-tab`" class="text-left rounded-[14px] px-4 py-3 min-w-[10rem] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" :class="activeVariant === variant.id ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container text-on-surface-variant hover:bg-surface-bright hover:text-on-background'" role="tab" :aria-selected="activeVariant === variant.id" :aria-controls="`${variant.id}-panel`" :tabindex="activeVariant === variant.id ? 0 : -1" @click="selectVariant(variant.id)">
          <span class="text-[10px] tracking-[0.14em] font-meta uppercase">{{ variant.label }}</span>
          <span class="text-xs mt-2 block">{{ variant.kicker }}</span>
        </button>
      </nav>

      <Transition name="dashboard-variant" mode="out-in">
        <main v-if="activeVariant === 'profile'" id="profile-panel" key="profile" class="grid gap-4 lg:grid-cols-12" role="tabpanel" aria-labelledby="profile-tab">
          <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-7 lg:p-10">
            <p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Verdict / headline</p>
            <p class="text-xs text-on-surface-variant font-meta mt-3">{{ fixture.identityTitle }}</p>
            <h2 class="max-w-[12ch] text-5xl tracking-[-0.08em] font-display leading-[0.9] mt-12 sm:text-7xl">{{ fixture.headline }}</h2>
            <p class="max-w-[34rem] text-base text-on-surface-variant leading-7 mt-8">{{ fixture.note }}</p>
            <div class="pt-6 mt-10 flex gap-10 border-t-[1px] border-divider border-solid"><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Grade</span><strong class="text-4xl text-primary-strong font-display block mt-2">{{ fixture.grade }}</strong></div><div><span class="text-[10px] text-on-surface-variant tracking-[0.14em] font-meta block uppercase">Read</span><strong class="text-sm text-on-background font-meta block mt-4">{{ fixture.growthLevel }}</strong></div></div>
          </article>
          <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-5 lg:p-10"><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Profile dimensions</p><DashboardRadarPreview class="mt-8" :data="fixture.profile" /><div class="space-y-3 border-t-[1px] border-divider pt-5 mt-6"><div v-for="item in fixture.profile" :key="item.label" class="flex gap-3 items-center"><span class="text-xs text-on-background flex-1">{{ item.label }}</span><span class="text-xs text-on-surface-variant font-meta">{{ item.value }}</span></div></div></article>
          <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12"><div class="flex items-center justify-between"><p class="text-[10px] text-on-surface-variant tracking-[0.18em] font-meta uppercase">Supporting evidence</p><span class="text-[10px] text-primary-strong font-meta">MOCKED</span></div><DashboardRingChart class="mt-8" :data="fixture.profile" /></article>
          <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-12"><div class="flex flex-wrap gap-4 items-end justify-between"><div><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Commit evidence / bar chart</p><h3 class="text-2xl tracking-[-0.05em] font-display mt-3">Change volume</h3></div><button class="text-[10px] text-on-surface-variant tracking-[0.12em] rounded-[8px] px-3 py-2 border-[1px] border-outline border-solid font-meta uppercase hover:text-on-background focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" @click="replayBarLoading">Replay loading</button></div><BklitBarChart class="mt-8" :data="fixture.commits" x-data-key="label" :status="isBarLoading ? 'loading' : 'ready'"><template #grid><BklitGrid horizontal /></template><BklitBar data-key="additions" fill="var(--color-primary)" /><BklitBar data-key="deletions" fill="var(--color-surface-bright)" animation-type="fade" /><template #x-axis><BklitBarXAxis /></template></BklitBarChart><div class="text-[10px] text-on-surface-variant tracking-[0.14em] mt-5 flex gap-5 font-meta uppercase"><span><i class="rounded-full bg-primary h-2 w-2 mr-2 inline-block" /> additions</span><span><i class="rounded-full bg-surface-bright h-2 w-2 mr-2 inline-block" /> deletions</span></div></article>
        </main>
        <main v-else-if="activeVariant === 'timeline'" id="timeline-panel" key="timeline" class="grid gap-4 lg:grid-cols-12" role="tabpanel" aria-labelledby="timeline-tab">
          <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12 lg:p-10"><div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Evidence first / change rhythm</p><h2 class="text-4xl tracking-[-0.07em] font-display mt-4 sm:text-6xl">The pattern is the punchline.</h2></div><p class="max-w-[18rem] text-xs text-on-surface-variant leading-5">A timeline makes the roast feel earned: when did the codebase accelerate, and where?</p></div><DashboardTimelineChart class="mt-12" :data="explorerFixture.timeline" /></article>
          <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-5"><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Commit evidence</p><div class="flex items-end justify-between mt-3"><h3 class="text-2xl tracking-[-0.05em] font-display">Change volume</h3><span class="text-3xl font-display">{{ fixture.evidence.files }}<small class="text-xs text-on-surface-variant ml-1 font-meta">files</small></span></div><DashboardCommitBars class="mt-10" :data="fixture.commits" /></article>
          <article class="rounded-[28px] bg-primary p-6 text-on-primary-fixed sm:p-8 lg:col-span-7"><p class="text-[10px] tracking-[0.18em] font-meta uppercase">What the rhythm implies</p><p class="max-w-[26rem] text-3xl tracking-[-0.06em] font-display leading-tight mt-10">You do not have a volume problem. You have a recovery problem.</p><div class="pt-5 mt-12 border-t-[1px] border-primary-strong/30"><span class="text-[10px] tracking-[0.14em] font-meta uppercase">Signal</span><p class="text-sm mt-2">High change density, low testability, repeated abstraction churn.</p></div></article>
        </main>
        <main v-else id="anatomy-panel" key="anatomy" class="grid gap-4 lg:grid-cols-12" role="tabpanel" aria-labelledby="anatomy-tab">
          <article class="rounded-[28px] bg-surface p-6 sm:p-8 lg:col-span-12 lg:p-10"><div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Structure first / repository anatomy</p><h2 class="text-4xl tracking-[-0.07em] font-display mt-4 sm:text-6xl">Your complexity has an address.</h2></div><p class="max-w-[20rem] text-xs text-on-surface-variant leading-5">Instead of scoring everything, point at the files that made the verdict inevitable.</p></div><DashboardRepositoryMap class="mt-12" :hotspots="explorerFixture.hotspots" /></article>
          <article class="rounded-[28px] bg-primary p-6 text-on-primary-fixed sm:p-8 lg:col-span-7"><p class="text-[10px] tracking-[0.18em] font-meta uppercase">Roast title</p><h3 class="max-w-[12ch] text-4xl tracking-[-0.07em] font-display mt-10">{{ fixture.identityTitle }}</h3><p class="max-w-[30rem] text-sm leading-6 mt-8">The repository map gives the user a route from punchline to proof. That is the part worth keeping if this direction wins.</p></article>
          <article class="rounded-[28px] bg-surface-container p-6 sm:p-8 lg:col-span-5"><p class="text-[10px] text-primary-strong tracking-[0.18em] font-meta uppercase">Next useful data</p><div class="space-y-4 mt-8"><div v-for="item in ['file-level change count', 'language distribution', 'test-to-source ratio']" :key="item" class="text-sm text-on-background pb-4 border-b-[1px] border-divider border-solid flex items-center justify-between"><span>{{ item }}</span><span class="text-[10px] text-on-surface-variant font-meta">MOCK</span></div></div></article>
        </main>
      </Transition>

      <footer class="text-[10px] text-on-surface-variant tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme · dashboard explorer</span><span>Use ← → or click to compare</span></footer>
    </div>
  </div>
</template>

<style>
.dashboard-variant-enter-active,
.dashboard-variant-leave-active { transition: opacity 160ms ease, transform 160ms ease; }
.dashboard-variant-enter-from { opacity: 0; transform: translateY(8px); }
.dashboard-variant-leave-to { opacity: 0; transform: translateY(-8px); }
@media (prefers-reduced-motion: reduce) {
  .dashboard-variant-enter-active,
  .dashboard-variant-leave-active { transition: none; }
}
</style>
