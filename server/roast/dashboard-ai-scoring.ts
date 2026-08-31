import type { DashboardPatchSelection } from './dashboard-patch-selection'
import type { GithubCommit, GithubContext } from './github-collector'
import { createError } from 'h3'
import { ROAST_LIMITS } from '~~/shared/roast/contracts'
import { runAiSync } from './ai-client'
import { DASHBOARD_AI_REVIEW_LIMITS, selectDashboardPatchEvidence } from './dashboard-patch-selection'
import { hasConfirmedRiskEvidence } from './dashboard-safety-evidence'
import { safetyFilePattern, safetyPatchPattern, selectSafetyCommits } from './dashboard-safety-selection'
import { extractModelText } from './output-parser'

export type DashboardSafetyCategory = 'validation' | 'auth' | 'error-handling' | 'secrets' | 'dependency'
export type DashboardSafetyVerdict = 'safe' | 'risk' | 'unclear'
export type DashboardSafetyImpact = 'introduced' | 'fixed' | 'unclear'
export type DashboardSafetySeverity = 'low' | 'medium' | 'high'

export interface DashboardSafetySignal {
  category: DashboardSafetyCategory
  verdict: DashboardSafetyVerdict
  impact: DashboardSafetyImpact
  severity: DashboardSafetySeverity
  commitSha: string
  evidence: string
}

export interface DashboardAiSafetyAssessment {
  confidence: number
  signals: DashboardSafetySignal[]
  status: 'assessed' | 'not-configured' | 'no-evidence' | 'unavailable' | 'invalid-response'
  diagnostic?: 'empty-model-text' | 'missing-signals-or-invalid-json'
  responsePath?: string
  responseShape?: string[]
}

const clamp = (value: number): number => Math.round(Math.min(100, Math.max(0, value)))
const allowedSeverities = new Set<DashboardSafetySeverity>(['low', 'medium', 'high'])
const allowedVerdicts = new Set<DashboardSafetyVerdict>(['safe', 'risk', 'unclear'])
const allowedImpacts = new Set<DashboardSafetyImpact>(['introduced', 'fixed', 'unclear'])
const allowedCategories = new Set<DashboardSafetyCategory>(['validation', 'auth', 'error-handling', 'secrets', 'dependency'])

function parseSignal(item: unknown): DashboardSafetySignal | null {
  if (!item || typeof item !== 'object')
    return null

  const signal = item as Record<string, unknown>
  const category = typeof signal.category === 'string' ? signal.category : ''
  const verdict = typeof signal.verdict === 'string' ? signal.verdict : ''
  const impact = typeof signal.impact === 'string' ? signal.impact : ''
  const severity = typeof signal.severity === 'string' ? signal.severity : ''
  const commitSha = typeof signal.commitSha === 'string' ? signal.commitSha.trim().slice(0, 64) : ''
  const evidence = typeof signal.evidence === 'string' ? signal.evidence.trim().slice(0, 300) : ''

  if (!allowedCategories.has(category as DashboardSafetyCategory)
    || !allowedVerdicts.has(verdict as DashboardSafetyVerdict)
    || !allowedImpacts.has(impact as DashboardSafetyImpact)
    || !allowedSeverities.has(severity as DashboardSafetySeverity)
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
    evidence,
  }
}

function parseAssessment(rawText: string): Pick<DashboardAiSafetyAssessment, 'confidence' | 'signals'> | null {
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
        .slice(0, 12)

      return {
        confidence: clamp(parsed.confidence),
        signals,
      }
    }
    catch {
      continue
    }
  }

  return null
}

