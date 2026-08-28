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

interface ChartPalette {
  grid: string
  track: string
  hover: string
  label: string
  text: string
  onBackground: string
  onSurfaceVariant: string
  surfaceVariant: string
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
  paperSnow: { label: 'Paper Snow', description: 'plain white, soft slate card', stageClass: 'bg-white', panelClass: 'bg-[#dfe4e2]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]' },
  cloudSlate: { label: 'Cloud Slate', description: 'cool canvas, lifted slate', stageClass: 'bg-[#f7f8f8]', panelClass: 'bg-[#cfd6d7]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]' },
  whiteStone: { label: 'White Stone', description: 'clean canvas, mineral contrast', stageClass: 'bg-white', panelClass: 'bg-[#d0cfca]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  silverCloud: { label: 'Silver Cloud', description: 'cool white, calm separation', stageClass: 'bg-[#f5f6f7]', panelClass: 'bg-[#c7ccd1]', copyClass: 'text-[#181614]', mutedClass: 'text-[#4e4e4e]' },
  chalkGraphite: { label: 'Chalk Graphite', description: 'chalk field, decisive card', stageClass: 'bg-[#f4f4f2]', panelClass: 'bg-[#c8c5bf]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  boneGraphite: { label: 'Bone Graphite', description: 'warm paper, grounded card', stageClass: 'bg-[#fdfcf9]', panelClass: 'bg-[#c7c0b8]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  fogWhite: { label: 'Fog White', description: 'fog canvas, lifted white card', stageClass: 'bg-[#edf0ef]', panelClass: 'bg-white', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]' },
  taupeWhite: { label: 'Taupe White', description: 'warm stage, quiet paper card', stageClass: 'bg-[#e8e3dd]', panelClass: 'bg-[#fffdf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  stoneCloud: { label: 'Stone Cloud', description: 'stone canvas, soft white card', stageClass: 'bg-[#e8e8e6]', panelClass: 'bg-[#f8f8f6]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  paperLift: { label: 'Paper Lift', description: 'paper canvas, elevated white card', stageClass: 'bg-[#f1f0ed]', panelClass: 'bg-white', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]' },
  slateCloud: { label: 'Slate Cloud', description: 'cool slate, crisp white card', stageClass: 'bg-[#e5e8e9]', panelClass: 'bg-[#fbfcfc]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]' },
} satisfies Record<string, DashboardColorProfile>
type ColorProfile = keyof typeof colorProfiles
const activeColorProfile = ref<ColorProfile>('basalt')
type ColorMode = 'dark' | 'light'
const activeColorMode = ref<ColorMode>('dark')
const colorProfileRows: ColorProfile[][] = [
  ['void', 'graphite', 'basalt', 'mauve', 'redline', 'charcoal', 'carbon', 'explorer'],
  ['voidWhisper', 'graphiteHush', 'basaltQuiet', 'explorerSoft'],
  ['paperSnow', 'cloudSlate', 'whiteStone', 'silverCloud', 'chalkGraphite', 'boneGraphite', 'fogWhite', 'taupeWhite', 'stoneCloud', 'paperLift', 'slateCloud'],
]
const darkColorProfileKeys = colorProfileRows.slice(0, 2).flat()
const lightColorProfileKeys = colorProfileRows[2]!
const visibleColorProfileKeys = computed(() => activeColorMode.value === 'dark' ? darkColorProfileKeys : lightColorProfileKeys)
const currentColorProfile = computed(() => colorProfiles[activeColorProfile.value])
const currentColorProfileIndex = computed(() => visibleColorProfileKeys.value.indexOf(activeColorProfile.value))
const chartPalette = computed<ChartPalette>(() => activeColorMode.value === 'dark'
  ? {
      grid: 'rgba(92, 93, 101, 0.28)',
      track: '#252831',
      hover: '#2f3035',
      label: '#d8bfa8',
      text: '#fcf7f0',
      onBackground: '#fcf7f0',
      onSurfaceVariant: '#d8bfa8',
      surfaceVariant: '#3d3833',
    }
  : {
      grid: 'rgba(92, 93, 101, 0.28)',
      track: '#252831',
      hover: '#2f3035',
      label: '#4e4e4e',
      text: '#1a211e',
      onBackground: '#181614',
      onSurfaceVariant: '#665d56',
      surfaceVariant: '#d7d1cb',
    })
const chartStyle = computed(() => ({
  '--color-chart-grid': chartPalette.value.grid,
  '--color-chart-track': chartPalette.value.track,
  '--color-chart-hover': chartPalette.value.hover,
  '--color-on-background': chartPalette.value.onBackground,
  '--color-on-surface-variant': chartPalette.value.onSurfaceVariant,
  '--color-surface-variant': chartPalette.value.surfaceVariant,
  '--chart-label': chartPalette.value.label,
  '--chart-text': chartPalette.value.text,
}))
const profileRadarData = computed(() => fixture.radarProfile.data.map(item => ({ ...item })))
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
  const profileKeys = visibleColorProfileKeys.value
  const nextIndex = (currentColorProfileIndex.value + direction + profileKeys.length) % profileKeys.length
  activeColorProfile.value = profileKeys[nextIndex]!
}

function setColorMode(mode: ColorMode) {
  activeColorMode.value = mode
  if (!visibleColorProfileKeys.value.includes(activeColorProfile.value)) {
    activeColorProfile.value = visibleColorProfileKeys.value[0]!
  }
}

function handleColorProfileKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) {
    return
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    cycleColorProfile(event.key === 'ArrowLeft' ? -1 : 1)
  }
}

onMounted(() => {
  replayBarLoading()
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
  <div :class="[currentColorProfile.stageClass, currentColorProfile.copyClass]" :style="chartStyle" class="min-h-[100dvh] overflow-x-hidden transition-colors duration-300">
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
                :class="activeColorMode === 'dark' ? 'bg-white/15 text-current' : currentColorProfile.mutedClass"
                class="text-[10px] tracking-[0.08em] rounded-[6px] h-8 px-3 transition-colors font-meta uppercase focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                :aria-pressed="activeColorMode === 'dark'"
                aria-label="Use dark color profiles"
                @click="setColorMode('dark')"
              >
                Dark
              </button>
              <button
                :class="activeColorMode === 'light' ? 'bg-white/15 text-current' : currentColorProfile.mutedClass"
                class="text-[10px] tracking-[0.08em] rounded-[6px] h-8 px-3 transition-colors font-meta uppercase focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                :aria-pressed="activeColorMode === 'light'"
                aria-label="Use light color profiles"
                @click="setColorMode('light')"
              >
                Light
              </button>
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
                <p :class="currentColorProfile.mutedClass" class="text-[9px] font-meta mt-0.5">{{ currentColorProfileIndex + 1 }} / {{ visibleColorProfileKeys.length }}</p>
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
          </div>
          <p :class="currentColorProfile.mutedClass" class="text-[10px] font-meta mt-2 sm:text-right">{{ currentColorProfile.description }}</p>
        </fieldset>
      </header>

      <div id="profile-panel" class="grid gap-4 mt-8 lg:grid-cols-12">
        <article :class="currentColorProfile.panelClass" class="rounded-[28px] p-6 sm:p-8 lg:col-span-8 lg:p-8 transition-colors duration-300">
          <h2 class="text-2xl tracking-[-0.04em] font-body">Profile</h2>
          <BklitRadarChart class="mt-4" :data="profileRadarData" :metrics="fixture.radarProfile.metrics" :size="400" />
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

      <footer :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.16em] mt-8 flex flex-wrap gap-4 justify-between font-meta uppercase"><span>Grillme</span><span>Profile view</span></footer>
    </div>
  </div>
</template>
