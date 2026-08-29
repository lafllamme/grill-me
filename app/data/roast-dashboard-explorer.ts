export interface RoastTimelineDatum {
  [key: string]: string | number
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

const timelineAnchors = [
  { day: 0, commits: 2, files: 6, additions: 180 },
  { day: 4, commits: 4, files: 11, additions: 340 },
  { day: 10, commits: 1, files: 3, additions: 92 },
  { day: 16, commits: 5, files: 14, additions: 410 },
  { day: 23, commits: 3, files: 8, additions: 246 },
  { day: 26, commits: 6, files: 18, additions: 522 },
  { day: 29, commits: 2, files: 5, additions: 139 },
] as const

function createTimeline(): RoastTimelineDatum[] {
  return Array.from({ length: 30 }, (_, day) => {
    const rightAnchor = timelineAnchors.find(anchor => anchor.day >= day) ?? timelineAnchors.at(-1)!
    const leftAnchor = timelineAnchors.findLast(anchor => anchor.day <= day) ?? timelineAnchors[0]
    const progress = rightAnchor.day === leftAnchor.day ? 0 : (day - leftAnchor.day) / (rightAnchor.day - leftAnchor.day)
    const interpolate = (key: 'commits' | 'files' | 'additions') => Math.round(leftAnchor[key] + (rightAnchor[key] - leftAnchor[key]) * progress)
    const date = new Date(Date.UTC(2026, 6, 31 + day))
    const month = date.getUTCMonth() === 6 ? 'Jul' : 'Aug'

    return {
      label: `${month} ${date.getUTCDate()}`,
      commits: interpolate('commits'),
      files: interpolate('files'),
      additions: interpolate('additions'),
    }
  })
}

export const roastDashboardExplorerFixture = {
  timeline: createTimeline(),
  barChangeVolume: [
    { label: '1c83407', additions: 522, deletions: 101 },
    { label: '73e2475', additions: 249, deletions: 38 },
    { label: 'a04f921', additions: 314, deletions: 72 },
    { label: 'c82a100', additions: 438, deletions: 126 },
    { label: 'e6b71d2', additions: 366, deletions: 84 },
    { label: 'f9d022a', additions: 487, deletions: 154 },
  ],
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
