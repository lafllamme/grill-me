import type { DashboardExplorerPanelProps } from '../types'
import type { RoastDashboardRingDatum } from '~/data/roast-dashboard'

export type EvidenceRingPanelProps = DashboardExplorerPanelProps & {
  data: readonly RoastDashboardRingDatum[]
}
