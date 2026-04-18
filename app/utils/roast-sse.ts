import type { RoastStreamEvent } from '~~/shared/roast/contracts'

/**
 * Parses one SSE event block into a typed roast stream event payload.
 */
function parseRoastSseEvent(rawEvent: string): RoastStreamEvent | null {
  const lines = rawEvent.split('\n')
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('data:'))
      dataLines.push(line.slice(5).trim())
  }

  if (dataLines.length === 0)
    return null

  try {
    return JSON.parse(dataLines.join('\n')) as RoastStreamEvent
  }
  catch {
    return null
  }
}

/**
 * Consumes a roast SSE response stream and emits typed events.
 */
export async function consumeRoastSse(response: Response, onEvent: (event: RoastStreamEvent) => void): Promise<void> {
  if (!response.body)
    throw new Error('Stream body is missing')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done)
      break

    buffer += decoder.decode(value, { stream: true })
    const eventBlocks = buffer.split('\n\n')
    buffer = eventBlocks.pop() || ''

    for (const eventBlock of eventBlocks) {
      const event = parseRoastSseEvent(eventBlock)
      if (event)
        onEvent(event)
    }
  }
}
