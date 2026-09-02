import type { DashboardAiReviewAssessment, DashboardAiReviewEvidence, DashboardAiSafetyAssessment } from './dashboard-ai-scoring'
import type { DashboardProfileRole, DashboardRoleClassification } from './dashboard-profile-roles'
import type { GithubCommit, GithubCommitFile, GithubContext } from './github-collector'
import { resolveDashboardProfileRole } from './dashboard-profile-roles'
import { confirmedDefensivePatchPattern, hasConfirmedDefensiveEvidence, hasConfirmedRiskEvidence } from './dashboard-safety-evidence'
import { safetySurfaceFilePattern, safetySurfacePatchPattern } from './dashboard-safety-selection'

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
  workflowPatchCommitCount: number
  safetyPatchCommitRatio: number
  workflowAverageFilesPerCommit: number
  workflowMedianFilesPerCommit: number
  workflowP75FilesPerCommit: number
  workflowMessageQuality: number
  workflowConventionalMessageRatio: number
  workflowLargeCommitRatio: number
  clarityScopeSignal: number
  clarityNamingSignal: number
  clarityStructureSignal: number
  clarityNamingEvidenceAvailable: boolean
  clarityStructureEvidenceAvailable: boolean
  contextPatchExplanationSignal: number
  contextOrientationArtifactSignal: number
  contextCommitSignal: number
  contextRepositoryOrientationSignal: number
  contextHandoffSignal: number
  contextPatchExplanationEvidenceAvailable: boolean
  contextOrientationArtifactEvidenceAvailable: boolean
  contextCommitEvidenceAvailable: boolean
  contextRepositoryEvidenceAvailable: boolean
  contextHandoffEvidenceAvailable: boolean
  complexityEffectiveFilesP75: number
  complexityExcludedFileRatio: number
  complexityRelativeOutlierRatio: number
  complexityScopeSignal: number
  complexityOutlierSignal: number
  complexityChurnSignal: number
  messageQuality: number
  conventionalMessageRatio: number
  genericMessageRatio: number
  emptyMessageRatio: number
  documentationFileRatio: number
  testFileRatio: number
  ciFileRatio: number
  validationFileRatio: number
  safetySurfaceFileRatio: number
  safetySurfaceLineRatio: number
  safetyDefenseCoverage: number
  pullRequestCoverage: number
  deletionRatio: number
  workflowDeletionRatio: number
  riskyFileRatio: number
  defensivePatchRatio: number
  riskyPatchRatio: number
  mergeCommitRatio: number
  largeCommitRatio: number
}