function buildSafetyPrompt(commits: readonly GithubCommit[]): string {
  let remainingPatchChars = ROAST_LIMITS.maxPromptTotalPatchChars
  const payload = commits
    .slice(0, 3)
    .map(commit => ({
      sha: commit.sha.slice(0, 7),
      message: commit.message,
      additions: commit.additions,
      deletions: commit.deletions,
      codeChanges: [...commit.files]
        .filter(file => file.patch)
        .sort((left, right) => {
          const leftRelevance = (safetyFilePattern.test(left.filename) ? 1 : 0) + (safetyPatchPattern.test(left.patch ?? '') ? 1 : 0)
          const rightRelevance = (safetyFilePattern.test(right.filename) ? 1 : 0) + (safetyPatchPattern.test(right.patch ?? '') ? 1 : 0)
          return rightRelevance - leftRelevance || left.filename.localeCompare(right.filename)
        })
        .slice(0, ROAST_LIMITS.maxPromptFilesPerCommit)
        .flatMap((file) => {
          if (!file.patch || remainingPatchChars <= 0)
            return []

          const patch = file.patch.slice(0, Math.min(ROAST_LIMITS.maxPatchChars, remainingPatchChars))
          remainingPatchChars -= patch.length
          return [{ filename: file.filename, status: file.status, patch }]
        }),
    }))

  return JSON.stringify({ commits: payload })
}

function hasKnownCommitSha(signalSha: string, commits: readonly GithubCommit[]): boolean {
  return commits.some(commit => signalSha === commit.sha || commit.sha.startsWith(signalSha) || signalSha.startsWith(commit.sha))
}

function responseShape(response: any): string[] {
  return [
    ...Object.keys(response ?? {}).slice(0, 12),
    ...(response?.choices?.[0] && typeof response.choices[0] === 'object' ? Object.keys(response.choices[0]).map(key => `choices[0].${key}`).slice(0, 8) : []),
    ...(response?.choices?.[0]?.message && typeof response.choices[0].message === 'object' ? Object.keys(response.choices[0].message).map(key => `choices[0].message.${key}`).slice(0, 8) : []),
    ...(response?.choices?.[0]?.message?.content && typeof response.choices[0].message.content === 'object' ? Object.keys(response.choices[0].message.content).map(key => `choices[0].message.content.${key}`).slice(0, 8) : []),
    `choices[0].finish_reason=${String(response?.choices?.[0]?.finish_reason ?? 'missing')}`,
    `choices[0].message.content.type=${Array.isArray(response?.choices?.[0]?.message?.content) ? 'array' : typeof response?.choices?.[0]?.message?.content}`,
    `choices[0].message.content.length=${typeof response?.choices?.[0]?.message?.content === 'string' ? response.choices[0].message.content.length : Array.isArray(response?.choices?.[0]?.message?.content) ? response.choices[0].message.content.length : 0}`,
    `choices[0].message.reasoning.length=${typeof response?.choices?.[0]?.message?.reasoning === 'string' ? response.choices[0].message.reasoning.length : 0}`,
    `choices[0].message.reasoning_content.length=${typeof response?.choices?.[0]?.message?.reasoning_content === 'string' ? response.choices[0].message.reasoning_content.length : 0}`,
  ]
}

function dashboardReviewCandidates(response: any, extracted: ReturnType<typeof extractModelText>): Array<{ path: string, text: string }> {
  const candidates: Array<{ path: string, text: string }> = []
  if (extracted.rawText.trim())
    candidates.push({ path: extracted.parserPath, text: extracted.rawText })

  // Qwen3 may place its final structured object in the reasoning channel when
  // the OpenAI-compatible endpoint does not honor reasoning_effort/no_think.
  // We only use it as an internal recovery source when the strict parser below
  // accepts the complete review contract. The reasoning text is never exposed.
  for (const [path, value] of [
    ['choices[0].message.reasoning', response?.choices?.[0]?.message?.reasoning],
    ['choices[0].message.reasoning_content', response?.choices?.[0]?.message?.reasoning_content],
    ['result.choices[0].message.reasoning', response?.result?.choices?.[0]?.message?.reasoning],
    ['result.choices[0].message.reasoning_content', response?.result?.choices?.[0]?.message?.reasoning_content],
  ] as const) {
    if (typeof value === 'string' && value.trim())
      candidates.push({ path, text: value })
  }

  return candidates
}

