import type { GithubCommit, GithubContext } from '../../server/roast/github-collector'
import { describe, expect, it, vi } from 'vitest'
import { runAiSync } from '../../server/roast/ai-client'
import { assessDashboardProfileWithAi, buildDashboardReviewPrompt, parseDashboardReview, toDashboardAiSafetyAssessment } from '../../server/roast/dashboard-ai-scoring'
import { selectDashboardPatchEvidence } from '../../server/roast/dashboard-patch-selection'

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

    expect(result).toMatchObject({ status: 'assessed', confidence: 82, responsePath: 'choices[0].message.reasoning' })
    expect(result.findings).toHaveLength(1)
  })

  it('parses grounded multi-axis findings and maps safety vocabulary', () => {
    const parsed = parseDashboardReview(JSON.stringify({
      confidence: 84,
      findings: [
        { axis: 'safety', verdict: 'positive', impact: 'introduced', severity: 'low', category: 'validation', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'input is validated before processing' },
        { axis: 'clarity', verdict: 'negative', impact: 'introduced', severity: 'low', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'the changed name hides the value meaning' },
      ],
    }))

    expect(parsed).toMatchObject({ confidence: 84, findings: [{ axis: 'safety' }, { axis: 'clarity' }] })

    const safety = toDashboardAiSafetyAssessment({
      ...parsed!,
      status: 'assessed',
      selectedCommitCount: 1,
      patchCount: 1,
      patchChars: 17,
    })
    expect(safety.signals[0]).toMatchObject({ category: 'validation', verdict: 'safe', impact: 'introduced' })
  })

  it('rejects a safety finding without a valid safety category', () => {
    expect(parseDashboardReview(JSON.stringify({
      confidence: 80,
      findings: [{ axis: 'safety', verdict: 'negative', impact: 'introduced', severity: 'high', commitSha: 'abcdef1', filename: 'src/validation.ts', evidence: 'unsafe change' }],
    }))).toBeNull()
  })

  it('keeps repository metadata scoped and the prompt within the patch budget', () => {
    const sample = context([
      commit(),
      commit({ sha: '123456789abc', committedAt: '2026-08-02T00:00:00Z', files: [{ filename: 'README.md', status: 'modified', additions: 3, deletions: 0, patch: '+ explains the profile contract' }] }),
    ])
    const selection = selectDashboardPatchEvidence(sample)
    const prompt = buildDashboardReviewPrompt(sample, selection)

    expect(prompt).toContain('README.md')
    expect(prompt).not.toContain('999')
    expect(prompt.length).toBeLessThan(20_000)
  })
})
