import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { DASHBOARD_AI_REVIEW_LIMITS, selectDashboardPatchEvidence } from '../../server/roast/dashboard-patch-selection'

function commit(overrides: Partial<GithubCommit> = {}): GithubCommit {
  return {
    repo: 'flame/example',
    sha: 'sha-default',
    message: 'feat: update profile signal',
    additions: 24,
    deletions: 6,
    changedFiles: 1,
    files: [{
      filename: 'app/profile.ts',
      status: 'modified',
      additions: 24,
      deletions: 6,
      patch: '+ const profileSignal = calculateSignal(input)',
    }],
    ...overrides,
  }
}

function context(commits: GithubCommit[]): GithubContext {
  return { username: 'lafllamme', commits, prs: [] }
}

describe('dashboard patch selection', () => {
  it('returns an empty bounded selection for an empty context', () => {
    expect(selectDashboardPatchEvidence(context([]))).toEqual({
      commits: [],
      files: [],
      usablePatchCount: 0,
      totalPatchChars: 0,
    })
  })

  it('stratifies evidence while respecting commit, file, and patch budgets', () => {
    const commits = Array.from({ length: 14 }, (_, index) => commit({
      sha: `sha-${String(index).padStart(2, '0')}`,
      committedAt: `2026-08-${String(index + 1).padStart(2, '0')}T12:00:00Z`,
      additions: index === 13 ? 900 : 20 + index,
      deletions: index === 13 ? 300 : 4,
      changedFiles: index === 13 ? 20 : 1,
      files: [{
        filename: index % 3 === 0 ? 'src/validation/input.ts' : 'app/profile.ts',
        status: 'modified',
        additions: index === 13 ? 900 : 20 + index,
        deletions: index === 13 ? 300 : 4,
        patch: `+ const profileSignal${index} = calculateSignal(input)`,
      }],
    }))

    const selection = selectDashboardPatchEvidence(context(commits))

    expect(selection.usablePatchCount).toBe(14)
    expect(selection.commits.length).toBeLessThanOrEqual(DASHBOARD_AI_REVIEW_LIMITS.maxCommits)
    expect(selection.files.length).toBeLessThanOrEqual(DASHBOARD_AI_REVIEW_LIMITS.maxFiles)
    expect(selection.totalPatchChars).toBeLessThanOrEqual(DASHBOARD_AI_REVIEW_LIMITS.maxTotalPatchChars)
    expect(selection.commits.some(item => item.commit.sha === 'sha-13')).toBe(true)
    expect(selection.commits.some(item => item.reasons.includes('safety-signal'))).toBe(true)
    expect(selection.commits.some(item => item.reasons.includes('typical'))).toBe(true)
    expect(selection.commits.some(item => item.reasons.includes('workflow-signal'))).toBe(true)
  })

  it('excludes merge commits and generated files from semantic evidence', () => {
    const selection = selectDashboardPatchEvidence(context([
      commit({ sha: 'merge', message: 'Merge branch release into main', isMerge: true }),
      commit({ sha: 'generated', files: [{ filename: 'dist/bundle.js', status: 'modified', additions: 500, deletions: 0, patch: '+ minified output' }] }),
      commit({ sha: 'personal', files: [{ filename: 'src/input.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ validate(input)' }] }),
    ]))

    expect(selection.usablePatchCount).toBe(1)
    expect(selection.commits.map(item => item.commit.sha)).toEqual(['personal'])
    expect(selection.files.map(file => file.filename)).toEqual(['src/input.ts'])
  })

  it('marks SQL concatenation and prefixed secret assignments as Safety evidence', () => {
    const sqlSelection = selectDashboardPatchEvidence(context([commit({
      sha: 'sql-risk',
      files: [{ filename: 'vulnerabilities/sqli/source/low.php', status: 'modified', additions: 1, deletions: 0, patch: '+ $query = "SELECT * FROM users WHERE id = " . $_GET[\'id\'];' }],
    })]))
    const secretSelection = selectDashboardPatchEvidence(context([commit({
      sha: 'secret-risk',
      files: [{ filename: 'src/SonarReport.java', status: 'modified', additions: 1, deletions: 0, patch: '+ private static final String SONAR_PASSWORD = "P4ssword!!!!";' }],
    })]))

    expect(sqlSelection.commits[0]?.reasons).toContain('safety-signal')
    expect(secretSelection.commits[0]?.reasons).toContain('safety-signal')
  })
})
