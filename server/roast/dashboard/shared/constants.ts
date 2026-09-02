export interface DashboardScoreBounds {
  minimum: number
  maximum: number
}

export interface DashboardMetricRules {
  emptyValue: number
  neutralScore: number
  percentageScale: number
  decimalPlaces: number
  millisecondsPerDay: number
}

export const DASHBOARD_SCORE_BOUNDS = {
  minimum: 0,
  maximum: 100,
} as const satisfies DashboardScoreBounds

export const DASHBOARD_METRIC_RULES = {
  emptyValue: 0,
  neutralScore: 50,
  percentageScale: 100,
  decimalPlaces: 1,
  millisecondsPerDay: 86_400_000,
} as const satisfies DashboardMetricRules
