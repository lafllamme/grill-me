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

  await page.goto('/')
  await page.getByTestId('entry-overlay-continue').click()
  await expect(page.getByTestId('entry-overlay-dialog')).toBeHidden({ timeout: 10_000 })

  const usernameInput = page.getByTestId('roast-username-input')
  const submitButton = page.getByTestId('roast-submit-button')

  await expect(usernameInput).toBeEditable()
  await usernameInput.click()
  await usernameInput.fill('')
  await usernameInput.pressSequentially(TEST_USERNAME)
  await expect(usernameInput).toHaveValue(TEST_USERNAME)
  await expect(submitButton).toBeEnabled()
  await submitButton.click()

  await expect(page.getByTestId('roast-terminal')).toContainText('Fetching GitHub activity and commit diffs...', {
    timeout: 30_000,
  })

  await expect.poll(async () => {
    const sessionState = await getOptionalText(page, 'roast-session-state')
    const title = await getOptionalText(page, 'roast-title')
    const lines = await getOptionalText(page, 'roast-lines')
    const error = await getOptionalText(page, 'roast-stream-error')

    return {
      isReady: sessionState.includes('[live]') || sessionState.includes('[done]'),
      hasTitle: !title.includes('Awaiting roast title') && title.trim().length > 0,
      hasLines: lines.trim().length > 0,
      error: error.trim(),
    }
  }, {
    timeout: 90_000,
    intervals: [500, 1000, 2000],
    message: 'Expected visible progressive roast content without a persistent stream error',
  }).toMatchObject({
    isReady: true,
    hasTitle: true,
    hasLines: true,
    error: '',
  })

  await expect(page.getByTestId('roast-title')).not.toContainText('Awaiting roast title...', {
    timeout: 30_000,
  })
  await expect(page.getByTestId('roast-lines')).toContainText(/.+/, {
    timeout: 30_000,
  })
  await expect(page.getByTestId('roast-stream-error')).toHaveCount(0)
})
