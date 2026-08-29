import type { InjectionKey, Ref } from 'vue'

export interface BklitBarDatum {
  [key: string]: string | number
}

export interface BklitBarContext {
  data: readonly BklitBarDatum[]
  xDataKey: string
  status: Ref<'loading' | 'ready'>
  animationDuration: number
  hoveredIndex: Ref<number | null>
  tooltipX: Ref<number | null>
  animatedTooltipX: Ref<number>
  tooltipY: Ref<number | null>
  xPositions: Ref<Record<string, number>>
  yPositions: Ref<Record<string, number>>
  chartWidth: number
  chartHeight: number
  plotTop: number
  plotRight: number
  plotBottom: number
  plotLeft: number
  barGap: number
  barWidth: number | undefined
  groupGap: number
  seriesCount: number
  maxValue: (dataKey: string) => number
  valueAt: (dataKey: string, index: number) => number
  xAt: (index: number) => number
  yAt: (index: number) => number
  orientation: 'vertical' | 'horizontal'
  stacked: boolean
  stackGap: number
  seriesColors: Record<string, string>
  seriesOrder: string[]
  registerSeries: (dataKey: string, color: string) => void
  setHoveredIndex: (index: number | null) => void
}

export const bklitBarContextKey: InjectionKey<BklitBarContext> = Symbol('bklit-bar-context')