export interface DashboardProfileAssessment {
  version: 'v2'
  username: string
  scores: DashboardProfileScores
  overallScore: number
  grade: string
  role: DashboardProfileRole
  roleCandidates: DashboardProfileRole[]
  roleStatus: DashboardRoleClassification['status']
  derivedMetrics: DashboardDerivedMetrics
  confidence: number
  safetyAiDefenseBonus: number
  aiSafety?: DashboardAiSafetyAssessment
  aiReview?: DashboardAiReviewAssessment
  aiAdjustments: Partial<Record<DashboardProfileAxis, number>>
  evidenceWindow: {
    commitCount: number
    pullRequestCount: number
    source: 'github-public-activity' | 'github-repository-evidence'
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

const complexityExcludedFilePattern = /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|\.nuxt|\.changeset|generated)(?:\/|$)|(?:^|\/)(?:generated[^/]*|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|npm-shrinkwrap\.json|CHANGELOG(?:\.[^/]+)?|release-notes(?:\.[^/]+)?)$/i
const complexityTestFilePattern = /(?:^|\/)(?:__tests__|tests?|specs?)(?:\/|$)|\.(?:test|spec)\.[^.]+$/i
const complexityDocumentationFilePattern = /(?:^|\/)(?:readme|docs?)(?:\.|\/|$)|\.md$/i
const complexityNonCodeFilePattern = /(?:^|\/)[^/]+\.kicad_block(?:\/|$)|\.(?:kicad_pcb|kicad_prl|kicad_pro|kicad_sch|pcb|sch|brd|dsn|gbr|step|stp|stl|iges|wrl|svg|png|jpe?g|gif|webp|ico|pdf|zip|tar|gz|bin|hex|uf2)$/i
const contextGeneratedArtifactPattern = /(?:^|\/)(?:CHANGELOG(?:\.[^/]+)?|release-notes(?:\.[^/]+)?|generated[^/]*)$/i
const contextOrientationArtifactPattern = /^(?:README(?:\.[^/]+)?|CONTRIBUTING(?:\.[^/]+)?|docs?|documentation|examples?|architecture|adrs?)(?:\/|\.|$)/i
const contextExplanationLinePattern = /^\s*(?:\/\/|\/\*|\*|#\s|<!--|'''|""")|\s(?:\/\/|\/\*).*\S/
const contextIntentPattern = /\b(?:because|so that|in order to|why|reason|instead of|to avoid|to allow|to support|migration|migrate|breaking change|backward compatible|follow[- ]?up|related to|document(?:ed|ation)?|explain(?:s|ed|ation)?)\b|(?:fixes?|closes?|resolves?)\s+#\d+/
const contextSubjectActionPattern = /\b(?:add|allow|change|extract|fix|handle|improve|introduce|migrate|prevent|refactor|remove|rename|replace|split|support|update)\b/
const contextGenericSubjectPattern = /^(?:fix|changes?|stuff|update|wip|misc|asdf|test)$/
const clarityDeclarationPattern = /^(?:export(?:\s+default)?\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/
const clarityGenericIdentifierPattern = /^(?:[xyzijkn]|data|item|value|thing|stuff|tmp|temp|obj|res|result|foo|bar|baz|misc)$/i

function percentile(values: readonly number[], percentileValue: number): number {
  if (!values.length)
    return 0

  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)
  return sorted[index] ?? 0
}

function complexityFileWeight(file: GithubCommitFile): number {
  if (complexityExcludedFilePattern.test(file.filename) || complexityNonCodeFilePattern.test(file.filename))
    return 0
  if (complexityTestFilePattern.test(file.filename))
    return 0.5
  if (complexityDocumentationFilePattern.test(file.filename))
    return 0.25
  return 1
}

/**
 * Estimates the effective change surface while accounting for GitHub's
 * bounded file sample. Unlisted files inherit the average visible file-class
 * weight; when no file class is visible, the estimate stays conservative.
 */
function effectiveComplexityFiles(commit: GithubCommit): number {
  const visibleWeights = commit.files.map(complexityFileWeight)
  const visibleWeight = visibleWeights.reduce((sum, weight) => sum + weight, 0)
  const omittedFileCount = Math.max(0, commit.changedFiles - commit.files.length)
  const inferredOmittedWeight = commit.files.length ? average(visibleWeights) : 1
  return visibleWeight + omittedFileCount * inferredOmittedWeight
}

function excludedComplexityFileRatio(commits: readonly GithubCommit[]): number {
  const files = commits.flatMap(commit => commit.files)
  return Math.round(ratio(files.filter(file => complexityFileWeight(file) === 0).length, files.length) * 100)
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

export interface DashboardSafetyScoreBreakdown {
  evidenceStatus: 'insufficient' | 'neutral' | 'surface-observed'
  surfaceFileRatio: number
  surfaceLineRatio: number
  defenseCoverage: number
  deterministicDefenseBonus: number
  aiDefenseBonus: number
  processBonus: number
  riskPenalty: number
  rawScore: number
}

const safetyTestFilePattern = /(?:^|\/)(?:__tests__|tests?|specs?)(?:\/|$)|\.(?:test|spec)\.[^.]+$/i

function addedPatchLinesFromFile(file: GithubCommitFile): string[] {
  return file.patch
    ?.split('\n')
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1))
    .filter(line => line.trim())
    ?? []
}

function isSafetySurfaceFile(file: GithubCommitFile): boolean {
  return !safetyTestFilePattern.test(file.filename) && safetySurfaceFilePattern.test(file.filename)
}

function getDashboardSafetySurfaceMetrics(commits: readonly GithubCommit[]): Pick<DashboardDerivedMetrics, 'safetySurfaceFileRatio' | 'safetySurfaceLineRatio' | 'safetyDefenseCoverage'> {
  const patchFiles = commits.flatMap(commit => commit.files).filter(file => Boolean(file.patch?.trim()))
  const surfaceFiles = patchFiles.filter((file) => {
    if (isSafetySurfaceFile(file))
      return true

    return addedPatchLinesFromFile(file).some(line => safetySurfacePatchPattern.test(line))
  })
  const surfaceLines = patchFiles.flatMap((file) => {
    const addedLines = addedPatchLinesFromFile(file)
    if (isSafetySurfaceFile(file))
      return addedLines

    return addedLines.filter(line => safetySurfacePatchPattern.test(line))
  })
  const defensiveSurfaceFiles = surfaceFiles.filter(file => addedPatchLinesFromFile(file).some(line => confirmedDefensivePatchPattern.test(line)))
  const defensiveSurfaceLines = surfaceLines.filter(line => confirmedDefensivePatchPattern.test(line))
  const fileCoverage = ratio(defensiveSurfaceFiles.length, surfaceFiles.length)
  const lineCoverage = ratio(defensiveSurfaceLines.length, surfaceLines.length)

  return {
    safetySurfaceFileRatio: Math.round(ratio(surfaceFiles.length, patchFiles.length) * 100),
    safetySurfaceLineRatio: Math.round(ratio(surfaceLines.length, patchFiles.flatMap(addedPatchLinesFromFile).length) * 100),
    safetyDefenseCoverage: Math.round((fileCoverage * 0.6 + lineCoverage * 0.4) * 100),
  }
}

export function confirmedDefensivePatchBonus(aiSafety: DashboardAiSafetyAssessment | undefined, commits: readonly GithubCommit[]): number {
  if (!aiSafety || aiSafety.status !== 'assessed' || aiSafety.confidence < 70)
    return 0

  const groundedSignals = aiSafety.signals.filter(signal => (
    signal.verdict === 'safe'
    && (signal.impact === 'introduced' || signal.impact === 'fixed')
    && Boolean(signal.evidence.trim())
    && isKnownCommitSha(signal.commitSha, commits)
    && hasConfirmedDefensiveEvidence(signal, commits)
  ))
  const distinctSignals = new Set(groundedSignals.map(signal => `${signal.commitSha}:${signal.filename ?? signal.category}`))
  return Math.min(8, distinctSignals.size * 4)
}

export function getDashboardSafetyScoreBreakdown(metrics: DashboardDerivedMetrics, commits: readonly GithubCommit[], aiSafety?: DashboardAiSafetyAssessment): DashboardSafetyScoreBreakdown {
  const personalCommits = commits.filter(commit => !isMergeCommit(commit))
  const hasPatchEvidence = personalCommits.some(commit => commit.files.some(file => Boolean(file.patch?.trim())))
  if (!hasPatchEvidence) {
    return {
      evidenceStatus: 'insufficient',
      surfaceFileRatio: metrics.safetySurfaceFileRatio,
      surfaceLineRatio: metrics.safetySurfaceLineRatio,
      defenseCoverage: metrics.safetyDefenseCoverage,
      deterministicDefenseBonus: 0,
      aiDefenseBonus: 0,
      processBonus: 0,
      riskPenalty: 0,
      rawScore: 50,
    }
  }

  const hasSafetySurface = metrics.safetySurfaceFileRatio > 0 || metrics.safetySurfaceLineRatio > 0
  const patchCoverageMultiplier = 0.5 + (metrics.safetyPatchCommitRatio / 100) * 0.5
  const riskPenalty = confirmedRiskPenalty(aiSafety, personalCommits)
  const aiDefenseBonus = confirmedDefensivePatchBonus(aiSafety, personalCommits) * patchCoverageMultiplier
  const processBonus = hasSafetySurface
    ? Math.min(5, metrics.validationFileRatio * 0.03 + metrics.ciFileRatio * 0.02)
    : 0
  const deterministicDefenseBonus = hasSafetySurface
    ? metrics.safetyDefenseCoverage * 0.25 * patchCoverageMultiplier
    : 0
  // A safety-relevant surface is not itself a failure. Without a confirmed
  // risk or visible defensive evidence, it stays at the same neutral baseline
  // as an ordinary patch instead of turning missing proof into a penalty.
  const baseScore = 70
  const rawScore = baseScore + deterministicDefenseBonus + aiDefenseBonus + processBonus - riskPenalty

  return {
    evidenceStatus: hasSafetySurface ? 'surface-observed' : 'neutral',
    surfaceFileRatio: metrics.safetySurfaceFileRatio,
    surfaceLineRatio: metrics.safetySurfaceLineRatio,
    defenseCoverage: metrics.safetyDefenseCoverage,
    deterministicDefenseBonus,
    aiDefenseBonus,
    processBonus,
    riskPenalty,
    rawScore: clamp(Math.min(95, rawScore)),
  }
}

export function scoreDashboardSafety(metrics: DashboardDerivedMetrics, commits: readonly GithubCommit[], aiSafety?: DashboardAiSafetyAssessment): number {
  return getDashboardSafetyScoreBreakdown(metrics, commits, aiSafety).rawScore
}

/**
 * Scores observable delivery hygiene without treating output volume or
 * maintainer merge work as personal workflow quality. Commit frequency and
 * merge ratio stay dashboard facts; they are intentionally not penalties.
 */
export interface DashboardWorkflowScoreBreakdown {
  messageSignal: number
  medianScopeSignal: number
  p75ScopeSignal: number
  fileScopeSignal: number
  outlierSignal: number
  granularitySignal: number
  reviewSignal: number
  reviewEvidenceAvailable: boolean
  evidenceCap: number
  evidenceQuality: 'insufficient' | 'limited' | 'usable' | 'strong'
  rawScore: number
}

export interface DashboardClarityScoreBreakdown {
  messageSignal: number
  conventionalMessageRatio: number
  namingSignal: number
  structureSignal: number
  namingEvidenceAvailable: boolean
  structureEvidenceAvailable: boolean
  rawScore: number
}

export interface DashboardContextScoreBreakdown {
  patchExplanationSignal: number
  orientationArtifactSignal: number
  commitContextSignal: number
  repositoryOrientationSignal: number
  handoffSignal: number
  patchExplanationEvidenceAvailable: boolean
  orientationArtifactEvidenceAvailable: boolean
  commitContextEvidenceAvailable: boolean
  repositoryEvidenceAvailable: boolean
  handoffEvidenceAvailable: boolean
  rawScore: number
}

export function getDashboardWorkflowEvidenceCap(metrics: DashboardDerivedMetrics): number {
  if (metrics.workflowCommitCount < 3)
    return 50

  // A score in the 90s needs more than a clean-looking metadata sample. Patch
  // evidence and enough personal commits are required before Workflow can
  // claim a strong delivery pattern.
  if (metrics.workflowPatchCommitCount < 3 || metrics.workflowCommitCount < 6)
    return 84
  if (metrics.workflowCommitCount < 10)
    return 89
  return 95
}

function getDashboardWorkflowEvidenceQuality(metrics: DashboardDerivedMetrics): DashboardWorkflowScoreBreakdown['evidenceQuality'] {
  if (metrics.workflowCommitCount < 3)
    return 'insufficient'
  if (metrics.workflowPatchCommitCount < 3 || metrics.workflowCommitCount < 6)
    return 'limited'
  if (metrics.workflowCommitCount < 10)
    return 'usable'
  return 'strong'
}

export function getDashboardWorkflowScoreBreakdown(metrics: DashboardDerivedMetrics): DashboardWorkflowScoreBreakdown {
  if (metrics.workflowCommitCount === 0) {
    return {
      messageSignal: 50,
      medianScopeSignal: 50,
      p75ScopeSignal: 50,
      fileScopeSignal: 50,
      outlierSignal: 50,
      granularitySignal: 50,
      reviewSignal: 50,
      reviewEvidenceAvailable: false,
      evidenceCap: 50,
      evidenceQuality: 'insufficient',
      rawScore: 50,
    }
  }

  const medianScopeSignal = clamp(100 - Math.max(0, metrics.workflowMedianFilesPerCommit - 2) * 5)
  const p75ScopeSignal = clamp(100 - Math.max(0, metrics.workflowP75FilesPerCommit - 4) * 3)
  const fileScopeSignal = medianScopeSignal * 0.65 + p75ScopeSignal * 0.35
  const outlierSignal = 100 - metrics.workflowLargeCommitRatio

  const reviewSignal = metrics.pullRequestCoverage > 0 ? metrics.pullRequestCoverage : 50
  const reviewEvidenceAvailable = metrics.pullRequestCoverage > 0
  const weightedSignals = metrics.workflowMessageQuality * 0.45
    + (fileScopeSignal * 0.75 + outlierSignal * 0.25) * 0.40
    + (reviewEvidenceAvailable ? reviewSignal * 0.15 : 0)
  const observedWeight = reviewEvidenceAvailable ? 1 : 0.85

  return {
    messageSignal: metrics.workflowMessageQuality,
    medianScopeSignal,
    p75ScopeSignal,
    fileScopeSignal,
    outlierSignal,
    granularitySignal: fileScopeSignal * 0.75 + outlierSignal * 0.25,
    reviewSignal,
    reviewEvidenceAvailable,
    evidenceCap: getDashboardWorkflowEvidenceCap(metrics),
    evidenceQuality: getDashboardWorkflowEvidenceQuality(metrics),
    rawScore: clamp(weightedSignals / observedWeight),
  }
}

export function scoreDashboardWorkflow(metrics: DashboardDerivedMetrics): number {
  if (metrics.commitCount < 3 || metrics.workflowCommitCount < 3)
    return 50

  if (metrics.workflowCommitCount === 0)
    return 50

  return Math.min(getDashboardWorkflowScoreBreakdown(metrics).rawScore, getDashboardWorkflowEvidenceCap(metrics))
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
    metrics.workflowMessageQuality * 0.35
    + metrics.clarityNamingSignal * 0.30
    + metrics.clarityStructureSignal * 0.35,
  )
}

