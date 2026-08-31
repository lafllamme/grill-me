<script setup lang="ts">
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'
import { computed, ref } from 'vue'
import { useHead, useSeoMeta } from '#imports'
import ChangeGaugePanel from '~/components/dashboard-explorer/change-gauge/ChangeGaugePanel.vue'
import ChangeVolumePanel from '~/components/dashboard-explorer/change-volume/ChangeVolumePanel.vue'
import CommitTimelinePanel from '~/components/dashboard-explorer/commit-timeline/CommitTimelinePanel.vue'
import EvidenceRingPanel from '~/components/dashboard-explorer/evidence-ring/EvidenceRingPanel.vue'
import ProfileRadarPanel from '~/components/dashboard-explorer/profile-radar/ProfileRadarPanel.vue'
import RepositorySunburstPanel from '~/components/dashboard-explorer/repository-sunburst/RepositorySunburstPanel.vue'
import VerdictPanel from '~/components/dashboard-explorer/verdict/VerdictPanel.vue'
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

interface RealSafetySignal {
  category: 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
  verdict: 'safe' | 'risk' | 'unclear'
  impact: 'introduced' | 'fixed' | 'unclear'
  severity: 'low' | 'medium' | 'high'
  commitSha: string
  evidence: string
}

interface RealAiFinding {
  axis: 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'
  verdict: 'positive' | 'mixed' | 'negative' | 'unclear'
  impact: 'introduced' | 'fixed' | 'unclear'
  severity: 'low' | 'medium' | 'high'
  commitSha: string
  filename: string
  evidence: string
  category?: string
}

interface RealAiReview {
  confidence: number
  status: string
  selectedCommitCount: number
  patchCount: number
  patchChars: number
  findings: RealAiFinding[]
}

interface RealCommitFile {
  filename: string
  status: string
  additions: number
  deletions: number
}

interface RealCommitEvidence {
  repo: string
  sha: string
  message: string
  additions: number
  deletions: number
  changedFiles: number
  committedAt?: string
  files: RealCommitFile[]
}

interface RealDashboardEvidence {
  commits: RealCommitEvidence[]
  pullRequests: unknown[]
}

interface RealProfileAssessment {
  username: string
  scores: Record<'clarity' | 'safety' | 'workflow' | 'complexity' | 'context', number>
  overallScore: number
  grade: string
  role: string
  roleStatus: 'classified' | 'unclassified'
  confidence: number
  derivedMetrics: {
    commitCount: number
    pullRequestCount: number
    additions: number
    deletions: number
    changedFiles: number
    averageCommitSize: number
    medianCommitSize: number
    largestCommitSize: number
    p90CommitSize: number
    activeDays: number
    spanDays: number
    commitsPer30Days: number
    averageFilesPerCommit: number
    documentationFileRatio: number
    testFileRatio: number
    ciFileRatio: number
    validationFileRatio: number
    pullRequestCoverage: number
    deletionRatio: number
    riskyFileRatio: number
    defensivePatchRatio: number
    riskyPatchRatio: number
    mergeCommitRatio: number
    largeCommitRatio: number
    messageQuality: number
    conventionalMessageRatio: number
    genericMessageRatio: number
    emptyMessageRatio: number
  }
  evidenceWindow: { from?: string, to?: string }
  aiSafety?: { confidence: number, status: string, signals: RealSafetySignal[] }
  aiReview?: RealAiReview
}

interface RealDashboardResponse {
  assessment: RealProfileAssessment
  evidence: RealDashboardEvidence
}

interface MutableSunburstNode {
  name: string
  value?: number
  children: Map<string, MutableSunburstNode>
}

