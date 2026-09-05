import { expect, test } from '@playwright/test'

test.describe('dashboard explorer analysis states', () => {
  test('shows the mock dashboard before a live request', async ({ page }) => {
    await page.goto('/dashboard-explorer')

    await expect(page.locator('[data-analysis-phase="idle"]')).toBeVisible()
    await expect(page.getByText('Profile', { exact: true })).toBeVisible()
    await expect(page.getByTestId('dashboard-analysis-state')).toHaveCount(0)
  })

  test('previews the loading layout without starting an API request', async ({ page }) => {
    let analysisRequestCount = 0
    page.on('request', (request) => {
      if (request.url().endsWith('/api/dashboard-profile/stream'))
        analysisRequestCount += 1
    })

    await page.goto('/dashboard-explorer')
    // Wait for the chart-heavy page to hydrate before exercising the local
    // preview control.
    await page.waitForTimeout(2000)
    await page.getByTestId('dashboard-loading-preview-toggle').click()

    await expect(page.getByTestId('dashboard-analysis-state')).toHaveAttribute('data-state', 'loading')
    await expect(page.getByTestId('dashboard-loading-grid')).toBeVisible()
    const profileLoadingCard = page.getByTestId('dashboard-loading-card-profile')
    await expect(profileLoadingCard).toContainText('lafllamme')
    await expect(profileLoadingCard).toContainText('Finding the public trail')
    await expect(profileLoadingCard).not.toContainText('01 / GitHub pass')
    await expect(profileLoadingCard).not.toContainText('github pass · live')
    const loadingProgress = page.getByTestId('dashboard-loading-progress')
    const collectionSummary = profileLoadingCard.getByTestId('dashboard-loading-collection-summary')
    await expect(loadingProgress).toHaveAttribute('style', /width: 8%/)
    await expect(collectionSummary).toHaveText('2 repos  /  4 commits  /  0 patches', { timeout: 3500 })
    await expect(loadingProgress).toHaveAttribute('style', /width: 36%/)
    await expect(collectionSummary).toHaveText('3 repos  /  12 commits  /  6 patches', { timeout: 3500 })
    await expect(loadingProgress).toHaveAttribute('style', /width: 62%/)
    await expect(page.getByRole('button', { name: 'Exit loading preview' })).toBeVisible()
    expect(analysisRequestCount).toBe(0)

    await expect(page.getByTestId('dashboard-analysis-state')).toHaveCount(0, { timeout: 8000 })
    await expect(page.getByRole('button', { name: 'Preview loading state' })).toBeVisible()
    expect(analysisRequestCount).toBe(0)
  })

  test('uses an honest loading state and exposes a retryable error', async ({ page }) => {
    await page.goto('/dashboard-explorer', { waitUntil: 'domcontentloaded' })
    // The dashboard page includes a large client-side chart surface. Give Nuxt
    // enough time to hydrate the form before exercising its event.
    await page.waitForTimeout(2000)
    await page.route('**/api/dashboard-profile/stream', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 250))
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: { code: 'simulated_failure', message: 'Simulated dashboard failure' } }),
      })
    })

    await page.getByRole('button', { name: 'Analyze live' }).click()
    await expect(page.getByTestId('dashboard-analysis-state')).toHaveAttribute('data-state', 'loading')
    await expect(page.getByTestId('dashboard-loading-grid')).toBeVisible()
    await expect(page.getByTestId('dashboard-loading-card-profile')).toBeVisible()
    await expect(page.getByTestId('dashboard-analysis-state')).toHaveAttribute('data-state', 'error')
    await expect(page.getByTestId('dashboard-analysis-state')).toContainText('Simulated dashboard failure')
    await expect(page.getByRole('button', { name: 'Retry analysis' })).toBeVisible()
  })

  test('keeps deterministic scores out of the dashboard until the final stream event', async ({ page }) => {
    const deterministicAssessment = {
      version: 'v2',
      username: 'lafllamme',
      scores: { clarity: 77, safety: 66, workflow: 68, complexity: 76, context: 82 },
      overallScore: 74,
      grade: 'C',
      role: 'Unclassified',
      roleCandidates: ['Unclassified'],
      roleStatus: 'unclassified',
      derivedMetrics: { commitCount: 18, changedFiles: 107 },
      confidence: 100,
      aiAdjustments: {},
      evidenceWindow: { commitCount: 18, pullRequestCount: 0, source: 'github-public-activity' },
    }
    const finalAssessment = {
      ...deterministicAssessment,
      scores: { ...deterministicAssessment.scores, complexity: 80 },
      overallScore: 75,
      aiAdjustments: { complexity: 4 },
      aiReview: {
        confidence: 86,
        status: 'assessed',
        selectedCommitCount: 2,
        patchCount: 2,
        patchChars: 1200,
        axisReviews: [{
          axis: 'clarity',
          verdict: 'supports',
          confidence: 86,
          summary: 'The visible patches keep names and local structure readable.',
          evidence: [{ commitSha: 'commit-1', filename: 'app/profile.ts', observation: 'The state names explain the data flow.' }],
        }],
      },
    }

    await page.addInitScript(({ deterministic, final }) => {
      const originalFetch = window.fetch.bind(window)
      window.fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof Request ? input.url : ''
        if (!url.endsWith('/api/dashboard-profile/stream'))
          return originalFetch(input, init)

        const encoder = new TextEncoder()
        const encode = (event: unknown) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encode({ type: 'status', phase: 'collecting-github', message: 'Collecting public GitHub evidence...' }))
            controller.enqueue(encode({
              type: 'github_progress',
              phase: 'commits',
              message: 'Commit evidence is ready for scoring.',
              counts: { repositories: 2, candidateCommits: 12, enrichedCommits: 12, usablePatches: 6, associatedPullRequests: 0, checkSummaries: 0 },
            }))
            setTimeout(() => {
              controller.enqueue(encode({ type: 'status', phase: 'reviewing-ai', message: 'Reviewing selected patch evidence with AI...' }))
              controller.enqueue(encode({ type: 'deterministic_scores', assessment: deterministic }))
            }, 300)
            setTimeout(() => {
              controller.enqueue(encode({
                type: 'done',
                data: { assessment: final, evidence: { commits: [], pullRequests: [], repositories: [] } },
              }))
              controller.close()
            }, 1200)
          },
        })

        return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })
      }
    }, { deterministic: deterministicAssessment, final: finalAssessment })

    await page.goto('/dashboard-explorer', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)
    await page.getByRole('button', { name: 'Analyze live' }).click()

    await expect(page.getByTestId('dashboard-analysis-state')).toHaveAttribute('data-state', 'loading')
    const profileLoadingCard = page.getByTestId('dashboard-loading-card-profile')
    await expect(profileLoadingCard).toContainText('Checking the selected patches')
    await expect(profileLoadingCard.getByTestId('dashboard-loading-progress')).toHaveAttribute('style', /width: 84%/)
    await expect(page.locator('.legend-container')).toHaveCount(0)

    await expect(page.getByTestId('dashboard-analysis-state')).toHaveCount(0)
    const complexityRow = page.locator('.legend-container > div').filter({ hasText: 'Complexity' })
    await expect(complexityRow).toContainText('80')
    await expect(complexityRow).not.toContainText('76')
    await expect(page.getByTestId('profile-radar-panel')).not.toContainText('AI second read')
    await expect(page.getByTestId('profile-review-panel')).toContainText('AI second read')
    await expect(page.getByText('The visible patches keep names and local structure readable.')).toBeVisible()
    await expect(page.getByText('app/profile.ts')).toBeVisible()
  })

  test('keeps sunburst drill-down focused without a mouse focus rectangle', async ({ page }) => {
    await page.goto('/dashboard-explorer', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(2000)

    await page.getByRole('button', { name: 'app, 114 changes' }).click()

    await expect(page.getByRole('button', { name: 'Zoom out to Repository' })).toBeVisible()
    await expect(page.locator('.sunburst-center-hub')).toBeVisible()
    await expect(page.locator('path.sunburst-hit-area:focus')).toHaveCount(0)
    const sunburst = page.locator('svg[aria-label="Repository hierarchy sunburst"]')
    await sunburst.click({ position: { x: 8, y: 8 } })
    await expect(sunburst).not.toBeFocused()
    await expect(page.locator('svg[aria-label="Repository hierarchy sunburst"]')).toContainText('dashboard-explorer.vue')
  })
})
