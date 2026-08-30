import type { DashboardAiSafetyAssessment } from './dashboard-ai-scoring'
import type { DashboardProfileRole, DashboardRoleClassification } from './dashboard-profile-roles'
import type { GithubCommit, GithubContext } from './github-collector'
import { resolveDashboardProfileRole } from './dashboard-profile-roles'
import { hasConfirmedRiskEvidence } from './dashboard-safety-evidence'

export type DashboardProfileAxis = 'clarity' | 'safety' | 'workflow' | 'complexity' | 'context'

export interface DashboardProfileScores {
  clarity: number
  safety: number
  workflow: number
  complexity: number
  context: number
}

export interface DashboardDerivedMetrics {
  commitCount: number
  pullRequestCount: number
  additions: number
  deletions: number
  changedFiles: number
  averageCommitSize: number
  medianCommitSize: number
  largestCommitSize: number
  p90CommitSize: number
  activeDays: number
  spanDays: number
  commitsPer30Days: number
  averageFilesPerCommit: number
  workflowCommitCount: number
  workflowAverageFilesPerCommit: number
  workflowMessageQuality: number
  workflowConventionalMessageRatio: number
  workflowLargeCommitRatio: number
  clarityScopeSignal: number
  contextDocumentationSignal: number
  messageQuality: number
  conventionalMessageRatio: number
  genericMessageRatio: number
  emptyMessageRatio: number
  documentationFileRatio: number
  testFileRatio: number
  ciFileRatio: number
  validationFileRatio: number
  pullRequestCoverage: number
  deletionRatio: number
  riskyFileRatio: number
  defensivePatchRatio: number
  riskyPatchRatio: number
  mergeCommitRatio: number
  largeCommitRatio: number
}

export interface DashboardProfileAssessment {
  version: 'v1'
  username: string
  scores: DashboardProfileScores
  overallScore: number
  grade: string
  role: DashboardProfileRole
  roleCandidates: DashboardProfileRole[]
  roleStatus: DashboardRoleClassification['status']
  derivedMetrics: DashboardDerivedMetrics
  confidence: number
  aiSafety?: DashboardAiSafetyAssessment
  evidenceWindow: {
    commitCount: number
    pullRequestCount: number
    source: 'github-public-activity'
    from?: string
    to?: string
  }
}

const axisWeights = [
  ['clarity', 0.2],
  ['safety', 0.2],
  ['workflow', 0.2],
  ['complexity', 0.2],
  ['context', 0.2],
] as const satisfies readonly [DashboardProfileAxis, number][]

const clamp = (value: number, min = 0, max = 100): number => Math.round(Math.min(max, Math.max(min, value)))
const average = (values: readonly number[]): number => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0
const ratio = (part: number, whole: number): number => whole > 0 ? part / whole : 0

function percentile(values: readonly number[], percentileValue: number): number {
  if (!values.length)
    return 0

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)
  return sorted[index] ?? 0
}

function scoreFromAverage(value: number, emptyFallback = 50): number {
  return clamp(value || emptyFallback)
}

const safetySeverityPenalty: Record<DashboardAiSafetyAssessment['signals'][number]['severity'], number> = {
  low: 5,
  medium: 15,
  high: 30,
}

function isKnownCommitSha(signalSha: string, commits: readonly GithubCommit[]): boolean {
  return commits.some(commit => signalSha === commit.sha || commit.sha.startsWith(signalSha) || signalSha.startsWith(commit.sha))
}

/**
 * Applies only AI signals that are both concrete and grounded in the supplied
 * commit sample. Safe, fixed, unclear, and unknown-commit signals are ignored.
 */
export function confirmedRiskPenalty(aiSafety: DashboardAiSafetyAssessment | undefined, commits: readonly GithubCommit[]): number {
  if (!aiSafety)
    return 0

  return aiSafety.signals.reduce((penalty, signal) => {
    if (signal.verdict !== 'risk'
      || signal.impact !== 'introduced'
      || !signal.evidence.trim()
      || !isKnownCommitSha(signal.commitSha, commits)
      || !hasConfirmedRiskEvidence(signal, commits)) {
      return penalty
    }

    const isSecretOrAuthBypass = (signal.category === 'secrets' || signal.category === 'auth') && signal.severity === 'high'
    return penalty + (isSecretOrAuthBypass ? 50 : safetySeverityPenalty[signal.severity])
  }, 0)
}

