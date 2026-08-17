import type { RoastMetrics, RoastStreamEvidenceEvent } from '~~/shared/roast/contracts'

export interface FuelRoastFile {
  filename: string
  status: string
  additions: number
  deletions: number
  patch?: string
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
  evidence: RoastStreamEvidenceEvent | null
  commits: FuelRoastCommit[]
  files: FuelRoastFile[]
  metrics: RoastMetrics | null
  intensityLabel: string
  stateLabel: 'Ready' | 'Live' | 'Filed' | 'Interrupted'
  hasResult: boolean
  isLive: boolean
  diffLineCount: number
}

export interface PublicRoastReceiptCommit {
  sha: string
  message: string
  repo: string
  additions: number
  deletions: number
  changedFiles: number
}

export interface PublicRoastReceiptFile {
  filename: string
  additions: number
  deletions: number
}

export interface PublicRoastReceipt {
  id: string
  username: string
  year: string
  status: 'Filed' | 'Archived'
  title: string
  grade: string
  stinkScore: number
  evidenceClaim: string
  commit: PublicRoastReceiptCommit
  files: PublicRoastReceiptFile[]
}

export interface AggregateStat {
  id: string
  label: string
  value: number
  suffix?: string
  description: string
}
