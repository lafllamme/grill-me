import type { DashboardExplorerPanelProps } from '../types'
import type { BklitRadarData, BklitRadarMetric } from '~/components/dashboard/bklit/radar-context'

export type ProfileRadarPanelProps = DashboardExplorerPanelProps & {
  data: {
    metrics: readonly BklitRadarMetric[]
    data: readonly BklitRadarData[]
  }
}
