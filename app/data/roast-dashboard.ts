export interface RoastDashboardRingDatum {
  label: string
  value: number
  maxValue: number
  descriptor: string
  color?: string
}

export interface RoastDashboardCommitDatum {
  label: string
  files: number
  additions: number
  deletions: number
}

/**
 * Exploration-only data for the dashboard direction.
 * Keep this separate from the API contract until the information model is approved.
 */
export const roastDashboardFixture = {
  username: 'lafllamme',
  repository: 'lafllamme/grill-me',
  growthLevel: 'High potential',
  identityTitle: 'The abstraction survivor',
  headline: 'Your architecture entered witness protection.',
  note: 'A sharp read on a codebase that keeps adding aliases instead of removing complexity.',
  grade: 'C-',
  evidence: {
    commits: 2,
    files: 18,
    additions: 771,
    deletions: 139,
  },
  profile: [
    { label: 'Human readability', value: 42, maxValue: 100, descriptor: 'Aliases hide intent' },
    { label: 'Testability', value: 31, maxValue: 100, descriptor: 'Behaviour under-covered' },
    { label: 'Maintainability', value: 39, maxValue: 100, descriptor: 'Wrappers multiply' },
  ] satisfies RoastDashboardRingDatum[],
  radarProfile: {
    metrics: [
      { key: 'engagement', label: 'Engagement' },
      { key: 'pagesPerSession', label: 'Pages/Session' },
      { key: 'sessionDuration', label: 'Session Duration' },
      { key: 'conversionRate', label: 'Conversion' },
      { key: 'bounceInverse', label: 'Retention' },
    ],
    data: [{
      label: 'Google Search',
      color: '#3b82f6',
      values: {
        engagement: 72,
        pagesPerSession: 68,
        sessionDuration: 70,
        conversionRate: 75,
        bounceInverse: 65,
      },
    }, {
      label: 'Display Ads',
      color: '#f59e0b',
      values: {
        engagement: 85,
        pagesPerSession: 45,
        sessionDuration: 40,
        conversionRate: 30,
        bounceInverse: 88,
      },
    }, {
      label: 'Newsletter',
      color: '#10b981',
      values: {
        engagement: 45,
        pagesPerSession: 90,
        sessionDuration: 92,
        conversionRate: 88,
        bounceInverse: 42,
      },
    }, {
      label: 'Social',
      color: '#ec4899',
      values: {
        engagement: 95,
        pagesPerSession: 35,
        sessionDuration: 25,
        conversionRate: 55,
        bounceInverse: 78,
      },
    }],
  },
  bklitProfile: [
    { label: 'Organic', value: 4250, maxValue: 5000, descriptor: '', color: '#0ea5e9' },
    { label: 'Paid', value: 3120, maxValue: 5000, descriptor: '', color: '#a855f7' },
    { label: 'Email', value: 2100, maxValue: 5000, descriptor: '', color: '#f59e0b' },
    { label: 'Social', value: 1580, maxValue: 5000, descriptor: '', color: '#10b981' },
    { label: 'Referral', value: 1050, maxValue: 5000, descriptor: '', color: '#ef1c24' },
    { label: 'Direct', value: 747, maxValue: 5000, descriptor: '', color: '#1d24b8' },
  ] satisfies RoastDashboardRingDatum[],
  commits: [
    { label: '1c83407', files: 9, additions: 522, deletions: 101 },
    { label: '73e2475', files: 9, additions: 249, deletions: 38 },
  ] satisfies RoastDashboardCommitDatum[],
  feedback: [
    'Delete pass-through wrappers that own no state, policy, or transformation.',
    'Move repeated request handling into one typed composable with an explicit contract.',
    'Add one behaviour-level test before the next abstraction gets a factory.',
  ],
} as const
