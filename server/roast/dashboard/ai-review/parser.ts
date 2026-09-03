import type { DashboardAiAxisReview, DashboardAiAxisReviewVerdict, DashboardAiReviewAssessment, DashboardAiReviewEvidence, DashboardAiReviewFinding, DashboardAiSafetyAssessment, DashboardReviewAxis, DashboardReviewVerdict, DashboardSafetyCategory, DashboardSafetyImpact, DashboardSafetyRiskScope, DashboardSafetySeverity, DashboardSafetySignal, DashboardSafetyVerdict } from './types'
import { clamp } from '../shared/math'
import { AI_REVIEW_PARSER_LIMITS } from './constants'

const ALLOWED_SEVERITIES = new Set<DashboardSafetySeverity>(['low', 'medium', 'high'])
const ALLOWED_VERDICTS = new Set<DashboardSafetyVerdict>(['safe', 'risk', 'unclear'])
const ALLOWED_IMPACTS = new Set<DashboardSafetyImpact>(['introduced', 'fixed', 'unclear'])
const ALLOWED_CATEGORIES = new Set<DashboardSafetyCategory>(['validation', 'auth', 'error-handling', 'secrets', 'dependency'])
const ALLOWED_RISK_SCOPES = new Set<DashboardSafetyRiskScope>(['production', 'test', 'docs', 'generated', 'unknown'])
const ALLOWED_REVIEW_AXES = new Set<DashboardReviewAxis>(['clarity', 'safety', 'workflow', 'complexity', 'context'])
const ALLOWED_REVIEW_VERDICTS = new Set<DashboardReviewVerdict>(['positive', 'mixed', 'negative', 'unclear'])
const ALLOWED_AXIS_REVIEW_VERDICTS = new Set<DashboardAiAxisReviewVerdict>(['supports', 'softens', 'contradicts', 'insufficient'])

export function parseSignal(item: unknown): DashboardSafetySignal | null {
  if (!item || typeof item !== 'object')
    return null

  const signal = item as Record<string, unknown>
  const category = typeof signal.category === 'string' ? signal.category : ''
  const verdict = typeof signal.verdict === 'string' ? signal.verdict : ''
  const impact = typeof signal.impact === 'string' ? signal.impact : ''
  const severity = typeof signal.severity === 'string' ? signal.severity : ''
  const commitSha = typeof signal.commitSha === 'string' ? signal.commitSha.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxCommitShaCharacters) : ''
  const filename = typeof signal.filename === 'string' ? signal.filename.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxFilenameCharacters) : undefined
  const riskScope = typeof signal.riskScope === 'string' && ALLOWED_RISK_SCOPES.has(signal.riskScope as DashboardSafetyRiskScope)
    ? signal.riskScope as DashboardSafetyRiskScope
    : undefined
  const evidence = typeof signal.evidence === 'string' ? signal.evidence.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxEvidenceCharacters) : ''

  if (!ALLOWED_CATEGORIES.has(category as DashboardSafetyCategory)
    || !ALLOWED_VERDICTS.has(verdict as DashboardSafetyVerdict)
    || !ALLOWED_IMPACTS.has(impact as DashboardSafetyImpact)
    || !ALLOWED_SEVERITIES.has(severity as DashboardSafetySeverity)
    || !commitSha
    || !evidence) {
    return null
  }

  return {
    category: category as DashboardSafetyCategory,
    verdict: verdict as DashboardSafetyVerdict,
    impact: impact as DashboardSafetyImpact,
    severity: severity as DashboardSafetySeverity,
    commitSha,
    ...(filename ? { filename } : {}),
    ...(riskScope ? { riskScope } : {}),
    evidence,
  }
}

export function parseSafetyAssessment(rawText: string): Pick<DashboardAiSafetyAssessment, 'confidence' | 'signals'> | null {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const jsonCandidates = [cleaned]
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart >= 0 && jsonEnd > jsonStart)
    jsonCandidates.push(cleaned.slice(jsonStart, jsonEnd + 1))

  for (const candidate of jsonCandidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      if (typeof parsed.confidence !== 'number' || !Number.isFinite(parsed.confidence) || !Array.isArray(parsed.signals))
        continue

      const parsedSignals = parsed.signals.map(parseSignal)
      if (parsedSignals.some(signal => !signal))
        continue

      const seen = new Set<string>()
      const signals = parsedSignals
        .filter((signal): signal is DashboardSafetySignal => Boolean(signal))
        .filter((signal) => {
          const key = `${signal.category}:${signal.verdict}:${signal.impact}:${signal.commitSha}:${signal.evidence}`
          if (seen.has(key))
            return false
          seen.add(key)
          return true
        })
        .slice(0, AI_REVIEW_PARSER_LIMITS.maximumSafetySignals)

      return { confidence: clamp(parsed.confidence), signals }
    }
    catch {
      continue
    }
  }

  return null
}

