import type { DashboardExplorerPanelProps } from '../types'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'

export type CommitTimelinePanelProps = DashboardExplorerPanelProps & {
  data: readonly RoastTimelineDatum[]
}
