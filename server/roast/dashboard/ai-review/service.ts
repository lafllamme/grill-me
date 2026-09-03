import type { DashboardTrace } from '~~/shared/dashboard/trace'
import type { GithubCommit, GithubContext } from '../../github-collector'
import type { DashboardPatchSelection } from '../patch-selection'
import type { DashboardAiAxisReview, DashboardAiReviewAssessment, DashboardAiReviewBaseline, DashboardAiSafetyAssessment } from './types'
import { createError } from 'h3'
import { runAiSync } from '../../ai-client'
import { extractModelText } from '../../output-parser'
import { hasConfirmedRiskEvidence, selectSafetyCommits } from '../categories/safety'
import { DASHBOARD_AI_REVIEW_LIMITS, selectDashboardPatchEvidence } from '../patch-selection'
import { AI_REVIEW_RUNTIME_CONFIG } from './constants'
import { hasKnownCommitSha, isGroundedFinding, normalizeAxisReviewEvidence } from './grounding'
import { parseDashboardReview, parseSafetyAssessment, responseShape } from './parser'
import { buildDashboardReviewPrompt, buildSafetyPrompt, DASHBOARD_PROFILE_REVIEW_SYSTEM_PROMPT, DASHBOARD_SAFETY_REVIEW_SYSTEM_PROMPT } from './prompt'

function dashboardReviewCandidates(response: unknown, extracted: ReturnType<typeof extractModelText>): Array<{ path: string, text: string }> {
  const candidates: Array<{ path: string, text: string }> = []
  if (extracted.rawText.trim())
    candidates.push({ path: extracted.parserPath, text: extracted.rawText })

  const root = response && typeof response === 'object' ? response as Record<string, unknown> : {}
  const choices = Array.isArray(root.choices) ? root.choices : []
  const firstChoice = choices[0] && typeof choices[0] === 'object' ? choices[0] as Record<string, unknown> : undefined
  const message = firstChoice?.message && typeof firstChoice.message === 'object' ? firstChoice.message as Record<string, unknown> : undefined
  const result = root.result && typeof root.result === 'object' ? root.result as Record<string, unknown> : undefined
  const resultChoices = result && Array.isArray(result.choices) ? result.choices : []
  const resultFirstChoice = resultChoices[0] && typeof resultChoices[0] === 'object' ? resultChoices[0] as Record<string, unknown> : undefined
  const resultMessage = resultFirstChoice?.message && typeof resultFirstChoice.message === 'object' ? resultFirstChoice.message as Record<string, unknown> : undefined

  for (const [path, value] of [
    ['choices[0].message.reasoning', message?.reasoning],
    ['choices[0].message.reasoning_content', message?.reasoning_content],
    ['result.choices[0].message.reasoning', resultMessage?.reasoning],
    ['result.choices[0].message.reasoning_content', resultMessage?.reasoning_content],
  ] as const) {
    if (typeof value === 'string' && value.trim())
      candidates.push({ path, text: value })
  }

  return candidates
}

function parseDashboardReviewResponse(response: unknown, extracted: ReturnType<typeof extractModelText>, selection: DashboardPatchSelection): { parsed: Pick<DashboardAiReviewAssessment, 'confidence' | 'findings' | 'axisReviews' | 'parseWarnings'>, path: string } | null {
  for (const candidate of dashboardReviewCandidates(response, extracted)) {
    const parsed = parseDashboardReview(candidate.text)
    if (!parsed)
      continue

    const isReasoningFallback = candidate.path.includes('reasoning')
    if (isReasoningFallback && parsed.findings.length > 0 && !parsed.findings.some(finding => isGroundedFinding(finding, selection)))
      continue

    return { parsed, path: candidate.path }
  }

  return null
}

function fallbackAssessment(status: DashboardAiSafetyAssessment['status']): DashboardAiSafetyAssessment {
  return { confidence: AI_REVIEW_RUNTIME_CONFIG.fallbackConfidence, signals: [], status }
}

