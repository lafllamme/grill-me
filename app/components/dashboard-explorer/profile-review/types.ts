import type { DashboardExplorerModel, DashboardExplorerPanelProps } from '../types'

export type ProfileReviewPanelProps = DashboardExplorerPanelProps & {
  clarityBreakdown?: NonNullable<DashboardExplorerModel['profile']['clarityBreakdown']>
  aiReview?: DashboardExplorerModel['aiReview']
}
