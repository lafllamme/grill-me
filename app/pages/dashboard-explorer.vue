<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import { buildLiveDashboardModel, buildMockDashboardModel } from '~/components/dashboard-explorer/dashboard-model'
import DashboardExplorer from '~/components/dashboard-explorer/DashboardExplorer.vue'
import { useDashboardAnalysis } from '~/composables/useDashboardAnalysis'
import { dashboardMockProfiles } from '~/data/dashboard-mock-profiles'

interface DashboardColorProfile {
  label: string
  description: string
  stageClass: string
  panelClass: string
  copyClass: string
  mutedClass: string
  surfaceContrast?: string
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

const activeMockProfileIndex = ref(0)
const { githubUsername, assessment: realAssessment, evidence: realEvidence, phase: analysisPhase, errorMessage: realAssessmentError, isLoading: isLoadingRealAssessment, analyze: analyzeGithubProfile, reset: resetAnalysis } = useDashboardAnalysis()
const activeMockProfile = computed(() => dashboardMockProfiles[activeMockProfileIndex.value]!)
const mockProfileCount = dashboardMockProfiles.length
const dashboardModel = computed(() => realAssessment.value && realEvidence.value
  ? buildLiveDashboardModel({ assessment: realAssessment.value, evidence: realEvidence.value }, activeMockProfile.value)
  : buildMockDashboardModel(activeMockProfile.value))
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
  slateCloudSoft: { label: 'Slate Cloud Soft', description: 'near-white slate stage, lifted card', stageClass: 'bg-[#eef1f1]', panelClass: 'bg-white', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.14:1' },
  paperSnow: { label: 'Paper Snow', description: 'soft white stage, lifted card', stageClass: 'bg-[#f4f5f3]', panelClass: 'bg-white', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.09:1' },
  cloudSlate: { label: 'Cloud Slate', description: 'cool cloud stage, lifted card', stageClass: 'bg-[#edf0f0]', panelClass: 'bg-[#fbfcfc]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.12:1' },
  whiteStone: { label: 'White Stone', description: 'mineral stage, clean card', stageClass: 'bg-[#f0f0ee]', panelClass: 'bg-[#fdfcf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.11:1' },
  silverCloud: { label: 'Silver Cloud', description: 'cool silver stage, crisp card', stageClass: 'bg-[#e9ecef]', panelClass: 'bg-[#f9fafb]', copyClass: 'text-[#181614]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.13:1' },
  chalkGraphite: { label: 'Chalk Graphite', description: 'chalk stage, bright card', stageClass: 'bg-[#ebeae7]', panelClass: 'bg-[#faf9f6]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.14:1' },
  boneGraphite: { label: 'Bone Graphite', description: 'warm paper stage, lifted card', stageClass: 'bg-[#eee9e3]', panelClass: 'bg-[#fffdf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.19:1' },
  fogWhite: { label: 'Fog White', description: 'fog canvas, lifted white card', stageClass: 'bg-[#edf0ef]', panelClass: 'bg-white', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.15:1' },
  taupeWhite: { label: 'Taupe White', description: 'warm stage, quiet paper card', stageClass: 'bg-[#e8e3dd]', panelClass: 'bg-[#fffdf9]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.26:1' },
  stoneCloud: { label: 'Stone Cloud', description: 'stone canvas, soft white card', stageClass: 'bg-[#e8e8e6]', panelClass: 'bg-[#f8f8f6]', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.15:1' },
  paperLift: { label: 'Paper Lift', description: 'paper canvas, elevated white card', stageClass: 'bg-[#f1f0ed]', panelClass: 'bg-white', copyClass: 'text-[#181614]', mutedClass: 'text-[#665d56]', surfaceContrast: '1.14:1' },
  slateCloud: { label: 'Slate Cloud', description: 'cool slate, crisp white card', stageClass: 'bg-[#e5e8e9]', panelClass: 'bg-[#fbfcfc]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.20:1' },
  slateCloudRich: { label: 'Slate Cloud Rich', description: 'deeper slate stage, crisp card', stageClass: 'bg-[#dde2e3]', panelClass: 'bg-[#f8faf9]', copyClass: 'text-[#1a211e]', mutedClass: 'text-[#4e4e4e]', surfaceContrast: '1.25:1' },
} satisfies Record<string, DashboardColorProfile>
type ColorProfile = keyof typeof colorProfiles
const activeColorProfile = ref<ColorProfile>('voidWhisper')
type ColorMode = 'dark' | 'light'
const activeColorMode = ref<ColorMode>('dark')
const currentColorProfile = computed<DashboardColorProfile>(() => colorProfiles[activeColorProfile.value])
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
  '--chart-1': 'var(--color-primary-strong)',
  '--chart-2': 'var(--color-primary)',
  '--chart-3': 'color-mix(in srgb, var(--color-primary-strong) 78%, black)',
  '--chart-4': 'color-mix(in srgb, var(--color-primary) 72%, white)',
  '--chart-5': 'color-mix(in srgb, var(--color-primary) 58%, black)',
}))
function shiftMockProfile(direction: -1 | 1) {
  resetAnalysis()
  activeMockProfileIndex.value = (activeMockProfileIndex.value + direction + mockProfileCount) % mockProfileCount
}

function setColorMode(mode: ColorMode) {
  activeColorMode.value = mode
  activeColorProfile.value = mode === 'dark' ? 'voidWhisper' : 'slateCloud'
}

function submitAnalysis() {
  void analyzeGithubProfile()
}

useHead({ title: 'Dashboard Explorer · Grillme' })
useSeoMeta({ title: 'Dashboard Explorer · Grillme', description: 'A mocked profile view for the roast dashboard.' })
</script>

<template>
  <div :class="[currentColorProfile.stageClass, currentColorProfile.copyClass]" :style="chartStyle" class="min-h-[100dvh] transition-colors duration-300 overflow-x-hidden">
    <div class="mx-auto px-5 pb-24 max-w-[1440px] lg:px-12 sm:px-8">
      <header class="py-6 border-b-[1px] border-divider border-solid flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 class="text-5xl leading-[0.88] tracking-[-0.08em] font-display mt-4 max-w-[10ch] sm:text-7xl">
            Read the roast.
          </h1>
          <p :class="currentColorProfile.mutedClass" class="text-base leading-7 mt-6 max-w-[42rem]">
            A profile read built from the commits, changes, and patterns that shape this repository.
          </p>
        </div>
        <fieldset class="m-0 p-0 border-0 sm:pt-4">
          <legend :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.14em] font-meta mb-2 uppercase">
            Color profile
          </legend>
          <div class="flex gap-2 items-center">
            <div class="p-1 border-[1px] border-white/10 rounded-[10px] border-solid bg-black/20 flex gap-1 items-center">
              <button
                :class="activeColorMode === 'dark' ? 'bg-white/15 text-current' : currentColorProfile.mutedClass"
                class="text-[10px] tracking-[0.08em] font-meta px-3 rounded-[6px] h-8 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                :aria-pressed="activeColorMode === 'dark'"
                aria-label="Use dark color profiles"
                @click="setColorMode('dark')"
              >
                Dark
              </button>
              <button
                :class="activeColorMode === 'light' ? 'bg-white/15 text-current' : currentColorProfile.mutedClass"
                class="text-[10px] tracking-[0.08em] font-meta px-3 rounded-[6px] h-8 uppercase transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                type="button"
                :aria-pressed="activeColorMode === 'light'"
                aria-label="Use light color profiles"
                @click="setColorMode('light')"
              >
                Light
              </button>
              <div :class="currentColorProfile.copyClass" class="px-2 text-center min-w-36">
                <p class="text-[10px] tracking-[0.08em] font-meta uppercase">
                  <Icon name="ph:crown-simple" class="text-primary mr-1 align-[-0.12em]" />{{ currentColorProfile.label }}
                </p>
                <p v-if="currentColorProfile.surfaceContrast" :class="currentColorProfile.mutedClass" class="text-[9px] font-meta mt-0.5">
                  stage ↔ card {{ currentColorProfile.surfaceContrast }}
                </p>
              </div>
            </div>
          </div>
          <div class="mt-4 flex gap-3 items-center sm:justify-end" role="group" aria-label="Browse mock dashboard profiles">
            <button
              :class="currentColorProfile.mutedClass"
              class="border-[1px] border-current/30 rounded-[8px] border-solid inline-flex h-9 w-9 transition-colors items-center justify-center focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:bg-white/10"
              type="button"
              aria-label="Previous mock dashboard profile"
              @click="shiftMockProfile(-1)"
            >
              <Icon name="ph:caret-left" aria-hidden="true" />
            </button>
            <div class="text-right min-w-48">
              <p :class="currentColorProfile.copyClass" class="text-xs font-body">
                {{ activeMockProfile.label }}
              </p>
              <p :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.08em] font-meta mt-1 uppercase">
                {{ activeMockProfile.group }} · {{ String(activeMockProfileIndex + 1).padStart(2, '0') }} / {{ String(mockProfileCount).padStart(2, '0') }}
              </p>
              <p :class="currentColorProfile.mutedClass" class="text-[10px] font-meta mt-1">
                {{ activeMockProfile.description }}
              </p>
            </div>
            <button
              :class="currentColorProfile.mutedClass"
              class="border-[1px] border-current/30 rounded-[8px] border-solid inline-flex h-9 w-9 transition-colors items-center justify-center focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:bg-white/10"
              type="button"
              aria-label="Next mock dashboard profile"
              @click="shiftMockProfile(1)"
            >
              <Icon name="ph:caret-right" aria-hidden="true" />
            </button>
          </div>
          <form class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end" @submit.prevent="submitAnalysis">
            <label :class="currentColorProfile.mutedClass" class="sr-only" for="github-profile">Analyze GitHub profile</label>
            <div class="px-3 border-[1px] border-current/20 rounded-[8px] bg-black/10 flex h-9 min-w-56 items-center">
              <span :class="currentColorProfile.mutedClass" class="text-xs font-meta mr-1">github.com/</span>
              <input
                id="github-profile"
                v-model="githubUsername"
                :class="currentColorProfile.copyClass"
                class="text-xs outline-none bg-transparent min-w-0 w-full"
                autocomplete="off"
                spellcheck="false"
              >
            </div>
            <button
              :disabled="isLoadingRealAssessment"
              :class="isLoadingRealAssessment ? 'opacity-60 cursor-wait' : ''"
              class="text-xs text-primary-strong font-meta px-3 border-[1px] border-primary rounded-[8px] h-9 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:bg-primary"
              type="submit"
            >
              {{ isLoadingRealAssessment ? 'Analyzing…' : 'Analyze live' }}
            </button>
          </form>
          <p v-if="realAssessmentError" class="text-xs text-primary mt-2 sm:text-right" role="alert">
            {{ realAssessmentError }}
          </p>
        </fieldset>
      </header>

      <DashboardExplorer
        :model="dashboardModel"
        :phase="analysisPhase"
        :username="githubUsername"
        :error-message="realAssessmentError"
        :panel-class="currentColorProfile.panelClass"
        :muted-class="currentColorProfile.mutedClass"
        @retry="submitAnalysis"
      />

      <footer :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.16em] font-meta mt-8 flex flex-wrap gap-4 uppercase justify-between">
        <span>Grillme</span><span>Profile view</span>
      </footer>
    </div>
  </div>
</template>
