import type { RoastDashboardCommitDatum, RoastDashboardRingDatum } from './roast-dashboard'
import type { RoastTimelineDatum } from './roast-dashboard-explorer'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { BklitRadarData, BklitRadarMetric } from '~/components/dashboard/bklit/radar-context'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'
import { roastDashboardExplorerFixture } from './roast-dashboard-explorer'

export type DashboardProfileGroup = 'positive' | 'mixed' | 'negative'

export interface ProfileScores {
  clarity: number
  safety: number
  workflow: number
  complexity: number
  context: number
}

interface DashboardMockData {
  grade: string
  growthLevel: string
  headline: string
  note: string
  evidence: { commits: number, files: number, additions: number, deletions: number }
  ringProfile: readonly RoastDashboardRingDatum[]
  radarProfile: { metrics: readonly BklitRadarMetric[], data: readonly BklitRadarData[] }
  commits: readonly RoastDashboardCommitDatum[]
}

interface ExplorerMockData {
  timeline: readonly RoastTimelineDatum[]
  barChangeVolume: readonly BklitBarDatum[]
  sunburstData: SunburstNode
}

interface RoleDefinition {
  id: string
  label: string
  group: DashboardProfileGroup
  description: string
  scores: ProfileScores
  grade: string
  growthLevel: string
  headline: string
  note: string
}

export interface DashboardMockProfile {
  id: string
  label: string
  group: DashboardProfileGroup
  description: string
  dashboard: DashboardMockData
  explorer: ExplorerMockData
}

const profileRadarMetrics: readonly BklitRadarMetric[] = [
  { key: 'clarity', label: 'Clarity' },
  { key: 'safety', label: 'Safety' },
  { key: 'workflow', label: 'Workflow' },
  { key: 'complexity', label: 'Complexity' },
  { key: 'context', label: 'Context' },
]

const scoreDescriptors: Record<keyof ProfileScores, [string, string]> = {
  clarity: ['Intent stays readable', 'Structure needs untangling'],
  safety: ['Critical paths are covered', 'Edge cases are exposed'],
  workflow: ['Work arrives in reviewable slices', 'Changes arrive in heavy bundles'],
  complexity: ['Layers earn their keep', 'Abstractions multiply'],
  context: ['The next move is visible', 'The repository keeps its reasons quiet'],
}

