import type { DashboardProfileStreamEvent } from '~~/shared/dashboard/contracts'

function parseDashboardSseEvent(rawEvent: string): DashboardProfileStreamEvent | null {
  const dataLines = rawEvent
    .split('\n')
    .filter(line => line.startsWith('data:'))
    .map(line => line.slice(5).trim())

  if (!dataLines.length)
    return null

  try {
    return JSON.parse(dataLines.join('\n')) as DashboardProfileStreamEvent
  }
  catch {
    return null
  }
}

export async function consumeDashboardProfileSse(
  response: Response,
  onEvent: (event: DashboardProfileStreamEvent) => void,
): Promise<void> {
  if (!response.body)
    throw new Error('Dashboard stream body is missing')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const consumeBlocks = (flush = false): void => {
    const blocks = buffer.split('\n\n')
    buffer = flush ? '' : blocks.pop() || ''

    for (const block of blocks) {
      const event = parseDashboardSseEvent(block)
      if (event)
        onEvent(event)
    }
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    buffer += decoder.decode(value, { stream: true })
    consumeBlocks()
  }

  buffer += decoder.decode()
  if (buffer.trim()) {
    buffer += '\n\n'
    consumeBlocks(true)
  }
}

export async function requestDashboardProfileStream(
  username: string,
  onEvent: (event: DashboardProfileStreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch('/api/dashboard-profile/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
    signal,
  })

  if (!response.ok) {
    let message = `Dashboard stream request failed (${response.status})`
    try {
      const rawBody = await response.text()
      const payload = JSON.parse(rawBody) as {
        error?: { message?: unknown } | string
        message?: unknown
        statusMessage?: unknown
      }
      const errorMessage = typeof payload.error === 'string'
        ? payload.error
        : typeof payload.error?.message === 'string' ? payload.error.message : undefined
      message = errorMessage
        ?? (typeof payload.message === 'string' ? payload.message : undefined)
        ?? (typeof payload.statusMessage === 'string' ? payload.statusMessage : undefined)
        ?? message
    }
    catch {
      // Keep the status-based message when the error body is not JSON.
    }
    throw new Error(message)
  }

  await consumeDashboardProfileSse(response, onEvent)
}
