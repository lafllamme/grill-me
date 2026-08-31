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
})