const roleDefinitions: readonly RoleDefinition[] = [
  { id: 'human-compiler', label: 'Human Compiler', group: 'positive', description: 'clarity that almost compiles itself', scores: { clarity: 90, safety: 74, workflow: 70, complexity: 82, context: 76 }, grade: 'A-', growthLevel: 'Clear signal', headline: 'Your code explains itself before you do.', note: 'Naming and structure make the repository unusually easy to enter, read, and change.' },
  { id: 'edge-case-sheriff', label: 'Edge-Case Sheriff', group: 'positive', description: 'the weird cases are already accounted for', scores: { clarity: 72, safety: 92, workflow: 71, complexity: 74, context: 70 }, grade: 'A-', growthLevel: 'Safety signal', headline: 'Nothing escapes the perimeter.', note: 'Validation, failure paths, and boundary tests keep the risky parts of the codebase calm.' },
  { id: 'dependency-detective', label: 'Dependency Detective', group: 'positive', description: 'every layer has to justify its existence', scores: { clarity: 78, safety: 76, workflow: 72, complexity: 92, context: 68 }, grade: 'A-', growthLevel: 'Architecture signal', headline: 'The dependency graph has nowhere to hide.', note: 'Boundaries stay deliberate, and abstractions are introduced because they earn their keep.' },
  { id: 'git-gardener', label: 'Git Gardener', group: 'positive', description: 'small commits, healthy history', scores: { clarity: 76, safety: 70, workflow: 92, complexity: 74, context: 73 }, grade: 'A-', growthLevel: 'Workflow signal', headline: 'Every commit got a little sunlight.', note: 'The history is granular enough to review, understand, and safely revisit.' },
  { id: 'ungrillable', label: 'Ungrillable', group: 'positive', description: 'strong across the entire profile', scores: { clarity: 88, safety: 86, workflow: 84, complexity: 87, context: 85 }, grade: 'A', growthLevel: 'No easy targets', headline: 'The grill has nothing to hold onto.', note: 'The repository is clear, controlled, well defended, and unusually easy to trust.' },
  { id: 'freddy-spaghetti', label: 'Freddy Spaghetti', group: 'mixed', description: 'good ingredients, tangled serving', scores: { clarity: 52, safety: 72, workflow: 76, complexity: 69, context: 78 }, grade: 'B-', growthLevel: 'Clarity watch', headline: 'The ingredients are fine. The plate is fighting back.', note: 'The project works and the intent is there, but local structure keeps turning simple paths into tangles.' },
  { id: 'risk-runner', label: 'Risk Runner', group: 'mixed', description: 'strong momentum, thin safety margin', scores: { clarity: 75, safety: 48, workflow: 74, complexity: 76, context: 72 }, grade: 'B-', growthLevel: 'Safety watch', headline: 'Fast feet, questionable landing gear.', note: 'The work is generally strong, but critical inputs and failure paths are taking unnecessary chances.' },
  { id: 'careful-squasher', label: 'Careful Squasher', group: 'mixed', description: 'solid work compressed into heavy commits', scores: { clarity: 74, safety: 71, workflow: 52, complexity: 68, context: 75 }, grade: 'B', growthLevel: 'Workflow watch', headline: 'Good work, aggressively vacuum-packed.', note: 'The implementation is sound, but the path through it gets hidden when too many changes arrive together.' },
  { id: 'wrapper-addict', label: 'Wrapper Addict', group: 'mixed', description: 'one more layer will surely fix it', scores: { clarity: 72, safety: 70, workflow: 73, complexity: 48, context: 71 }, grade: 'B-', growthLevel: 'Complexity watch', headline: 'The wrapper has acquired a wrapper.', note: 'The code is understandable, but each new problem attracts another adapter, layer, or forwarding component.' },
  { id: 'docs-dodger', label: 'Docs Dodger', group: 'mixed', description: 'the code is here; the explanation is not', scores: { clarity: 73, safety: 72, workflow: 70, complexity: 74, context: 42 }, grade: 'B', growthLevel: 'Context watch', headline: 'The repository knows. Nobody wrote it down.', note: 'The implementation is mostly solid, but important intent and decisions are harder to recover than they should be.' },
  { id: 'brain-dumper', label: 'Brain Dumper', group: 'negative', description: 'structure was apparently optional', scores: { clarity: 28, safety: 58, workflow: 57, complexity: 56, context: 60 }, grade: 'C-', growthLevel: 'Clarity failure', headline: 'The thought left the brain and skipped the outline.', note: 'The repository contains working pieces, but naming, ownership, and control flow make the whole difficult to follow.' },
  { id: 'finger-crosser', label: 'Finger Crosser', group: 'negative', description: 'deploy first, validate spiritually', scores: { clarity: 62, safety: 28, workflow: 58, complexity: 61, context: 57 }, grade: 'C-', growthLevel: 'Safety failure', headline: 'The safety net is mostly a prayer.', note: 'The standard path is readable, but critical boundaries and failure states are not reliably protected.' },
  { id: 'big-bang-committer', label: 'Big-Bang Committer', group: 'negative', description: 'one commit to explain them all', scores: { clarity: 60, safety: 59, workflow: 25, complexity: 62, context: 58 }, grade: 'C', growthLevel: 'Workflow failure', headline: 'One commit entered. Six unrelated stories left.', note: 'The history hides the shape of the work inside oversized, mixed-purpose changes.' },
  { id: 'merge-conflict-magician', label: 'Merge Conflict Magician', group: 'negative', description: 'turning clean branches into folklore', scores: { clarity: 58, safety: 60, workflow: 57, complexity: 29, context: 62 }, grade: 'C-', growthLevel: 'Complexity failure', headline: 'Two branches walk in. Nobody knows what comes out.', note: 'Wide change surfaces and hidden coupling turn ordinary collaboration into a recurring conflict ritual.' },
  { id: 'readme-houdini', label: 'README Houdini', group: 'negative', description: 'documentation disappears on contact', scores: { clarity: 62, safety: 58, workflow: 60, complexity: 61, context: 22 }, grade: 'C', growthLevel: 'Context failure', headline: 'The README was here a second ago.', note: 'The code exists, but the project leaves almost no explanation of its intent, boundaries, or decisions.' },
  { id: 'vibe-coder', label: 'Vibe Coder', group: 'negative', description: 'the plan was apparently a feeling', scores: { clarity: 30, safety: 28, workflow: 34, complexity: 32, context: 25 }, grade: 'D', growthLevel: 'Systemic roast', headline: 'Not built. Manifested.', note: 'Several profile axes are weak at once, so the repository lacks a reliable base for the next change.' },
]

