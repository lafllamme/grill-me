import type { GithubCommit, GithubContext } from '../../github-collector'
import type { DashboardPatchSelection } from '../patch-selection'
import type { DashboardAiAxisReview, DashboardAiReviewAssessment, DashboardAiReviewBaseline, DashboardAiSafetyAssessment } from './types'
import { createError } from 'h3'
import { runAiSync } from '../../ai-client'
import { extractModelText } from '../../output-parser'
import { hasConfirmedRiskEvidence, selectSafetyCommits } from '../categories/safety'
import { DASHBOARD_AI_REVIEW_LIMITS, selectDashboardPatchEvidence } from '../patch-selection'
import { AI_REVIEW_PROMPT_LIMITS, AI_REVIEW_RUNTIME_CONFIG } from './constants'
import { hasKnownCommitSha, isGroundedFinding, normalizeAxisReviewEvidence } from './grounding'
import { parseDashboardReview, parseSafetyAssessment, responseShape } from './parser'
import { buildDashboardReviewPrompt, buildSafetyPrompt } from './prompt'

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
      systemPrompt: [
        'You are a conservative application-security reviewer.',
        'Review only the supplied codeChanges. They are truncated diff excerpts, not complete repositories.',
        'The server calculates the numeric Safety score. Do not return a score, grade, ranking, or reviewed category list.',
        'Return only concrete signals visible in changed lines. Missing tests, missing CI, missing files, truncated patches, unfamiliar code, commit size, and commit frequency are not risks.',
        'Use verdict safe only when the changed lines visibly add a safeguard. Use verdict risk only when the changed lines visibly introduce unsafe behavior. Use verdict unclear when the excerpt cannot establish either.',
        'Use impact fixed when the changed lines clearly fix or mitigate an existing leak, overflow, out-of-bounds access, use-after-free, injection, validation bug, or cleanup bug. Fixed and unclear signals never lower the score.',
        'Only a signal with verdict risk and impact introduced can lower the score. Never turn absence of evidence into a risk.',
        'Classify signals only as validation, auth, error-handling, secrets, or dependency. Use high severity for an exposed secret or authorization bypass, medium for a concrete exploitable weakness, and low for a smaller concrete safety gap.',
        'Use the exact short commit SHA and filename supplied with the patch when available, and quote a short, concrete explanation in evidence. Do not invent a SHA, filename, or evidence.',
        'Return exactly one JSON object with this schema: {"confidence":60,"signals":[{"category":"validation","verdict":"safe","impact":"introduced","severity":"low","commitSha":"abc1234","filename":"src/validation.ts","evidence":"changed lines add explicit input validation"}]}',
        'confidence is a number from 0 to 100. signals is an array and may be empty. Every signal must contain category, verdict, impact, severity, commitSha, and evidence; include filename when available. No markdown, prose, code fences, or extra keys.',
      ].join(' '),
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
}): Promise<DashboardAiReviewAssessment> {
  const selection = selectDashboardPatchEvidence(input.context)
  if (!selection.files.length)
    return fallbackReview('no-evidence', selection)
  if (!input.accountId || !input.apiToken || !input.model)
    return fallbackReview('not-configured', selection)

  try {
    const response = await runAiSync({
      accountId: input.accountId,
      apiToken: input.apiToken,
      model: input.model,
      timeoutMs: input.timeoutMs,
      maxTokens: Math.max(input.maxTokens ?? 0, DASHBOARD_AI_REVIEW_LIMITS.maxOutputTokens),
      temperature: AI_REVIEW_RUNTIME_CONFIG.temperature,
      topP: AI_REVIEW_RUNTIME_CONFIG.profileTopP,
      reasoningEffort: 'none',
      systemPrompt: [
        'You are the semantic second reviewer for a developer profile dashboard.',
        'Review only the supplied commit metadata and patch hunks. Patches are truncated excerpts, not complete repositories.',
        'The server calculates all numeric scores. Never return a score, grade, rank, role, or overall quality judgment.',
        'The deterministicReview object contains provisional server scores, component signals, and the question for each axis. Treat it as a hypothesis to check against the supplied patches, not as a number to repeat.',
        'Return findings only when the changed lines visibly support them. Missing tests, missing CI, missing documentation, unfamiliar code, repository popularity, commit volume, and truncated context are not negative evidence.',
        'Use positive for a concrete quality signal added by the changed lines, negative for a concrete problem introduced by the changed lines, and mixed or unclear when the excerpt cannot establish a reliable direction.',
        'Use impact introduced only for a newly added behavior, fixed only when the changed lines clearly repair an existing problem, and unclear otherwise. A fixed or unclear finding must never be treated as a penalty.',
        'For safety, classify only validation, auth, error-handling, secrets, or dependency. A positive safety finding is allowed only for a visible defensive safeguard and may provide a small bounded lift after server verification. Only a safety finding with verdict negative and impact introduced may lower Safety, and the server independently verifies the evidence.',
        'For clarity use the supplied clarity breakdown to inspect naming, local structure, and intent in the changed lines; conventionalMessageRatio is diagnostic workflow context, not a Clarity input. Respect the supplied clarity evidenceCap: the server applies it after any bounded adjustment, so do not upgrade a thin sample beyond that ceiling. Do not treat commit count, file count, repository size, or missing patch evidence as clarity evidence. For workflow use the supplied workflow breakdown to inspect delivery granularity and intent, prefer median and p75 scope signals over the raw average alone, then use the patches to decide whether broad changes are coherent and reviewable. The server applies a conservative evidence cap: do not upgrade a limited sample into a strong score, and do not treat the cap as evidence that the developer is bad. A neutral review signal, merge ratio, missing PRs, commit frequency, repository size, and raw output volume are context limitations, not automatic workflow failures. For complexity inspect visible coupling, indirection, duplication, nesting, and change surface in the changed lines; do not infer complexity from repository size, raw file count, package breadth, release files, or commit volume. For context use the supplied context breakdown and inspect only actual explanatory additions, orientation artifacts, commit bodies, examples, and visible handoff evidence. A README or docs entry in repository metadata is weak orientation evidence, not proof of documentation quality; missing docs, missing PRs, missing comments, and truncated patches are neutral rather than negative.',
        'Return one compact axisReview for each axis. Use supports when the deterministic result fits the visible patches, softens when the result is too strict because broad changes are visibly coherent, contradicts when the patches show a material issue the baseline misses, and insufficient when the selected excerpts cannot support a reliable judgment. Every axisReview must include a short summary that explains the judgment. A supports review must cite at least one exact supplied patch file. A softens or contradicts review must cite at least two distinct exact supplied patch files. Only insufficient may use an empty evidence array.',
        'Use the exact short commit SHA and exact filename supplied with each patch. Evidence must be a short concrete explanation of visible changed lines. Do not invent a SHA or filename.',
        `Return compact JSON only. Keep every summary, observation, and finding evidence under ${AI_REVIEW_PROMPT_LIMITS.maximumEvidenceCharacters} characters. Return exactly one JSON object with this schema: {"confidence":60,"axisReviews":[{"axis":"clarity","verdict":"supports","confidence":86,"summary":"The visible patches use clear state names and keep the local data flow readable.","evidence":[{"commitSha":"abc1234","filename":"src/profile.ts","observation":"profileState and validationResult make the data flow explicit"}]}],"findings":[]}`,
        'Every axisReview must contain axis, verdict, confidence, summary, and an evidence array. Every evidence item must contain commitSha, filename, and observation. Every finding must contain axis, verdict, impact, severity, commitSha, filename, and evidence. Safety findings must also contain category. Non-safety findings must omit category. Return at most five axisReviews and six findings. Do not repeat metadata, baseline values, or patch text. No markdown, prose, code fences, or extra keys.',
      ].join(' '),
      userPrompt: `${buildDashboardReviewPrompt(input.context, selection, input.baseline)}\n/no_think`,
    })
    const extracted = extractModelText(response)
    const parsedResponse = parseDashboardReviewResponse(response, extracted, selection)
    if (parsedResponse) {
      const normalizedAxisReviews = parsedResponse.parsed.axisReviews
        ?.map(axisReview => normalizeAxisReviewEvidence(axisReview, selection))
        .filter((axisReview): axisReview is DashboardAiAxisReview => Boolean(axisReview))
      const droppedAxisReviewCount = (parsedResponse.parsed.axisReviews?.length ?? 0) - (normalizedAxisReviews?.length ?? 0)
      const parseWarnings = droppedAxisReviewCount > 0
        ? [...(parsedResponse.parsed.parseWarnings ?? []), `axisReviews-ungrounded:${droppedAxisReviewCount}`]
        : parsedResponse.parsed.parseWarnings

      return {
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
    }

    return {
      ...fallbackReview('invalid-response', selection),
      diagnostic: extracted.rawText ? 'missing-findings-or-invalid-json' : 'empty-model-text',
      responsePath: extracted.parserPath,
      responseShape: responseShape(response),
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error)
      return fallbackReview('unavailable', selection)
    throw createError({ statusCode: 503, statusMessage: 'AI dashboard review unavailable', data: { code: 'dashboard_ai_unavailable' } })
  }
}
