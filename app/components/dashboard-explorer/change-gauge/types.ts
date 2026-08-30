import type { DashboardExplorerPanelProps } from '../types'

export type ChangeGaugePanelProps = DashboardExplorerPanelProps & {
  value: number
  centerValue?: number
  label?: string
  description: string
}