function fallbackReview(status: DashboardAiReviewAssessment['status'], selection: DashboardPatchSelection): DashboardAiReviewAssessment {
  return {
    confidence: AI_REVIEW_RUNTIME_CONFIG.fallbackConfidence,
    findings: [],
    axisReviews: [],
    status,
    selectedCommitCount: selection.commits.length,
    patchCount: selection.files.length,
    patchChars: selection.totalPatchChars,
  }
}

function traceReviewCompletion(trace: DashboardTrace | undefined, review: DashboardAiReviewAssessment): void {
  trace?.log('ai', 'review-complete', {
    status: review.status,
    responsePath: review.responsePath,
    confidence: review.confidence,
    axisReviews: review.axisReviews?.length ?? 0,
    findings: review.findings.length,
    diagnostic: review.diagnostic,
    parseWarnings: review.parseWarnings,
    responseShape: review.responseShape,
  })
}

export async function assessDashboardSafetyWithAi(input: {
  commits: readonly GithubCommit[]
  accountId?: string
  apiToken?: string
  model?: string
  timeoutMs: number
}): Promise<DashboardAiSafetyAssessment> {
  const selectedCommits = selectSafetyCommits(input.commits)
  const commitsWithPatches = selectedCommits.filter(commit => commit.files.some(file => file.patch))
  if (!commitsWithPatches.length)
    return fallbackAssessment('no-evidence')
  if (!input.accountId || !input.apiToken || !input.model)
    return fallbackAssessment('not-configured')

  try {
    const response = await runAiSync({
      accountId: input.accountId,
      apiToken: input.apiToken,
      model: input.model,
      timeoutMs: input.timeoutMs,
      maxTokens: AI_REVIEW_RUNTIME_CONFIG.standaloneMaxTokens,
      temperature: AI_REVIEW_RUNTIME_CONFIG.temperature,
      topP: AI_REVIEW_RUNTIME_CONFIG.safetyTopP,
      systemPrompt: DASHBOARD_SAFETY_REVIEW_SYSTEM_PROMPT,
      userPrompt: `${buildSafetyPrompt(commitsWithPatches)}\n/no_think`,
    })
    const extracted = extractModelText(response)
    const assessment = parseSafetyAssessment(extracted.rawText)
    if (assessment) {
      return {
        ...assessment,
        signals: assessment.signals.filter(signal => hasKnownCommitSha(signal.commitSha, commitsWithPatches)
          && (signal.verdict !== 'risk' || signal.impact !== 'introduced' || hasConfirmedRiskEvidence(signal, commitsWithPatches))),
        status: 'assessed',
        responsePath: extracted.parserPath,
      }
    }

    return {
      ...fallbackAssessment('invalid-response'),
      diagnostic: extracted.rawText ? 'missing-signals-or-invalid-json' : 'empty-model-text',
      responsePath: extracted.parserPath,
      responseShape: responseShape(response),
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error)
      return fallbackAssessment('unavailable')
    throw createError({ statusCode: 503, statusMessage: 'AI safety assessment unavailable', data: { code: 'dashboard_ai_unavailable' } })
  }
}

