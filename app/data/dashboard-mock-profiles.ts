import type { RoastDashboardCommitDatum, RoastDashboardRingDatum } from './roast-dashboard'
import type { RoastTimelineDatum } from './roast-dashboard-explorer'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { BklitRadarData, BklitRadarMetric } from '~/components/dashboard/bklit/radar-context'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'
import { roastDashboardFixture } from './roast-dashboard'
import { roastDashboardExplorerFixture } from './roast-dashboard-explorer'

interface DashboardMockData {
  grade: string
  growthLevel: string
  headline: string
  note: string
  evidence: {
    commits: number
    files: number
    additions: number
    deletions: number
  }
  ringProfile: readonly RoastDashboardRingDatum[]
  radarProfile: {
    metrics: readonly BklitRadarMetric[]
    data: readonly BklitRadarData[]
  }
  commits: readonly RoastDashboardCommitDatum[]
}

interface ExplorerMockData {
  timeline: readonly RoastTimelineDatum[]
  barChangeVolume: readonly BklitBarDatum[]
  sunburstData: SunburstNode
}

export interface DashboardMockProfile {
  id: string
  label: string
  description: string
  dashboard: DashboardMockData
  explorer: ExplorerMockData
}

function scaleTimeline(scale: number, commitOffset: number) {
  return roastDashboardExplorerFixture.timeline.map(item => ({
    ...item,
    additions: Math.round(item.additions * scale),
    files: Math.max(1, Math.round(item.files * scale)),
    commits: Math.max(1, item.commits + commitOffset),
  }))
}

const profileRadarMetrics: readonly BklitRadarMetric[] = [
  { key: 'readability', label: 'Readability' },
  { key: 'testability', label: 'Testability' },
  { key: 'maintainability', label: 'Maintainability' },
  { key: 'discipline', label: 'Discipline' },
  { key: 'documentation', label: 'Documentation' },
]

function createProfileRadar(label: string, values: [number, number, number, number, number]) {
  const [readability, testability, maintainability, discipline, documentation] = values
  return {
    metrics: profileRadarMetrics,
    data: [{
      label,
      values: { readability, testability, maintainability, discipline, documentation },
    }],
  }
}

function createRepositorySunburst(scale: number): SunburstNode {
  const value = (amount: number) => Math.round(amount * scale)
  return {
    name: 'Repository',
    children: [
      { name: 'app', children: [{ name: 'pages', children: [{ name: 'dashboard-explorer.vue', value: value(92) }, { name: 'index.vue', value: value(58) }] }, { name: 'components', children: [{ name: 'dashboard', value: value(84) }, { name: 'roast-one', value: value(61) }] }] },
      { name: 'server', children: [{ name: 'roast', children: [{ name: 'orchestrator.ts', value: value(128) }, { name: 'prompt.ts', value: value(76) }] }, { name: 'api', value: value(54) }] },
      { name: 'shared', children: [{ name: 'roast', value: value(48) }, { name: 'types', value: value(37) }] },
      { name: 'docs', children: [{ name: 'design-system', value: value(42) }, { name: 'testing', value: value(29) }] },
    ],
  }
}

