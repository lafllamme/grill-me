import { expect, test } from '@playwright/test'

test('sync roast api responds with canonical fields', async ({ request }) => {
  const response = await request.post('/api/roast', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
    },
  })

  expect(response.ok()).toBeTruthy()
  const body = await response.json()

  expect(body.username).toBe('lafllamme')
  expect(Array.isArray(body.roastLines)).toBeTruthy()
  expect(Array.isArray(body.feedback)).toBeTruthy()
  expect(typeof body.roast).toBe('string')
})

test('stream roast api emits SSE envelope', async ({ request }) => {
  const response = await request.post('/api/roast/stream', {
    data: {
      githubUsername: 'lafllamme',
      debugLevel: 'minimal',
    },
  })

  expect(response.ok()).toBeTruthy()
  const streamBody = await response.text()

  expect(streamBody).toContain('event: meta')
  expect(streamBody).toContain('event: done')
})
