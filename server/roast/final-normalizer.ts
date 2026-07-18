import type { RoastIntensityProfile } from '../../shared/roast/intensity'
import { getRoastOutputTarget } from '../../shared/roast/intensity'

interface CanonicalRoastStateLike {
  title: string
  roastLines: Map<number, string>
  feedback: Map<number, string>
}

function toOrderedValues(map: Map<number, string>): string[] {
  return [...map.entries()]
    .sort((left, right) => left[0] - right[0])
    .map(([, value]) => value.trim())
    .filter(Boolean)
}

export interface CanonicalRoastOutput {
  title: string
  roastLines: string[]
  feedback: string[]
}

function limitItems(items: string[], maxItems: number): string[] {
  return items
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, maxItems)
}

export function normalizeCanonicalRoastOutput(
  value: CanonicalRoastOutput,
  intensityProfile: RoastIntensityProfile,
): CanonicalRoastOutput {
  const target = getRoastOutputTarget(intensityProfile)

  return {
    title: value.title.trim(),
    roastLines: limitItems(value.roastLines, target.maxRoastLines),
    feedback: limitItems(value.feedback, target.maxFeedbackItems),
  }
}

export function isCanonicalRoastOutputComplete(value: CanonicalRoastOutput): boolean {
  return Boolean(value.title && value.roastLines.length > 0 && value.feedback.length > 0)
}

export function mergeCanonicalRoastOutputs(
  primary: CanonicalRoastOutput,
  secondary: CanonicalRoastOutput,
  intensityProfile: RoastIntensityProfile,
): CanonicalRoastOutput {
  return normalizeCanonicalRoastOutput({
    title: primary.title || secondary.title,
    roastLines: primary.roastLines.length > 0 ? primary.roastLines : secondary.roastLines,
    feedback: primary.feedback.length > 0 ? primary.feedback : secondary.feedback,
  }, intensityProfile)
}

/**
 * Normalizes parser state maps into sorted canonical arrays.
 *
 * @param state NDJSON parser accumulation state.
 * @returns Canonical roast output candidate.
 * @example
 * const canonical = normalizeCanonicalRoastFromNdjson(state)
 * canonical.roastLines[0]
 */
export function normalizeCanonicalRoastFromNdjson(
  state: CanonicalRoastStateLike,
  intensityProfile: RoastIntensityProfile,
): CanonicalRoastOutput {
  return normalizeCanonicalRoastOutput({
    title: state.title.trim(),
    roastLines: toOrderedValues(state.roastLines),
    feedback: toOrderedValues(state.feedback),
  }, intensityProfile)
}

/**
 * Asserts mandatory final contract fields for stream canonical payloads.
 *
 * @throws Error `cloudflare_ai_incomplete_output` when required fields are missing.
 */
export function assertCanonicalRoastOutput(value: CanonicalRoastOutput): void {
  if (!isCanonicalRoastOutputComplete(value)) {
    throw new Error('cloudflare_ai_incomplete_output')
  }
}
