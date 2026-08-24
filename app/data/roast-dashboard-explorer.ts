export interface RoastTimelineDatum {
  label: string
  commits: number
  files: number
  additions: number
}

export interface RoastHotspotDatum {
  path: string
  changes: number
  signal: string
  tone: 'critical' | 'watch' | 'stable'
}

export const roastDashboardExplorerFixture = {
  timeline: [
    { label: 'Mar 04', commits: 2, files: 6, additions: 180 },
    { label: 'Mar 08', commits: 4, files: 11, additions: 340 },
    { label: 'Mar 12', commits: 1, files: 3, additions: 92 },
    { label: 'Mar 16', commits: 5, files: 14, additions: 410 },
    { label: 'Mar 20', commits: 3, files: 8, additions: 246 },
    { label: 'Mar 24', commits: 6, files: 18, additions: 522 },
    { label: 'Mar 28', commits: 2, files: 5, additions: 139 },
  ] satisfies RoastTimelineDatum[],
  languages: [
    { label: 'TypeScript', value: 42, color: 'bg-primary' },
    { label: 'Vue', value: 28, color: 'bg-secondary' },
    { label: 'CSS / UnoCSS', value: 17, color: 'bg-tertiary' },
    { label: 'Markdown', value: 13, color: 'bg-surface-bright' },
  ],
  hotspots: [
    { path: 'app/composables/useRoast.ts', changes: 18, signal: 'Too many entry points', tone: 'critical' },
    { path: 'app/components/dashboard/', changes: 14, signal: 'Wrapper multiplication', tone: 'watch' },
    { path: 'server/roast/prompt.ts', changes: 9, signal: 'Contract pressure', tone: 'watch' },
    { path: 'docs/design-system/', changes: 6, signal: 'Healthy documentation', tone: 'stable' },
  ] satisfies RoastHotspotDatum[],
} as const