export function getDashboardClarityScoreBreakdown(metrics: DashboardDerivedMetrics): DashboardClarityScoreBreakdown {
  if (metrics.workflowCommitCount === 0) {
    return {
      messageSignal: 50,
      conventionalMessageRatio: 50,
      namingSignal: 50,
      structureSignal: 50,
      namingEvidenceAvailable: false,
      structureEvidenceAvailable: false,
      rawScore: 50,
    }
  }

  return {
    messageSignal: metrics.workflowMessageQuality,
    conventionalMessageRatio: metrics.workflowConventionalMessageRatio,
    namingSignal: metrics.clarityNamingSignal,
    structureSignal: metrics.clarityStructureSignal,
    namingEvidenceAvailable: metrics.clarityNamingEvidenceAvailable,
    structureEvidenceAvailable: metrics.clarityStructureEvidenceAvailable,
    rawScore: scoreDashboardClarity(metrics),
  }
}

export function getDashboardContextScoreBreakdown(metrics: DashboardDerivedMetrics): DashboardContextScoreBreakdown {
  if (metrics.commitCount < 3 || metrics.workflowCommitCount < 3) {
    return {
      patchExplanationSignal: 50,
      orientationArtifactSignal: 50,
      commitContextSignal: 50,
      repositoryOrientationSignal: 50,
      handoffSignal: 50,
      patchExplanationEvidenceAvailable: false,
      orientationArtifactEvidenceAvailable: false,
      commitContextEvidenceAvailable: false,
      repositoryEvidenceAvailable: false,
      handoffEvidenceAvailable: false,
      rawScore: 50,
    }
  }

  const rawScore = clamp(
    60
    + (metrics.contextPatchExplanationSignal - 50) * 0.35
    + (metrics.contextOrientationArtifactSignal - 50) * 0.20
    + (metrics.contextCommitSignal - 50) * 0.35
    + (metrics.contextRepositoryOrientationSignal - 50) * 0.05
    + (metrics.contextHandoffSignal - 50) * 0.05,
  )

  return {
    patchExplanationSignal: metrics.contextPatchExplanationSignal,
    orientationArtifactSignal: metrics.contextOrientationArtifactSignal,
    commitContextSignal: metrics.contextCommitSignal,
    repositoryOrientationSignal: metrics.contextRepositoryOrientationSignal,
    handoffSignal: metrics.contextHandoffSignal,
    patchExplanationEvidenceAvailable: metrics.contextPatchExplanationEvidenceAvailable,
    orientationArtifactEvidenceAvailable: metrics.contextOrientationArtifactEvidenceAvailable,
    commitContextEvidenceAvailable: metrics.contextCommitEvidenceAvailable,
    repositoryEvidenceAvailable: metrics.contextRepositoryEvidenceAvailable,
    handoffEvidenceAvailable: metrics.contextHandoffEvidenceAvailable,
    rawScore,
  }
}