export function responseShape(response: unknown): string[] {
  const root = response && typeof response === 'object' ? response as Record<string, unknown> : {}
  const choices = Array.isArray(root.choices) ? root.choices : []
  const firstChoice = choices[0] && typeof choices[0] === 'object' ? choices[0] as Record<string, unknown> : undefined
  const message = firstChoice?.message && typeof firstChoice.message === 'object' ? firstChoice.message as Record<string, unknown> : undefined
  const content = message?.content && typeof message.content === 'object' ? message.content as Record<string, unknown> : undefined
  const keys = (value: Record<string, unknown> | undefined, prefix: string, limit: number): string[] => value
    ? Object.keys(value).map(key => `${prefix}.${key}`).slice(0, limit)
    : []

  return [
    ...Object.keys(root).slice(0, AI_REVIEW_PARSER_LIMITS.maximumResponseKeys),
    ...keys(firstChoice, 'choices[0]', AI_REVIEW_PARSER_LIMITS.maximumNestedResponseKeys),
    ...keys(message, 'choices[0].message', AI_REVIEW_PARSER_LIMITS.maximumNestedResponseKeys),
    ...keys(content, 'choices[0].message.content', AI_REVIEW_PARSER_LIMITS.maximumNestedResponseKeys),
    `choices[0].finish_reason=${String(firstChoice?.finish_reason ?? 'missing')}`,
    `choices[0].message.content.type=${Array.isArray(message?.content) ? 'array' : typeof message?.content}`,
    `choices[0].message.content.length=${typeof message?.content === 'string' ? message.content.length : Array.isArray(message?.content) ? message.content.length : 0}`,
    `choices[0].message.reasoning.length=${typeof message?.reasoning === 'string' ? message.reasoning.length : 0}`,
    `choices[0].message.reasoning_content.length=${typeof message?.reasoning_content === 'string' ? message.reasoning_content.length : 0}`,
  ]
}

function parseAxisReviewEvidence(item: unknown): DashboardAiReviewEvidence | null {
  if (!item || typeof item !== 'object')
    return null

  const evidence = item as Record<string, unknown>
  const commitSha = typeof evidence.commitSha === 'string' ? evidence.commitSha.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxCommitShaCharacters) : ''
  const filename = typeof evidence.filename === 'string' ? evidence.filename.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxFilenameCharacters) : ''
  const observation = typeof evidence.observation === 'string' ? evidence.observation.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxEvidenceCharacters) : ''
  if (!commitSha || !filename || !observation)
    return null

  return { commitSha, filename, observation }
}

function parseAxisReview(item: unknown): DashboardAiAxisReview | null {
  if (!item || typeof item !== 'object')
    return null

  const review = item as Record<string, unknown>
  const axis = typeof review.axis === 'string' ? review.axis : ''
  const verdict = typeof review.verdict === 'string' ? review.verdict : ''
  const confidence = typeof review.confidence === 'number' && Number.isFinite(review.confidence) ? review.confidence : Number.NaN
  const summary = typeof review.summary === 'string' ? review.summary.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxSummaryCharacters) : ''
  const evidence = Array.isArray(review.evidence)
    ? review.evidence.map(parseAxisReviewEvidence).filter((item): item is DashboardAiReviewEvidence => Boolean(item))
    : []

  if (!ALLOWED_REVIEW_AXES.has(axis as DashboardReviewAxis)
    || !ALLOWED_AXIS_REVIEW_VERDICTS.has(verdict as DashboardAiAxisReviewVerdict)
    || !Number.isFinite(confidence)
    || !summary) {
    return null
  }

  return {
    axis: axis as DashboardReviewAxis,
    verdict: verdict as DashboardAiAxisReviewVerdict,
    confidence: clamp(confidence),
    summary,
    evidence: evidence.slice(0, AI_REVIEW_PARSER_LIMITS.maximumAxisEvidence),
  }
}