export function scoreDashboardSafety(metrics: DashboardDerivedMetrics, commits: readonly GithubCommit[], aiSafety?: DashboardAiSafetyAssessment): number {
  const hasPatchEvidence = commits.some(commit => commit.files.some(file => Boolean(file.patch?.trim())))
  if (!hasPatchEvidence)
    return 50

  return clamp(65
    + metrics.defensivePatchRatio * 0.20
    + metrics.testFileRatio * 0.15
    + metrics.ciFileRatio * 0.15
    + metrics.validationFileRatio * 0.10
    + metrics.pullRequestCoverage * 0.10
    - confirmedRiskPenalty(aiSafety, commits))
}

/**
 * Scores observable delivery hygiene without treating output volume or
 * maintainer merge work as personal workflow quality. Commit frequency and
 * merge ratio stay dashboard facts; they are intentionally not penalties.
 */
export function scoreDashboardWorkflow(metrics: DashboardDerivedMetrics): number {
  if (metrics.commitCount === 0)
    return 50

  if (metrics.workflowCommitCount === 0)
    return 50

  const messageSignal = metrics.workflowMessageQuality
  const fileScopeSignal = clamp(100 - Math.max(0, metrics.workflowAverageFilesPerCommit - 1) * 7)
  const outlierSignal = 100 - metrics.workflowLargeCommitRatio
  const granularitySignal = fileScopeSignal * 0.75 + outlierSignal * 0.25
  const reviewSignal = metrics.pullRequestCoverage > 0 ? metrics.pullRequestCoverage : 50

  return clamp(
    messageSignal * 0.45
    + granularitySignal * 0.40
    + reviewSignal * 0.15,
  )
}

/**
 * Scores clarity from the personal, non-merge commit sample. Merge messages
 * describe repository integration rather than the author's change intent, so
 * merge-only samples use the neutral evidence fallback.
 */
export function scoreDashboardClarity(metrics: DashboardDerivedMetrics): number {
  if (metrics.commitCount < 3 || metrics.workflowCommitCount < 3)
    return 50

  return clamp(
    metrics.workflowMessageQuality * 0.55
    + metrics.workflowConventionalMessageRatio * 0.15
    + metrics.clarityScopeSignal * 0.30,
  )
}

/**
 * Scores project context from personal intent, observed documentation work,
 * and review evidence. Missing documentation or PRs stay neutral because the
 * public commit sample cannot prove that either is absent from the repository.
 */
export function scoreDashboardContext(metrics: DashboardDerivedMetrics): number {
  if (metrics.commitCount < 3 || metrics.workflowCommitCount < 3)
    return 50

  const reviewSignal = metrics.pullRequestCoverage > 0 ? metrics.pullRequestCoverage : 50

  return clamp(
    metrics.workflowMessageQuality * 0.50
    + metrics.contextDocumentationSignal * 0.30
    + reviewSignal * 0.20,
  )
}

export function scoreCommitMessage(message: string): number {
  const subject = message.split('\n')[0]?.trim() ?? ''
  if (!subject)
    return 15

  let score = 42
  if (subject.length >= 12)
    score += 16
  if (subject.length >= 28)
    score += 10
  if (/^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i.test(subject))
    score += 24
  if (/\b(?:add|update|remove|handle|prevent|support|improve|move|extract|rename)\b/i.test(subject))
    score += 8
  if (/^(?:fix|changes?|stuff|update|wip|misc|asdf|test)$/i.test(subject))
    score -= 28
  if (subject === subject.toUpperCase() && /[A-Z]/.test(subject))
    score -= 8

  return clamp(score)
}

function fileSignal(commits: readonly GithubCommit[], pattern: RegExp): number {
  const files = commits.flatMap(commit => commit.files)
  return ratio(files.filter(file => pattern.test(file.filename)).length, files.length)
}

function patchSignal(commits: readonly GithubCommit[], pattern: RegExp): number {
  const patches = commits.flatMap(commit => commit.files).map(file => file.patch).filter((patch): patch is string => Boolean(patch))
  return ratio(patches.filter(patch => pattern.test(patch)).length, patches.length)
}

function isMergeCommit(commit: GithubCommit): boolean {
  return /^merge\s/i.test(commit.message) || /\bmerge branch\b/i.test(commit.message)
}

