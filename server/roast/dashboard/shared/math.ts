import { DASHBOARD_METRIC_RULES, DASHBOARD_SCORE_BOUNDS } from './constants'

export const clamp = (value: number, min = DASHBOARD_SCORE_BOUNDS.minimum, max = DASHBOARD_SCORE_BOUNDS.maximum): number => Math.round(Math.min(max, Math.max(min, value)))

export function average(values: readonly number[]): number {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : DASHBOARD_METRIC_RULES.emptyValue
}

export const ratio = (part: number, whole: number): number => whole > 0 ? part / whole : DASHBOARD_METRIC_RULES.emptyValue

export function percentile(values: readonly number[], percentileValue: number): number {
  if (!values.length)
    return DASHBOARD_METRIC_RULES.emptyValue

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)
  return sorted[index] ?? DASHBOARD_METRIC_RULES.emptyValue
}