function parseDashboardReviewResponse(response: any, extracted: ReturnType<typeof extractModelText>, selection: DashboardPatchSelection): { parsed: Pick<DashboardAiReviewAssessment, 'confidence' | 'findings'>, path: string } | null {
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
  return { confidence: 0, signals: [], status }
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
      maxTokens: 1100,
      temperature: 0,
      topP: 0.9,
      systemPrompt: [
        'You are a conservative application-security reviewer.',
        'Review only the supplied codeChanges. They are truncated diff excerpts, not complete repositories.',
        'The server calculates the numeric Safety score. Do not return a score, grade, ranking, or reviewed category list.',
        'Return only concrete signals visible in changed lines. Missing tests, missing CI, missing files, truncated patches, unfamiliar code, commit size, and commit frequency are not risks.',
        'Use verdict safe only when the changed lines visibly add a safeguard. Use verdict risk only when the changed lines visibly introduce unsafe behavior. Use verdict unclear when the excerpt cannot establish either.',
        'Use impact fixed when the changed lines clearly fix or mitigate an existing leak, overflow, out-of-bounds access, use-after-free, injection, validation bug, or cleanup bug. Fixed and unclear signals never lower the score.',
        'Only a signal with verdict risk and impact introduced can lower the score. Never turn absence of evidence into a risk.',
        'Classify signals only as validation, auth, error-handling, secrets, or dependency. Use high severity for an exposed secret or authorization bypass, medium for a concrete exploitable weakness, and low for a smaller concrete safety gap.',
        'Use the exact short commit SHA supplied with the patch and quote a short, concrete explanation in evidence. Do not invent a SHA or evidence.',
        'Return exactly one JSON object with this schema: {"confidence":60,"signals":[{"category":"validation","verdict":"safe","impact":"introduced","severity":"low","commitSha":"abc1234","evidence":"changed lines add explicit input validation"}]}',
        'confidence is a number from 0 to 100. signals is an array and may be empty. Every signal must contain all six fields. No markdown, prose, code fences, or extra keys.',
      ].join(' '),
      userPrompt: `${buildSafetyPrompt(commitsWithPatches)}\n/no_think`,
    })
    const extracted = extractModelText(response)
    const assessment = parseAssessment(extracted.rawText)
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
      status: 'invalid-response',
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

export type DashboardReviewAxis = 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'
export type DashboardReviewVerdict = 'positive' | 'mixed' | 'negative' | 'unclear'

export interface DashboardAiReviewFinding {
  axis: DashboardReviewAxis
  verdict: DashboardReviewVerdict
  impact: DashboardSafetyImpact
  severity: DashboardSafetySeverity
  commitSha: string
  filename: string
  evidence: string
  category?: DashboardSafetyCategory
}

export interface DashboardAiReviewAssessment {
  confidence: number
  findings: DashboardAiReviewFinding[]
  status: 'assessed' | 'not-configured' | 'no-evidence' | 'unavailable' | 'invalid-response'
  diagnostic?: 'empty-model-text' | 'missing-findings-or-invalid-json'
  responsePath?: string
  responseShape?: string[]
  selectedCommitCount: number
  patchCount: number
  patchChars: number
}

const allowedReviewAxes = new Set<DashboardReviewAxis>(['clarity', 'safety', 'workflow', 'complexity', 'context'])
const allowedReviewVerdicts = new Set<DashboardReviewVerdict>(['positive', 'mixed', 'negative', 'unclear'])