function createProfileRadar(label: string, scores: ProfileScores) {
  return { metrics: profileRadarMetrics, data: [{ label, color: 'var(--color-primary-strong)', values: { ...scores } }] }
}

function createRingProfile(scores: ProfileScores): readonly RoastDashboardRingDatum[] {
  return profileRadarMetrics.map((metric) => {
    const key = metric.key as keyof ProfileScores
    const value = scores[key]
    return { label: metric.label, value, maxValue: 100, descriptor: scoreDescriptors[key][value >= 65 ? 0 : 1], color: 'var(--color-primary-strong)' }
  })
}

function createRepositorySunburst(scale: number): SunburstNode {
  const value = (amount: number) => Math.max(1, Math.round(amount * scale))
  return { name: 'Repository', children: [
    { name: 'app', children: [{ name: 'pages', children: [{ name: 'dashboard-explorer.vue', value: value(92) }, { name: 'index.vue', value: value(58) }] }, { name: 'components', children: [{ name: 'dashboard', value: value(84) }, { name: 'roast-one', value: value(61) }] }] },
    { name: 'server', children: [{ name: 'roast', children: [{ name: 'orchestrator.ts', value: value(128) }, { name: 'prompt.ts', value: value(76) }] }, { name: 'api', value: value(54) }] },
    { name: 'shared', children: [{ name: 'roast', value: value(48) }, { name: 'types', value: value(37) }] },
    { name: 'docs', children: [{ name: 'design-system', value: value(42) }, { name: 'testing', value: value(29) }] },
  ] }
}

function createTimeline(scale: number, commitOffset: number): readonly RoastTimelineDatum[] {
  return roastDashboardExplorerFixture.timeline.map(item => ({ ...item, additions: Math.max(1, Math.round(item.additions * scale)), files: Math.max(1, Math.round(item.files * scale)), commits: Math.max(1, item.commits + commitOffset) }))
}

function createProfile(definition: RoleDefinition, index: number): DashboardMockProfile {
  const commits = 18 + Math.round(definition.scores.workflow * 0.7) + index
  const files = 24 + Math.round((100 - definition.scores.complexity) * 0.55) + index * 2
  const additions = 900 + commits * 68 + (100 - definition.scores.clarity) * 12
  const deletions = Math.max(90, Math.round(additions * (0.12 + (100 - definition.scores.safety) / 500)))
  const scale = Math.max(0.45, files / 78)
  const commitsData: readonly RoastDashboardCommitDatum[] = Array.from({ length: 2 }, (_, commitIndex) => ({ label: `${definition.id.slice(0, 3)}${index + 1}${commitIndex + 1}`, files: Math.max(2, Math.round(files / (commitIndex + 2))), additions: Math.max(24, Math.round(additions / (commitIndex + 2))), deletions: Math.max(8, Math.round(deletions / (commitIndex + 2))) }))
  const barChangeVolume: readonly BklitBarDatum[] = Array.from({ length: 6 }, (_, barIndex) => ({ label: `${definition.id.slice(0, 2)}${barIndex + 1}`, additions: Math.max(12, Math.round(additions * (0.12 + barIndex * 0.012))), deletions: Math.max(6, Math.round(deletions * (0.16 + barIndex * 0.01))) }))

  return { id: definition.id, label: definition.label, group: definition.group, description: definition.description, dashboard: { grade: definition.grade, growthLevel: definition.growthLevel, headline: definition.headline, note: definition.note, evidence: { commits, files, additions, deletions }, ringProfile: createRingProfile(definition.scores), radarProfile: createProfileRadar(definition.label, definition.scores), commits: commitsData }, explorer: { timeline: createTimeline(Math.max(0.45, commits / 60), Math.round((definition.scores.workflow - 60) / 30)), barChangeVolume, sunburstData: createRepositorySunburst(scale) } }
}

export const dashboardMockProfiles: readonly DashboardMockProfile[] = roleDefinitions.map(createProfile)
