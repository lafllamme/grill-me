import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import { ROAST_LIMITS, toRoastLines } from '~~/shared/roast/contracts'
import { getRoastOutputTarget } from '~~/shared/roast/intensity'

interface ParsedRoastContent {
  title: string
  roastLines: string[]
  feedback: string[]
  parserPath: string
}

function modelContentToText(value: unknown): string {
  if (typeof value === 'string')
    return value

  if (Array.isArray(value))
    return value.map(modelContentToText).filter(Boolean).join('')

  if (value && typeof value === 'object') {
    const content = value as Record<string, unknown>
    for (const key of ['text', 'content', 'output_text', 'value']) {
      const nested = modelContentToText(content[key])
      if (nested)
        return nested
    }

    if ('confidence' in content || 'findings' in content || 'roastLines' in content || 'feedback' in content)
      return JSON.stringify(content)
  }

  return ''
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
    return Array.isArray(value) ? modelContentToText(value) : ''
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
    const text = modelContentToText(candidate.value)
    if (text.trim()) {
      return {
        rawText: text,
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

      return {
        title,
        roastLines,
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

/**
 * Parses model text into strict structured roast output.
 *
 * @remarks
 * This parser is intentionally JSON-first to keep contract behavior deterministic.
 * No marker-based textual fallback is used in the product stream path.
 *
 * @param raw Raw model output text.
 * @returns Parsed structured roast content or `unparseable` sentinel shape.
 * @example
 * const parsed = parseRoastOutput('{\"title\":\"X\",\"roastLines\":[\"a\"],\"feedback\":[\"b\"]}')
 */
export function parseRoastOutput(raw: string, intensityProfile: RoastIntensityProfile): ParsedRoastContent {
  const parsed = parseJsonCandidate(raw)
  if (!parsed) {
    return {
      title: '',
      roastLines: [],
      feedback: [],
      parserPath: 'unparseable',
    }
  }

  const target = getRoastOutputTarget(intensityProfile)
  let remainingWords = ROAST_LIMITS.maxRoastWords
  const roastLines: string[] = []

  for (const line of parsed.roastLines) {
    if (remainingWords <= 0 || roastLines.length >= target.maxRoastLines)
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

  const feedback = parsed.feedback.slice(0, target.maxFeedbackItems)

  return {
    title: parsed.title,
    roastLines: toRoastLines(roastLines.join('\n')),
    feedback,
    parserPath: parsed.parserPath,
  }
}