function parseReviewFinding(item: unknown): DashboardAiReviewFinding | null {
  if (!item || typeof item !== 'object')
    return null

  const finding = item as Record<string, unknown>
  const axis = typeof finding.axis === 'string' ? finding.axis : ''
  const verdict = typeof finding.verdict === 'string' ? finding.verdict : ''
  const impact = typeof finding.impact === 'string' ? finding.impact : ''
  const severity = typeof finding.severity === 'string' ? finding.severity : ''
  const commitSha = typeof finding.commitSha === 'string' ? finding.commitSha.trim().slice(0, 64) : ''
  const filename = typeof finding.filename === 'string' ? finding.filename.trim().slice(0, 300) : ''
  const evidence = typeof finding.evidence === 'string' ? finding.evidence.trim().slice(0, 300) : ''
  const category = typeof finding.category === 'string' ? finding.category : undefined

  if (!allowedReviewAxes.has(axis as DashboardReviewAxis)
    || !allowedReviewVerdicts.has(verdict as DashboardReviewVerdict)
    || !allowedImpacts.has(impact as DashboardSafetyImpact)
    || !allowedSeverities.has(severity as DashboardSafetySeverity)
    || !commitSha
    || !filename
    || !evidence
    || (axis === 'safety' && (!category || !allowedCategories.has(category as DashboardSafetyCategory)))) {
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
    ...(category && allowedCategories.has(category as DashboardSafetyCategory) ? { category: category as DashboardSafetyCategory } : {}),
  }
}

export function parseDashboardReview(rawText: string): Pick<DashboardAiReviewAssessment, 'confidence' | 'findings'> | null {
  const cleaned = rawText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const jsonCandidates = [cleaned]
  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')
  if (jsonStart >= 0 && jsonEnd > jsonStart)
    jsonCandidates.push(cleaned.slice(jsonStart, jsonEnd + 1))

  for (const candidate of jsonCandidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>
      if (typeof parsed.confidence !== 'number' || !Number.isFinite(parsed.confidence) || !Array.isArray(parsed.findings))
        continue

      const parsedFindings = parsed.findings.map(parseReviewFinding)
      if (parsedFindings.some(finding => !finding))
        continue

      const seen = new Set<string>()
      const findings = parsedFindings
        .filter((finding): finding is DashboardAiReviewFinding => Boolean(finding))
        .filter((finding) => {
          const key = `${finding.axis}:${finding.verdict}:${finding.impact}:${finding.commitSha}:${finding.filename}:${finding.evidence}`
          if (seen.has(key))
            return false
          seen.add(key)
          return true
        })
        .slice(0, 12)

      return { confidence: clamp(parsed.confidence), findings }
    }
    catch {
      continue
    }
  }

  return null
}

const maxPromptRepositoryEntries = 24

export function buildDashboardReviewPrompt(context: GithubContext, selection: DashboardPatchSelection): string {
  const payload = {
    repositories: (context.repositories ?? []).map(repository => ({
      repo: repository.repo,
      defaultBranch: repository.defaultBranch,
      language: repository.language,
      rootEntries: repository.rootEntries.slice(0, maxPromptRepositoryEntries),
    })),
    commits: selection.commits.map(({ commit, reasons }) => ({
      sha: commit.sha.slice(0, 7),
      repo: commit.repo,
      message: commit.message.split('\n')[0]?.trim().slice(0, 180) ?? '',
      additions: commit.additions,
      deletions: commit.deletions,
      changedFiles: commit.changedFiles,
      committedAt: commit.committedAt,
      selectionReasons: reasons,
    })),
    pullRequests: context.prs.slice(0, 6).map(pullRequest => ({
      repo: pullRequest.repo,
      number: pullRequest.number,
      title: pullRequest.title.slice(0, 160),
      state: pullRequest.state,
      reviewCount: pullRequest.reviewCount,
      commentCount: pullRequest.commentCount,
      changedFiles: pullRequest.changedFiles,
      merged: Boolean(pullRequest.mergedAt),
    })),
    checks: (context.checks ?? []).slice(0, 6).map(check => ({
      repo: check.repo,
      sha: check.sha.slice(0, 7),
      total: check.total,
      successful: check.successful,
      failed: check.failed,
      pending: check.pending,
    })),
    patches: selection.files.map(file => ({
      commitSha: file.commitSha.slice(0, 7),
      repo: file.repo,
      filename: file.filename,
      status: file.status,
      selectionReason: file.reason,
      patch: file.patch,
    })),
  }

  return JSON.stringify(payload)
}

function isGroundedFinding(finding: DashboardAiReviewFinding, selection: DashboardPatchSelection): boolean {
  return selection.files.some(file => (
    (finding.commitSha === file.commitSha || file.commitSha.startsWith(finding.commitSha) || finding.commitSha.startsWith(file.commitSha))
    && finding.filename === file.filename
  ))
}

