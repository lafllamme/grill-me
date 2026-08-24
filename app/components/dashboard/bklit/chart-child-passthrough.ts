export const CHART_CLIP_PASSTHROUGH = '__chartClipPassthrough' as const

export type ChartLayer = 'underlay' | 'series' | 'overlay'

export interface ChartChildConfig {
  layer?: ChartLayer
  dataKey?: string
  [key: string]: unknown
}

export function isUnderlayComponent(child: ChartChildConfig) {
  return child.layer === 'underlay'
}

export function isPostOverlayComponent(child: ChartChildConfig) {
  return child.layer === 'overlay'
}

export function renderKeyedChartLayers(children: readonly ChartChildConfig[]) {
  return {
    underlay: children.filter(isUnderlayComponent),
    series: children.filter(child => !isUnderlayComponent(child) && !isPostOverlayComponent(child)),
    overlay: children.filter(isPostOverlayComponent),
  }
}
