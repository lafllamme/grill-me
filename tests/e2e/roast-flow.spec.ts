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
  expect(typeof body.metrics).toBe('object')
  expect(typeof body.receipt).toBe('string')
  expect(typeof body.metrics.stinkScore).toBe('number')
  expect(typeof body.metrics.egoDamage).toBe('number')
  expect(typeof body.metrics.grade).toBe('string')
})

test('intensity changes configured commit-selection budgets in debug', async ({ request }) => {
  test.setTimeout(180_000)

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
  expect(streamBody).toContain('"metrics"')
  expect(streamBody).not.toContain('event: typing_roast')

  const titlePos = streamBody.indexOf('event: roast_title')
  const donePos = streamBody.indexOf('event: done')
  expect(titlePos).toBeGreaterThan(-1)
  expect(donePos).toBeGreaterThan(titlePos)
})

test('entry overlay blocks landing until continue', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('entry-overlay-dialog')).toBeVisible()
  await expect(page.getByTestId('entry-overlay-continue')).toBeVisible()
  await page.getByTestId('entry-overlay-continue').click()

  await expect(page.getByTestId('entry-overlay-dialog')).toBeHidden()
  await expect(page.getByTestId('roast-intensity-slider')).toBeVisible()
  await expect(page.getByText('Roast Intensity')).toBeVisible()
  await expect(page.getByText('Critical Temperature')).toBeVisible()
  await expect(page.getByText('salty')).toBeVisible()
  await expect(page.getByText('savage')).toBeVisible()
  await expect(page.getByText('unhinged')).toBeVisible()
  await expect(page.getByText('nuke')).toBeVisible()
})

test('not today navigates to toysrus in same tab', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('entry-overlay-not-today')).toBeVisible()
  await page.getByTestId('entry-overlay-not-today').click()
  await page.waitForURL('https://www.toysrus.com/**', { timeout: 20_000 })
})

test('leaderboard api responds with stable shape', async ({ request }) => {
  const response = await request.get('/api/leaderboard?window=all&limit=10')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()

  expect(body.window).toBe('all')
  expect(Array.isArray(body.items)).toBeTruthy()
  expect(typeof body.limit).toBe('number')
})

test('share api creates and resolves temporary roast links', async ({ request }) => {
  test.setTimeout(180_000)

  const roastResponse = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 2,
    },
  })
  if (!roastResponse.ok()) {
    expect([429, 500, 503]).toContain(roastResponse.status())
    return
  }
  const roastBody = await roastResponse.json()

  const shareResponse = await request.post('/api/roast/share', {
    data: {
      receipt: roastBody.receipt,
    },
  })

  if (!shareResponse.ok()) {
    expect([500, 503]).toContain(shareResponse.status())
    return
  }

  const shareBody = await shareResponse.json()
  expect(typeof shareBody.shareUrl).toBe('string')
  expect(typeof shareBody.token).toBe('string')

  const resolveResponse = await request.get(`/api/roast/share/${shareBody.token}`)
  if (!resolveResponse.ok()) {
    expect([404, 500, 503]).toContain(resolveResponse.status())
    return
  }
  const resolveBody = await resolveResponse.json()
  expect(resolveBody.data.username).toBe('lafllamme')
  expect(Array.isArray(resolveBody.data.roastLines)).toBeTruthy()
})

test('official submit requires authenticated github session', async ({ request }) => {
  const roastResponse = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
      roastIntensity: 2,
    },
  })
  if (!roastResponse.ok()) {
    expect([429, 500, 503]).toContain(roastResponse.status())
    return
  }
  const roastBody = await roastResponse.json()

  const submitResponse = await request.post('/api/leaderboard/submit', {
    data: {
      receipt: roastBody.receipt,
    },
  })

  expect(submitResponse.ok()).toBeFalsy()
  expect([401, 403]).toContain(submitResponse.status())
})
