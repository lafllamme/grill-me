import type { DefaultArcObject } from 'd3-shape'
import type { InjectionKey, Ref } from 'vue'
import { arc as arcGenerator } from 'd3-shape'

export interface BklitRingData {
  label: string
  value: number
  maxValue: number
  color?: string
  descriptor?: string
}

export interface BklitRingPath {
  backgroundPath: string
  progressPath: string
}

export interface BklitRingContext {
  data: readonly BklitRingData[]
  baseInnerRadius: number
  ringGap: number
  strokeWidth: number
  startAngle: number
  endAngle: number
  enterStaggerScale: number
  hoveredIndex: Ref<number | null>
  setHoveredIndex: (index: number) => void
  clearHoveredIndex: () => void
  getRingColor: (index: number) => string
  getRingPath: (index: number, lineCap?: 'round' | 'butt') => BklitRingPath
  getProgressPath: (index: number, progress: number, lineCap?: 'round' | 'butt') => string
}

export const bklitRingContextKey: InjectionKey<BklitRingContext> = Symbol('bklit-ring-context')

export function createRingPaths({
  data,
  baseInnerRadius,
  ringGap,
  strokeWidth,
  startAngle,
  endAngle,
  lineCap = 'round',
}: {
  data: readonly BklitRingData[]
  baseInnerRadius: number
  ringGap: number
  strokeWidth: number
  startAngle: number
  endAngle: number
  lineCap?: 'round' | 'butt'
}) {
  return data.map((item, index) => {
    const innerRadius = baseInnerRadius + index * (strokeWidth + ringGap)
    const outerRingRadius = innerRadius + strokeWidth
    const progressEndAngle = startAngle + (endAngle - startAngle) * Math.min(item.value / item.maxValue, 1)
    const arc = arcGenerator<DefaultArcObject>()
      .innerRadius(innerRadius)
      .outerRadius(outerRingRadius)
      .cornerRadius(lineCap === 'round' ? strokeWidth / 2 : 0)

    return {
      backgroundPath: arc({ innerRadius, outerRadius: outerRingRadius, startAngle, endAngle }) ?? '',
      progressPath: progressEndAngle <= startAngle + 0.01
        ? ''
        : arc({ innerRadius, outerRadius: outerRingRadius, startAngle, endAngle: progressEndAngle }) ?? '',
    }
  })
}

export function createProgressPath({
  item,
  index,
  progress,
  baseInnerRadius,
  ringGap,
  strokeWidth,
  startAngle,
  endAngle,
  lineCap = 'round',
}: {
  item: BklitRingData
  index: number
  progress: number
  baseInnerRadius: number
  ringGap: number
  strokeWidth: number
  startAngle: number
  endAngle: number
  lineCap?: 'round' | 'butt'
}) {
  const innerRadius = baseInnerRadius + index * (strokeWidth + ringGap)
  const outerRingRadius = innerRadius + strokeWidth
  const progressEndAngle = startAngle + (endAngle - startAngle) * Math.min(Math.max(progress, 0), 1) * Math.min(item.value / item.maxValue, 1)
  const arc = arcGenerator<DefaultArcObject>()
    .innerRadius(innerRadius)
    .outerRadius(outerRingRadius)
    .cornerRadius(lineCap === 'round' ? strokeWidth / 2 : 0)

  return progressEndAngle <= startAngle + 0.01
    ? ''
    : arc({ innerRadius, outerRadius: outerRingRadius, startAngle, endAngle: progressEndAngle }) ?? ''
}