const activeMockProfileIndex = ref(0)
const githubUsername = ref('lafllamme')
const realAssessment = ref<RealProfileAssessment | null>(null)
const realEvidence = ref<RealDashboardEvidence | null>(null)
const isLoadingRealAssessment = ref(false)
const realAssessmentError = ref('')
const activeMockProfile = computed(() => dashboardMockProfiles[activeMockProfileIndex.value]!)
const mockProfileCount = dashboardMockProfiles.length
const fixture = computed(() => activeMockProfile.value.dashboard)
const explorerFixture = computed(() => activeMockProfile.value.explorer)
const commitFrequencyGauge = computed(() => Math.min(100, fixture.value.evidence.commits))
const displayedRadarProfile = computed(() => realAssessment.value
  ? { metrics: fixture.value.radarProfile.metrics, data: [{ label: realAssessment.value.username, color: 'var(--color-primary-strong)', values: realAssessment.value.scores }] }
  : fixture.value.radarProfile)
const displayedRingProfile = computed(() => realAssessment.value
  ? fixture.value.ringProfile.map(ring => ({ ...ring, value: realAssessment.value!.scores[ring.label.toLowerCase() as keyof RealProfileAssessment['scores']] ?? ring.value }))
  : fixture.value.ringProfile)
const displayedGrade = computed(() => realAssessment.value?.grade ?? fixture.value.grade)
const displayedGaugeValue = computed(() => realAssessment.value ? Math.min(100, realAssessment.value.derivedMetrics.commitCount) : commitFrequencyGauge.value)
const displayedGaugeCenterValue = computed(() => realAssessment.value?.derivedMetrics.commitCount ?? fixture.value.evidence.commits)
const displayedVerdictGrowthLevel = computed(() => realAssessment.value ? 'Live profile' : fixture.value.growthLevel)
const displayedVerdictHeadline = computed(() => realAssessment.value ? `${realAssessment.value.role} under review.` : fixture.value.headline)
const displayedVerdictNote = computed(() => realAssessment.value
  ? 'A bounded repository sample now connects the profile scores to the same commits, files, and review signals shown below.'
  : fixture.value.note)

const liveEvidenceCommits = computed(() => realEvidence.value?.commits ?? [])
const displayedBarChangeVolume = computed<readonly BklitBarDatum[]>(() => {
  if (!realAssessment.value || !liveEvidenceCommits.value.length)
    return explorerFixture.value.barChangeVolume

  return [...liveEvidenceCommits.value]
    .sort((left, right) => Date.parse(left.committedAt ?? '') - Date.parse(right.committedAt ?? ''))
    .slice(-8)
    .map(commit => ({
      label: commit.sha.slice(0, 7),
      additions: commit.additions,
      deletions: commit.deletions,
    }))
})

const displayedTimeline = computed<readonly RoastTimelineDatum[]>(() => {
  if (!realAssessment.value || !liveEvidenceCommits.value.length)
    return explorerFixture.value.timeline

  const grouped = new Map<string, RoastTimelineDatum>()
  liveEvidenceCommits.value.forEach((commit, index) => {
    const timestamp = commit.committedAt ? Date.parse(commit.committedAt) : Number.NaN
    const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date(Date.UTC(2026, 0, index + 1))
    const key = date.toISOString().slice(0, 10)
    const current = grouped.get(key)
    if (current) {
      current.commits += 1
      current.files += commit.changedFiles
      current.additions += commit.additions
      return
    }

    grouped.set(key, {
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
      date: date.getTime(),
      commits: 1,
      files: commit.changedFiles,
      additions: commit.additions,
    })
  })

  return [...grouped.values()].sort((left, right) => Number(left.date) - Number(right.date))
})

function toSunburstNode(node: MutableSunburstNode): SunburstNode {
  const children = [...node.children.values()].map(toSunburstNode)
  return {
    name: node.name,
    ...(node.value !== undefined && !children.length ? { value: node.value } : {}),
    ...(children.length ? { children } : {}),
  }
}

