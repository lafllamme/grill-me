import type { DashboardExplorerPanelProps } from '../types'
import type { BklitLineMarker } from '~/components/dashboard/bklit/BklitLineChart.vue'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'

export type CommitTimelinePanelProps = DashboardExplorerPanelProps & {
  data: readonly RoastTimelineDatum[]
  markers?: readonly BklitLineMarker[]
}
