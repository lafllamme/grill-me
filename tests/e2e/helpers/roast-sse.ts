export interface TimedSseEvent<T = unknown> {
  eventName: string
  data: T
  receivedAtMs: number
}

function parseSseBlock(block: string): TimedSseEvent | null {
  const lines = block.split('\n')
  let eventName = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('event:'))
      eventName = line.slice(6).trim()

    if (line.startsWith('data:'))
      dataLines.push(line.slice(5).trim())
  }

  if (dataLines.length === 0)
    return null

  try {
    return {
      eventName,
      data: JSON.parse(dataLines.join('\n')),
      receivedAtMs: Date.now(),
    }
  }
  catch {
    return null
  }
}

export async function readRoastSseStream(baseUrl: string, body: Record<string, unknown>): Promise<TimedSseEvent[]> {
  const response = await fetch(`${baseUrl}/api/roast/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok)
    throw new Error(`Stream request failed (${response.status})`)

  if (!response.body)
    throw new Error('Stream body missing')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  const events: TimedSseEvent[] = []
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      const parsed = parseSseBlock(block)
      if (parsed)
        events.push(parsed)
    }
  }

  if (buffer.trim()) {
    const parsed = parseSseBlock(buffer)
    if (parsed)
      events.push(parsed)
  }

  return events
}
