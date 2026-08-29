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
  name: 'Revenue',
  children: [
    { name: 'Product', children: [
      { name: 'Enterprise', children: [{ name: 'North America', children: [{ name: 'Direct', value: 52 }, { name: 'Channel', value: 38 }] }, { name: 'EMEA', value: 60 }, { name: 'APAC', value: 48 }] },
      { name: 'Pro', children: [{ name: 'Teams', value: 90 }, { name: 'Solo', value: 55 }] },
      { name: 'Starter', value: 95 },
    ] },
    { name: 'Services', children: [
      { name: 'Consulting', children: [{ name: 'Strategy', value: 72 }, { name: 'Implementation', value: 88 }] },
      { name: 'Support', children: [{ name: 'Premium', value: 48 }, { name: 'Standard', value: 42 }] },
      { name: 'Training', value: 55 },
    ] },
    { name: 'Partners', children: [{ name: 'Referrals', value: 120 }, { name: 'Affiliates', value: 75 }, { name: 'Resellers', children: [{ name: 'Regional', value: 64 }, { name: 'Global', value: 46 }] }] },
    { name: 'Other', children: [{ name: 'Licensing', value: 85 }, { name: 'Events', value: 42 }] },
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