const displayedSunburst = computed<SunburstNode>(() => {
  if (!realAssessment.value || !liveEvidenceCommits.value.length)
    return explorerFixture.value.sunburstData

  const fileChanges = new Map<string, number>()
  liveEvidenceCommits.value.forEach((commit) => {
    commit.files.forEach((file) => {
      fileChanges.set(file.filename, (fileChanges.get(file.filename) ?? 0) + Math.max(1, file.additions + file.deletions))
    })
  })

  const root: MutableSunburstNode = { name: 'Repository', children: new Map() }
  const rankedFiles = [...fileChanges.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 80)
  rankedFiles.forEach(([filename, value]) => {
    const segments = filename.split('/').filter(Boolean)
    let current = root
    segments.forEach((segment, index) => {
      const child = current.children.get(segment) ?? { name: segment, children: new Map<string, MutableSunburstNode>() }
      current.children.set(segment, child)
      if (index === segments.length - 1)
        child.value = value
      current = child
    })
  })

  return toSunburstNode(root)
})

const displayedSunburstDescription = computed(() => realAssessment.value
  ? 'Files and folders are sized by changed lines in the enriched GitHub sample.'
  : 'Repository folders and file hotspots derived from the selected mock profile.')
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
  activeMockProfileIndex.value = (activeMockProfileIndex.value + direction + mockProfileCount) % mockProfileCount
}

function setColorMode(mode: ColorMode) {
  activeColorMode.value = mode
  activeColorProfile.value = mode === 'dark' ? 'voidWhisper' : 'slateCloud'
}

async function analyzeGithubProfile() {
  realAssessmentError.value = ''
  isLoadingRealAssessment.value = true
  try {
    const response = await $fetch<RealDashboardResponse>('/api/dashboard-profile', {
      method: 'POST',
      body: { username: githubUsername.value },
    })
    realAssessment.value = response.assessment
    realEvidence.value = response.evidence
  }
  catch (error: any) {
    realAssessmentError.value = error?.data?.message || error?.statusMessage || 'GitHub profile could not be analyzed.'
  }
  finally {
    isLoadingRealAssessment.value = false
  }
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
          <form class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end" @submit.prevent="analyzeGithubProfile">
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
              class="text-xs text-primary font-meta px-3 border-[1px] border-primary rounded-[8px] h-9 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 hover:bg-primary"
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

      <div id="profile-panel" class="mt-8 gap-4 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-12">
        <ProfileRadarPanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-radar`" class="lg:col-span-6" :data="displayedRadarProfile" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <VerdictPanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-verdict`" class="lg:col-span-6" :grade="displayedGrade" :growth-level="displayedVerdictGrowthLevel" :headline="displayedVerdictHeadline" :note="displayedVerdictNote" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <EvidenceRingPanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-ring`" :data="displayedRingProfile" heading="Profile signals" center-label="Profile score" :is-live="Boolean(realAssessment)" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <ChangeGaugePanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-gauge`" :value="displayedGaugeValue" :center-value="displayedGaugeCenterValue" label="Commits" description="Commits recorded in the selected analysis window, normalized to a 100-commit scale." :is-live="Boolean(realAssessment)" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <ChangeVolumePanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-volume`" :data="displayedBarChangeVolume" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <CommitTimelinePanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-timeline`" :data="displayedTimeline" :markers="realAssessment ? [] : undefined" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
        <RepositorySunburstPanel :key="`${activeMockProfile.id}-${realAssessment?.username ?? 'mock'}-sunburst`" :data="displayedSunburst" :description="displayedSunburstDescription" :is-live="Boolean(realAssessment)" :panel-class="currentColorProfile.panelClass" :muted-class="currentColorProfile.mutedClass" />
      </div>

      <footer :class="currentColorProfile.mutedClass" class="text-[10px] tracking-[0.16em] font-meta mt-8 flex flex-wrap gap-4 uppercase justify-between">
        <span>Grillme</span><span>Profile view</span>
      </footer>
    </div>
  </div>
</template>
