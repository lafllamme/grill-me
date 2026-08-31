import type { DashboardEvidenceCommit, DashboardProfileResponse, DashboardProfileScores } from '~~/shared/dashboard/contracts'
import type { DashboardExplorerModel } from './types'
import type { BklitBarDatum } from '~/components/dashboard/bklit/bar-context'
import type { SunburstNode } from '~/components/dashboard/bklit/sunburst'
import type { DashboardMockProfile, ProfileScores } from '~/data/dashboard-mock-profiles'
import type { RoastTimelineDatum } from '~/data/roast-dashboard-explorer'

interface MutableSunburstNode {
  name: string
  value?: number
  children: Map<string, MutableSunburstNode>
}

const dashboardAxes = ['clarity', 'safety', 'workflow', 'complexity', 'context'] as const satisfies readonly (keyof DashboardProfileScores)[]

function scoresFromValues(values: Record<string, number>): DashboardProfileScores {
  return dashboardAxes.reduce((scores, axis) => {
    scores[axis] = values[axis] ?? 0
    return scores
  }, {} as DashboardProfileScores)
}

function averageScore(scores: DashboardProfileScores): number {
  return Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / dashboardAxes.length)
}

function toSunburstNode(node: MutableSunburstNode): SunburstNode {
  const children = [...node.children.values()].map(toSunburstNode)
  return {
    name: node.name,
    ...(node.value !== undefined && !children.length ? { value: node.value } : {}),
    ...(children.length ? { children } : {}),
  }
}

function buildLiveBarData(commits: readonly DashboardEvidenceCommit[]): readonly BklitBarDatum[] {
  return [...commits]
    .sort((left, right) => Date.parse(left.committedAt ?? '') - Date.parse(right.committedAt ?? ''))
    .slice(-8)
    .map(commit => ({
      label: commit.sha.slice(0, 7),
      additions: commit.additions,
      deletions: commit.deletions,
    }))
}

function buildLiveTimeline(commits: readonly DashboardEvidenceCommit[]): readonly RoastTimelineDatum[] {
  const grouped = new Map<string, RoastTimelineDatum>()

  commits.forEach((commit, index) => {
    const timestamp = commit.committedAt ? Date.parse(commit.committedAt) : Number.NaN
    const date = Number.isFinite(timestamp) ? new Date(timestamp) : new Date(Date.UTC(2026, 0, index + 1))
    const key = date.toISOString().slice(0, 10)
    const current = grouped.get(key)

    if (current) {
      current.commits += 1
      current.files += commit.changedFiles
      current.additions += commit.additions
      return
    }

    grouped.set(key, {
      label: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date),
      date: date.getTime(),
      commits: 1,
      files: commit.changedFiles,
      additions: commit.additions,
    })
  })

  return [...grouped.values()].sort((left, right) => Number(left.date) - Number(right.date))
}

function buildLiveSunburst(commits: readonly DashboardEvidenceCommit[]): SunburstNode {
  const fileChanges = new Map<string, number>()

  commits.forEach((commit) => {
    commit.files.forEach((file) => {
      fileChanges.set(file.filename, (fileChanges.get(file.filename) ?? 0) + Math.max(1, file.additions + file.deletions))
    })
  })

  const root: MutableSunburstNode = { name: 'Repository', children: new Map() }
  const rankedFiles = [...fileChanges.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 80)

  rankedFiles.forEach(([filename, value]) => {
    const segments = filename.split('/').filter(Boolean)
    let current = root

    segments.forEach((segment, index) => {
      const child = current.children.get(segment) ?? { name: segment, children: new Map<string, MutableSunburstNode>() }
      current.children.set(segment, child)
      if (index === segments.length - 1)
        child.value = value
      current = child
    })
  })

  return toSunburstNode(root)
}

function buildMockScores(profile: DashboardMockProfile): ProfileScores {
  const values = profile.dashboard.radarProfile.data[0]?.values ?? {}
  return scoresFromValues(values)
}

export function buildMockDashboardModel(profile: DashboardMockProfile): DashboardExplorerModel {
  const scores = buildMockScores(profile)
  const evidence = profile.dashboard.evidence

  return {
    source: 'mock',
    key: `mock:${profile.id}`,
    identity: {
      username: profile.label,
      repositories: 1,
      commits: evidence.commits,
      files: evidence.files,
    },
    profile: {
      scores,
      overallScore: averageScore(scores),
      grade: profile.dashboard.grade,
      role: profile.label,
    },
    verdict: {
      grade: profile.dashboard.grade,
      growthLevel: profile.dashboard.growthLevel,
      headline: profile.dashboard.headline,
      note: profile.dashboard.note,
    },
    charts: {
      radar: profile.dashboard.radarProfile,
      ring: profile.dashboard.ringProfile,
      gauge: {
        value: Math.min(100, evidence.commits),
        centerValue: evidence.commits,
        label: 'Commits',
        description: 'Commits recorded in the selected analysis window, normalized to a 100-commit scale.',
      },
      changeVolume: profile.explorer.barChangeVolume,
      commitRhythm: profile.explorer.timeline,
      repositoryAnatomy: profile.explorer.sunburstData,
    },
    evidence: {},
  }
}

export function buildLiveDashboardModel(response: DashboardProfileResponse, fallbackProfile: DashboardMockProfile): DashboardExplorerModel {
  const { assessment, evidence } = response
  const commits = evidence.commits
  const scores = assessment.scores
  const ring = fallbackProfile.dashboard.ringProfile.map((item) => {
    const axis = item.label.toLowerCase() as keyof DashboardProfileScores
    return { ...item, value: scores[axis] ?? item.value }
  })

  return {
    source: 'live',
    key: `live:${assessment.username}`,
    identity: {
      username: assessment.username,
      repositories: evidence.repositories?.length ?? 0,
      commits: assessment.derivedMetrics.commitCount,
      files: assessment.derivedMetrics.changedFiles,
      window: assessment.evidenceWindow,
    },
    profile: {
      scores,
      overallScore: assessment.overallScore,
      grade: assessment.grade,
      role: assessment.role,
    },
    verdict: {
      grade: assessment.grade,
      growthLevel: 'Live profile',
      headline: `${assessment.role} under review.`,
      note: 'A bounded repository sample now connects the profile scores to the same commits, files, and review signals shown below.',
    },
    charts: {
      radar: {
        metrics: fallbackProfile.dashboard.radarProfile.metrics,
        data: [{ label: assessment.username, color: 'var(--color-primary-strong)', values: { ...scores } }],
      },
      ring,
      gauge: {
        value: Math.min(100, assessment.derivedMetrics.commitCount),
        centerValue: assessment.derivedMetrics.commitCount,
        label: 'Commits',
        description: 'Commits recorded in the selected analysis window, normalized to a 100-commit scale.',
      },
      changeVolume: commits.length ? buildLiveBarData(commits) : fallbackProfile.explorer.barChangeVolume,
      commitRhythm: commits.length ? buildLiveTimeline(commits) : fallbackProfile.explorer.timeline,
      repositoryAnatomy: commits.length ? buildLiveSunburst(commits) : fallbackProfile.explorer.sunburstData,
    },
    evidence: {
      derivedMetrics: assessment.derivedMetrics,
      commits: [...commits],
    },
  }
}
