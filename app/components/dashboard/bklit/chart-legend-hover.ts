import type { InjectionKey, Ref } from 'vue'

export interface ChartLegendHoverContext {
  hoveredIndex: Ref<number | null>
  setHoveredIndex: (index: number | null) => void
}

export const chartLegendHoverKey: InjectionKey<ChartLegendHoverContext> = Symbol('bklit-chart-legend-hover')