export async function assessDashboardProfileWithAi(input: {
  context: GithubContext
  baseline?: DashboardAiReviewBaseline
  accountId?: string
  apiToken?: string
  model?: string
  timeoutMs: number
  maxTokens?: number
  trace?: DashboardTrace
}): Promise<DashboardAiReviewAssessment> {
  const selection = selectDashboardPatchEvidence(input.context)
  input.trace?.log('ai', 'patch-selection-complete', {
    commitCount: selection.commits.length,
    fileCount: selection.files.length,
    usablePatchCount: selection.usablePatchCount,
    patchCharacters: selection.totalPatchChars,
    commits: selection.commits.map(selected => ({
      repo: selected.commit.repo,
      sha: selected.commit.sha,
      message: selected.commit.message,
      additions: selected.commit.additions,
      deletions: selected.commit.deletions,
      changedFiles: selected.commit.changedFiles,
      reasons: selected.reasons,
    })),
    files: selection.files.map(file => ({
      commitSha: file.commitSha,
      repo: file.repo,
      filename: file.filename,
      status: file.status,
      patch: file.patch,
      patchCharacters: file.patch.length,
      reason: file.reason,
    })),
  })
  if (!selection.files.length) {
    const review = fallbackReview('no-evidence', selection)
    traceReviewCompletion(input.trace, review)
    return review
  }
  if (!input.accountId || !input.apiToken || !input.model) {
    const review = fallbackReview('not-configured', selection)
    traceReviewCompletion(input.trace, review)
    return review
  }

  try {
    const userPrompt = `${buildDashboardReviewPrompt(input.context, selection, input.baseline)}\n/no_think`
    input.trace?.log('ai', 'prompt-prepared', {
      systemPrompt: DASHBOARD_PROFILE_REVIEW_SYSTEM_PROMPT,
      userPrompt,
      selectedCommitCount: selection.commits.length,
      patchCount: selection.files.length,
      patchCharacters: selection.totalPatchChars,
    })
    const response = await runAiSync({
      accountId: input.accountId,
      apiToken: input.apiToken,
      model: input.model,
      timeoutMs: input.timeoutMs,
      maxTokens: Math.max(input.maxTokens ?? 0, DASHBOARD_AI_REVIEW_LIMITS.maxOutputTokens),
      temperature: AI_REVIEW_RUNTIME_CONFIG.temperature,
      topP: AI_REVIEW_RUNTIME_CONFIG.profileTopP,
      reasoningEffort: 'none',
      systemPrompt: DASHBOARD_PROFILE_REVIEW_SYSTEM_PROMPT,
      userPrompt,
      onRequestMetrics: metrics => input.trace?.log('ai', 'request-metrics', { ...metrics }),
    })
    const extracted = extractModelText(response)
    const candidates = dashboardReviewCandidates(response, extracted)
    const responseCandidate = candidates[0]
    input.trace?.log('ai', 'response-received', {
      parserPath: responseCandidate?.path ?? extracted.parserPath,
      rawResponse: responseCandidate?.text ?? extracted.rawText,
      responseShape: responseShape(response),
    })
    const parsedResponse = parseDashboardReviewResponse(response, extracted, selection)
    if (parsedResponse) {
      const normalizedAxisReviews = parsedResponse.parsed.axisReviews
        ?.map(axisReview => normalizeAxisReviewEvidence(axisReview, selection))
        .filter((axisReview): axisReview is DashboardAiAxisReview => Boolean(axisReview))
      const droppedAxisReviewCount = (parsedResponse.parsed.axisReviews?.length ?? 0) - (normalizedAxisReviews?.length ?? 0)
      const parseWarnings = droppedAxisReviewCount > 0
        ? [...(parsedResponse.parsed.parseWarnings ?? []), `axisReviews-ungrounded:${droppedAxisReviewCount}`]
        : parsedResponse.parsed.parseWarnings

      const review: DashboardAiReviewAssessment = {
        ...parsedResponse.parsed,
        findings: parsedResponse.parsed.findings.filter(finding => isGroundedFinding(finding, selection)),
        axisReviews: normalizedAxisReviews,
        ...(parseWarnings?.length ? { parseWarnings } : {}),
        status: 'assessed',
        responsePath: parsedResponse.path,
        selectedCommitCount: selection.commits.length,
        patchCount: selection.files.length,
        patchChars: selection.totalPatchChars,
      }
      traceReviewCompletion(input.trace, review)
      return review
    }

    const review: DashboardAiReviewAssessment = {
      ...fallbackReview('invalid-response', selection),
      diagnostic: (responseCandidate?.text ?? extracted.rawText) ? 'missing-findings-or-invalid-json' : 'empty-model-text',
      responsePath: responseCandidate?.path ?? extracted.parserPath,
      responseShape: responseShape(response),
    }
    traceReviewCompletion(input.trace, review)
    return review
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const review = fallbackReview('unavailable', selection)
      traceReviewCompletion(input.trace, review)
      return review
    }
    throw createError({ statusCode: 503, statusMessage: 'AI dashboard review unavailable', data: { code: 'dashboard_ai_unavailable' } })
  }
}
