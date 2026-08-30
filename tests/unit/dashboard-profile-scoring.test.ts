import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { resolveDashboardProfileRole } from '../../server/roast/dashboard-profile-roles'
import { deriveDashboardMetrics, scoreCommitMessage, scoreDashboardClarity, scoreDashboardProfile, scoreDashboardWorkflow } from '../../server/roast/dashboard-profile-scoring'
import { selectSafetyCommits } from '../../server/roast/dashboard-safety-selection'

function commit(overrides: Partial<GithubCommit> = {}): GithubCommit {
  return {
    repo: 'flame/example',
    sha: 'abc123',
    message: 'feat: improve dashboard flow',
    additions: 24,
    deletions: 6,
    changedFiles: 2,
    files: [
      { filename: 'app/example.ts', status: 'modified', additions: 20, deletions: 4 },
      { filename: 'tests/example.test.ts', status: 'modified', additions: 4, deletions: 2 },
    ],
    ...overrides,
  }
}

function context(commits: GithubCommit[], prs = 2): GithubContext {
  return { username: 'lafllamme', commits, prs: Array.from({ length: prs }, (_, index) => ({ repo: 'flame/example', title: `PR ${index}`, url: '', state: 'closed' })) }
}

describe('dashboard profile scoring', () => {
  it('keeps every score bounded and exposes explainable evidence metrics', () => {
    const assessment = scoreDashboardProfile(context([commit(), commit({ sha: 'def456' })]))
    expect(Object.values(assessment.scores).every(score => score >= 0 && score <= 100)).toBe(true)
    expect(assessment.overallScore).toBeGreaterThanOrEqual(0)
    expect(assessment.overallScore).toBeLessThanOrEqual(100)
    expect(assessment.derivedMetrics.testFileRatio).toBe(50)
    expect(assessment.confidence).toBeGreaterThan(35)
  })

  it('rewards small, explicit, documented work with tests', () => {
    const assessment = scoreDashboardProfile(context([
      commit(),
      commit({ sha: 'def456', message: 'test: cover empty dashboard state', files: [{ filename: 'docs/decisions.md', status: 'added', additions: 12, deletions: 0 }], changedFiles: 1 }),
      commit({ sha: 'ghi789', message: 'fix: handle missing profile data', files: [{ filename: 'README.md', status: 'modified', additions: 8, deletions: 2 }], changedFiles: 1 }),
    ], 3))
    expect(assessment.scores.workflow).toBeGreaterThan(70)
    expect(assessment.scores.context).toBeGreaterThan(50)
  })

  it('penalizes large mixed commits and merge-heavy history', () => {
    const assessment = scoreDashboardProfile(context(Array.from({ length: 4 }, (_, index) => commit({
      sha: `big-${index}`,
      message: index % 2 ? 'Merge branch feature into main' : 'update',
      additions: 900,
      deletions: 700,
      changedFiles: 22,
      files: [{ filename: `app/generated-${index}.ts`, status: 'modified', additions: 900, deletions: 700 }],
    })), 0))
    expect(assessment.scores.workflow).toBeLessThan(50)
    expect(assessment.scores.complexity).toBeLessThan(50)
    expect(assessment.scores.context).toBeLessThan(50)
    expect(assessment.derivedMetrics.mergeCommitRatio).toBe(50)
    expect(assessment.derivedMetrics.largeCommitRatio).toBe(100)
  })

  it('uses neutral values when GitHub has no enrichable commits', () => {
    const assessment = scoreDashboardProfile(context([], 0))
    expect(Object.values(assessment.scores)).toEqual([50, 50, 50, 50, 50])
    expect(assessment.confidence).toBe(35)
    expect(assessment.role).toBe('Unclassified')
    expect(assessment.roleStatus).toBe('unclassified')
  })

  it('calculates additions, deletions, and file averages from the source context', () => {
    const metrics = deriveDashboardMetrics(context([commit({ additions: 10, deletions: 2, changedFiles: 1 })], 0))
    expect(metrics).toMatchObject({ additions: 10, deletions: 2, changedFiles: 1, averageCommitSize: 12, medianCommitSize: 12, largestCommitSize: 12, p90CommitSize: 12, averageFilesPerCommit: 1 })
  })

  it('keeps the typical commit separate from a single large outlier', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'small', additions: 8, deletions: 2 }),
      commit({ sha: 'medium', additions: 40, deletions: 10 }),
      commit({ sha: 'large', additions: 900, deletions: 100 }),
    ], 0))
    expect(metrics.medianCommitSize).toBe(50)
    expect(metrics.largestCommitSize).toBe(1000)
    expect(metrics.p90CommitSize).toBe(1000)
    expect(metrics.averageCommitSize).toBe(353)
  })

  it('normalizes commit frequency to the observed calendar window', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'day-one', committedAt: '2026-08-01T10:00:00Z' }),
      commit({ sha: 'day-one-2', committedAt: '2026-08-01T12:00:00Z' }),
      commit({ sha: 'day-three', committedAt: '2026-08-03T12:00:00Z' }),
    ], 0))
    expect(metrics.activeDays).toBe(2)
    expect(metrics.spanDays).toBe(3)
    expect(metrics.commitsPer30Days).toBe(30)
  })

  it('scores commit messages by information density instead of length alone', () => {
    expect(scoreCommitMessage('')).toBe(15)
    expect(scoreCommitMessage('update')).toBeLessThan(40)
    expect(scoreCommitMessage('fix: handle missing profile data')).toBeGreaterThan(70)
    expect(scoreCommitMessage('feat(auth): rotate session tokens')).toBeGreaterThan(70)
  })

  it('scores Clarity from personal intent, conventional messages, and reviewable scope', () => {
    const clearHistory = context([
      commit({ sha: 'one', message: 'feat: add profile summary', changedFiles: 1 }),
      commit({ sha: 'two', message: 'fix: handle missing profile data', changedFiles: 2 }),
      commit({ sha: 'three', message: 'refactor: extract profile score mapper', changedFiles: 1 }),
    ], 0)
    const unclearHistory = context(Array.from({ length: 3 }, (_, index) => commit({
      sha: `unclear-${index}`,
      message: 'update',
      changedFiles: 20,
      files: [{ filename: `app/file-${index}.ts`, status: 'modified', additions: 800, deletions: 200 }],
    })), 0)

    expect(scoreDashboardClarity(deriveDashboardMetrics(clearHistory))).toBeGreaterThan(85)
    expect(scoreDashboardClarity(deriveDashboardMetrics(unclearHistory))).toBeLessThan(35)
  })

  it('keeps Clarity neutral when the sample has no personal evidence', () => {
    const mergeOnlyHistory = context([
      commit({ sha: 'merge-one', message: 'Merge branch feature into main', changedFiles: 20 }),
      commit({ sha: 'merge-two', message: 'Merge branch release into main', changedFiles: 20 }),
      commit({ sha: 'merge-three', message: 'Merge pull request #3 from feature', changedFiles: 20 }),
    ], 0)
    const thinHistory = context([
      commit({ sha: 'one', message: 'feat: add one thing', changedFiles: 1 }),
      commit({ sha: 'two', message: 'fix: handle one thing', changedFiles: 1 }),
    ], 0)

    expect(scoreDashboardClarity(deriveDashboardMetrics(mergeOnlyHistory))).toBe(50)
    expect(scoreDashboardClarity(deriveDashboardMetrics(thinHistory))).toBe(50)
  })

  it('keeps Clarity neutral when only one personal commit survives merge filtering', () => {
    const integrationHeavyHistory = context([
      commit({ sha: 'personal', message: 'feat: add board state', changedFiles: 1 }),
      commit({ sha: 'merge-one', message: 'Merge branch feature into main', changedFiles: 18 }),
      commit({ sha: 'merge-two', message: 'Merge branch release into main', changedFiles: 18 }),
      commit({ sha: 'merge-three', message: 'Merge pull request #3 from feature', changedFiles: 18 }),
    ], 0)

    expect(deriveDashboardMetrics(integrationHeavyHistory).workflowCommitCount).toBe(1)
    expect(scoreDashboardClarity(deriveDashboardMetrics(integrationHeavyHistory))).toBe(50)
  })

  it('scores Workflow from delivery hygiene instead of raw commit volume', () => {
    const cleanHistory = context([
      commit({ sha: 'one', message: 'feat: add profile summary', additions: 24, deletions: 4, changedFiles: 2 }),
      commit({ sha: 'two', message: 'fix: handle missing profile data', additions: 18, deletions: 3, changedFiles: 1 }),
      commit({ sha: 'three', message: 'test: cover empty profile state', additions: 20, deletions: 5, changedFiles: 2 }),
    ], 3)
    const mergeHeavyHistory = context([
      commit({ sha: 'merge-one', message: 'Merge branch feature into main', additions: 900, deletions: 700, changedFiles: 22 }),
      commit({ sha: 'merge-two', message: 'update', additions: 800, deletions: 600, changedFiles: 20 }),
      commit({ sha: 'merge-three', message: 'Merge branch release into main', additions: 700, deletions: 500, changedFiles: 18 }),
    ], 0)

    expect(scoreDashboardWorkflow(deriveDashboardMetrics(cleanHistory))).toBeGreaterThan(90)
    expect(scoreDashboardWorkflow(deriveDashboardMetrics(mergeHeavyHistory))).toBeLessThan(40)
  })

  it('keeps merge-only maintainer history neutral instead of calling it bad workflow', () => {
    const mergeOnlyHistory = context([
      commit({ sha: 'merge-one', message: 'Merge branch feature into main', additions: 2_000, deletions: 1_500, changedFiles: 40 }),
      commit({ sha: 'merge-two', message: 'Merge branch release into main', additions: 1_800, deletions: 1_200, changedFiles: 35 }),
      commit({ sha: 'merge-three', message: 'Merge pull request #3 from feature', additions: 1_600, deletions: 1_000, changedFiles: 30 }),
    ], 0)
    const metrics = deriveDashboardMetrics(mergeOnlyHistory)

    expect(metrics.workflowCommitCount).toBe(0)
    expect(metrics.workflowLargeCommitRatio).toBe(50)
    expect(scoreDashboardWorkflow(metrics)).toBe(50)
  })

  it('does not reward a compressed burst merely because it has a higher frequency', () => {
    const sameHistory = [
      commit({ sha: 'one', committedAt: '2026-08-01T10:00:00Z' }),
      commit({ sha: 'two', committedAt: '2026-08-02T10:00:00Z' }),
      commit({ sha: 'three', committedAt: '2026-08-03T10:00:00Z' }),
    ]
    const burst = deriveDashboardMetrics(context(sameHistory.map(item => ({ ...item, committedAt: '2026-08-03T10:00:00Z' })), 0))
    const spread = deriveDashboardMetrics(context(sameHistory, 0))

    expect(burst.commitsPer30Days).toBeGreaterThan(spread.commitsPer30Days)
    expect(scoreDashboardWorkflow(burst)).toBe(scoreDashboardWorkflow(spread))
  })

  it('reports generic and conventional message ratios', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'generic', message: 'update' }),
      commit({ sha: 'conventional', message: 'fix: handle empty state' }),
    ], 0))
    expect(metrics.conventionalMessageRatio).toBe(50)
    expect(metrics.genericMessageRatio).toBe(50)
    expect(metrics.emptyMessageRatio).toBe(0)
  })

  it('reports observable safety signals without treating them as a verdict', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'safe', files: [
        { filename: 'tests/auth.test.ts', status: 'modified', additions: 10, deletions: 1 },
        { filename: '.github/workflows/test.yml', status: 'modified', additions: 8, deletions: 0 },
        { filename: 'app/validators/session.ts', status: 'added', additions: 12, deletions: 0 },
      ], additions: 30, deletions: 1, changedFiles: 3 }),
    ], 1))
    expect(metrics.testFileRatio).toBe(33)
    expect(metrics.ciFileRatio).toBe(33)
    expect(metrics.validationFileRatio).toBe(33)
    expect(metrics.pullRequestCoverage).toBe(100)
    expect(metrics.deletionRatio).toBe(3)
  })

  it('keeps missing patch evidence neutral and recognizes defensive or risky patches', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'defensive', files: [{ filename: 'app/auth.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ try { validate(input) } catch (error) { throw new Error() }' }] }),
      commit({ sha: 'unknown', files: [{ filename: 'app/example.ts', status: 'modified', additions: 4, deletions: 1 }] }),
    ], 0))
    expect(metrics.riskyFileRatio).toBe(50)
    expect(metrics.defensivePatchRatio).toBe(100)
    expect(metrics.riskyPatchRatio).toBe(0)
  })

  it('uses the no-evidence fallback when no patch can be inspected', () => {
    const assessment = scoreDashboardProfile(context([commit({ files: [{ filename: 'app/example.ts', status: 'modified', additions: 4, deletions: 1 }] })], 0))
    expect(assessment.scores.safety).toBe(50)
  })

  it('raises Safety only for visible defensive evidence and keeps heuristic risks contextual', () => {
    const defensive = scoreDashboardProfile(context([commit({
      files: [
        { filename: 'tests/auth.test.ts', status: 'modified', additions: 10, deletions: 1, patch: '+ try { validate(input) } catch (error) { throw new Error() }' },
        { filename: '.github/workflows/test.yml', status: 'modified', additions: 8, deletions: 0 },
      ],
      changedFiles: 2,
    })], 1))
    const risky = scoreDashboardProfile(context([commit({
      files: [{ filename: 'app/render.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ element.innerHTML = input' }],
    })], 0))
    expect(defensive.scores.safety).toBeGreaterThan(65)
    expect(risky.scores.safety).toBe(65)
  })

  it('applies only introduced AI risks to the deterministic Safety score', () => {
    const sample = context([commit({ sha: 'risk', files: [{ filename: 'app/render.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ element.innerHTML = input' }] })], 0)
    const base = scoreDashboardProfile(sample)
    const fixed = scoreDashboardProfile(sample, {
      confidence: 90,
      signals: [{ category: 'validation', verdict: 'risk', impact: 'fixed', severity: 'high', commitSha: 'risk', evidence: 'the changed lines remove the old unsafe sink' }],
      status: 'assessed',
    })
    const unclear = scoreDashboardProfile(sample, {
      confidence: 40,
      signals: [{ category: 'validation', verdict: 'risk', impact: 'unclear', severity: 'high', commitSha: 'risk', evidence: 'the excerpt is truncated' }],
      status: 'assessed',
    })
    const introduced = scoreDashboardProfile(sample, {
      confidence: 90,
      signals: [{ category: 'validation', verdict: 'risk', impact: 'introduced', severity: 'medium', commitSha: 'risk', evidence: 'the changed line writes untrusted input to innerHTML' }],
      status: 'assessed',
    })
    const ungrounded = scoreDashboardProfile(sample, {
      confidence: 90,
      signals: [{ category: 'validation', verdict: 'risk', impact: 'introduced', severity: 'high', commitSha: 'not-in-sample', evidence: 'not grounded in the supplied commits' }],
      status: 'assessed',
    })
    const unsupported = scoreDashboardProfile(context([commit({ sha: 'plain', files: [{ filename: 'app/plain.ts', status: 'modified', additions: 4, deletions: 0, patch: '+ const nextValue = input' }] })], 0), {
      confidence: 90,
      signals: [{ category: 'dependency', verdict: 'risk', impact: 'introduced', severity: 'high', commitSha: 'plain', evidence: 'the dependency may be unsafe, but the patch has no direct risk evidence' }],
      status: 'assessed',
    })

    expect(base.scores.safety).toBe(65)
    expect(fixed.scores.safety).toBe(65)
    expect(unclear.scores.safety).toBe(65)
    expect(introduced.scores.safety).toBe(50)
    expect(ungrounded.scores.safety).toBe(65)
    expect(unsupported.scores.safety).toBe(65)
  })

  it('uses the dedicated secret or auth bypass penalty', () => {
    const sample = context([commit({ sha: 'secret', files: [{ filename: 'app/auth.ts', status: 'modified', additions: 4, deletions: 0, patch: '+ bypassAuthorization(input)' }] })], 0)
    const assessment = scoreDashboardProfile(sample, {
      confidence: 95,
      signals: [{ category: 'auth', verdict: 'risk', impact: 'introduced', severity: 'high', commitSha: 'secret', evidence: 'the changed line bypasses authorization' }],
      status: 'assessed',
    })

    expect(assessment.scores.safety).toBe(15)
  })

  it('selects at most the newest, largest, and most relevant commits', () => {
    const commits = [
      commit({ sha: 'old', committedAt: '2026-08-01T00:00:00Z', additions: 10, deletions: 1, files: [{ filename: 'app/example.ts', status: 'modified', additions: 10, deletions: 1, patch: '+ const value = 1' }] }),
      commit({ sha: 'latest', committedAt: '2026-08-03T00:00:00Z', additions: 12, deletions: 1, files: [{ filename: 'app/example.ts', status: 'modified', additions: 12, deletions: 1, patch: '+ const latest = 1' }] }),
      commit({ sha: 'largest', committedAt: '2026-08-02T00:00:00Z', additions: 900, deletions: 100, files: [{ filename: 'app/feature.ts', status: 'modified', additions: 900, deletions: 100, patch: '+ const feature = 1' }] }),
      commit({ sha: 'relevant', committedAt: '2026-07-30T00:00:00Z', additions: 20, deletions: 5, files: [{ filename: 'app/validators/input.ts', status: 'modified', additions: 20, deletions: 5, patch: '+ validate(input)' }] }),
    ]

    expect(selectSafetyCommits(commits).map(selected => selected.sha)).toEqual(['latest', 'largest', 'relevant'])
  })

  it('classifies Safety roles only when the sample has enough patch evidence', () => {
    const edgeCaseSheriff = resolveDashboardProfileRole({
      scores: { clarity: 70, safety: 90, workflow: 68, complexity: 72, context: 70 },
      commitCount: 3,
      hasPatchEvidence: true,
    })
    const riskRunner = resolveDashboardProfileRole({
      scores: { clarity: 75, safety: 50, workflow: 74, complexity: 76, context: 72 },
      commitCount: 3,
      hasPatchEvidence: true,
    })
    const fingerCrosser = resolveDashboardProfileRole({
      scores: { clarity: 55, safety: 35, workflow: 55, complexity: 55, context: 55 },
      commitCount: 3,
      hasPatchEvidence: true,
    })
    const insufficient = resolveDashboardProfileRole({
      scores: { clarity: 90, safety: 90, workflow: 90, complexity: 90, context: 90 },
      commitCount: 12,
      hasPatchEvidence: false,
    })

    expect(edgeCaseSheriff.primary).toBe('Edge-Case Sheriff')
    expect(riskRunner.primary).toBe('Risk Runner')
    expect(fingerCrosser.primary).toBe('Finger Crosser')
    expect(insufficient).toMatchObject({ primary: 'Unclassified', status: 'unclassified', reason: 'insufficient-evidence' })
  })

  it('keeps all matching role candidates while preferring the broad overall role', () => {
    const classification = resolveDashboardProfileRole({
      scores: { clarity: 88, safety: 86, workflow: 84, complexity: 87, context: 85 },
      commitCount: 6,
      hasPatchEvidence: true,
    })

    expect(classification.primary).toBe('Ungrillable')
    expect(classification.candidates).toContain('Ungrillable')
    expect(classification.candidates).toContain('Human Compiler')
    expect(classification.candidates).toContain('Edge-Case Sheriff')
  })
})
