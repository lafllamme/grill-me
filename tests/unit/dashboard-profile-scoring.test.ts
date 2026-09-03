import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it } from 'vitest'
import { computeDashboardAiAdjustments } from '../../server/roast/dashboard/ai-review/adjustments'
import { getDashboardClarityEvidenceCap, getDashboardClarityScoreBreakdown, scoreDashboardClarity } from '../../server/roast/dashboard/categories/clarity'
import { scoreDashboardComplexity } from '../../server/roast/dashboard/categories/complexity'
import { getDashboardContextScoreBreakdown, scoreDashboardContext } from '../../server/roast/dashboard/categories/context'
import { selectSafetyCommits } from '../../server/roast/dashboard/categories/safety'
import { getDashboardWorkflowScoreBreakdown, scoreCommitMessage, scoreDashboardWorkflow } from '../../server/roast/dashboard/categories/workflow'
import { resolveDashboardProfileRole } from '../../server/roast/dashboard/roles'
import { deriveDashboardMetrics, scoreDashboardProfile } from '../../server/roast/dashboard/scoring'
import { dashboardSafetyProbeSet, dashboardSafetyRepositoryProbeSet } from '../fixtures/dashboard-safety-probes'

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

function context(commits: GithubCommit[], prs = 2, username = 'lafllamme'): GithubContext {
  return { username, commits, prs: Array.from({ length: prs }, (_, index) => ({ repo: 'flame/example', title: `PR ${index}`, url: '', state: 'closed' })) }
}

