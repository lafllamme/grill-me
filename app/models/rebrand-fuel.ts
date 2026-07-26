import type { RoastMetrics, RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'

export interface FuelRoastFile {
  filename: string
  status: string
  additions: number
  deletions: number
  repo: string
  sha: string
}

export type FuelRoastCommit = RoastStreamEvidenceEvent['commits'][number]

export interface FuelRoastViewModel {
  username: string
  title: string
  roastLines: string[]
  feedback: string[]
  statuses: string[]
  evidence: RoastStreamEvidenceEvent
  commits: FuelRoastCommit[]
  files: FuelRoastFile[]
  metrics: RoastMetrics
  intensityLabel: string
  stateLabel: 'Ready' | 'Live' | 'Filed' | 'Interrupted'
  hasResult: boolean
  isLive: boolean
  diffLineCount: number
}
