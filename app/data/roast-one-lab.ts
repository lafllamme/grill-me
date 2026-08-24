import { roastOneFixture } from '~/data/roast-one'

export type RoastOneLayout = '01' | '02' | '03' | '04'

export interface RoastOneLabDimension {
  key: string
  label: string
  value: number
  signal: string
  note: string
}

export interface RoastOneLabInsight {
  label: string
  value: string
  detail: string
  impact: string
}

export const roastOneLabLayouts = [
  { id: '01', label: 'Masked editorial' },
  { id: '02', label: 'Rounded bento' },
  { id: '03', label: 'Clarity split' },
  { id: '04', label: 'Framed service' },
] as const satisfies readonly { id: RoastOneLayout, label: string }[]

export const roastOneLabDimensions: RoastOneLabDimension[] = [
  { key: 'readability', label: 'Human readability', value: 42, signal: 'Aliases hide intent', note: 'Names explain the shape, not the reason.' },
  { key: 'performance', label: 'Performance', value: 68, signal: 'Requests stay chatty', note: 'The hot path is serviceable, not quiet.' },
  { key: 'testability', label: 'Testability', value: 31, signal: 'Behaviour is under-covered', note: 'The abstraction arrived before its proof.' },
  { key: 'cohesion', label: 'Cohesion', value: 46, signal: 'Boundaries blur', note: 'Helpers keep passing the parcel.' },
  { key: 'maintainability', label: 'Maintainability', value: 39, signal: 'Wrappers multiply', note: 'Every shortcut leaves another seam.' },
  { key: 'signal', label: 'Signal clarity', value: 44, signal: 'Naming performs triage', note: 'The useful part is buried under ceremony.' },
]

export const roastOneLabInsights: RoastOneLabInsight[] = [
  { label: 'Readable intent', value: '42 / 100', detail: 'Aliases make the implementation look smaller than the system it hides.', impact: '-18 signal' },
  { label: 'Abstraction load', value: '71 / 100', detail: 'Pass-through layers own no policy, state, or transformation.', impact: '-22 clarity' },
  { label: 'Evidence density', value: '2 commits', detail: 'Both commits touch the same orchestration seam.', impact: 'high confidence' },
  { label: 'Fix leverage', value: '3 moves', detail: 'Delete wrappers, centralise requests, then prove behaviour.', impact: '+27 maintainability' },
]

export const roastOneLabMetrics = [
  { key: 'stink', label: 'Stink', value: 78, descriptor: 'overall code smell', delta: '-18' },
  { key: 'spaghetti', label: 'Spaghetti', value: 71, descriptor: 'complexity & entanglement', delta: '-22' },
  { key: 'ego', label: 'Ego damage', value: 84, descriptor: 'roast severity', delta: '-25' },
] as const

export const roastOneLabEvidence = roastOneFixture.evidence.commits.map((commit, index) => ({
  id: commit.sha,
  index: String(index + 1).padStart(2, '0'),
  title: commit.message,
  repo: commit.repo,
  sha: commit.sha,
  files: commit.changedFiles,
  impact: index === 0 ? 'high' : 'medium',
}))