function fallbackReview(status: DashboardAiReviewAssessment['status'], selection: DashboardPatchSelection): DashboardAiReviewAssessment {
  return {
    confidence: 0,
    findings: [],
    status,
    selectedCommitCount: selection.commits.length,
    patchCount: selection.files.length,
    patchChars: selection.totalPatchChars,
  }
}

export function toDashboardAiSafetyAssessment(review: DashboardAiReviewAssessment): DashboardAiSafetyAssessment {
  const signals: DashboardSafetySignal[] = review.findings
    .filter((finding): finding is DashboardAiReviewFinding & { category: DashboardSafetyCategory } => finding.axis === 'safety' && Boolean(finding.category))
    .map(finding => ({
      category: finding.category,
      verdict: finding.verdict === 'positive' ? 'safe' : finding.verdict === 'negative' ? 'risk' : 'unclear',
      impact: finding.impact,
      severity: finding.severity,
      commitSha: finding.commitSha,
      evidence: finding.evidence,
    }))

  return {
    confidence: review.confidence,
    signals,
    status: review.status,
    ...(review.diagnostic ? { diagnostic: review.diagnostic === 'missing-findings-or-invalid-json' ? 'missing-signals-or-invalid-json' : review.diagnostic } : {}),
    ...(review.responsePath ? { responsePath: review.responsePath } : {}),
    ...(review.responseShape ? { responseShape: review.responseShape } : {}),
  }
}

export async function assessDashboardProfileWithAi(input: {
  context: GithubContext
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
      temperature: 0,
      topP: 0.1,
      reasoningEffort: 'none',
      systemPrompt: [
        'You are the semantic second reviewer for a developer profile dashboard.',
        'Review only the supplied commit metadata and patch hunks. Patches are truncated excerpts, not complete repositories.',
        'The server calculates all numeric scores. Never return a score, grade, rank, role, or overall quality judgment.',
        'Return findings only when the changed lines visibly support them. Missing tests, missing CI, missing documentation, unfamiliar code, repository popularity, commit volume, and truncated context are not negative evidence.',
        'Use positive for a concrete quality signal added by the changed lines, negative for a concrete problem introduced by the changed lines, and mixed or unclear when the excerpt cannot establish a reliable direction.',
        'Use impact introduced only for a newly added behavior, fixed only when the changed lines clearly repair an existing problem, and unclear otherwise. A fixed or unclear finding must never be treated as a penalty.',
        'For safety, classify only validation, auth, error-handling, secrets, or dependency. Only a safety finding with verdict negative and impact introduced may lower Safety, and the server independently verifies the evidence.',
        'For clarity inspect naming, structure, and intent. For workflow inspect change granularity and delivery intent. For complexity inspect visible coupling, indirection, and change surface. For context inspect comments, documentation, examples, and explanatory intent that are actually present.',
        'Use the exact short commit SHA and exact filename supplied with each patch. Evidence must be a short concrete explanation of visible changed lines. Do not invent a SHA or filename.',
        'Return exactly one JSON object with this schema: {"confidence":60,"findings":[{"axis":"safety","verdict":"positive","impact":"introduced","severity":"low","category":"validation","commitSha":"abc1234","filename":"src/input.ts","evidence":"changed lines reject invalid input before processing"}]}',
        'Every finding must contain axis, verdict, impact, severity, commitSha, filename, and evidence. Safety findings must also contain category. Non-safety findings must omit category. Return at most twelve findings, no markdown, prose, code fences, or extra keys.',
      ].join(' '),
      userPrompt: `${buildDashboardReviewPrompt(input.context, selection)}\n/no_think`,
    })
    const extracted = extractModelText(response)
    const parsedResponse = parseDashboardReviewResponse(response, extracted, selection)
    if (parsedResponse) {
      return {
        ...parsedResponse.parsed,
        findings: parsedResponse.parsed.findings.filter(finding => isGroundedFinding(finding, selection)),
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
