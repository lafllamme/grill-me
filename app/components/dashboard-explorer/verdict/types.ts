import type { DashboardExplorerPanelProps } from '../types'
import type { roastDashboardFixture } from '~/data/roast-dashboard'

export type VerdictPanelProps = DashboardExplorerPanelProps & {
  grade: typeof roastDashboardFixture.grade
  growthLevel: typeof roastDashboardFixture.growthLevel
  headline: typeof roastDashboardFixture.headline
  note: typeof roastDashboardFixture.note
}