function parseReviewFinding(item: unknown): DashboardAiReviewFinding | null {
  if (!item || typeof item !== 'object')
    return null

  const finding = item as Record<string, unknown>
  const axis = typeof finding.axis === 'string' ? finding.axis : ''
  const verdict = typeof finding.verdict === 'string' ? finding.verdict : ''
  const impact = typeof finding.impact === 'string' ? finding.impact : ''
  const severity = typeof finding.severity === 'string' ? finding.severity : ''
  const commitSha = typeof finding.commitSha === 'string' ? finding.commitSha.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxCommitShaCharacters) : ''
  const filename = typeof finding.filename === 'string' ? finding.filename.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxFilenameCharacters) : ''
  const evidence = typeof finding.evidence === 'string' ? finding.evidence.trim().slice(0, AI_REVIEW_PARSER_LIMITS.maxEvidenceCharacters) : ''
  const category = typeof finding.category === 'string' ? finding.category : undefined
  const riskScope = typeof finding.riskScope === 'string' && ALLOWED_RISK_SCOPES.has(finding.riskScope as DashboardSafetyRiskScope)
    ? finding.riskScope as DashboardSafetyRiskScope
    : undefined

  if (!ALLOWED_REVIEW_AXES.has(axis as DashboardReviewAxis)
    || !ALLOWED_REVIEW_VERDICTS.has(verdict as DashboardReviewVerdict)
    || !ALLOWED_IMPACTS.has(impact as DashboardSafetyImpact)
    || !ALLOWED_SEVERITIES.has(severity as DashboardSafetySeverity)
    || !commitSha
    || !filename
    || !evidence
    || (axis === 'safety' && (!category || !ALLOWED_CATEGORIES.has(category as DashboardSafetyCategory)))) {
    return null
  }

  return {
    axis: axis as DashboardReviewAxis,
    verdict: verdict as DashboardReviewVerdict,
    impact: impact as DashboardSafetyImpact,
    severity: severity as DashboardSafetySeverity,
    commitSha,
    filename,
    evidence,
    ...(category && ALLOWED_CATEGORIES.has(category as DashboardSafetyCategory) ? { category: category as DashboardSafetyCategory } : {}),
    ...(riskScope ? { riskScope } : {}),
  }
}

function parseReviewItems<T>(rawItems: unknown, parser: (item: unknown) => T | null, label: string): { values: T[], warnings: string[] } {
  if (rawItems === undefined)
    return { values: [], warnings: [`${label}-missing`] }
  if (!Array.isArray(rawItems))
    return { values: [], warnings: [`${label}-not-array`] }

  const values = rawItems.map(parser).filter((item): item is T => Boolean(item))
  const droppedCount = rawItems.length - values.length
  return { values, warnings: droppedCount ? [`${label}-dropped:${droppedCount}`] : [] }
}

function reducePartialReviewConfidence(confidence: number, warnings: readonly string[]): number {
  const penalty = Math.min(
    AI_REVIEW_PARSER_LIMITS.maximumWarningPenalty,
    warnings.reduce((total, warning) => total + (warning.includes('dropped')
      ? AI_REVIEW_PARSER_LIMITS.droppedWarningPenalty
      : AI_REVIEW_PARSER_LIMITS.otherWarningPenalty), 0),
  )
  return clamp(confidence - penalty)
}

export function parseDashboardReview(rawText: string): Pick<DashboardAiReviewAssessment, 'confidence' | 'findings' | 'axisReviews' | 'parseWarnings'> | null {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const jsonCandidates = [cleaned]
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart >= 0 && jsonEnd > jsonStart)
    jsonCandidates.push(cleaned.slice(jsonStart, jsonEnd + 1))

  for (const candidate of jsonCandidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      if (typeof parsed.confidence !== 'number' || !Number.isFinite(parsed.confidence))
        continue

      const hasFindings = Object.hasOwn(parsed, 'findings')
      const hasAxisReviews = Object.hasOwn(parsed, 'axisReviews')
      if (!hasFindings && !hasAxisReviews)
        continue

      const findingResult = parseReviewItems(parsed.findings, parseReviewFinding, 'findings')
      const axisReviewResult = parseReviewItems(parsed.axisReviews, parseAxisReview, 'axisReviews')
      const hasProposedItems = (Array.isArray(parsed.findings) && parsed.findings.length > 0)
        || (Array.isArray(parsed.axisReviews) && parsed.axisReviews.length > 0)
      if (hasProposedItems && !findingResult.values.length && !axisReviewResult.values.length)
        continue

      const parseWarnings = [...findingResult.warnings, ...axisReviewResult.warnings]
      const seenFindings = new Set<string>()
      const findings = findingResult.values
        .filter((finding) => {
          const key = `${finding.axis}:${finding.verdict}:${finding.impact}:${finding.commitSha}:${finding.filename}:${finding.evidence}`
          if (seenFindings.has(key))
            return false
          seenFindings.add(key)
          return true
        })
        .slice(0, AI_REVIEW_PARSER_LIMITS.maximumFindings)

      const seenAxes = new Set<DashboardReviewAxis>()
      const axisReviews = axisReviewResult.values
        .filter((review) => {
          if (seenAxes.has(review.axis))
            return false
          seenAxes.add(review.axis)
          return true
        })
        .slice(0, AI_REVIEW_PARSER_LIMITS.maximumAxisReviews)

      return {
        confidence: reducePartialReviewConfidence(parsed.confidence, parseWarnings),
        findings,
        axisReviews,
        ...(parseWarnings.length ? { parseWarnings } : {}),
      }
    }
    catch {
      continue
    }
  }

  return null
}
