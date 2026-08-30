import type { DashboardExplorerPanelProps } from '../types'

export type VerdictPanelProps = DashboardExplorerPanelProps & {
  grade: string
  growthLevel: string
  headline: string
  note: string
}
