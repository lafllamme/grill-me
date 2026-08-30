import type { DashboardExplorerPanelProps } from '../types'

export type ChangeGaugePanelProps = DashboardExplorerPanelProps & {
  value: number
  description: string
}
