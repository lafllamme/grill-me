import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { readRoastSseStream } from './helpers/roast-sse'

const TEST_USERNAME = 'lafllamme'

function getBaseUrl(): string {
  return process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:4173'
}

async function getOptionalText(page: Page, testId: string): Promise<string> {
  const locator = page.getByTestId(testId)
  const count = await locator.count()
  if (count === 0)
    return ''

  return (await locator.first().textContent() || '').trim()
}

test('api roast stream progressively emits structured roast events for lafllamme', async () => {
  test.setTimeout(180_000)

  const events = await readRoastSseStream(getBaseUrl(), {
    githubUsername: TEST_USERNAME,
    debugLevel: 'minimal',
    roastIntensity: 2,
  })

  const eventNames = events.map(event => event.eventName)
  const typedEvents = events.map(event => event.data as Record<string, any>)
  const errorEvent = typedEvents.find(event => event.type === 'error')

  expect(eventNames).toContain('meta')
  expect(eventNames).toContain('status')

  expect(errorEvent, `Unexpected stream error for ${TEST_USERNAME}: ${JSON.stringify({
    eventNames,
    tail: typedEvents.slice(-5),
  }, null, 2)}`).toBeUndefined()

  expect(eventNames).toContain('roast_title')
  expect(eventNames).toContain('roast_line')
  expect(eventNames).toContain('feedback_item')
  expect(eventNames).toContain('done')

  const firstContentIndex = eventNames.findIndex(name =>
    name === 'roast_title' || name === 'roast_line' || name === 'feedback_item',
  )
  const doneIndex = eventNames.findIndex(name => name === 'done')

  expect(firstContentIndex).toBeGreaterThan(-1)
  expect(doneIndex).toBeGreaterThan(firstContentIndex)
})

test('browser roast flow for lafllamme does not leave a persistent stream error behind', async ({ page }) => {
  test.setTimeout(120_000)

  await page.route('**/api/roast/stream', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      headers: {
        'Cache-Control': 'no-cache',
      },
      body: [
        { type: 'meta', requestId: 'roast-stream-e2e', username: TEST_USERNAME },
        { type: 'status', phase: 'fetching_github', message: 'Reading public GitHub activity' },
        { type: 'status', phase: 'selecting_evidence', message: 'Selecting the commits that earned this' },
        { type: 'roast_title', title: 'Abstraction Witness Protection' },
        { type: 'roast_line', index: 0, text: 'You did not remove complexity. You gave it aliases.' },
      ].map(event => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`).join(''),
    })
  })

  await page.goto('/')
  await expect(page.getByTestId('landing-entrance-preloader')).toBeHidden({ timeout: 10_000 })

  const usernameInput = page.getByTestId('test-2-username-input')
  const submitButton = page.getByTestId('test-2-submit-button')

  await expect(usernameInput).toBeEditable({ timeout: 10_000 })
  await usernameInput.click()
  await usernameInput.fill('')
  await usernameInput.pressSequentially(TEST_USERNAME)
  await expect(usernameInput).toHaveValue(TEST_USERNAME)
  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  await expect.poll(async () => {
    const liveStage = await getOptionalText(page, 'test-2-live-roast')
    const title = await getOptionalText(page, 'test-2-roast-title')
    const error = await getOptionalText(page, 'test-2-roast-error')

    return {
      isReady: liveStage.includes('Public trail for @lafllamme'),
      hasTitle: title.includes('Abstraction Witness Protection'),
      error: error.trim(),
    }
  }, {
    timeout: 90_000,
    intervals: [500, 1000, 2000],
    message: 'Expected visible progressive roast content without a persistent stream error',
  }).toMatchObject({
    isReady: true,
    hasTitle: true,
    error: '',
  })

  await expect(page.getByTestId('test-2-live-roast')).toContainText('You did not remove complexity. You gave it aliases.')
  await expect(page.getByTestId('test-2-roast-error')).toHaveCount(0)
})
