<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import BklitBar from '~/components/dashboard/bklit/BklitBar.vue'
import BklitBarChart from '~/components/dashboard/bklit/BklitBarChart.vue'
import BklitBarXAxis from '~/components/dashboard/bklit/BklitBarXAxis.vue'
import BklitGrid from '~/components/dashboard/bklit/BklitGrid.vue'
import BklitRadarChart from '~/components/dashboard/bklit/BklitRadarChart.vue'
import DashboardRingChart from '~/components/dashboard/DashboardRingChart.vue'
import RoastOneGradeStar from '~/components/roast-one/RoastOneGradeStar.vue'
import { roastDashboardFixture } from '~/data/roast-dashboard'
import { roastDashboardExplorerFixture } from '~/data/roast-dashboard-explorer'

interface DashboardColorProfile {
  label: string
  description: string
  stageClass: string
  panelClass: string
  copyClass: string
  mutedClass: string
}

const fixture = roastDashboardFixture
const explorerFixture = roastDashboardExplorerFixture
const isBarLoading = ref(true)
const colorProfiles = {
  void: { label: 'Void Ink', description: 'pure, sharp, cinematic', stageClass: 'bg-[#050505]', panelClass: 'bg-[#151517]', copyClass: 'text-[#f7f3ee]', mutedClass: 'text-[#a9a29b]' },
  graphite: { label: 'Black Graphite', description: 'quiet, premium, focused', stageClass: 'bg-[#080808]', panelClass: 'bg-[#202022]', copyClass: 'text-[#f8f5ef]', mutedClass: 'text-[#aaa5a0]' },
  basalt: {
    label: 'Basalt',
    description: 'warmer lift',
    stageClass: 'bg-[#0f0e0d]',
    panelClass: 'bg-[#211d1a]',
    copyClass: 'text-[#fffdf9]',
    mutedClass: 'text-[#d8bfa8]',
  },
  mauve: { label: 'Mauve Chamber', description: 'soft black, warm lift', stageClass: 'bg-[#151211]', panelClass: 'bg-[#302725]', copyClass: 'text-[#fff7f0]', mutedClass: 'text-[#d4b9aa]' },
  redline: { label: 'Redline Deep', description: 'pressure, not decoration', stageClass: 'bg-[#100506]', panelClass: 'bg-[#321417]', copyClass: 'text-[#fff5f1]', mutedClass: 'text-[#d4a9a5]' },
  charcoal: { label: 'Charcoal Mist', description: 'neutral, tactile, restrained', stageClass: 'bg-[#111214]', panelClass: 'bg-[#292b2e]', copyClass: 'text-white', mutedClass: 'text-[#a1a1aa]' },
  carbon: { label: 'Soft Carbon', description: 'low contrast, calm density', stageClass: 'bg-[#1b1918]', panelClass: 'bg-[#312c29]', copyClass: 'text-[#fffaf5]', mutedClass: 'text-[#c6b8ae]' },
  explorer: {
    label: 'Explorer',
    description: 'soft separation',
    stageClass: 'bg-[#0f0e0d]',
    panelClass: 'bg-[#181614]',
    copyClass: 'text-[#fffdf9]',
    mutedClass: 'text-[#d8bfa8]',
  },
  voidWhisper: { label: 'Void Whisper', description: 'ink with a softer edge', stageClass: 'bg-[#050505]', panelClass: 'bg-[#111112]', copyClass: 'text-[#f7f3ee]', mutedClass: 'text-[#9f9993]' },
  graphiteHush: { label: 'Graphite Hush', description: 'neutral, low attention', stageClass: 'bg-[#0b0b0b]', panelClass: 'bg-[#171718]', copyClass: 'text-[#f8f5ef]', mutedClass: 'text-[#9d9995]' },
  basaltQuiet: { label: 'Basalt Quiet', description: 'warm structure, less contrast', stageClass: 'bg-[#0f0e0d]', panelClass: 'bg-[#1a1715]', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#cbb5a2]' },
  explorerSoft: { label: 'Explorer Soft', description: 'warm stage, barely lifted card', stageClass: 'bg-[#131211]', panelClass: 'bg-[#1a1715]', copyClass: 'text-[#fffdf9]', mutedClass: 'text-[#cbb5a2]' },
  paperSnow: { label: 'Paper Snow', description: 'quiet paper, lifted card', stageClass: 'bg-[#ebe7e1]', panelClass: 'bg-[#fffdf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  bonePaper: { label: 'Bone Paper', description: 'warm canvas, soft surface', stageClass: 'bg-[#f1e4d5]', panelClass: 'bg-white', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  warmPaperSignal: { label: 'Warm Paper', description: 'soft field, one red action', stageClass: 'bg-[#e4d7c8]', panelClass: 'bg-[#fffdf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  whiteCloud: { label: 'White Cloud', description: 'clean canvas, quiet lift', stageClass: 'bg-[#e4e6e8]', panelClass: 'bg-white', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
} satisfies Record<string, DashboardColorProfile>
type ColorProfile = keyof typeof colorProfiles
const activeColorProfile = ref<ColorProfile>('basalt')
const colorProfileRows: ColorProfile[][] = [
  ['void', 'graphite', 'basalt', 'mauve', 'redline', 'charcoal', 'carbon', 'explorer'],
  ['voidWhisper', 'graphiteHush', 'basaltQuiet', 'explorerSoft'],
  ['paperSnow', 'bonePaper', 'warmPaperSignal', 'whiteCloud'],
]
const colorProfileKeys = colorProfileRows.flat()
const currentColorProfile = computed(() => colorProfiles[activeColorProfile.value])
const currentColorProfileIndex = computed(() => colorProfileKeys.indexOf(activeColorProfile.value))
const favoriteColorProfiles = ref<ColorProfile[]>([])
const favoriteColorProfileDetails = computed(() => favoriteColorProfiles.value.map(profileKey => ({ key: profileKey, ...colorProfiles[profileKey] })))
const favoritesStorageKey = 'grillme-dashboard-explorer-favorites'
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

function cycleColorProfile(direction: -1 | 1) {
  const nextIndex = (currentColorProfileIndex.value + direction + colorProfileKeys.length) % colorProfileKeys.length
  activeColorProfile.value = colorProfileKeys[nextIndex]!
}

function handleColorProfileKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) {
    return
  }

  if (event.key.toLowerCase() === 'l') {
    event.preventDefault()
    toggleFavorite()
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    cycleColorProfile(event.key === 'ArrowLeft' ? -1 : 1)
  }
}

function toggleFavorite(profileKey: ColorProfile = activeColorProfile.value) {
  favoriteColorProfiles.value = favoriteColorProfiles.value.includes(profileKey)
    ? favoriteColorProfiles.value.filter(favoriteKey => favoriteKey !== profileKey)
    : [...favoriteColorProfiles.value, profileKey]
  localStorage.setItem(favoritesStorageKey, JSON.stringify(favoriteColorProfiles.value))
}

function isFavorite(profileKey: ColorProfile = activeColorProfile.value) {
  return favoriteColorProfiles.value.includes(profileKey)
}

function loadFavorites() {
  const storedFavorites = localStorage.getItem(favoritesStorageKey)
  if (!storedFavorites) {
    return
  }

  try {
    const parsedFavorites: unknown = JSON.parse(storedFavorites)
    if (Array.isArray(parsedFavorites)) {
      favoriteColorProfiles.value = parsedFavorites.filter((profileKey): profileKey is ColorProfile => colorProfileKeys.includes(profileKey as ColorProfile))
    }
  }
  catch {
    localStorage.removeItem(favoritesStorageKey)
  }
}

onMounted(() => {
  replayBarLoading()
  loadFavorites()
  window.addEventListener('keydown', handleColorProfileKeydown)
})
onBeforeUnmount(() => {
  if (barLoadingTimer) {
    clearTimeout(barLoadingTimer)
  }
  window.removeEventListener('keydown', handleColorProfileKeydown)
})

useHead({ title: 'Dashboard Explorer · Grillme' })
useSeoMeta({ title: 'Dashboard Explorer · Grillme', description: 'A mocked profile view for the roast dashboard.' })
</script>

<template>
  <div :class="[currentColorProfile.stageClass, currentColorProfile.copyClass]" class="min-h-[100dvh] overflow-x-hidden transition-colors duration-300">
    <div class="mx-auto px-5 pb-24 max-w-[1440px] sm:px-8 lg:px-12">
      <header class="py-6 flex flex-col gap-6 border-b-[1px] border-divider border-solid sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="max-w-[10ch] text-5xl tracking-[-0.08em] font-display leading-[0.88] mt-4 sm:text-7xl">Read the roast.</h1>
          <p :class="currentColorProfile.mutedClass" class="max-w-[42rem] text-base leading-7 mt-6">A profile read built from the commits, changes, and patterns that shape this repository.</p>
        </div>
        <fieldset class="border-0 p-0 m-0 sm:pt-4">
          <legend :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.14em] font-meta uppercase mb-2">Color profile</legend>
          <div class="flex gap-2 items-center">
            <div class="bg-black/20 p-1 rounded-[10px] flex gap-1 items-center border-[1px] border-white/10 border-solid">
              <button
                :class="currentColorProfile.mutedClass"
                class="text-lg leading-none rounded-[6px] h-8 w-8 transition-colors hover:opacity-70 font-body focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                aria-label="Previous color profile"
                @click="cycleColorProfile(-1)"
              >
                ←
              </button>
              <div :class="currentColorProfile.copyClass" class="px-2 min-w-36 text-center">
                <p class="text-[10px] tracking-[0.08em] font-meta uppercase"><Icon v-if="activeColorProfile === 'voidWhisper'" name="ph:crown-simple" class="text-primary mr-1 align-[-0.12em]" />{{ currentColorProfile.label }}</p>
                <p :class="currentColorProfile.mutedClass" class="text-[9px] font-meta mt-0.5">{{ currentColorProfileIndex + 1 }} / {{ colorProfileKeys.length }}</p>
              </div>
              <button
                :class="currentColorProfile.mutedClass"
                class="text-lg leading-none rounded-[6px] h-8 w-8 transition-colors hover:opacity-70 font-body focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                aria-label="Next color profile"
                @click="cycleColorProfile(1)"
              >
                →
              </button>
            </div>
            <button
              :class="isFavorite() ? 'text-primary bg-primary/12' : currentColorProfile.mutedClass"
              class="rounded-[8px] h-10 w-10 transition-colors hover:opacity-70 flex items-center justify-center border-[1px] border-white/10 border-solid focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              type="button"
              :aria-pressed="isFavorite()"
              :aria-label="isFavorite() ? 'Remove current color profile from favorites' : 'Add current color profile to favorites'"
              title="Favorite (L)"
              @click="toggleFavorite()"
            >
              <Icon name="ph:heart" class="text-lg" />
            </button>
          </div>
          <p :class="currentColorProfile.mutedClass" class="text-[10px] font-meta mt-2 sm:text-right">{{ currentColorProfile.description }}</p>
        </fieldset>
      </header>

      <div id="profile-panel" class="grid gap-4 mt-8 lg:grid-cols-12">
        <article :class="currentColorProfile.panelClass" class="rounded-[28px] p-6 sm:p-8 lg:col-span-8 lg:p-8 transition-colors duration-300">
          <h2 class="text-2xl tracking-[-0.04em] font-body">Profile</h2>
          <BklitRadarChart class="mt-4" :data="fixture.radarProfile.data" :metrics="fixture.radarProfile.metrics" :size="400" />
        </article>
        <article :class="currentColorProfile.panelClass" class="rounded-[28px] p-6 sm:p-8 lg:col-span-4 lg:p-8 transition-colors duration-300">
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-2xl tracking-[-0.04em] font-body">Verdict</h2>
            <RoastOneGradeStar :grade="fixture.grade" grade-size="xs" size="sm" />
          </div>
          <span class="text-[11px] text-primary tracking-[0.08em] rounded-full px-3 py-1.5 border-[1px] border-primary/30 border-solid inline-flex font-meta uppercase mt-6">{{ fixture.growthLevel }}</span>
          <h3 class="max-w-[12ch] text-4xl tracking-[-0.06em] font-display leading-[0.94] mt-5 sm:text-5xl">{{ fixture.headline }}</h3>
          <p :class="currentColorProfile.mutedClass" class="max-w-[34rem] text-base leading-7 mt-6">{{ fixture.note }}</p>
        </article>
        <article :class="currentColorProfile.panelClass" class="rounded-[28px] p-6 sm:p-8 lg:col-span-12 transition-colors duration-300"><div class="flex items-center justify-between"><h2 class="text-2xl tracking-[-0.04em] font-body">Evidence</h2><span class="text-[10px] text-primary-strong font-meta uppercase">Mock</span></div><DashboardRingChart class="mt-8" :data="fixture.ringProfile" /></article>
        <article :class="currentColorProfile.panelClass" class="rounded-[28px] p-6 sm:p-8 lg:col-span-12 transition-colors duration-300"><div class="flex flex-wrap gap-4 items-end justify-between"><div><h2 class="text-2xl tracking-[-0.05em] font-display">Change volume</h2></div><button :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.12em] rounded-[8px] px-3 py-2 border-[1px] border-current/30 border-solid font-meta uppercase hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2" type="button" @click="replayBarLoading">Replay loading</button></div><BklitBarChart class="mt-8" :data="explorerFixture.barChangeVolume" x-data-key="label" :series-count="2" :status="isBarLoading ? 'loading' : 'ready'"><template #grid><BklitGrid horizontal /></template><BklitBar data-key="additions" fill="var(--color-primary-strong)" /><BklitBar data-key="deletions" fill="var(--color-primary)" /><template #x-axis><BklitBarXAxis /></template></BklitBarChart><div :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.14em] mt-5 flex gap-5 font-meta uppercase"><span><i class="rounded-full bg-primary-strong h-2 w-2 mr-2 inline-block" /> additions</span><span><i class="rounded-full bg-primary h-2 w-2 mr-2 inline-block" /> deletions</span></div></article>
      </div>

      <section v-if="favoriteColorProfileDetails.length" :class="currentColorProfile.panelClass" class="rounded-[28px] p-5 mt-4 transition-colors duration-300 sm:p-6">
        <div class="flex flex-wrap gap-3 items-baseline justify-between">
          <h2 class="text-lg tracking-[-0.03em] font-body">Favorites</h2>
          <span :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.12em] font-meta uppercase">{{ favoriteColorProfileDetails.length }} saved · press L to add</span>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="favorite in favoriteColorProfileDetails"
            :key="favorite.key"
            :class="favorite.key === activeColorProfile ? 'bg-primary text-bone-50' : currentColorProfile.mutedClass"
            class="text-[10px] tracking-[0.08em] rounded-[7px] px-3 py-2 border-[1px] border-current/20 border-solid font-meta uppercase hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            type="button"
            @click="activeColorProfile = favorite.key"
          >
            <Icon name="ph:heart" class="mr-1.5 align-[-0.12em]" />{{ favorite.label }}
          </button>
        </div>
      </section>

      <footer :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme</span><span>Profile view</span></footer>
    </div>
  </div>
</template>
