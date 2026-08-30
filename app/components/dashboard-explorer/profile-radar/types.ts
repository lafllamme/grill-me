import type { DashboardExplorerPanelProps } from '../types'
import type { roastDashboardFixture } from '~/data/roast-dashboard'

export type ProfileRadarPanelProps = DashboardExplorerPanelProps & {
  data: typeof roastDashboardFixture.radarProfile
}
