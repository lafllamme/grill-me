import type { InjectionKey, Ref } from 'vue'

export interface BklitBarDatum {
  [key: string]: string | number
}

export interface BklitBarContext {
  data: readonly BklitBarDatum[]
  xDataKey: string
  status: Ref<'loading' | 'ready'>
  hoveredIndex: Ref<number | null>
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
  setHoveredIndex: (index: number | null) => void
}

export const bklitBarContextKey: InjectionKey<BklitBarContext> = Symbol('bklit-bar-context')
