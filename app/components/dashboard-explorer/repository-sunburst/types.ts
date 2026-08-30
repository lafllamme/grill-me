import type { DashboardExplorerPanelProps } from '../types'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'

export type RepositorySunburstPanelProps = DashboardExplorerPanelProps & {
  data: SunburstNode
  description: string
}
