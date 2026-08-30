import type { DashboardExplorerPanelProps } from '../types'
import type { roastDashboardExplorerFixture } from '~/data/roast-dashboard-explorer'

export type ChangeVolumePanelProps = DashboardExplorerPanelProps & {
  data: typeof roastDashboardExplorerFixture.barChangeVolume
}