export function deriveDashboardMetrics(context: GithubContext): DashboardDerivedMetrics {
  const commits = context.commits
  const additions = commits.reduce((sum, commit) => sum + commit.additions, 0)
  const deletions = commits.reduce((sum, commit) => sum + commit.deletions, 0)
  const changedFiles = commits.reduce((sum, commit) => sum + commit.changedFiles, 0)
  const commitSizes = commits.map(commit => commit.additions + commit.deletions)
  const workflowCommits = commits.filter(commit => !isMergeCommit(commit))
  const workflowCommitSizes = workflowCommits.map(commit => commit.additions + commit.deletions)
  const workflowFileCounts = workflowCommits.map(commit => commit.changedFiles)
  const workflowConventionalMessages = workflowCommits.filter(commit => /^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const largeCommitCount = commits.filter(commit => commit.additions + commit.deletions >= 500 || commit.changedFiles >= 15).length
  const typicalWorkflowSize = percentile(workflowCommitSizes, 50)
  const typicalWorkflowFiles = percentile(workflowFileCounts, 50)
  const workflowSizeThreshold = Math.max(500, typicalWorkflowSize * 4)
  const workflowFileThreshold = Math.max(15, typicalWorkflowFiles * 4)
  const workflowLargeCommitCount = workflowCommits.filter(commit => commit.additions + commit.deletions >= workflowSizeThreshold || commit.changedFiles >= workflowFileThreshold).length
  const commitDates = commits.map(commit => commit.committedAt ? new Date(commit.committedAt) : null).filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())))
  const dayKeys = new Set(commitDates.map(date => date.toISOString().slice(0, 10)))
  const sortedDayKeys = [...dayKeys].sort()
  const earliestDay = sortedDayKeys[0] ? Date.parse(`${sortedDayKeys[0]}T00:00:00Z`) : 0
  const latestDay = sortedDayKeys.at(-1) ? Date.parse(`${sortedDayKeys.at(-1)}T00:00:00Z`) : 0
  const spanDays = earliestDay && latestDay ? Math.max(1, Math.round((latestDay - earliestDay) / 86_400_000) + 1) : 0
  const conventionalMessages = commits.filter(commit => /^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const genericMessages = commits.filter(commit => /^(?:fix|changes?|stuff|update|wip|misc|asdf|test)$/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const emptyMessages = commits.filter(commit => !commit.message.split('\n')[0]?.trim()).length
  const documentationFileRatio = Math.round(fileSignal(commits, /(?:^|\/)(?:readme|docs?)(?:\.|\/|$)|\.md$/i) * 100)

  return {
    commitCount: commits.length,
    pullRequestCount: context.prs.length,
    additions,
    deletions,
    changedFiles,
    averageCommitSize: Math.round(average(commitSizes)),
    medianCommitSize: Math.round(percentile(commitSizes, 50)),
    largestCommitSize: Math.max(0, ...commitSizes),
    p90CommitSize: Math.round(percentile(commitSizes, 90)),
    activeDays: dayKeys.size,
    spanDays,
    commitsPer30Days: spanDays ? Number((commits.length / spanDays * 30).toFixed(1)) : 0,
    averageFilesPerCommit: Number(average(commits.map(commit => commit.changedFiles)).toFixed(1)),
    workflowCommitCount: workflowCommits.length,
    workflowAverageFilesPerCommit: workflowCommits.length ? Number(average(workflowFileCounts).toFixed(1)) : 0,
    workflowMessageQuality: workflowCommits.length ? Math.round(average(workflowCommits.map(commit => scoreCommitMessage(commit.message)))) : 50,
    workflowConventionalMessageRatio: Math.round(ratio(workflowConventionalMessages, workflowCommits.length) * 100),
    workflowLargeCommitRatio: workflowCommits.length ? Math.round(ratio(workflowLargeCommitCount, workflowCommits.length) * 100) : 50,
    clarityScopeSignal: workflowCommits.length ? clamp(100 - Math.max(0, average(workflowFileCounts) - 1) * 7) : 50,
    contextDocumentationSignal: documentationFileRatio > 0 ? clamp(50 + Math.min(documentationFileRatio * 2, 30)) : 50,
    messageQuality: Math.round(average(commits.map(commit => scoreCommitMessage(commit.message)))),
    conventionalMessageRatio: Math.round(ratio(conventionalMessages, commits.length) * 100),
    genericMessageRatio: Math.round(ratio(genericMessages, commits.length) * 100),
    emptyMessageRatio: Math.round(ratio(emptyMessages, commits.length) * 100),
    documentationFileRatio,
    testFileRatio: Math.round(fileSignal(commits, /(?:^|\/)(?:__tests__|tests?|specs?)(?:\/|$)|\.(?:test|spec)\.[^.]+$/i) * 100),
    ciFileRatio: Math.round(fileSignal(commits, /(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:Jenkinsfile|azure-pipelines\.ya?ml)$/i) * 100),
    validationFileRatio: Math.round(fileSignal(commits, /(?:^|\/)(?:schemas?|validators?|validation|middleware|guards?)(?:\/|$)|(?:schema|validator|validation|guard)[^/]*\.[^.]+$/i) * 100),
    pullRequestCoverage: Math.round(Math.min(1, ratio(context.prs.length, commits.length)) * 100),
    deletionRatio: Math.round(ratio(deletions, additions + deletions) * 100),
    riskyFileRatio: Math.round(fileSignal(commits, /(?:^|\/)(?:auth|security|permissions?|secrets?|database|db|payments?)(?:\/|$)|(?:auth|security|permission|secret|database|payment)[^/]*\.[^.]+$/i) * 100),
    defensivePatchRatio: Math.round(patchSignal(commits, /\b(?:try\s*\{|catch\s*\(|validate|sanitize|escape|authorize|permission|fallback|throw new)\b/i) * 100),
    riskyPatchRatio: Math.round(patchSignal(commits, /\b(?:eval\s*\(|innerHTML\s*=|dangerouslySetInnerHTML|child_process|exec\s*\(|spawn\s*\(|SELECT[^;\n]{0,120}(?:\+|\$\{|format\s*\()|(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{16,}['"])/i) * 100),
    mergeCommitRatio: Math.round(ratio(commits.filter(isMergeCommit).length, commits.length) * 100),
    largeCommitRatio: Math.round(ratio(largeCommitCount, commits.length) * 100),
  }
}

export function gradeForDashboardScore(score: number): string {
  if (score >= 90) {
    return 'A'
  }
  if (score >= 85) {
    return 'A-'
  }
  if (score >= 80) {
    return 'B+'
  }
  if (score >= 75) {
    return 'B'
  }
  if (score >= 70) {
    return 'B-'
  }
  if (score >= 65) {
    return 'C+'
  }
  if (score >= 60) {
    return 'C'
  }
  if (score >= 55) {
    return 'C-'
  }
  if (score >= 50) {
    return 'D+'
  }
  if (score >= 45) {
    return 'D'
  }
  if (score >= 40) {
    return 'D-'
  }
  if (score >= 30) {
    return 'E'
  }
  if (score >= 20) {
    return 'E-'
  }
  return 'F'
}

export function scoreDashboardProfile(context: GithubContext, aiSafety?: DashboardAiSafetyAssessment): DashboardProfileAssessment {
  const metrics = deriveDashboardMetrics(context)
  const empty = metrics.commitCount === 0
  const normalizedCommitSize = Math.min(metrics.averageCommitSize / 700, 1)
  const normalizedFiles = Math.min(metrics.averageFilesPerCommit / 12, 1)
  const scores: DashboardProfileScores = {
    clarity: scoreDashboardClarity(metrics),
    safety: scoreDashboardSafety(metrics, context.commits, aiSafety),
    workflow: scoreDashboardWorkflow(metrics),
    complexity: scoreFromAverage(90 - normalizedFiles * 34 - normalizedCommitSize * 24 - metrics.largeCommitRatio * 0.18),
    context: scoreDashboardContext(metrics),
  }

  if (empty) {
    scores.clarity = 50
    scores.safety = 50
    scores.workflow = 50
    scores.complexity = 50
    scores.context = 50
  }

  const overallScore = clamp(axisWeights.reduce((sum, [axis, weight]) => sum + scores[axis] * weight, 0))
  const evidenceCount = metrics.commitCount + metrics.pullRequestCount
  const confidence = clamp(35 + Math.min(evidenceCount / 18, 1) * 65)
  const commitDates = context.commits.map(commit => commit.committedAt).filter((date): date is string => Boolean(date)).sort()
  const roleClassification = resolveDashboardProfileRole({
    scores,
    commitCount: metrics.commitCount,
    hasPatchEvidence: context.commits.some(commit => commit.files.some(file => Boolean(file.patch?.trim()))),
  })

  return {
    version: 'v1',
    username: context.username,
    scores,
    overallScore,
    grade: gradeForDashboardScore(overallScore),
    role: roleClassification.primary,
    roleCandidates: roleClassification.candidates,
    roleStatus: roleClassification.status,
    derivedMetrics: metrics,
    confidence,
    ...(aiSafety ? { aiSafety } : {}),
    evidenceWindow: {
      commitCount: metrics.commitCount,
      pullRequestCount: metrics.pullRequestCount,
      source: 'github-public-activity',
      ...(commitDates[0] ? { from: commitDates[0] } : {}),
      ...(commitDates.at(-1) ? { to: commitDates.at(-1) } : {}),
    },
  }
}
