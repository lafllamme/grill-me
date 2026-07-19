import { expect, test } from '@playwright/test'

function createSseBody(events: Record<string, unknown>[]): string {
  return events
    .map(event => `data: ${JSON.stringify(event)}\n\n`)
    .join('')
}

test('first rebrand direction stays focused and avoids mobile overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/test-1')

  await expect(page.getByRole('heading', { name: 'Your code remembers.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: /your abstractions need adult supervision/i })).toBeVisible()
  await expect(page.getByLabel('GitHub username')).toHaveValue('lafllamme')
  const viewportMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(viewportMetrics).toEqual({
    clientWidth: 390,
    scrollWidth: 390,
  })
})

test('second rebrand direction exposes target, analysis, and result as separate stages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/test-2')

  await expect(page.getByRole('heading', { name: 'Your code remembers.' })).toBeVisible()
  await expect(page.getByLabel('Public GitHub username')).toHaveValue('lafllamme')
  await page.getByTestId('test-2-intensity-trigger').click()
  await page.getByTestId('test-2-intensity-3').click()
  await expect(page.getByTestId('test-2-intensity-trigger')).toContainText('Medium')
  await expect(page.getByRole('heading', { name: 'The wait should say something.' })).toBeAttached()
  await expect(page.getByText(/You didn.t remove complexity/)).toBeAttached()

  const viewportMetrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))

  expect(viewportMetrics).toEqual({
    clientWidth: 390,
    scrollWidth: 390,
  })
})

test('second rebrand direction scrolls into a streamed roast experience', async ({ page }) => {
  await page.route('**/api/roast/stream', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'Cache-Control': 'no-cache',
      },
      body: createSseBody([
        { type: 'meta', requestId: 'rebrand-e2e', username: 'lafllamme' },
        { type: 'status', phase: 'fetching_github', message: 'Reading public GitHub activity' },
        { type: 'status', phase: 'selecting_evidence', message: 'Selecting the commits that earned this' },
        { type: 'status', phase: 'calling_ai', message: 'Writing the roast from verified evidence' },
        { type: 'roast_title', title: 'Abstraction Witness Protection' },
        { type: 'roast_line', index: 0, text: 'You did not remove complexity. You gave it aliases.' },
        { type: 'feedback_item', index: 0, text: 'Delete the wrapper before naming the next one.' },
      ]),
    })
  })

  await page.goto('/test-2')
  await page.getByTestId('test-2-submit-button').click()

  const liveStage = page.getByTestId('test-2-live-roast')
  await expect(liveStage).toBeVisible()
  await expect(page.getByTestId('test-2-roast-title')).toHaveText('Abstraction Witness Protection')
  await expect(liveStage).toContainText('You did not remove complexity. You gave it aliases.')
  await expect(liveStage).toContainText('Delete the wrapper before naming the next one.')
  await expect(page.getByTestId('test-2-roast-error')).toHaveCount(0)

  await expect.poll(async () => liveStage.evaluate(element => Math.abs(element.getBoundingClientRect().top)), {
    timeout: 5_000,
  }).toBeLessThan(24)
})
