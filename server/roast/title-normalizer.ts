import type { RoastMeta } from '~~/shared/roast/contracts'
import type { RoastIntensityProfile } from '~~/shared/roast/intensity'
import { ROAST_TITLE_POLICY } from './title-policy'

interface TitleContext {
  username: string
  roastLines: string[]
  meta: RoastMeta
  intensityProfile: RoastIntensityProfile
}

export interface NormalizedTitleResult {
  title: string
  normalized: boolean
  reasons: string[]
}

function stripSummaryPrefix(value: string): { value: string, changed: boolean } {
  const lower = value.toLowerCase()
  const prefix = ROAST_TITLE_POLICY.disallowedSummaryPrefixes.find(item => lower.startsWith(item))
  if (!prefix)
    return { value, changed: false }

  return {
    value: value.slice(prefix.length).trim(),
    changed: true,
  }
}

function sanitizeWhitespace(value: string): string {
  return value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, '\'')
    .replace(/\s+/g, ' ')
    .trim()
}

function removeMildInsults(value: string): { value: string, changed: boolean } {
  let next = value
  let changed = false

  for (const token of ROAST_TITLE_POLICY.mildInsultDenylist) {
    const pattern = new RegExp(`\\b${token}\\b`, 'gi')
    if (pattern.test(next)) {
      next = next.replace(pattern, 'shipper')
      changed = true
    }
  }

  return { value: sanitizeWhitespace(next), changed }
}

function words(value: string): string[] {
  return value.split(/\s+/).filter(Boolean)
}

function clampWordCount(value: string): { value: string, changed: boolean } {
  const tokens = words(value)
  if (tokens.length <= ROAST_TITLE_POLICY.maxWords)
    return { value, changed: false }

  const clamped = tokens.slice(0, ROAST_TITLE_POLICY.maxWords).join(' ')
  return { value: clamped, changed: true }
}

function ensureMinWords(value: string, context: TitleContext): { value: string, changed: boolean } {
  const tokens = words(value)
  if (tokens.length >= ROAST_TITLE_POLICY.minWords)
    return { value, changed: false }

  const commitCount = context.meta.selectedCommitCount || context.meta.commitCount
  const prefixIndex = Math.max(0, (context.intensityProfile.level - 1) % ROAST_TITLE_POLICY.fallbackPrefixes.length)
  const prefix = ROAST_TITLE_POLICY.fallbackPrefixes[prefixIndex]
  const fallback = `${prefix} ${context.username} shipped ${commitCount} commits?`

  return {
    value: fallback,
    changed: true,
  }
}

/**
 * Normalizes model-generated roast titles to the product contract:
 * hook line, spicy-clean, 6-12 words where possible.
 */
export function normalizeRoastTitle(title: string, context: TitleContext): NormalizedTitleResult {
  const reasons: string[] = []
  let normalized = sanitizeWhitespace(title)

  const stripped = stripSummaryPrefix(normalized)
  if (stripped.changed)
    reasons.push('stripped_summary_prefix')
  normalized = stripped.value

  const filtered = removeMildInsults(normalized)
  if (filtered.changed)
    reasons.push('removed_mild_insult')
  normalized = filtered.value

  const clamped = clampWordCount(normalized)
  if (clamped.changed)
    reasons.push('clamped_max_words')
  normalized = clamped.value

  const minWords = ensureMinWords(normalized, context)
  if (minWords.changed)
    reasons.push('enforced_min_words')
  normalized = minWords.value

  return {
    title: sanitizeWhitespace(normalized),
    normalized: reasons.length > 0,
    reasons,
  }
}
