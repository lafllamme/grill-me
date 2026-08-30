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
  { id: 'human-compiler', label: 'Human Compiler', group: 'positive', description: 'clarity that almost compiles itself', scores: { clarity: 90, safety: 74, workflow: 70, complexity: 82, context: 76 }, growthLevel: 'Clear signal', headline: 'Your code explains itself before you do.', note: 'Naming and structure make the repository unusually easy to enter, read, and change.' },
  { id: 'edge-case-sheriff', label: 'Edge-Case Sheriff', group: 'positive', description: 'the weird cases are already accounted for', scores: { clarity: 72, safety: 92, workflow: 71, complexity: 74, context: 70 }, growthLevel: 'Safety signal', headline: 'Nothing escapes the perimeter.', note: 'Validation, failure paths, and boundary tests keep the risky parts of the codebase calm.' },
  { id: 'dependency-detective', label: 'Dependency Detective', group: 'positive', description: 'every layer has to justify its existence', scores: { clarity: 78, safety: 76, workflow: 72, complexity: 92, context: 68 }, growthLevel: 'Architecture signal', headline: 'The dependency graph has nowhere to hide.', note: 'Boundaries stay deliberate, and abstractions are introduced because they earn their keep.' },
  { id: 'git-gardener', label: 'Git Gardener', group: 'positive', description: 'small commits, healthy history', scores: { clarity: 76, safety: 70, workflow: 92, complexity: 74, context: 73 }, growthLevel: 'Workflow signal', headline: 'Every commit got a little sunlight.', note: 'The history is granular enough to review, understand, and safely revisit.' },
  { id: 'ungrillable', label: 'Ungrillable', group: 'positive', description: 'strong across the entire profile', scores: { clarity: 88, safety: 86, workflow: 84, complexity: 87, context: 85 }, growthLevel: 'No easy targets', headline: 'The grill has nothing to hold onto.', note: 'The repository is clear, controlled, well defended, and unusually easy to trust.' },
  { id: 'freddy-spaghetti', label: 'Freddy Spaghetti', group: 'mixed', description: 'good ingredients, tangled serving', scores: { clarity: 52, safety: 72, workflow: 76, complexity: 69, context: 78 }, growthLevel: 'Clarity watch', headline: 'The ingredients are fine. The plate is fighting back.', note: 'The project works and the intent is there, but local structure keeps turning simple paths into tangles.' },
  { id: 'risk-runner', label: 'Risk Runner', group: 'mixed', description: 'strong momentum, thin safety margin', scores: { clarity: 75, safety: 48, workflow: 74, complexity: 76, context: 72 }, growthLevel: 'Safety watch', headline: 'Fast feet, questionable landing gear.', note: 'The work is generally strong, but critical inputs and failure paths are taking unnecessary chances.' },
  { id: 'careful-squasher', label: 'Careful Squasher', group: 'mixed', description: 'solid work compressed into heavy commits', scores: { clarity: 74, safety: 71, workflow: 52, complexity: 68, context: 75 }, growthLevel: 'Workflow watch', headline: 'Good work, aggressively vacuum-packed.', note: 'The implementation is sound, but the path through it gets hidden when too many changes arrive together.' },
  { id: 'wrapper-addict', label: 'Wrapper Addict', group: 'mixed', description: 'one more layer will surely fix it', scores: { clarity: 72, safety: 70, workflow: 73, complexity: 48, context: 71 }, growthLevel: 'Complexity watch', headline: 'The wrapper has acquired a wrapper.', note: 'The code is understandable, but each new problem attracts another adapter, layer, or forwarding component.' },
  { id: 'docs-dodger', label: 'Docs Dodger', group: 'mixed', description: 'the code is here; the explanation is not', scores: { clarity: 73, safety: 72, workflow: 70, complexity: 74, context: 42 }, growthLevel: 'Context watch', headline: 'The repository knows. Nobody wrote it down.', note: 'The implementation is mostly solid, but important intent and decisions are harder to recover than they should be.' },
  { id: 'brain-dumper', label: 'Brain Dumper', group: 'negative', description: 'structure was apparently optional', scores: { clarity: 28, safety: 55, workflow: 55, complexity: 55, context: 55 }, growthLevel: 'Clarity failure', headline: 'The thought left the brain and skipped the outline.', note: 'The repository contains working pieces, but naming, ownership, and control flow make the whole difficult to follow.' },
  { id: 'finger-crosser', label: 'Finger Crosser', group: 'negative', description: 'deploy first, validate spiritually', scores: { clarity: 55, safety: 20, workflow: 55, complexity: 55, context: 55 }, growthLevel: 'Safety failure', headline: 'The safety net is mostly a prayer.', note: 'The standard path is readable, but critical boundaries and failure states are not reliably protected.' },
  { id: 'big-bang-committer', label: 'Big-Bang Committer', group: 'negative', description: 'one commit to explain them all', scores: { clarity: 55, safety: 55, workflow: 12, complexity: 55, context: 55 }, growthLevel: 'Workflow failure', headline: 'One commit entered. Six unrelated stories left.', note: 'The history hides the shape of the work inside oversized, mixed-purpose changes.' },
  { id: 'merge-conflict-magician', label: 'Merge Conflict Magician', group: 'negative', description: 'turning clean branches into folklore', scores: { clarity: 55, safety: 55, workflow: 55, complexity: 8, context: 55 }, growthLevel: 'Complexity failure', headline: 'Two branches walk in. Nobody knows what comes out.', note: 'Wide change surfaces and hidden coupling turn ordinary collaboration into a recurring conflict ritual.' },
  { id: 'readme-houdini', label: 'README Houdini', group: 'negative', description: 'documentation disappears on contact', scores: { clarity: 55, safety: 55, workflow: 55, complexity: 55, context: 4 }, growthLevel: 'Context failure', headline: 'The README was here a second ago.', note: 'The code exists, but the project leaves almost no explanation of its intent, boundaries, or decisions.' },
  { id: 'vibe-coder', label: 'Vibe Coder', group: 'negative', description: 'the plan was apparently a feeling', scores: { clarity: 30, safety: 28, workflow: 34, complexity: 32, context: 25 }, growthLevel: 'Systemic roast', headline: 'Not built. Manifested.', note: 'Several profile axes are weak at once, so the repository lacks a reliable base for the next change.' },
]