/**
 * Scores Complexity v2 from effective personal change surface. This is a
 * GitHub-observable proxy, not a claim about cyclomatic complexity or AST
 * structure. Merge commits are excluded before all three signals are derived.
 */
export function scoreDashboardComplexity(metrics: DashboardDerivedMetrics): number {
  if (metrics.commitCount < 3 || metrics.workflowCommitCount < 3)
    return 50

  return clamp(
    metrics.complexityScopeSignal * 0.50
    + metrics.complexityOutlierSignal * 0.30
    + metrics.complexityChurnSignal * 0.20,
  )
}

/**
 * Scores project context from visible explanations, orientation artifacts,
 * commit bodies, repository affordances, and handoff evidence. Missing
 * documentation or PRs stay neutral because the public sample cannot prove
 * that either is absent from the repository.
 */
export function scoreDashboardContext(metrics: DashboardDerivedMetrics): number {
  return getDashboardContextScoreBreakdown(metrics).rawScore
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

function addedPatchSignal(commits: readonly GithubCommit[], pattern: RegExp): number {
  const patches = commits
    .flatMap(commit => commit.files)
    .map(file => file.patch)
    .filter((patch): patch is string => Boolean(patch))
    .map(patch => patch
      .split('\n')
      .filter(line => line.startsWith('+') && !line.startsWith('+++'))
      .join('\n'))
    .filter(Boolean)

  return ratio(patches.filter(patch => pattern.test(patch)).length, patches.length)
}

function addedPatchLines(commits: readonly GithubCommit[]): string[] {
  return commits
    .flatMap(commit => commit.files)
    .flatMap(file => file.patch?.split('\n') ?? [])
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1))
}

