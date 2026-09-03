import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { buildLiveDashboardModel, buildMockDashboardModel } from '../../app/components/dashboard-explorer/dashboard-model'
import { dashboardMockProfiles } from '../../app/data/dashboard-mock-profiles'
import { scoreDashboardProfile } from '../../server/roast/dashboard/scoring'

function commit(index: number): GithubCommit {
  return {
    repo: 'flame/grill-me',
    sha: `commit-${index}`,
    message: `feat: ship dashboard slice ${index}`,
    additions: 20 + index,
    deletions: 4,
    changedFiles: 1,
    committedAt: `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
    files: [{ filename: `app/components/slice-${index}.vue`, status: 'modified', additions: 20 + index, deletions: 4 }],
  }
}

function responseFor(commits: readonly GithubCommit[]) {
  const context: GithubContext = { username: 'lafllamme', commits: [...commits], prs: [] }
  const assessment = scoreDashboardProfile(context)
  return {
    assessment,
    evidence: {
      commits: commits.map(({ repo, sha, message, additions, deletions, changedFiles, committedAt, files }) => ({
        repo,
        sha,
        message,
        additions,
        deletions,
        changedFiles,
        committedAt,
        files: files.map(({ filename, status, additions: fileAdditions, deletions: fileDeletions }) => ({ filename, status, additions: fileAdditions, deletions: fileDeletions })),
      })),
      pullRequests: [],
    },
  }
}

describe('dashboard model', () => {
  it('keeps mock profiles on the same render contract as live profiles', () => {
    const model = buildMockDashboardModel(dashboardMockProfiles[0]!)

    expect(model.source).toBe('mock')
    expect(model.profile.role).toBe(dashboardMockProfiles[0]!.label)
    expect(model.charts.radar.data).toHaveLength(1)
    expect(model.charts.ring).toHaveLength(5)
    expect(model.charts.commitRhythm.length).toBeGreaterThan(0)
    expect(model.charts.repositoryAnatomy.name).toBe('Repository')
  })

  it('maps live assessment scores and evidence into chart-specific slices', () => {
    const liveResponse = responseFor([commit(1), commit(2), commit(3)])
    liveResponse.assessment.aiReview = {
      confidence: 86,
      status: 'assessed',
      selectedCommitCount: 3,
      patchCount: 3,
      patchChars: 420,
      axisReviews: [{
        axis: 'clarity',
        verdict: 'supports',
        confidence: 86,
        summary: 'The visible patches use clear names and keep the local data flow readable.',
        evidence: [{
          commitSha: 'commit-1',
          filename: 'app/components/slice-1.vue',
          observation: 'The component name and state flow are explicit.',
        }],
      }],
    }
    const model = buildLiveDashboardModel(liveResponse, dashboardMockProfiles[0]!)

    expect(model.source).toBe('live')
    expect(model.identity).toMatchObject({ username: 'lafllamme', commits: 3, files: 3 })
    expect(model.charts.radar.data[0]?.values).toEqual(liveResponse.assessment.scores)
    expect(model.charts.gauge.centerValue).toBe(3)
    expect(model.charts.changeVolume).toHaveLength(3)
    expect(model.charts.commitRhythm).toHaveLength(3)
    expect(model.evidence.commits).toHaveLength(3)
    expect(model.aiReview?.axisReviews?.[0]?.summary).toContain('clear names')
    expect(model.profile.clarityBreakdown).toMatchObject({ evidenceCap: 90 })
  })
})