function averageProfileScore(scores: ProfileScores): number {
  const values = Object.values(scores)
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function gradeForScores(scores: ProfileScores): string {
  const average = averageProfileScore(scores)
  if (average >= 90)
    return 'A'
  if (average >= 85)
    return 'A-'
  if (average >= 80)
    return 'B+'
  if (average >= 75)
    return 'B'
  if (average >= 70)
    return 'B-'
  if (average >= 65)
    return 'C+'
  if (average >= 60)
    return 'C'
  if (average >= 55)
    return 'C-'
  if (average >= 50)
    return 'D+'
  if (average >= 45)
    return 'D'
  if (average >= 40)
    return 'D-'
  if (average >= 30)
    return 'E'
  if (average >= 20)
    return 'E-'
  return 'F'
}

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

function createRepositorySunburst(scores: ProfileScores, files: number): SunburstNode {
  const activityScale = Math.max(0.45, files / 78)
  const value = (amount: number, modifier = 1) => Math.max(1, Math.round(amount * activityScale * modifier))
  const documentationModifier = 0.35 + scores.context / 100
  const complexityModifier = 0.65 + (100 - scores.complexity) / 140

  return { name: 'Repository', children: [
    { name: 'app', children: [{ name: 'pages', children: [{ name: 'dashboard-explorer.vue', value: value(92, complexityModifier) }, { name: 'index.vue', value: value(58) }] }, { name: 'components', children: [{ name: 'dashboard', value: value(84, complexityModifier) }, { name: 'roast-one', value: value(61) }] }] },
    { name: 'server', children: [{ name: 'roast', children: [{ name: 'orchestrator.ts', value: value(128, scores.safety < 60 ? 1.2 : 1) }, { name: 'prompt.ts', value: value(76) }] }, { name: 'api', value: value(54, scores.safety < 60 ? 1.15 : 1) }] },
    { name: 'shared', children: [{ name: 'roast', value: value(48) }, { name: 'types', value: value(37) }] },
    { name: 'docs', children: [{ name: 'design-system', value: value(42, documentationModifier) }, { name: 'testing', value: value(29, documentationModifier) }] },
  ] }
}

function normalizeSeries(values: readonly number[], target: number): number[] {
  const total = values.reduce((sum, value) => sum + value, 0)
  const scale = total > 0 ? target / total : 1
  return values.map(value => Math.max(1, Math.round(value * scale)))
}

function createTimeline(scores: ProfileScores, targetCommits: number, targetAdditions: number): readonly RoastTimelineDatum[] {
  const workflowStability = scores.workflow / 100
  const complexityPressure = (100 - scores.complexity) / 100
  const clarityPressure = (100 - scores.clarity) / 100
  const commitValues = roastDashboardExplorerFixture.timeline.map((item, index) => {
    const pulse = Math.sin(index * 0.78 + 0.4)
    const burst = Math.max(0, pulse) * complexityPressure * 1.8
    const steady = workflowStability * 0.65
    return Math.max(1, item.commits * (0.7 + steady + burst))
  })
  const additionValues = roastDashboardExplorerFixture.timeline.map((item, index) => {
    const pulse = Math.sin(index * 0.54 + 1.2)
    const churn = Math.max(0, pulse) * (0.45 + complexityPressure * 0.8)
    return Math.max(1, item.additions * (0.7 + clarityPressure * 0.5 + churn))
  })
  const commits = normalizeSeries(commitValues, targetCommits)
  const additions = normalizeSeries(additionValues, targetAdditions)

  return roastDashboardExplorerFixture.timeline.map((item, index) => ({
    ...item,
    additions: additions[index]!,
    files: Math.max(1, Math.round(item.files * (0.7 + complexityPressure * 0.8 + clarityPressure * 0.25))),
    commits: commits[index]!,
  }))
}

function createBarChangeVolume(scores: ProfileScores, targetAdditions: number, targetDeletions: number, profileIndex: number): readonly BklitBarDatum[] {
  const complexityPressure = (100 - scores.complexity) / 100
  const safetyPressure = (100 - scores.safety) / 100
  const workflowPressure = (100 - scores.workflow) / 100
  const additionWeights = Array.from({ length: 6 }, (_, index) => 1 + Math.max(0, Math.sin(index * 1.4 + profileIndex)) * workflowPressure * 1.8)
  const deletionWeights = Array.from({ length: 6 }, (_, index) => 1 + (index % 2 ? complexityPressure : safetyPressure) * 0.9)
  const additions = normalizeSeries(additionWeights, targetAdditions)
  const deletions = normalizeSeries(deletionWeights, targetDeletions)

  return Array.from({ length: 6 }, (_, index) => ({
    label: `${String(profileIndex + 1).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
    additions: additions[index]!,
    deletions: deletions[index]!,
  }))
}

function createProfile(definition: RoleDefinition, index: number): DashboardMockProfile {
  const commits = 18 + Math.round(definition.scores.workflow * 0.7) + index
  const files = 24 + Math.round((100 - definition.scores.complexity) * 0.55) + index * 2
  const additions = 900 + commits * 68 + (100 - definition.scores.clarity) * 12 + (100 - definition.scores.complexity) * 10
  const deletions = Math.max(90, Math.round(additions * (0.1 + (100 - definition.scores.safety) / 300 + (100 - definition.scores.complexity) / 700)))
  const commitsData: readonly RoastDashboardCommitDatum[] = Array.from({ length: 2 }, (_, commitIndex) => ({ label: `${definition.id.slice(0, 3)}${index + 1}${commitIndex + 1}`, files: Math.max(2, Math.round(files / (commitIndex + 2))), additions: Math.max(24, Math.round(additions / (commitIndex + 2))), deletions: Math.max(8, Math.round(deletions / (commitIndex + 2))) }))
  const barChangeVolume = createBarChangeVolume(definition.scores, additions, deletions, index)

  return { id: definition.id, label: definition.label, group: definition.group, description: definition.description, dashboard: { grade: gradeForScores(definition.scores), growthLevel: definition.growthLevel, headline: definition.headline, note: definition.note, evidence: { commits, files, additions, deletions }, ringProfile: createRingProfile(definition.scores), radarProfile: createProfileRadar(definition.label, definition.scores), commits: commitsData }, explorer: { timeline: createTimeline(definition.scores, commits, additions), barChangeVolume, sunburstData: createRepositorySunburst(definition.scores, files) } }
}

export const dashboardMockProfiles: readonly DashboardMockProfile[] = roleDefinitions.map(createProfile)
