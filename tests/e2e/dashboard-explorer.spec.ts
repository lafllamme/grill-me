import { expect, test } from '@playwright/test'

test.describe('dashboard explorer analysis states', () => {
  test('shows the mock dashboard before a live request', async ({ page }) => {
    await page.goto('/dashboard-explorer')

    await expect(page.locator('[data-analysis-phase="idle"]')).toBeVisible()
    await expect(page.getByText('Profile', { exact: true })).toBeVisible()
    await expect(page.getByTestId('dashboard-analysis-state')).toHaveCount(0)
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
      aiReview: { confidence: 60, status: 'assessed', selectedCommitCount: 2, patchCount: 2, patchChars: 1200 },
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
            controller.enqueue(encode({ type: 'deterministic_scores', assessment: deterministic }))
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
    await expect(page.locator('.legend-container')).toHaveCount(0)

    await expect(page.getByTestId('dashboard-analysis-state')).toHaveCount(0)
    const complexityRow = page.locator('.legend-container > div').filter({ hasText: 'Complexity' })
    await expect(complexityRow).toContainText('80')
    await expect(complexityRow).not.toContainText('76')
  })
})
