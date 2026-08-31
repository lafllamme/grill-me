import type { DashboardEvidenceCommit, DashboardProfileAssessment, DashboardProfileResponse, DashboardProfileStreamGithubProgressEvent } from '~~/shared/dashboard/contracts'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { BklitRadarData, BklitRadarMetric } from '~/components/dashboard/bklit/radar-context'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'
import type { RoastDashboardRingDatum } from '~/data/roast-dashboard'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'

export interface DashboardExplorerPanelProps {
  panelClass: string
  mutedClass: string
  isLive?: boolean
  chartStatus?: 'loading' | 'ready'
}

export type DashboardAnalysisPhase = 'idle' | 'collecting-github' | 'scoring' | 'reviewing-ai' | 'finalizing' | 'ready' | 'error'

export interface DashboardExplorerModel {
  source: 'mock' | 'live'
  key: string
  identity: {
    username: string
    repositories: number
    commits: number
    files: number
    window?: { from?: string, to?: string }
  }
  profile: {
    scores: DashboardProfileAssessment['scores']
    overallScore?: number
    grade: string
    role: string
  }
  verdict: {
    grade: string
    growthLevel: string
    headline: string
    note: string
  }
  charts: {
    radar: {
      metrics: readonly BklitRadarMetric[]
      data: readonly BklitRadarData[]
    }
    ring: readonly RoastDashboardRingDatum[]
    gauge: {
      value: number
      centerValue: number
      label: string
      description: string
    }
    changeVolume: readonly BklitBarDatum[]
    commitRhythm: readonly RoastTimelineDatum[]
    repositoryAnatomy: SunburstNode
  }
  evidence: {
    derivedMetrics?: DashboardProfileAssessment['derivedMetrics']
    commits?: DashboardEvidenceCommit[]
  }
}

export interface DashboardExplorerProps {
  model?: DashboardExplorerModel | null
  phase: DashboardAnalysisPhase
  progress?: DashboardProfileStreamGithubProgressEvent | null
  panelClass: string
  mutedClass: string
  username?: string
  errorMessage?: string | null
}

export type DashboardApiResponse = DashboardProfileResponse
