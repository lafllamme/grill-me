import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it, vi } from 'vitest'
import { runAiSync } from '../../server/roast/ai-client'
import { assessDashboardProfileWithAi, buildDashboardReviewPrompt, dashboardCategoryQuestions, parseDashboardReview, toDashboardAiSafetyAssessment } from '../../server/roast/dashboard/ai-review'
import { selectDashboardPatchEvidence } from '../../server/roast/dashboard/patch-selection'

vi.mock('h3', () => ({ createError: (input: unknown) => input }))
vi.mock('consola', () => ({ consola: { info: vi.fn(), error: vi.fn() } }))
vi.mock('~~/shared/roast/contracts', () => ({
  ROAST_LIMITS: {
    maxPromptTotalPatchChars: 4500,
    maxPatchChars: 700,
    maxPromptFilesPerCommit: 3,
  },
}))
vi.mock('../../server/roast/output-parser', () => ({ extractModelText: vi.fn() }))
vi.mock('../../server/roast/ai-client', () => ({ runAiSync: vi.fn() }))

function commit(overrides: Partial<GithubCommit> = {}): GithubCommit {
  return {
    repo: 'flame/example',
    sha: 'abcdef123456',
    message: 'fix: validate profile input',
    additions: 8,
    deletions: 2,
    changedFiles: 1,
    files: [{ filename: 'src/validation.ts', status: 'modified', additions: 8, deletions: 2, patch: '+ validate(input)' }],
    ...overrides,
  }
}

function context(commits: GithubCommit[]): GithubContext {
  return {
    username: 'lafllamme',
    commits,
    prs: [],
    repositories: [{
      repo: 'flame/example',
      defaultBranch: 'main',
      language: 'TypeScript',
      isFork: false,
      isArchived: false,
      size: 100,
      stars: 999,
      rootEntries: ['README.md', 'app', 'package.json'],
    }],
  }
}

