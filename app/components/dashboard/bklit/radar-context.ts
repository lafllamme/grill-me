import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'

export interface BklitRadarMetric { key: string, label: string }
export interface BklitRadarData { label: string, color?: string, values: Record<string, number> }
export interface BklitRadarContext {
  data: readonly BklitRadarData[]
  metrics: readonly BklitRadarMetric[]
  levels: number
  animate: boolean
  enterDurationMs: number
  staggerScale: number
  motionReplayKey: string
  radius: number
  center: number
  hoveredIndex: Ref<number | null>
  setHoveredIndex: (index: number | null) => void
  getPoint: (metricIndex: number, value: number, distance?: number) => { x: number, y: number }
  pointsFor: (values: Record<string, number>, distance?: number) => string
  colorFor: (index: number) => string
}

export const bklitRadarContextKey: InjectionKey<BklitRadarContext> = Symbol('bklit-radar-context')

export function provideBklitRadarContext(context: BklitRadarContext) {
  provide(bklitRadarContextKey, context)
}

export function useBklitRadarContext() {
  const context = inject(bklitRadarContextKey)
  if (!context) {
    throw new Error('BklitRadar components must be rendered inside BklitRadarChart')
  }
  return context
}
