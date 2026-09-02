import type { DashboardProfileAssessment } from '~~/shared/dashboard/contracts'
import type { DashboardExplorerPanelProps } from '../types'
import type { BklitRadarData, BklitRadarMetric } from '~/components/dashboard/bklit/radar-context'

export type ProfileRadarPanelProps = DashboardExplorerPanelProps & {
  data: {
    metrics: readonly BklitRadarMetric[]
    data: readonly BklitRadarData[]
  }
  clarityBreakdown?: {
    messageSignal: number
    namingSignal: number
    structureSignal: number
    evidenceCap: number
  }
  aiReview?: DashboardProfileAssessment['aiReview']
}
