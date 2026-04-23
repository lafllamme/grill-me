import { ROAST_LIMITS, toRoastLines } from '~~/shared/roast/contracts'

interface ParsedRoastContent {
  title: string
  roastLines: string[]
  feedback: string[]
  parserPath: string
}

export interface ParsedModelEnvelope {
  rawText: string
  parserPath: string
}

/**
 * Extracts generated text from multiple Cloudflare/OpenAI-compatible response shapes.
 */
export function extractModelText(payload: any): ParsedModelEnvelope {
  const joinContentArray = (value: unknown): string => {
    if (!Array.isArray(value))
      return ''

    const chunks = value
      .map((item) => {
        if (typeof item === 'string')
          return item
        if (item && typeof item === 'object' && typeof (item as any).text === 'string')
          return String((item as any).text)
        if (item && typeof item === 'object' && typeof (item as any).content === 'string')
          return String((item as any).content)
        return ''
      })
      .filter(Boolean)

    return chunks.join('')
  }

  const candidates: Array<{ path: string, value: unknown }> = [
    { path: 'result.response', value: payload?.result?.response },
    { path: 'result.output_text', value: payload?.result?.output_text },
    { path: 'result.text', value: payload?.result?.text },
    { path: 'result.choices[0].message.content', value: payload?.result?.choices?.[0]?.message?.content },
    { path: 'result.choices[0].delta.content', value: payload?.result?.choices?.[0]?.delta?.content },
    { path: 'result.output[0].content[0].text', value: payload?.result?.output?.[0]?.content?.[0]?.text },
    { path: 'result.output[0].content[0]', value: payload?.result?.output?.[0]?.content?.[0] },
    { path: 'response', value: payload?.response },
    { path: 'output_text', value: payload?.output_text },
    { path: 'text', value: payload?.text },
    { path: 'choices[0].message.content', value: payload?.choices?.[0]?.message?.content },
    { path: 'choices[0].message.content[]', value: joinContentArray(payload?.choices?.[0]?.message?.content) },
    { path: 'choices[0].text', value: payload?.choices?.[0]?.text },
    { path: 'choices[0].delta.content[]', value: joinContentArray(payload?.choices?.[0]?.delta?.content) },
    { path: 'output[0].content[0].text', value: payload?.output?.[0]?.content?.[0]?.text },
    { path: 'output[0].content[0]', value: payload?.output?.[0]?.content?.[0] },
    { path: 'output[0].content[]', value: joinContentArray(payload?.output?.[0]?.content) },
  ]

  for (const candidate of candidates) {
    if (typeof candidate.value === 'string' && candidate.value.trim()) {
      return {
        rawText: candidate.value,
        parserPath: candidate.path,
      }
    }
  }

  return {
    rawText: '',
    parserPath: 'none',
  }
}

function parseJsonCandidate(raw: string): ParsedRoastContent | null {
  const normalized = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim()

  const jsonCandidates = [
    raw,
    normalized,
    (() => {
      const first = raw.indexOf('{')
      const last = raw.lastIndexOf('}')
      return first >= 0 && last > first ? raw.slice(first, last + 1) : ''
    })(),
  ].filter(Boolean)

  for (const candidate of jsonCandidates) {
    try {
      const parsed = JSON.parse(candidate)
      const roastLines = Array.isArray(parsed?.roastLines)
        ? parsed.roastLines.filter((item: unknown) => typeof item === 'string').map((item: string) => item.trim()).filter(Boolean)
        : []
      const feedback = Array.isArray(parsed?.feedback)
        ? parsed.feedback.filter((item: unknown) => typeof item === 'string').map((item: string) => item.trim()).filter(Boolean)
        : []
      const title = typeof parsed?.title === 'string' ? parsed.title.trim() : ''

      const joinedRoast = typeof parsed?.roast === 'string' ? parsed.roast.trim() : ''
      const normalizedRoastLines = roastLines.length > 0 ? roastLines : toRoastLines(joinedRoast)

      if (normalizedRoastLines.length === 0)
        continue

      return {
        title,
        roastLines: normalizedRoastLines,
        feedback,
        parserPath: 'json',
      }
    }
    catch {
      continue
    }
  }

  return null
}

function parseLineCandidate(raw: string): ParsedRoastContent {
  const normalizedRaw = raw.replace(/\r\n/g, '\n')
  const feedbackSplit = normalizedRaw.split(/\n?FEEDBACK:\n?/i)
  const roastSection = feedbackSplit[0] || ''
  const feedbackSection = feedbackSplit.slice(1).join('\n')

  const roastLines = roastSection
    .split(/\n+/)
    .map(line => line.trim())
    .filter(Boolean)

  const feedbackCandidates = [
    ...feedbackSection.split(/\n+/),
    ...normalizedRaw.split(/\n+/),
  ]
  const feedback = feedbackCandidates
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => /^[-*•\d.)]\s+/.test(line))
    .map(line => line.replace(/^[-*•\d.)\s]+/, '').trim())
    .filter(Boolean)

  const title = roastLines[0]?.trim() || ''

  return {
    title,
    roastLines: toRoastLines(roastLines.join('\n')),
    feedback,
    parserPath: 'lines',
  }
}

/**
 * Parses model text into roast lines and feedback bullets with normalization.
 */
export function parseRoastOutput(raw: string): ParsedRoastContent {
  const parsedJson = parseJsonCandidate(raw)
  const parsed = parsedJson ?? parseLineCandidate(raw)

  let remainingWords = ROAST_LIMITS.maxRoastWords
  const roastLines: string[] = []

  for (const line of parsed.roastLines) {
    if (remainingWords <= 0)
      break

    const words = line
      .split(/\s+/)
      .filter(Boolean)

    if (words.length === 0)
      continue

    const limitedLineWords = words.slice(0, remainingWords)
    roastLines.push(limitedLineWords.join(' '))
    remainingWords -= limitedLineWords.length
  }

  const feedback = parsed.feedback.slice(0, ROAST_LIMITS.maxFeedbackItems)
  const title = parsed.title || roastLines[0] || ''

  return {
    title: title.trim(),
    roastLines: toRoastLines(roastLines.join('\n')),
    feedback,
    parserPath: parsed.parserPath,
  }
}

/**
 * Ensures response shape remains normalized without synthetic fallback content.
 */
export function normalizeRoastParts(parsed: ParsedRoastContent): { title: string, roastLines: string[], feedback: string[] } {
  const feedback = parsed.feedback.slice(0, ROAST_LIMITS.maxFeedbackItems)
  return {
    title: parsed.title.trim(),
    roastLines: parsed.roastLines,
    feedback,
  }
}
