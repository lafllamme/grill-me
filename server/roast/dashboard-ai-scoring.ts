import type { GithubCommit } from './github-collector'
import { createError } from 'h3'
import { ROAST_LIMITS } from '~~/shared/roast/contracts'
import { runAiSync } from './ai-client'
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
    `choices[0].finish_reason=${String(response?.choices?.[0]?.finish_reason ?? 'missing')}`,
    `choices[0].message.content.type=${Array.isArray(response?.choices?.[0]?.message?.content) ? 'array' : typeof response?.choices?.[0]?.message?.content}`,
    `choices[0].message.content.length=${typeof response?.choices?.[0]?.message?.content === 'string' ? response.choices[0].message.content.length : Array.isArray(response?.choices?.[0]?.message?.content) ? response.choices[0].message.content.length : 0}`,
    `choices[0].message.reasoning.length=${typeof response?.choices?.[0]?.message?.reasoning === 'string' ? response.choices[0].message.reasoning.length : 0}`,
    `choices[0].message.reasoning_content.length=${typeof response?.choices?.[0]?.message?.reasoning_content === 'string' ? response.choices[0].message.reasoning_content.length : 0}`,
  ]
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