export const dashboardMockProfiles: readonly DashboardMockProfile[] = [
  {
    id: 'abstraction-survivor',
    label: 'Abstraction survivor',
    description: 'large changes, thin safety net',
    dashboard: {
      ...roastDashboardFixture,
      grade: 'C-',
      growthLevel: 'High potential',
      headline: 'Your architecture entered witness protection.',
      note: 'A sharp read on a codebase that keeps adding aliases instead of removing complexity.',
      evidence: { commits: 42, files: 118, additions: 8420, deletions: 1910 },
      commits: [
        { label: '1c83407', files: 18, additions: 522, deletions: 101 },
        { label: '73e2475', files: 14, additions: 249, deletions: 38 },
      ],
      radarProfile: createProfileRadar('Abstraction survivor', [42, 31, 39, 28, 24]),
      ringProfile: [
        { label: 'Human readability', value: 42, maxValue: 100, descriptor: 'Aliases hide intent' },
        { label: 'Testability', value: 31, maxValue: 100, descriptor: 'Behaviour under-covered' },
        { label: 'Maintainability', value: 39, maxValue: 100, descriptor: 'Wrappers multiply' },
        { label: 'Change discipline', value: 28, maxValue: 100, descriptor: 'Commit scope drifts' },
        { label: 'Abstraction pressure', value: 67, maxValue: 100, descriptor: 'Layers outpace intent' },
        { label: 'Documentation coverage', value: 24, maxValue: 100, descriptor: 'Context lives in code' },
      ],
    },
    explorer: {
      ...roastDashboardExplorerFixture,
      timeline: scaleTimeline(1.15, 0),
      barChangeVolume: [
        { label: '1c83407', additions: 522, deletions: 101 },
        { label: '73e2475', additions: 249, deletions: 38 },
        { label: 'a04f921', additions: 314, deletions: 72 },
        { label: 'c82a100', additions: 438, deletions: 126 },
        { label: 'e6b71d2', additions: 366, deletions: 84 },
        { label: 'f9d022a', additions: 487, deletions: 154 },
      ],
      sunburstData: createRepositorySunburst(1),
    },
  },
  {
    id: 'steady-builder',
    label: 'Steady builder',
    description: 'consistent delivery, measured change',
    dashboard: {
      ...roastDashboardFixture,
      grade: 'B+',
      growthLevel: 'Strong signal',
      headline: 'You ship like you remember tomorrow exists.',
      note: 'The repository shows steady delivery, contained change surfaces, and enough evidence to trust the next move.',
      evidence: { commits: 64, files: 76, additions: 4860, deletions: 2180 },
      commits: [
        { label: 'a10f2c1', files: 6, additions: 180, deletions: 92 },
        { label: 'b42d881', files: 7, additions: 246, deletions: 118 },
      ],
      radarProfile: createProfileRadar('Steady builder', [78, 73, 81, 76, 69]),
      ringProfile: [
        { label: 'Human readability', value: 78, maxValue: 100, descriptor: 'Intent stays visible' },
        { label: 'Testability', value: 73, maxValue: 100, descriptor: 'Behaviour has cover' },
        { label: 'Maintainability', value: 81, maxValue: 100, descriptor: 'Boundaries hold' },
        { label: 'Change discipline', value: 76, maxValue: 100, descriptor: 'Commits stay scoped' },
        { label: 'Abstraction pressure', value: 29, maxValue: 100, descriptor: 'Layers earn their keep' },
        { label: 'Documentation coverage', value: 69, maxValue: 100, descriptor: 'Context travels with code' },
      ],
    },
    explorer: {
      ...roastDashboardExplorerFixture,
      timeline: scaleTimeline(0.72, 0),
      barChangeVolume: [
        { label: 'a10f2c1', additions: 180, deletions: 92 },
        { label: 'b42d881', additions: 246, deletions: 118 },
        { label: 'c17ab04', additions: 154, deletions: 76 },
        { label: 'd90ce21', additions: 292, deletions: 133 },
        { label: 'e31fa08', additions: 208, deletions: 105 },
        { label: 'f82bc10', additions: 226, deletions: 97 },
      ],
      sunburstData: createRepositorySunburst(0.72),
    },
  },
  {
    id: 'velocity-maximalist',
    label: 'Velocity maximalist',
    description: 'fast output, rising review pressure',
    dashboard: {
      ...roastDashboardFixture,
      grade: 'B-',
      growthLevel: 'Watch closely',
      headline: 'The merge button is doing cardio.',
      note: 'Output is high and momentum is real, but the review surface is expanding faster than the safety net.',
      evidence: { commits: 91, files: 164, additions: 12400, deletions: 6310 },
      commits: [
        { label: '90ab1d0', files: 22, additions: 780, deletions: 311 },
        { label: 'a82ce14', files: 19, additions: 612, deletions: 284 },
      ],
      radarProfile: createProfileRadar('Velocity maximalist', [61, 48, 56, 44, 38]),
      ringProfile: [
        { label: 'Human readability', value: 61, maxValue: 100, descriptor: 'Intent mostly survives' },
        { label: 'Testability', value: 48, maxValue: 100, descriptor: 'Coverage trails velocity' },
        { label: 'Maintainability', value: 56, maxValue: 100, descriptor: 'Boundaries are bending' },
        { label: 'Change discipline', value: 44, maxValue: 100, descriptor: 'Scope moves quickly' },
        { label: 'Abstraction pressure', value: 52, maxValue: 100, descriptor: 'New layers arrive early' },
        { label: 'Documentation coverage', value: 38, maxValue: 100, descriptor: 'Context is catching up' },
      ],
    },
    explorer: {
      ...roastDashboardExplorerFixture,
      timeline: scaleTimeline(1.65, 1),
      barChangeVolume: [
        { label: '90ab1d0', additions: 780, deletions: 311 },
        { label: 'a82ce14', additions: 612, deletions: 284 },
        { label: 'b19fa02', additions: 944, deletions: 407 },
        { label: 'c40dd28', additions: 538, deletions: 221 },
        { label: 'd70be11', additions: 1102, deletions: 508 },
        { label: 'e61ca09', additions: 864, deletions: 392 },
      ],
      sunburstData: createRepositorySunburst(1.65),
    },
  },
  {
    id: 'quiet-maintainer',
    label: 'Quiet maintainer',
    description: 'small surface, excellent signal',
    dashboard: {
      ...roastDashboardFixture,
      grade: 'A-',
      growthLevel: 'Clean signal',
      headline: 'Nothing is on fire. Suspiciously elegant.',
      note: 'Small, deliberate changes keep the repository legible and make the next review easier than the last.',
      evidence: { commits: 37, files: 42, additions: 2190, deletions: 1180 },
      commits: [
        { label: '3ab82e1', files: 4, additions: 96, deletions: 44 },
        { label: '4c10f88', files: 3, additions: 74, deletions: 31 },
      ],
      radarProfile: createProfileRadar('Quiet maintainer', [88, 84, 91, 87, 82]),
      ringProfile: [
        { label: 'Human readability', value: 88, maxValue: 100, descriptor: 'Intent is obvious' },
        { label: 'Testability', value: 84, maxValue: 100, descriptor: 'Behaviour is covered' },
        { label: 'Maintainability', value: 91, maxValue: 100, descriptor: 'Boundaries stay calm' },
        { label: 'Change discipline', value: 87, maxValue: 100, descriptor: 'Commits stay focused' },
        { label: 'Abstraction pressure', value: 18, maxValue: 100, descriptor: 'Complexity stays earned' },
        { label: 'Documentation coverage', value: 82, maxValue: 100, descriptor: 'Context is easy to find' },
      ],
    },
    explorer: {
      ...roastDashboardExplorerFixture,
      timeline: scaleTimeline(0.48, -1),
      barChangeVolume: [
        { label: '3ab82e1', additions: 96, deletions: 44 },
        { label: '4c10f88', additions: 74, deletions: 31 },
        { label: '5d21aa0', additions: 118, deletions: 52 },
        { label: '6e02bc4', additions: 83, deletions: 40 },
        { label: '7f11cd2', additions: 136, deletions: 62 },
        { label: '8a30de8', additions: 105, deletions: 48 },
      ],
      sunburstData: createRepositorySunburst(0.48),
    },
  },
]