describe('dashboard AI review contract', () => {
  it('recovers a strict review object from a reasoning-only provider response', async () => {
    const { extractModelText } = await import('../../server/roast/output-parser')
    vi.mocked(extractModelText).mockReturnValue({ rawText: '', parserPath: 'none' })
    vi.mocked(runAiSync).mockResolvedValue({
      choices: [{
        finish_reason: 'stop',
        message: {
          content: {},
          reasoning: `I reviewed the patch. Final object: ${JSON.stringify({
            confidence: 82,
            findings: [{ axis: 'safety', verdict: 'positive', impact: 'introduced', severity: 'low', category: 'validation', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'changed lines validate input before processing' }],
          })}`,
        },
      }],
    })

    const result = await assessDashboardProfileWithAi({
      context: context([commit()]),
      accountId: 'account',
      apiToken: 'token',
      model: '@cf/qwen/qwen3-30b-a3b-fp8',
      timeoutMs: 1000,
    })

    expect(result).toMatchObject({ status: 'assessed', confidence: 72, responsePath: 'choices[0].message.reasoning', parseWarnings: ['axisReviews-missing'] })
    expect(result.findings).toHaveLength(1)
  })

  it('keeps axis review evidence limited to the patches sent to the model', async () => {
    const { extractModelText } = await import('../../server/roast/output-parser')
    vi.mocked(extractModelText).mockReturnValue({ rawText: JSON.stringify({
      confidence: 82,
      axisReviews: [{
        axis: 'complexity',
        verdict: 'softens',
        confidence: 80,
        summary: 'The visible change stays coherent despite touching a broad surface.',
        evidence: [
          { commitSha: 'abcdef1', filename: 'src/not-sent.ts', observation: 'not part of the selected patch sample' },
        ],
      }],
      findings: [],
    }), parserPath: 'content' })
    vi.mocked(runAiSync).mockResolvedValue({ choices: [{ message: { content: 'ignored' } }] })

    const result = await assessDashboardProfileWithAi({
      context: context([commit()]),
      accountId: 'account',
      apiToken: 'token',
      model: '@cf/qwen/qwen3-30b-a3b-fp8',
      timeoutMs: 1000,
    })

    expect(result.axisReviews).toEqual([])
    expect(result.parseWarnings).toContain('axisReviews-ungrounded:1')
  })

  it('parses grounded multi-axis findings and maps safety vocabulary', () => {
    const parsed = parseDashboardReview(JSON.stringify({
      confidence: 84,
      axisReviews: [{
        axis: 'complexity',
        verdict: 'softens',
        confidence: 78,
        summary: 'The visible change stays coherent despite touching a broad surface.',
        evidence: [
          { commitSha: 'abcdef1', filename: 'src/validation.ts', observation: 'the focused patch keeps the boundary explicit' },
          { commitSha: 'abcdef1', filename: 'src/validation.ts', observation: 'the validation change remains local' },
        ],
      }],
      findings: [
        { axis: 'safety', verdict: 'positive', impact: 'introduced', severity: 'low', category: 'validation', commitSha: 'abcdef1', filename: 'src/validation.ts', riskScope: 'production', evidence: 'input is validated before processing' },
        { axis: 'clarity', verdict: 'negative', impact: 'introduced', severity: 'low', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'the changed name hides the value meaning' },
      ],
    }))

    expect(parsed).toMatchObject({ confidence: 84, axisReviews: [{ axis: 'complexity', verdict: 'softens' }], findings: [{ axis: 'safety' }, { axis: 'clarity' }] })

    const safety = toDashboardAiSafetyAssessment({
      ...parsed!,
      status: 'assessed',
      selectedCommitCount: 1,
      patchCount: 1,
      patchChars: 17,
    })
    expect(safety.signals[0]).toMatchObject({ category: 'validation', verdict: 'safe', impact: 'introduced', riskScope: 'production' })
  })

  it('preserves the Safety risk scope from the AI contract', () => {
    const parsed = parseDashboardReview(JSON.stringify({
      confidence: 84,
      findings: [{
        axis: 'safety',
        verdict: 'negative',
        impact: 'introduced',
        severity: 'medium',
        category: 'secrets',
        riskScope: 'test',
        commitSha: 'abcdef1',
        filename: 'tests/fixtures.test.ts',
        evidence: 'the fixture contains a deliberately fake token',
      }],
    }))

    expect(parsed?.findings[0]).toMatchObject({ axis: 'safety', riskScope: 'test' })
    const safety = toDashboardAiSafetyAssessment({
      ...parsed!,
      status: 'assessed',
      selectedCommitCount: 1,
      patchCount: 1,
      patchChars: 17,
    })
    expect(safety.signals[0]).toMatchObject({ riskScope: 'test', filename: 'tests/fixtures.test.ts' })
  })

  it('rejects a safety finding without a valid safety category', () => {
    expect(parseDashboardReview(JSON.stringify({
      confidence: 80,
      findings: [{ axis: 'safety', verdict: 'negative', impact: 'introduced', severity: 'high', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'unsafe change' }],
    }))).toBeNull()
  })

  it('keeps valid review items when another item is malformed', () => {
    const parsed = parseDashboardReview(JSON.stringify({
      confidence: 90,
      axisReviews: [
        {
          axis: 'workflow',
          verdict: 'supports',
          confidence: 80,
          summary: 'The visible change is focused and easy to review.',
          evidence: [{ commitSha: 'abcdef1', filename: 'src/validation.ts', observation: 'focused change' }],
        },
        { axis: 'not-an-axis', verdict: 'supports', confidence: 80, summary: 'Invalid axis', evidence: [] },
      ],
      findings: [
        { axis: 'safety', verdict: 'positive', impact: 'introduced', severity: 'low', category: 'validation', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'validates input' },
        { axis: 'safety', verdict: 'positive', impact: 'introduced', severity: 'low', commitSha: 'abcdef1', evidence: 'filename is missing' },
      ],
    }))

    expect(parsed).toMatchObject({
      confidence: 80,
      parseWarnings: ['findings-dropped:1', 'axisReviews-dropped:1'],
      findings: [{ axis: 'safety', evidence: 'validates input' }],
      axisReviews: [{ axis: 'workflow', verdict: 'supports' }],
    })
  })

  it('accepts an axis-only response with a reduced confidence warning', () => {
    const parsed = parseDashboardReview(JSON.stringify({
      confidence: 90,
      axisReviews: [{ axis: 'context', verdict: 'insufficient', confidence: 40, summary: 'The selected excerpts do not show enough context to judge this axis.', evidence: [] }],
    }))

    expect(parsed).toMatchObject({
      confidence: 80,
      parseWarnings: ['findings-missing'],
      findings: [],
      axisReviews: [{ axis: 'context', verdict: 'insufficient' }],
    })
  })

  it('keeps repository metadata scoped and the prompt within the patch budget', () => {
    const sample = context([
      commit(),
      commit({ sha: '123456789abc', committedAt: '2026-08-02T00:00:00Z', files: [{ filename: 'README.md', status: 'modified', additions: 3, deletions: 0, patch: '+ explains the profile contract' }] }),
    ])
    const selection = selectDashboardPatchEvidence(sample)
    const prompt = buildDashboardReviewPrompt(sample, selection, {
      scores: { clarity: 80, safety: 75, workflow: 72, complexity: 76, context: 70 },
      questions: dashboardCategoryQuestions,
      safety: {
        surfaceFileRatio: 25,
        surfaceLineRatio: 18,
        defenseCoverage: 64,
        patchCommitRatio: 100,
        validationFileRatio: 33,
        ciFileRatio: 0,
      },
      clarity: {
        messageSignal: 82,
        conventionalMessageRatio: 67,
        namingSignal: 90,
        structureSignal: 88,
        namingEvidenceAvailable: true,
        structureEvidenceAvailable: true,
        evidenceCap: 90,
      },
      workflow: {
        personalCommitCount: 3,
        patchCommitCount: 3,
        messageQuality: 82,
        conventionalMessageRatio: 67,
        averageFilesPerCommit: 3.5,
        medianFilesPerCommit: 2,
        p75FilesPerCommit: 4,
        largeCommitRatio: 0,
        medianScopeSignal: 100,
        p75ScopeSignal: 100,
        fileScopeSignal: 100,
        outlierSignal: 100,
        granularitySignal: 82,
        reviewSignal: 50,
        reviewEvidenceAvailable: false,
        evidenceCap: 84,
        evidenceQuality: 'limited',
        mergeCommitRatio: 25,
      },
      complexity: {
        effectiveFilesP75: 10.1,
        excludedFileRatio: 0,
        relativeOutlierRatio: 12,
        scopeSignal: 60,
        outlierSignal: 88,
        churnSignal: 100,
      },
      context: {
        patchExplanationSignal: 68,
        orientationArtifactSignal: 72,
        commitContextSignal: 64,
        repositoryOrientationSignal: 66,
        handoffSignal: 58,
        patchExplanationEvidenceAvailable: true,
        orientationArtifactEvidenceAvailable: true,
        commitContextEvidenceAvailable: true,
        repositoryEvidenceAvailable: true,
        handoffEvidenceAvailable: true,
      },
    })

    expect(prompt).toContain('README.md')
    expect(prompt).toContain('"complexity":76')
    expect(prompt).toContain('"averageFilesPerCommit":3.5')
    expect(prompt).toContain('Are broad changes coherent and controlled')
    expect(prompt).toContain('"patchExplanationSignal":68')
    expect(prompt).toContain('"repositoryOrientationSignal":66')
    expect(prompt).not.toContain('999')
    expect(prompt.length).toBeLessThan(20_000)
  })
})