function clarityNamingSignal(commits: readonly GithubCommit[]): { signal: number, evidenceAvailable: boolean } {
  const declarations = addedPatchLines(commits)
    .map(line => line.trim().match(clarityDeclarationPattern)?.[1])
    .filter((name): name is string => Boolean(name))

  if (!declarations.length)
    return { signal: 50, evidenceAvailable: false }

  const descriptiveRatio = ratio(
    declarations.filter(name => !clarityGenericIdentifierPattern.test(name)).length,
    declarations.length,
  )
  return { signal: clamp(descriptiveRatio * 100), evidenceAvailable: true }
}

function clarityStructureSignal(commits: readonly GithubCommit[]): { signal: number, evidenceAvailable: boolean } {
  const codeLines = addedPatchLines(commits)
    .filter(line => line.trim() && !/^\s*(?:\/\/|\/\*|\*|#)/.test(line))

  if (!codeLines.length)
    return { signal: 50, evidenceAvailable: false }

  const longLineRatio = ratio(codeLines.filter(line => line.trimEnd().length > 120).length, codeLines.length)
  const deeplyIndentedRatio = ratio(codeLines.filter(line => /^\s{12,}/.test(line) || /^\t{3,}/.test(line)).length, codeLines.length)
  return {
    signal: clamp(100 - longLineRatio * 45 - deeplyIndentedRatio * 55),
    evidenceAvailable: true,
  }
}

function contextVisiblePatchFiles(commits: readonly GithubCommit[]): GithubCommitFile[] {
  return commits
    .flatMap(commit => commit.files)
    .filter(file => Boolean(file.patch?.trim()))
}

function contextPatchExplanationSignal(commits: readonly GithubCommit[]): { signal: number, evidenceAvailable: boolean } {
  const addedLines = commits
    .flatMap(commit => commit.files)
    .filter(file => !contextOrientationArtifactPattern.test(file.filename) && !contextGeneratedArtifactPattern.test(file.filename))
    .flatMap(file => file.patch?.split('\n') ?? [])
    .filter(line => line.startsWith('+') && !line.startsWith('+++'))
    .map(line => line.slice(1))
    .filter(line => line.trim())

  if (!addedLines.length)
    return { signal: 50, evidenceAvailable: false }

  const explanatoryLineRatio = ratio(addedLines.filter(line => contextExplanationLinePattern.test(line)).length, addedLines.length)
  return { signal: clamp(50 + explanatoryLineRatio * 40), evidenceAvailable: true }
}

function contextOrientationArtifactWeight(filename: string): number {
  if (contextGeneratedArtifactPattern.test(filename))
    return 0
  if (/^README(?:\.[^/]+)?$/i.test(filename) || /^CONTRIBUTING(?:\.[^/]+)?$/i.test(filename))
    return 1
  if (/^(?:docs?|documentation)(?:\/|\.|$)/i.test(filename))
    return 0.8
  if (/^(?:examples?|architecture|adrs?)(?:\/|\.|$)/i.test(filename))
    return 0.6
  return 0
}

function contextOrientationArtifactSignal(commits: readonly GithubCommit[]): { signal: number, evidenceAvailable: boolean } {
  const files = contextVisiblePatchFiles(commits)
  if (!files.length)
    return { signal: 50, evidenceAvailable: false }

  const orientationWeight = files.reduce((sum, file) => sum + contextOrientationArtifactWeight(file.filename), 0)
  if (!orientationWeight)
    return { signal: 50, evidenceAvailable: false }

  return {
    signal: clamp(50 + Math.min(orientationWeight / files.length, 1) * 40),
    evidenceAvailable: true,
  }
}

function contextCommitSignal(commits: readonly GithubCommit[]): { signal: number, evidenceAvailable: boolean } {
  if (!commits.length)
    return { signal: 50, evidenceAvailable: false }

  const commitSignals = commits.map((commit) => {
    const [subject = '', ...bodyLines] = commit.message.split('\n')
    const body = bodyLines.join(' ').trim()
    const hasMeaningfulBody = body.length >= 20
    const hasExplicitContext = contextIntentPattern.test(commit.message.toLowerCase())

    const normalizedSubject = subject.trim().toLowerCase()
    const subjectWords = normalizedSubject.split(/\s+/).filter(Boolean)
    const subjectWithoutPrefix = normalizedSubject.replace(/^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\([^)]*\))?:\s*/, '')
    const hasSpecificSubject = subjectWords.length >= 3
      && contextSubjectActionPattern.test(normalizedSubject)
      && !contextGenericSubjectPattern.test(subjectWithoutPrefix)

    let signal = 50
    if (hasSpecificSubject)
      signal += 15
    if (hasMeaningfulBody)
      signal += 15
    if (hasExplicitContext)
      signal += 10
    return clamp(signal)
  })

  return {
    signal: clamp(average(commitSignals)),
    evidenceAvailable: commitSignals.some(signal => signal > 50),
  }
}

