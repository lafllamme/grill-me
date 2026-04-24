import { expect, test } from '@playwright/test'

test('sync roast api responds with canonical fields', async ({ request }) => {
  const response = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 4,
    },
  })

  expect(response.ok()).toBeTruthy()
  const body = await response.json()

  expect(body.username).toBe('lafllamme')
  expect(typeof body.title).toBe('string')
  expect(Array.isArray(body.roastLines)).toBeTruthy()
  expect(Array.isArray(body.feedback)).toBeTruthy()
  expect(typeof body.roast).toBe('string')
})

test('intensity changes configured commit-selection budgets in debug', async ({ request }) => {
  const lowResponse = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 1,
    },
  })
  const highResponse = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 4,
    },
  })

  expect(lowResponse.ok()).toBeTruthy()
  expect(highResponse.ok()).toBeTruthy()

  const lowBody = await lowResponse.json()
  const highBody = await highResponse.json()

  expect(lowBody.debug.selectionSummary.configuredMaxCommitRefs).toBe(6)
  expect(lowBody.debug.selectionSummary.configuredMaxSelectedCommits).toBe(4)
  expect(highBody.debug.selectionSummary.configuredMaxCommitRefs).toBe(18)
  expect(highBody.debug.selectionSummary.configuredMaxSelectedCommits).toBe(12)
  expect(highBody.debug.intensityProfile.aiMaxTokens).toBeGreaterThan(lowBody.debug.intensityProfile.aiMaxTokens)
})

test('stream roast api emits SSE envelope', async ({ request }) => {
  const response = await request.post('/api/roast/stream', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 3,
    },
  })

  expect(response.ok()).toBeTruthy()
  const streamBody = await response.text()

  expect(streamBody).toContain('event: meta')
  expect(streamBody).toContain('event: status')
  expect(streamBody).toContain('event: roast_title')
  expect(streamBody).toContain('event: roast_line')
  expect(streamBody).toContain('event: feedback_item')
  expect(streamBody).toContain('event: done')
  expect(streamBody).not.toContain('event: typing_roast')

  const titlePos = streamBody.indexOf('event: roast_title')
  const donePos = streamBody.indexOf('event: done')
  expect(titlePos).toBeGreaterThan(-1)
  expect(donePos).toBeGreaterThan(titlePos)
})

test('ui renders roast intensity slider and levels', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('roast-intensity-slider')).toBeVisible()
  await expect(page.getByText('Roast Intensity')).toBeVisible()
  await expect(page.getByText('Critical Temperature')).toBeVisible()
  await expect(page.getByText('salty')).toBeVisible()
  await expect(page.getByText('savage')).toBeVisible()
  await expect(page.getByText('unhinged')).toBeVisible()
  await expect(page.getByText('nuke')).toBeVisible()
})
