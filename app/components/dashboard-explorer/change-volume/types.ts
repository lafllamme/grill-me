import type { DashboardExplorerPanelProps } from '../types'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'

export type ChangeVolumePanelProps = DashboardExplorerPanelProps & {
  data: readonly BklitBarDatum[]
}