function contextRepositoryOrientationSignal(repositories: GithubContext['repositories']): { signal: number, evidenceAvailable: boolean } {
  const rootEntries = repositories?.flatMap(repository => repository.rootEntries) ?? []
  if (!rootEntries.length)
    return { signal: 50, evidenceAvailable: false }

  const orientationWeight = rootEntries.reduce((sum, entry) => sum + contextOrientationArtifactWeight(entry), 0)
  return {
    signal: orientationWeight ? clamp(50 + Math.min(orientationWeight * 8, 30)) : 50,
    evidenceAvailable: true,
  }
}

function contextHandoffSignal(metrics: Pick<DashboardDerivedMetrics, 'pullRequestCoverage'>, pullRequests: number, reviewedPullRequests: number): { signal: number, evidenceAvailable: boolean } {
  if (!pullRequests)
    return { signal: 50, evidenceAvailable: false }

  const reviewedRatio = ratio(reviewedPullRequests, pullRequests)
  return {
    signal: clamp(50 + metrics.pullRequestCoverage * 0.20 + reviewedRatio * 20),
    evidenceAvailable: true,
  }
}

function isMergeCommit(commit: GithubCommit): boolean {
  return commit.isMerge ?? (commit.parentCount !== undefined
    ? commit.parentCount > 1
    : /^merge\s/i.test(commit.message) || /\bmerge branch\b/i.test(commit.message))
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
  const complexityEffectiveFileCounts = workflowCommits.map(effectiveComplexityFiles)
  const workflowConventionalMessages = workflowCommits.filter(commit => /^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const largeCommitCount = commits.filter(commit => commit.additions + commit.deletions >= 500 || commit.changedFiles >= 15).length
  const typicalWorkflowSize = percentile(workflowCommitSizes, 50)
  const typicalWorkflowFiles = percentile(workflowFileCounts, 50)
  const workflowSizeThreshold = Math.max(500, typicalWorkflowSize * 4)
  const workflowFileThreshold = Math.max(15, typicalWorkflowFiles * 4)
  const workflowLargeCommitCount = workflowCommits.filter(commit => commit.additions + commit.deletions >= workflowSizeThreshold || commit.changedFiles >= workflowFileThreshold).length
  const complexityOutlierCommitCount = complexityEffectiveFileCounts.filter(effectiveFileCount => effectiveFileCount >= 12).length
  const workflowAdditions = workflowCommits.reduce((sum, commit) => sum + commit.additions, 0)
  const workflowDeletions = workflowCommits.reduce((sum, commit) => sum + commit.deletions, 0)
  const workflowPatchCommitCount = workflowCommits.filter(commit => commit.files.some(file => Boolean(file.patch?.trim()))).length
  const commitDates = commits.map(commit => commit.committedAt ? new Date(commit.committedAt) : null).filter((date): date is Date => Boolean(date && !Number.isNaN(date.getTime())))
  const dayKeys = new Set(commitDates.map(date => date.toISOString().slice(0, 10)))
  const sortedDayKeys = [...dayKeys].sort()
  const earliestDay = sortedDayKeys[0] ? Date.parse(`${sortedDayKeys[0]}T00:00:00Z`) : 0
  const latestDay = sortedDayKeys.at(-1) ? Date.parse(`${sortedDayKeys.at(-1)}T00:00:00Z`) : 0
  const spanDays = earliestDay && latestDay ? Math.max(1, Math.round((latestDay - earliestDay) / 86_400_000) + 1) : 0
  const conventionalMessages = commits.filter(commit => /^(?:feat|fix|refactor|docs|test|chore|perf|build|ci|style)(?:\(.+\))?:\s+\S+/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const genericMessages = commits.filter(commit => /^(?:fix|changes?|stuff|update|wip|misc|asdf|test)$/i.test(commit.message.split('\n')[0]?.trim() ?? '')).length
  const emptyMessages = commits.filter(commit => !commit.message.split('\n')[0]?.trim()).length
  const documentationFileRatio = Math.round(fileSignal(workflowCommits, /(?:^|\/)(?:readme|docs?)(?:\.|\/|$)|\.md$/i) * 100)
  const workflowDeletionRatio = Math.round(ratio(workflowDeletions, workflowAdditions + workflowDeletions) * 100)
  const namingSignal = clarityNamingSignal(workflowCommits)
  const structureSignal = clarityStructureSignal(workflowCommits)
  const contextPatchExplanation = contextPatchExplanationSignal(workflowCommits)
  const contextOrientationArtifact = contextOrientationArtifactSignal(workflowCommits)
  const contextCommit = contextCommitSignal(workflowCommits)
  const contextRepositoryOrientation = contextRepositoryOrientationSignal(context.repositories)
  const pullRequestCoverage = Math.round(Math.min(1, ratio(context.prs.length, workflowCommits.length)) * 100)
  const reviewedPullRequestCount = context.prs.filter(pullRequest => (pullRequest.reviewCount ?? 0) > 0 || (pullRequest.reviewCommentCount ?? 0) > 0 || (pullRequest.commentCount ?? 0) > 0).length
  const contextHandoff = contextHandoffSignal({ pullRequestCoverage }, context.prs.length, reviewedPullRequestCount)
  const complexityEffectiveFilesP75 = workflowCommits.length ? Number(percentile(complexityEffectiveFileCounts, 75).toFixed(1)) : 50
  const complexityRelativeOutlierRatio = workflowCommits.length ? Math.round(ratio(complexityOutlierCommitCount, workflowCommits.length) * 100) : 50
  const complexityScopeSignal = workflowCommits.length
    ? clamp(100 - Math.min(60, Math.max(0, complexityEffectiveFilesP75 - 2) * 5))
    : 50
  const complexityOutlierSignal = workflowCommits.length ? 100 - complexityRelativeOutlierRatio : 50
  const complexityChurnSignal = clamp(100 - Math.max(0, workflowDeletionRatio - 50) * 0.5)
  const safetySurface = getDashboardSafetySurfaceMetrics(workflowCommits)

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
    workflowPatchCommitCount,
    safetyPatchCommitRatio: Math.round(ratio(workflowPatchCommitCount, workflowCommits.length) * 100),
    workflowAverageFilesPerCommit: workflowCommits.length ? Number(average(workflowFileCounts).toFixed(1)) : 0,
    workflowMedianFilesPerCommit: workflowCommits.length ? Number(percentile(workflowFileCounts, 50).toFixed(1)) : 0,
    workflowP75FilesPerCommit: workflowCommits.length ? Number(percentile(workflowFileCounts, 75).toFixed(1)) : 0,
    workflowMessageQuality: workflowCommits.length ? Math.round(average(workflowCommits.map(commit => scoreCommitMessage(commit.message)))) : 50,
    workflowConventionalMessageRatio: Math.round(ratio(workflowConventionalMessages, workflowCommits.length) * 100),
    workflowLargeCommitRatio: workflowCommits.length ? Math.round(ratio(workflowLargeCommitCount, workflowCommits.length) * 100) : 50,
    clarityScopeSignal: workflowCommits.length ? clamp(100 - Math.max(0, average(workflowFileCounts) - 1) * 7) : 50,
    clarityNamingSignal: namingSignal.signal,
    clarityStructureSignal: structureSignal.signal,
    clarityNamingEvidenceAvailable: namingSignal.evidenceAvailable,
    clarityStructureEvidenceAvailable: structureSignal.evidenceAvailable,
    contextPatchExplanationSignal: contextPatchExplanation.signal,
    contextOrientationArtifactSignal: contextOrientationArtifact.signal,
    contextCommitSignal: contextCommit.signal,
    contextRepositoryOrientationSignal: contextRepositoryOrientation.signal,
    contextHandoffSignal: contextHandoff.signal,
    contextPatchExplanationEvidenceAvailable: contextPatchExplanation.evidenceAvailable,
    contextOrientationArtifactEvidenceAvailable: contextOrientationArtifact.evidenceAvailable,
    contextCommitEvidenceAvailable: contextCommit.evidenceAvailable,
    contextRepositoryEvidenceAvailable: contextRepositoryOrientation.evidenceAvailable,
    contextHandoffEvidenceAvailable: contextHandoff.evidenceAvailable,
    complexityEffectiveFilesP75,
    complexityExcludedFileRatio: excludedComplexityFileRatio(workflowCommits),
    complexityRelativeOutlierRatio,
    complexityScopeSignal,
    complexityOutlierSignal,
    complexityChurnSignal,
    messageQuality: Math.round(average(commits.map(commit => scoreCommitMessage(commit.message)))),
    conventionalMessageRatio: Math.round(ratio(conventionalMessages, commits.length) * 100),
    genericMessageRatio: Math.round(ratio(genericMessages, commits.length) * 100),
    emptyMessageRatio: Math.round(ratio(emptyMessages, commits.length) * 100),
    documentationFileRatio,
    testFileRatio: Math.round(fileSignal(workflowCommits, /(?:^|\/)(?:__tests__|tests?|specs?)(?:\/|$)|\.(?:test|spec)\.[^.]+$/i) * 100),
    ciFileRatio: Math.round(fileSignal(workflowCommits, /(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:Jenkinsfile|azure-pipelines\.ya?ml)$/i) * 100),
    validationFileRatio: Math.round(fileSignal(workflowCommits, /(?:^|\/)(?:schemas?|validators?|validation|middleware|guards?)(?:\/|$)|(?:schema|validator|validation|guard)[^/]*\.[^.]+$/i) * 100),
    safetySurfaceFileRatio: safetySurface.safetySurfaceFileRatio,
    safetySurfaceLineRatio: safetySurface.safetySurfaceLineRatio,
    safetyDefenseCoverage: safetySurface.safetyDefenseCoverage,
    pullRequestCoverage,
    deletionRatio: Math.round(ratio(deletions, additions + deletions) * 100),
    workflowDeletionRatio,
    riskyFileRatio: Math.round(fileSignal(workflowCommits, /(?:^|\/)(?:auth|security|permissions?|secrets?|database|db|payments?)(?:\/|$)|(?:auth|security|permission|secret|database|payment)[^/]*\.[^.]+$/i) * 100),
    defensivePatchRatio: Math.round(addedPatchSignal(workflowCommits, /\b(?:try\s*\{|catch\s*\(|validate|sanitize|escape|authorize|permission|fallback|throw new)\b/i) * 100),
    riskyPatchRatio: Math.round(addedPatchSignal(workflowCommits, /\b(?:eval\s*\(|innerHTML\s*=|dangerouslySetInnerHTML|child_process|exec\s*\(|spawn\s*\(|SELECT[^;\n]{0,120}(?:\+|\$\{|format\s*\()|(?:api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{16,}['"])/i) * 100),
    mergeCommitRatio: Math.round(ratio(commits.filter(isMergeCommit).length, commits.length) * 100),
    largeCommitRatio: Math.round(ratio(largeCommitCount, commits.length) * 100),
  }
}

function isGroundedReviewEvidence(evidence: DashboardAiReviewEvidence, commits: readonly GithubCommit[]): boolean {
  return commits.some(commit => (
    (evidence.commitSha === commit.sha || commit.sha.startsWith(evidence.commitSha) || evidence.commitSha.startsWith(commit.sha))
    && commit.files.some(file => file.filename === evidence.filename)
  ))
}

/**
 * Lets the single AI review refine non-safety axes only after it has supplied
 * a high-confidence, grounded axis verdict with at least two patch references.
 * Safety remains governed by confirmed-risk penalties so semantic prose cannot
 * inflate or collapse that score.
 */
export function computeDashboardAiAdjustments(review: DashboardAiReviewAssessment | undefined, commits: readonly GithubCommit[]): Partial<Record<DashboardProfileAxis, number>> {
  if (!review || review.status !== 'assessed' || review.confidence < 60)
    return {}

  const adjustments: Partial<Record<DashboardProfileAxis, number>> = {}
  for (const axis of ['clarity', 'workflow', 'complexity', 'context'] as const) {
    const axisReview = review.axisReviews?.find(item => item.axis === axis)
    if (!axisReview || axisReview.confidence < 70 || axisReview.verdict === 'supports' || axisReview.verdict === 'insufficient')
      continue

    const groundedEvidence = axisReview.evidence
      .filter(evidence => isGroundedReviewEvidence(evidence, commits))
    const distinctEvidence = new Set(groundedEvidence.map(evidence => `${evidence.commitSha}:${evidence.filename}`))
    if (distinctEvidence.size < 2)
      continue

    if (axisReview.verdict === 'softens')
      adjustments[axis] = 4
    if (axisReview.verdict === 'contradicts')
      adjustments[axis] = -4
  }

  return adjustments
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

export function scoreDashboardProfile(context: GithubContext, aiSafety?: DashboardAiSafetyAssessment, aiReview?: DashboardAiReviewAssessment): DashboardProfileAssessment {
  const metrics = deriveDashboardMetrics(context)
  const empty = metrics.commitCount === 0
  const aiAdjustments = computeDashboardAiAdjustments(aiReview, context.commits)
  const safetyBreakdown = getDashboardSafetyScoreBreakdown(metrics, context.commits, aiSafety)
  const scores: DashboardProfileScores = {
    clarity: scoreDashboardClarity(metrics),
    safety: safetyBreakdown.rawScore,
    workflow: scoreDashboardWorkflow(metrics),
    complexity: scoreDashboardComplexity(metrics),
    context: scoreDashboardContext(metrics),
  }

  if (empty) {
    scores.clarity = 50
    scores.safety = 50
    scores.workflow = 50
    scores.complexity = 50
    scores.context = 50
  }

  for (const [axis, adjustment] of Object.entries(aiAdjustments) as [DashboardProfileAxis, number][]) {
    scores[axis] = clamp(scores[axis] + adjustment)
    if (axis === 'workflow')
      scores[axis] = Math.min(scores[axis], getDashboardWorkflowEvidenceCap(metrics))
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
    version: 'v2',
    username: context.username,
    scores,
    overallScore,
    grade: gradeForDashboardScore(overallScore),
    role: roleClassification.primary,
    roleCandidates: roleClassification.candidates,
    roleStatus: roleClassification.status,
    derivedMetrics: metrics,
    confidence,
    safetyAiDefenseBonus: Math.round(safetyBreakdown.aiDefenseBonus),
    ...(aiSafety ? { aiSafety } : {}),
    ...(aiReview ? { aiReview } : {}),
    aiAdjustments,
    evidenceWindow: {
      commitCount: metrics.commitCount,
      pullRequestCount: metrics.pullRequestCount,
      source: context.collection?.mode === 'dashboard' ? 'github-repository-evidence' : 'github-public-activity',
      ...(commitDates[0] ? { from: commitDates[0] } : {}),
      ...(commitDates.at(-1) ? { to: commitDates.at(-1) } : {}),
    },
  }
}
