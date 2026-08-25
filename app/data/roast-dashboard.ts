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
      { key: 'readability', label: 'Readability' },
      { key: 'maintainability', label: 'Maintainability' },
      { key: 'testability', label: 'Testability' },
      { key: 'discipline', label: 'Change discipline' },
      { key: 'abstraction', label: 'Abstraction' },
      { key: 'documentation', label: 'Documentation' },
    ],
    data: [{
      label: 'Your profile',
      color: 'var(--color-primary-strong)',
      values: {
        readability: 42,
        maintainability: 39,
        testability: 31,
        discipline: 48,
        abstraction: 57,
        documentation: 26,
      },
    }, {
      label: 'Healthy baseline',
      color: 'var(--color-success)',
      values: {
        readability: 78,
        maintainability: 82,
        testability: 74,
        discipline: 80,
        abstraction: 68,
        documentation: 72,
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