describe('dashboard profile scoring', () => {
  it('keeps every score bounded and exposes explainable evidence metrics', () => {
    const assessment = scoreDashboardProfile(context([commit(), commit({ sha: 'def456' })]))
    expect(assessment.version).toBe('v2')
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
    expect(assessment.scores.workflow).toBe(50)
    expect(assessment.scores.complexity).toBe(50)
    expect(assessment.scores.context).toBe(50)
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

  it('scores Clarity from intent, visible naming, and local patch structure', () => {
    const clearHistory = context([
      commit({ sha: 'one', message: 'feat: add profile summary', changedFiles: 1, files: [{ filename: 'src/profileSummary.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileSummary = buildProfileSummary(input)\n+ return profileSummary' }] }),
      commit({ sha: 'two', message: 'fix: handle missing profile data', changedFiles: 1, files: [{ filename: 'src/profileValidation.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const validationResult = validateProfile(input)\n+ return validationResult' }] }),
      commit({ sha: 'three', message: 'refactor: extract profile score mapper', changedFiles: 1, files: [{ filename: 'src/profileScoreMapper.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileScore = mapProfileScore(profile)\n+ return profileScore' }] }),
    ], 0)
    const unclearHistory = context(Array.from({ length: 3 }, (_, index) => commit({
      sha: `unclear-${index}`,
      message: 'update',
      changedFiles: 2,
      files: [{ filename: `app/file-${index}.ts`, status: 'modified', additions: 4, deletions: 0, patch: '+ const x = data\n+             if (x) {\n+               return x\n+             }' }],
    })), 0)

    const clearMetrics = deriveDashboardMetrics(clearHistory)
    const unclearMetrics = deriveDashboardMetrics(unclearHistory)
    expect(clearMetrics.clarityNamingSignal).toBe(100)
    expect(clearMetrics.clarityStructureSignal).toBe(100)
    expect(clearMetrics.clarityEvidenceCap).toBe(90)
    expect(scoreDashboardClarity(clearMetrics)).toBeGreaterThan(85)
    expect(unclearMetrics.clarityNamingSignal).toBe(0)
    expect(unclearMetrics.clarityStructureSignal).toBeLessThan(60)
    expect(scoreDashboardClarity(unclearMetrics)).toBeLessThan(45)
  })

  it('caps near-perfect Clarity when the visible sample is still thin', () => {
    const thinHistory = context(Array.from({ length: 3 }, (_, index) => commit({
      sha: `thin-${index}`,
      message: 'feat: implement explicit profile state validation',
      changedFiles: 1,
      files: [{ filename: `src/profile-${index}.ts`, status: 'modified', additions: 2, deletions: 0, patch: '+ const profileState = buildProfileState(input)\n+ return profileState' }],
    })), 0)
    const metrics = deriveDashboardMetrics(thinHistory)
    const breakdown = getDashboardClarityScoreBreakdown(metrics)

    expect(breakdown.evidenceCap).toBe(90)
    expect(scoreDashboardClarity(metrics)).toBe(90)

    const reviewed = scoreDashboardProfile(thinHistory, undefined, {
      confidence: 90,
      status: 'assessed',
      selectedCommitCount: 3,
      patchCount: 3,
      patchChars: 180,
      axisReviews: [{
        axis: 'clarity',
        verdict: 'softens',
        confidence: 90,
        summary: 'The visible patches are clearer than the baseline suggests.',
        evidence: [
          { commitSha: 'thin-0', filename: 'src/profile-0.ts', observation: 'the name explains the state' },
          { commitSha: 'thin-1', filename: 'src/profile-1.ts', observation: 'the same naming pattern is visible' },
        ],
      }],
      findings: [],
    })

    expect(reviewed.scores.clarity).toBe(90)
  })

  it('allows a strong Clarity score only after a broader patch-backed sample', () => {
    const broadHistory = context(Array.from({ length: 10 }, (_, index) => commit({
      sha: `broad-${index}`,
      message: 'feat: implement explicit profile state validation',
      changedFiles: 1,
      files: [{ filename: `src/profile-${index}.ts`, status: 'modified', additions: 2, deletions: 0, patch: '+ const profileState = buildProfileState(input)\n+ return profileState' }],
    })), 0)
    const metrics = deriveDashboardMetrics(broadHistory)

    expect(getDashboardClarityEvidenceCap(metrics)).toBe(95)
    expect(scoreDashboardClarity(metrics)).toBe(95)
  })

  it('exposes Clarity component signals and neutral patch evidence explicitly', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'one', message: 'feat: add profile summary', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0 }] }),
      commit({ sha: 'two', message: 'fix: handle missing profile data', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0 }] }),
      commit({ sha: 'three', message: 'refactor: extract profile mapper', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0 }] }),
    ], 0))

    expect(getDashboardClarityScoreBreakdown(metrics)).toMatchObject({
      namingSignal: 50,
      structureSignal: 50,
      namingEvidenceAvailable: false,
      structureEvidenceAvailable: false,
    })
  })

  it('does not use Conventional Commit syntax as a Clarity proxy', () => {
    const metrics = deriveDashboardMetrics(context([
      commit({ sha: 'one', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileSummary = buildProfileSummary(input)' }] }),
      commit({ sha: 'two', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileValidation = validateProfile(input)' }] }),
      commit({ sha: 'three', files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileScore = mapProfileScore(profile)' }] }),
    ], 0))

    expect(scoreDashboardClarity({ ...metrics, workflowConventionalMessageRatio: 0 }))
      .toBe(scoreDashboardClarity({ ...metrics, workflowConventionalMessageRatio: 100 }))
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

  it('scores Complexity from personal change surface and ignores merge breadth', () => {
    const focusedHistory = context([
      commit({ sha: 'focused-one', additions: 20, deletions: 4, changedFiles: 1 }),
      commit({ sha: 'focused-two', additions: 30, deletions: 6, changedFiles: 2 }),
      commit({ sha: 'focused-three', additions: 18, deletions: 3, changedFiles: 1 }),
      commit({ sha: 'focused-four', additions: 28, deletions: 5, changedFiles: 2 }),
    ], 0)
    const broadHistory = context(Array.from({ length: 4 }, (_, index) => commit({
      sha: `broad-${index}`,
      additions: 900,
      deletions: 700,
      changedFiles: 22,
      files: [{ filename: `app/area-${index}.ts`, status: 'modified', additions: 900, deletions: 700 }],
    })), 0)
    const mergeHeavyHistory = context([
      ...focusedHistory.commits,
      commit({ sha: 'merge', message: 'Merge branch feature into main', additions: 12_000, deletions: 8_000, changedFiles: 80, files: [{ filename: 'vendor/merged.ts', status: 'modified', additions: 12_000, deletions: 8_000 }] }),
    ], 0)

    const focusedScore = scoreDashboardComplexity(deriveDashboardMetrics(focusedHistory))

    expect(focusedScore).toBeGreaterThan(80)
    expect(scoreDashboardComplexity(deriveDashboardMetrics(broadHistory))).toBeLessThanOrEqual(45)
    expect(scoreDashboardComplexity(deriveDashboardMetrics(mergeHeavyHistory))).toBe(focusedScore)
  })

  it('uses weighted effective files instead of treating docs, tests, and release artifacts as runtime complexity', () => {
    const history = context(Array.from({ length: 4 }, (_, index) => commit({
      sha: `weighted-${index}`,
      additions: 20,
      deletions: 2,
      changedFiles: 4,
      files: [
        { filename: `src/feature-${index}.ts`, status: 'modified', additions: 12, deletions: 1 },
        { filename: `tests/feature-${index}.test.ts`, status: 'modified', additions: 4, deletions: 1 },
        { filename: `docs/feature-${index}.md`, status: 'modified', additions: 4, deletions: 0 },
        { filename: 'pnpm-lock.yaml', status: 'modified', additions: 0, deletions: 0 },
      ],
    })), 0)
    const metrics = deriveDashboardMetrics(history)

    expect(metrics.complexityEffectiveFilesP75).toBe(1.8)
    expect(metrics.complexityExcludedFileRatio).toBe(25)
    expect(metrics.complexityScopeSignal).toBe(100)
    expect(scoreDashboardComplexity(metrics)).toBeGreaterThan(90)
  })

  it('does not count non-code design artifacts or extrapolate them as runtime files', () => {
    const history = context(Array.from({ length: 4 }, (_, index) => commit({
      sha: `design-${index}`,
      additions: 900,
      deletions: 700,
      changedFiles: 12,
      files: [
        { filename: `Hardware/board-${index}/board.kicad_pcb`, status: 'modified', additions: 220, deletions: 180 },
        { filename: `Hardware/board-${index}/board.kicad_sch`, status: 'modified', additions: 680, deletions: 520 },
        { filename: `Hardware/board-${index}/board.kicad_block/components.json`, status: 'modified', additions: 0, deletions: 0 },
      ],
    })), 0)
    const metrics = deriveDashboardMetrics(history)

    expect(metrics.complexityEffectiveFilesP75).toBe(0)
    expect(metrics.complexityExcludedFileRatio).toBe(100)
    expect(metrics.complexityScopeSignal).toBe(100)
    expect(scoreDashboardComplexity(metrics)).toBe(100)
  })

  it('does not turn raw line volume into complexity when the effective surface stays focused', () => {
    const history = context(Array.from({ length: 4 }, (_, index) => commit({
      sha: `large-file-${index}`,
      additions: 50_000,
      deletions: 49_000,
      changedFiles: 1,
      files: [{ filename: `src/refactor-${index}.ts`, status: 'modified', additions: 50_000, deletions: 49_000 }],
    })), 0)
    const metrics = deriveDashboardMetrics(history)

    expect(metrics.complexityRelativeOutlierRatio).toBe(0)
    expect(scoreDashboardComplexity(metrics)).toBe(100)
  })

  it('keeps Complexity neutral when personal evidence is insufficient', () => {
    const thinHistory = context([
      commit({ sha: 'one', changedFiles: 1 }),
      commit({ sha: 'two', changedFiles: 1 }),
    ], 0)

    expect(scoreDashboardComplexity(deriveDashboardMetrics(thinHistory))).toBe(50)
  })

  it('scores Context from visible explanations, orientation artifacts, and handoff evidence', () => {
    const orientedHistory = context([
      commit({ sha: 'one', message: 'feat: add profile summary\n\nExplains why the summary stays separate from the score.', changedFiles: 1, files: [{ filename: 'src/profile.ts', status: 'modified', additions: 1, deletions: 0, patch: '+ // Keeps profile context next to the summary boundary' }] }),
      commit({ sha: 'two', message: 'docs: explain profile scoring contract', changedFiles: 1, files: [{ filename: 'README.md', status: 'modified', additions: 2, deletions: 0, patch: '+ # Profile scoring\n+ The score describes the sampled change surface.' }] }),
      commit({ sha: 'three', message: 'fix: handle missing profile data\n\nBecause an empty profile needs an explicit neutral state.', changedFiles: 1, files: [{ filename: 'src/profile-state.ts', status: 'modified', additions: 1, deletions: 0, patch: '+ // Preserve a neutral state until profile evidence is available' }] }),
    ], 2)
    orientedHistory.prs = orientedHistory.prs.map(pullRequest => ({ ...pullRequest, reviewCount: 1 }))
    orientedHistory.repositories = [{ repo: 'flame/example', defaultBranch: 'main', isFork: false, isArchived: false, size: 100, stars: 0, rootEntries: ['README.md', 'docs', 'examples'] }]

    const undocumentedHistory = context([
      commit({ sha: 'one', message: 'feat: introduce profile summary', changedFiles: 1, files: [{ filename: 'src/profile.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileSummary = buildProfileSummary(input)\n+ return profileSummary' }] }),
      commit({ sha: 'two', message: 'fix: handle missing profile data', changedFiles: 1, files: [{ filename: 'src/profile-state.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const nextState = resolveProfileState(input)\n+ return nextState' }] }),
      commit({ sha: 'three', message: 'refactor: replace profile mapper', changedFiles: 1, files: [{ filename: 'src/profile-mapper.ts', status: 'modified', additions: 2, deletions: 0, patch: '+ const profileMapper = createProfileMapper(input)\n+ return profileMapper' }] }),
    ], 0)
    const vagueHistory = context(Array.from({ length: 3 }, (_, index) => commit({
      sha: `vague-${index}`,
      message: 'update',
      changedFiles: 1,
      files: [{ filename: `app/file-${index}.ts`, status: 'modified', additions: 2, deletions: 0, patch: '+ const x = data\n+ return x' }],
    })), 0)

    const orientedScore = scoreDashboardContext(deriveDashboardMetrics(orientedHistory))
    const undocumentedScore = scoreDashboardContext(deriveDashboardMetrics(undocumentedHistory))
    const vagueScore = scoreDashboardContext(deriveDashboardMetrics(vagueHistory))

    expect(orientedScore).toBe(91)
    expect(undocumentedScore).toBe(74)
    expect(orientedScore).toBeGreaterThan(75)
    expect(undocumentedScore).toBeGreaterThanOrEqual(50)
    expect(orientedScore).toBeGreaterThan(undocumentedScore)
    expect(vagueScore).toBe(66)
  })

  it('keeps Context neutral when only file names or generated release artifacts are visible', () => {
    const history = context(Array.from({ length: 3 }, (_, index) => commit({
      sha: `release-${index}`,
      message: 'chore: publish package',
      changedFiles: 1,
      files: [{ filename: 'CHANGELOG.md', status: 'modified', additions: 8, deletions: 2 }],
    })), 0)
    history.repositories = [{ repo: 'flame/example', defaultBranch: 'main', isFork: false, isArchived: false, size: 100, stars: 0, rootEntries: ['CHANGELOG.md', 'src'] }]

    const metrics = deriveDashboardMetrics(history)
    const breakdown = getDashboardContextScoreBreakdown(metrics)

    expect(breakdown.orientationArtifactSignal).toBe(50)
    expect(breakdown.repositoryOrientationSignal).toBe(50)
    expect(scoreDashboardContext(metrics)).toBe(70)
  })

  it('keeps Context neutral when there are fewer than three personal commits', () => {
    const thinHistory = context([
      commit({ sha: 'one', message: 'feat: add one thing', changedFiles: 1 }),
      commit({ sha: 'two', message: 'fix: handle one thing', changedFiles: 1 }),
    ], 3)

    expect(scoreDashboardContext(deriveDashboardMetrics(thinHistory))).toBe(50)
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

    expect(scoreDashboardWorkflow(deriveDashboardMetrics(cleanHistory))).toBe(84)
    expect(scoreDashboardWorkflow(deriveDashboardMetrics(mergeHeavyHistory))).toBe(50)
  })

  it('uses median and p75 scope instead of letting one broad change define Workflow', () => {
    const history = context([
      commit({ sha: 'focused-one', changedFiles: 2 }),
      commit({ sha: 'focused-two', changedFiles: 2 }),
      commit({ sha: 'focused-three', changedFiles: 2 }),
      commit({ sha: 'focused-four', changedFiles: 2 }),
      commit({ sha: 'broad-refactor', changedFiles: 40, additions: 900, deletions: 100 }),
    ], 0)
    const metrics = deriveDashboardMetrics(history)
    const breakdown = getDashboardWorkflowScoreBreakdown(metrics)

    expect(metrics.workflowAverageFilesPerCommit).toBe(9.6)
    expect(metrics.workflowMedianFilesPerCommit).toBe(2)
    expect(metrics.workflowP75FilesPerCommit).toBe(2)
    expect(breakdown.fileScopeSignal).toBe(100)
    expect(breakdown.rawScore).toBeGreaterThan(90)
    expect(breakdown.evidenceCap).toBe(84)
    expect(scoreDashboardWorkflow(metrics)).toBe(84)
  })

  it('requires enough personal and patch evidence before Workflow can enter the strong band', () => {
    const strongHistory = context(Array.from({ length: 10 }, (_, index) => commit({
      sha: `strong-${index}`,
      files: [{ filename: `src/feature-${index}.ts`, status: 'modified', additions: 12, deletions: 2, patch: '+ const focusedChange = true' }],
      changedFiles: 1,
    })), 0)
    const limitedMetrics = deriveDashboardMetrics(context([
      commit({ sha: 'limited-one', files: [{ filename: 'src/one.ts', status: 'modified', additions: 12, deletions: 2, patch: '+ const one = true' }] }),
      commit({ sha: 'limited-two', files: [{ filename: 'src/two.ts', status: 'modified', additions: 12, deletions: 2, patch: '+ const two = true' }] }),
      commit({ sha: 'limited-three', files: [{ filename: 'src/three.ts', status: 'modified', additions: 12, deletions: 2, patch: '+ const three = true' }] }),
    ], 0))

    expect(scoreDashboardWorkflow(limitedMetrics)).toBeLessThanOrEqual(84)
    expect(getDashboardWorkflowScoreBreakdown(limitedMetrics).evidenceQuality).toBe('limited')
    expect(scoreDashboardWorkflow(deriveDashboardMetrics(strongHistory))).toBeLessThanOrEqual(95)
    expect(getDashboardWorkflowScoreBreakdown(deriveDashboardMetrics(strongHistory)).evidenceQuality).toBe('strong')
  })

  it('does not lower a good Workflow score just because public PR evidence is absent', () => {
    const commits = [
      commit({ sha: 'one', changedFiles: 1 }),
      commit({ sha: 'two', changedFiles: 2 }),
      commit({ sha: 'three', changedFiles: 1 }),
    ]
    const withoutPrs = deriveDashboardMetrics(context(commits, 0))
    const withPrs = deriveDashboardMetrics(context(commits, 3))

    expect(getDashboardWorkflowScoreBreakdown(withoutPrs).reviewEvidenceAvailable).toBe(false)
    expect(getDashboardWorkflowScoreBreakdown(withPrs).reviewEvidenceAvailable).toBe(true)
    expect(scoreDashboardWorkflow(withoutPrs)).toBe(scoreDashboardWorkflow(withPrs))
  })

  it('keeps the named probe set in plausible Workflow bands', () => {
    const probeSet = [
      { username: 'lafllamme', fileScopes: [2, 3, 4, 6, 12], minimum: 80 },
      { username: 'danielroe', fileScopes: [1, 1, 2, 2, 3], minimum: 80 },
      { username: 'torvalds', fileScopes: [2, 3, 4], mergeCount: 6, minimum: 80 },
      { username: 'sindresorhus', fileScopes: [2, 2, 3, 5, 20], minimum: 80 },
      { username: 'antfu', fileScopes: [1, 1, 1, 2, 2], minimum: 80 },
      { username: 'kentcdodds', fileScopes: [2, 3, 4, 5, 6], minimum: 80 },
    ]

    const scores = new Map(probeSet.map((probe) => {
      const personalCommits = probe.fileScopes.map((changedFiles, index) => commit({
        sha: `${probe.username}-${index}`,
        changedFiles,
      }))
      const mergeCommits = Array.from({ length: probe.mergeCount ?? 0 }, (_, index) => commit({
        sha: `${probe.username}-merge-${index}`,
        message: 'Merge branch release into main',
        changedFiles: 30,
        isMerge: true,
      }))
      const score = scoreDashboardWorkflow(deriveDashboardMetrics(context([...personalCommits, ...mergeCommits], 0, probe.username)))

      expect(score, probe.username).toBeGreaterThanOrEqual(probe.minimum)
      return [probe.username, score] as const
    }))

    const torvaldsWithoutMerges = scoreDashboardWorkflow(deriveDashboardMetrics(context(
      [2, 3, 4].map((changedFiles, index) => commit({ sha: `torvalds-personal-${index}`, changedFiles })),
      0,
      'torvalds',
    )))

    expect(scores.get('torvalds')).toBe(torvaldsWithoutMerges)
    expect(scores.get('sindresorhus')).toBeGreaterThan(scores.get('lafllamme')! - 15)
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
    expect(metrics.safetyPatchCommitRatio).toBe(50)
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
    expect(defensive.scores.safety).toBe(95)
    expect(risky.scores.safety).toBe(70)
  })

  it('lets grounded AI defense findings lift a safety-relevant patch without owning the score', () => {
    const sample = context([
      commit({ sha: 'auth', files: [{ filename: 'app/auth.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ if (!authorize(user)) throw new Error("unauthorized")' }] }),
      commit({ sha: 'validation', files: [{ filename: 'app/validation.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ const parsed = validate(input)' }] }),
      commit({ sha: 'database', files: [{ filename: 'app/database.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ const query = input' }] }),
    ], 0)
    const baseline = scoreDashboardProfile(sample)
    const reviewed = scoreDashboardProfile(sample, {
      confidence: 90,
      signals: [
        { category: 'auth', verdict: 'safe', impact: 'introduced', severity: 'low', commitSha: 'auth', filename: 'app/auth.ts', evidence: 'changed lines authorize before access' },
        { category: 'validation', verdict: 'safe', impact: 'introduced', severity: 'low', commitSha: 'validation', filename: 'app/validation.ts', evidence: 'changed lines validate input' },
      ],
      status: 'assessed',
    })

    expect(reviewed.derivedMetrics.safetySurfaceFileRatio).toBe(100)
    expect(reviewed.derivedMetrics.safetySurfaceLineRatio).toBe(100)
    expect(reviewed.derivedMetrics.safetyDefenseCoverage).toBe(67)
    expect(reviewed.safetyAiDefenseBonus).toBe(8)
    expect(reviewed.scores.safety).toBeGreaterThan(baseline.scores.safety)
    expect(reviewed.scores.safety).toBeLessThanOrEqual(95)
  })

  it('limits the defensive bonus when only a sparse part of the sample has patches', () => {
    const sparsePatchHistory = Array.from({ length: 10 }, (_, index) => commit({
      sha: `sparse-${index}`,
      files: index === 0
        ? [{ filename: 'src/input.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ try { validate(input) } catch (error) { throw new Error() }' }]
        : [{ filename: `src/file-${index}.ts`, status: 'modified', additions: 8, deletions: 1 }],
      changedFiles: 1,
    }))
    const assessment = scoreDashboardProfile(context(sparsePatchHistory, 0))

    expect(assessment.derivedMetrics.safetyPatchCommitRatio).toBe(10)
    expect(assessment.derivedMetrics.defensivePatchRatio).toBe(100)
    expect(assessment.scores.safety).toBe(84)
  })

  it('does not turn test files or PR coverage into a Safety bonus', () => {
    const plain = scoreDashboardProfile(context([commit({
      files: [{ filename: 'src/input.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ const value = input' }],
      changedFiles: 1,
    })], 0))
    const processSignals = scoreDashboardProfile(context([commit({
      files: [
        { filename: 'src/input.ts', status: 'modified', additions: 8, deletions: 1, patch: '+ const value = input' },
        { filename: 'tests/input.test.ts', status: 'added', additions: 12, deletions: 0 },
      ],
      changedFiles: 2,
    })], 1))

    expect(plain.scores.safety).toBe(70)
    expect(processSignals.scores.safety).toBe(70)
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

    expect(base.scores.safety).toBe(70)
    expect(fixed.scores.safety).toBe(70)
    expect(unclear.scores.safety).toBe(70)
    expect(introduced.scores.safety).toBe(55)
    expect(ungrounded.scores.safety).toBe(70)
    expect(unsupported.scores.safety).toBe(70)
  })

  it('keeps repository-specific negative probes low and paired fixes unpenalized', () => {
    for (const probe of dashboardSafetyProbeSet) {
      const assessment = scoreDashboardProfile(context([commit({
        repo: probe.repository,
        sha: probe.id,
        files: [{ filename: probe.filename, status: 'modified', additions: 1, deletions: 0, patch: probe.patch }],
        changedFiles: 1,
      })], 0, probe.username), {
        confidence: 95,
        signals: [{
          category: probe.category,
          verdict: probe.kind === 'introduced-risk' ? 'risk' : 'unclear',
          impact: probe.impact,
          severity: probe.severity,
          commitSha: probe.id,
          evidence: `${probe.repository} controlled ${probe.kind} probe`,
        }],
        status: 'assessed',
      })

      const expectedScore = probe.kind === 'fix' ? 95 : 70 - probe.expectedPenalty
      expect(assessment.scores.safety, probe.id).toBe(expectedScore)
    }
  })

  it('scores real repository commit probes as concrete Safety risks', () => {
    for (const probe of dashboardSafetyRepositoryProbeSet) {
      const assessment = scoreDashboardProfile(context([commit({
        repo: probe.repository,
        sha: probe.commitSha,
        files: [{ filename: probe.filename, status: 'modified', additions: 1, deletions: 0, patch: probe.patch }],
        changedFiles: 1,
      })], 0, probe.username), {
        confidence: 95,
        signals: [{
          category: probe.category,
          verdict: 'risk',
          impact: probe.impact,
          severity: probe.severity,
          commitSha: probe.commitSha,
          evidence: `${probe.repository} commit ${probe.commitSha.slice(0, 7)} adds the visible risky line`,
        }],
        status: 'assessed',
      })

      expect(assessment.scores.safety, probe.sourceUrl).toBe(70 - probe.expectedPenalty)
    }
  })

  it('uses the dedicated secret or auth bypass penalty', () => {
    const sample = context([commit({ sha: 'secret', files: [{ filename: 'app/auth.ts', status: 'modified', additions: 4, deletions: 0, patch: '+ bypassAuthorization(input)' }] })], 0)
    const assessment = scoreDashboardProfile(sample, {
      confidence: 95,
      signals: [{ category: 'auth', verdict: 'risk', impact: 'introduced', severity: 'high', commitSha: 'secret', evidence: 'the changed line bypasses authorization' }],
      status: 'assessed',
    })

    expect(assessment.scores.safety).toBe(20)
  })

  it('applies only bounded, grounded AI adjustments to non-safety axes', () => {
    const sample = context([
      commit({ sha: 'one', files: [{ filename: 'src/one.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ const clearName = input' }] }),
      commit({ sha: 'two', files: [{ filename: 'src/two.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ const anotherClearName = input' }] }),
      commit({ sha: 'three', files: [{ filename: 'src/three.ts', status: 'modified', additions: 4, deletions: 1, patch: '+ const finalClearName = input' }] }),
    ], 0)
    const review = {
      confidence: 90,
      status: 'assessed' as const,
      selectedCommitCount: 3,
      patchCount: 3,
      patchChars: 90,
      axisReviews: [{
        axis: 'clarity' as const,
        verdict: 'softens' as const,
        confidence: 90,
        summary: 'The visible patches are clearer than the baseline suggests.',
        evidence: [
          { commitSha: 'one', filename: 'src/one.ts', observation: 'the name explains the value' },
          { commitSha: 'two', filename: 'src/two.ts', observation: 'the second name follows the same clear pattern' },
        ],
      }],
      findings: [
        { axis: 'clarity' as const, verdict: 'positive' as const, impact: 'introduced' as const, severity: 'low' as const, commitSha: 'one', filename: 'src/one.ts', evidence: 'the name explains the value' },
        { axis: 'clarity' as const, verdict: 'positive' as const, impact: 'introduced' as const, severity: 'low' as const, commitSha: 'two', filename: 'src/two.ts', evidence: 'the name explains the value' },
        { axis: 'safety' as const, verdict: 'negative' as const, impact: 'introduced' as const, severity: 'high' as const, category: 'auth' as const, commitSha: 'three', filename: 'src/three.ts', evidence: 'auth signal is not directly visible' },
      ],
    }

    expect(computeDashboardAiAdjustments(review, sample.commits)).toEqual({ clarity: 4 })
    const base = scoreDashboardProfile(sample)
    const adjusted = scoreDashboardProfile(sample, undefined, review)
    expect(adjusted.scores.clarity).toBe(Math.min(getDashboardClarityEvidenceCap(deriveDashboardMetrics(sample)), base.scores.clarity + 4))
    expect(adjusted.scores.safety).toBe(base.scores.safety)
    expect(adjusted.aiAdjustments).toEqual({ clarity: 4 })
  })

  it('does not let low-confidence or ungrounded AI findings change a score', () => {
    const sample = context([
      commit({ sha: 'one' }),
      commit({ sha: 'two' }),
      commit({ sha: 'three' }),
    ], 0)
    const review = {
      confidence: 59,
      status: 'assessed' as const,
      selectedCommitCount: 1,
      patchCount: 1,
      patchChars: 20,
      findings: [
        { axis: 'workflow' as const, verdict: 'negative' as const, impact: 'introduced' as const, severity: 'high' as const, commitSha: 'not-present', filename: 'src/nope.ts', evidence: 'not grounded' },
        { axis: 'workflow' as const, verdict: 'negative' as const, impact: 'introduced' as const, severity: 'high' as const, commitSha: 'also-not-present', filename: 'src/nope-two.ts', evidence: 'not grounded' },
      ],
    }

    expect(computeDashboardAiAdjustments(review, sample.commits)).toEqual({})
    expect(scoreDashboardProfile(sample, undefined, review).aiAdjustments).toEqual({})
  })

  it('does not apply an axis review without two grounded patch references', () => {
    const sample = context([
      commit({ sha: 'one' }),
      commit({ sha: 'two' }),
      commit({ sha: 'three' }),
    ], 0)
    const review = {
      confidence: 90,
      status: 'assessed' as const,
      selectedCommitCount: 3,
      patchCount: 3,
      patchChars: 90,
      axisReviews: [{
        axis: 'complexity' as const,
        verdict: 'softens' as const,
        confidence: 80,
        summary: 'The visible patches keep the broad change coherent.',
        evidence: [{ commitSha: 'not-present', filename: 'src/nope.ts', observation: 'not grounded' }],
      }],
      findings: [],
    }

    expect(computeDashboardAiAdjustments(review, sample.commits)).toEqual({})
  })

  it('selects the newest, a typical, and the most relevant commits', () => {
    const commits = [
      commit({ sha: 'old', committedAt: '2026-08-01T00:00:00Z', additions: 10, deletions: 1, files: [{ filename: 'app/example.ts', status: 'modified', additions: 10, deletions: 1, patch: '+ const value = 1' }] }),
      commit({ sha: 'latest', committedAt: '2026-08-03T00:00:00Z', additions: 12, deletions: 1, files: [{ filename: 'app/example.ts', status: 'modified', additions: 12, deletions: 1, patch: '+ const latest = 1' }] }),
      commit({ sha: 'largest', committedAt: '2026-08-02T00:00:00Z', additions: 900, deletions: 100, files: [{ filename: 'app/feature.ts', status: 'modified', additions: 900, deletions: 100, patch: '+ const feature = 1' }] }),
      commit({ sha: 'relevant', committedAt: '2026-07-30T00:00:00Z', additions: 20, deletions: 5, files: [{ filename: 'app/validators/input.ts', status: 'modified', additions: 20, deletions: 5, patch: '+ validate(input)' }] }),
    ]

    expect(selectSafetyCommits(commits).map(selected => selected.sha)).toEqual(['latest', 'old', 'relevant'])
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
