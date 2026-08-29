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

export const roastSunburstData = {
  name: 'Repository',
  children: [
    { name: 'app', children: [
      { name: 'components', children: [{ name: 'dashboard', value: 32 }, { name: 'roast-one', value: 18 }] },
      { name: 'composables', children: [{ name: 'useRoast', value: 24 }, { name: 'useAuthSession', value: 10 }] },
      { name: 'pages', children: [{ name: 'dashboard-explorer', value: 28 }, { name: 'index', value: 14 }] },
    ] },
    { name: 'server', children: [
      { name: 'roast', children: [{ name: 'prompt', value: 16 }, { name: 'stream', value: 12 }] },
      { name: 'api', value: 18 },
    ] },
    { name: 'docs', children: [{ name: 'design-system', value: 14 }, { name: 'dashboard-roadmap', value: 9 }, { name: 'test', value: 8 }] },
    { name: 'tests', children: [{ name: 'unit', value: 12 }, { name: 'e2e', value: 10 }] },
  ],
} as const

function createTimeline(): RoastTimelineDatum[] {
  const noise = (seed: number, amplitude: number) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return (value - Math.floor(value)) * amplitude
  }

  return Array.from({ length: 30 }, (_, day) => {
    const date = new Date(Date.UTC(2026, 6, 31 + day))
    // Keep the fixture deterministic while following Bklit's wavy sine/noise shape.
    const referenceIndex = 29 - day
    const additions = Math.round(Math.max(0, 300 + Math.sin(referenceIndex * 0.4) * 75 + noise(referenceIndex + 1, 50) - 25 + day * 2))
    const files = Math.round(Math.max(1, 9 + Math.sin(referenceIndex * 0.35) * 1.8 + noise(referenceIndex + 101, 2.5) - 1.25 + day * 0.12))
    const commits = Math.round(Math.max(1, 3 + Math.sin(referenceIndex * 0.42 + 0.5) * 1.2 + noise(referenceIndex + 201, 1.4) - 0.7))
    const month = date.getUTCMonth() === 6 ? 'Jul' : 'Aug'

    return {
      label: `${month} ${date.getUTCDate()}`,
      date: date.getTime(),
      commits,
      files,
      additions,
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
