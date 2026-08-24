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
  hoveredIndex: Ref<number | null>
  setHoveredIndex: (index: number) => void
  clearHoveredIndex: () => void
  isEntered: Ref<boolean>
  getRingColor: (index: number) => string
  getRingPath: (index: number) => BklitRingPath
  getProgressPath: (index: number, progress: number) => string
}

export const bklitRingContextKey: InjectionKey<BklitRingContext> = Symbol('bklit-ring-context')

export function createRingPaths({
  data,
  outerRadius,
  ringGap,
  strokeWidth,
  startAngle,
  endAngle,
}: {
  data: readonly BklitRingData[]
  outerRadius: number
  ringGap: number
  strokeWidth: number
  startAngle: number
  endAngle: number
}) {
  return data.map((item, index) => {
    const innerRadius = outerRadius - index * (strokeWidth + ringGap)
    const outerRingRadius = innerRadius + strokeWidth
    const progressEndAngle = startAngle + (endAngle - startAngle) * Math.min(item.value / item.maxValue, 1)
    const arc = arcGenerator<DefaultArcObject>()
      .innerRadius(innerRadius)
      .outerRadius(outerRingRadius)
      .cornerRadius(strokeWidth / 2)

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
  outerRadius,
  ringGap,
  strokeWidth,
  startAngle,
  endAngle,
}: {
  item: BklitRingData
  index: number
  progress: number
  outerRadius: number
  ringGap: number
  strokeWidth: number
  startAngle: number
  endAngle: number
}) {
  const innerRadius = outerRadius - index * (strokeWidth + ringGap)
  const outerRingRadius = innerRadius + strokeWidth
  const progressEndAngle = startAngle + (endAngle - startAngle) * Math.min(Math.max(progress, 0), 1) * Math.min(item.value / item.maxValue, 1)
  const arc = arcGenerator<DefaultArcObject>()
    .innerRadius(innerRadius)
    .outerRadius(outerRingRadius)
    .cornerRadius(strokeWidth / 2)

  return progressEndAngle <= startAngle + 0.01
    ? ''
    : arc({ innerRadius, outerRadius: outerRingRadius, startAngle, endAngle: progressEndAngle }) ?? ''
}
