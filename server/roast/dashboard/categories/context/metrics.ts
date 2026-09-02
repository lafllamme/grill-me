import type { GithubCommit, GithubCommitFile, GithubPullRequest, GithubRepositoryEvidence } from '../../../github-collector'
import type { ContextSignal } from './types'
import { DASHBOARD_METRIC_RULES } from '../../shared/constants'
import { average, clamp, ratio } from '../../shared/math'
import { addedPatchLinesFromFile } from '../../shared/patches'
import { CONTEXT_COMMIT_RULES, CONTEXT_SCORE_DEFAULT, CONTEXT_SIGNAL_RULES } from './constants'
import { contextContributingPattern, contextDocsDirectoryPattern, contextExampleDirectoryPattern, contextExplanationLinePattern, contextGeneratedArtifactPattern, contextGenericSubjectPattern, contextIntentPattern, contextOrientationArtifactPattern, contextReadmePattern, contextSubjectActionPattern, contextSubjectPrefixPattern, contextSubjectWordPattern } from './patterns'

function visiblePatchFiles(commits: readonly GithubCommit[]): GithubCommitFile[] {
  return commits.flatMap(commit => commit.files).filter(file => Boolean(file.patch?.trim()))
}

function orientationArtifactWeight(filename: string): number {
  if (contextGeneratedArtifactPattern.test(filename))
    return DASHBOARD_METRIC_RULES.emptyValue
  if (contextReadmePattern.test(filename) || contextContributingPattern.test(filename))
    return CONTEXT_SIGNAL_RULES.readmeArtifactWeight
  if (contextDocsDirectoryPattern.test(filename))
    return CONTEXT_SIGNAL_RULES.docsArtifactWeight
  if (contextExampleDirectoryPattern.test(filename))
    return CONTEXT_SIGNAL_RULES.exampleArtifactWeight
  return DASHBOARD_METRIC_RULES.emptyValue
}

export function contextPatchExplanationSignal(commits: readonly GithubCommit[]): ContextSignal {
  const addedLines = commits
    .flatMap(commit => commit.files)
    .filter(file => !contextOrientationArtifactPattern.test(file.filename) && !contextGeneratedArtifactPattern.test(file.filename))
    .flatMap(file => addedPatchLinesFromFile(file))

  if (!addedLines.length)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  const explanatoryLineRatio = ratio(addedLines.filter(line => contextExplanationLinePattern.test(line)).length, addedLines.length)
  return {
    signal: clamp(CONTEXT_SIGNAL_RULES.scoreBaseline + explanatoryLineRatio * CONTEXT_SIGNAL_RULES.maximumArtifactLift),
    evidenceAvailable: true,
  }
}

export function contextOrientationArtifactSignal(commits: readonly GithubCommit[]): ContextSignal {
  const files = visiblePatchFiles(commits)
  if (!files.length)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  const orientationWeight = files.reduce<number>((sum, file) => sum + orientationArtifactWeight(file.filename), DASHBOARD_METRIC_RULES.emptyValue)
  if (!orientationWeight)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  return {
    signal: clamp(
      CONTEXT_SIGNAL_RULES.scoreBaseline
      + Math.min(orientationWeight / files.length, CONTEXT_SIGNAL_RULES.maximumRatio) * CONTEXT_SIGNAL_RULES.maximumArtifactLift,
    ),
    evidenceAvailable: true,
  }
}

export function contextCommitSignal(commits: readonly GithubCommit[]): ContextSignal {
  if (!commits.length)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  const commitSignals = commits.map((commit) => {
    const [subject = '', ...bodyLines] = commit.message.split('\n')
    const body = bodyLines.join(' ').trim()
    const hasMeaningfulBody = body.length >= CONTEXT_COMMIT_RULES.minimumBodyCharacters
    const hasExplicitContext = contextIntentPattern.test(commit.message)
    const normalizedSubject = subject.trim().toLowerCase()
    const subjectWords = normalizedSubject.split(contextSubjectWordPattern).filter(Boolean)
    const subjectWithoutPrefix = normalizedSubject.replace(contextSubjectPrefixPattern, '')
    const hasSpecificSubject = subjectWords.length >= CONTEXT_COMMIT_RULES.minimumSubjectWords
      && contextSubjectActionPattern.test(normalizedSubject)
      && !contextGenericSubjectPattern.test(subjectWithoutPrefix)

    let signal = CONTEXT_SIGNAL_RULES.scoreBaseline
    if (!subject.trim())
      signal -= CONTEXT_COMMIT_RULES.emptySubjectPenalty
    if (contextGenericSubjectPattern.test(subjectWithoutPrefix))
      signal -= CONTEXT_COMMIT_RULES.genericSubjectPenalty
    if (hasSpecificSubject)
      signal += CONTEXT_COMMIT_RULES.specificSubjectBonus
    if (hasMeaningfulBody)
      signal += CONTEXT_COMMIT_RULES.meaningfulBodyBonus
    if (hasExplicitContext)
      signal += CONTEXT_COMMIT_RULES.explicitContextBonus
    return clamp(signal)
  })

  return {
    signal: clamp(average(commitSignals)),
    evidenceAvailable: commitSignals.some(signal => signal > CONTEXT_SIGNAL_RULES.scoreBaseline),
  }
}

export function contextRepositoryOrientationSignal(repositories: readonly GithubRepositoryEvidence[] | undefined): ContextSignal {
  const rootEntries = repositories?.flatMap(repository => repository.rootEntries) ?? []
  if (!rootEntries.length)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  const orientationWeight = rootEntries.reduce<number>((sum, entry) => sum + orientationArtifactWeight(entry), DASHBOARD_METRIC_RULES.emptyValue)
  return {
    signal: orientationWeight
      ? clamp(CONTEXT_SIGNAL_RULES.scoreBaseline + Math.min(orientationWeight * CONTEXT_SIGNAL_RULES.repositoryArtifactBonus, CONTEXT_SIGNAL_RULES.maximumRepositoryLift))
      : CONTEXT_SCORE_DEFAULT,
    evidenceAvailable: true,
  }
}

export function contextHandoffSignal(pullRequestCoverage: number, pullRequests: readonly GithubPullRequest[]): ContextSignal {
  if (!pullRequests.length)
    return { signal: CONTEXT_SCORE_DEFAULT, evidenceAvailable: false }

  const reviewedPullRequests = pullRequests.filter(pullRequest => (
    (pullRequest.reviewCount ?? DASHBOARD_METRIC_RULES.emptyValue) > 0
    || (pullRequest.reviewCommentCount ?? DASHBOARD_METRIC_RULES.emptyValue) > 0
    || (pullRequest.commentCount ?? DASHBOARD_METRIC_RULES.emptyValue) > 0
  )).length
  const reviewedRatio = ratio(reviewedPullRequests, pullRequests.length)
  return {
    signal: clamp(
      CONTEXT_SIGNAL_RULES.scoreBaseline
      + pullRequestCoverage * CONTEXT_SIGNAL_RULES.handoffCoverageWeight
      + reviewedRatio * CONTEXT_SIGNAL_RULES.reviewedPullRequestWeight,
    ),
    evidenceAvailable: true,
  }
}

export function deriveContextMetrics(commits: readonly GithubCommit[], repositories: readonly GithubRepositoryEvidence[] | undefined, pullRequestCoverage: number, pullRequests: readonly GithubPullRequest[]): {
  patchExplanation: ContextSignal
  orientationArtifact: ContextSignal
  commit: ContextSignal
  repositoryOrientation: ContextSignal
  handoff: ContextSignal
} {
  return {
    patchExplanation: contextPatchExplanationSignal(commits),
    orientationArtifact: contextOrientationArtifactSignal(commits),
    commit: contextCommitSignal(commits),
    repositoryOrientation: contextRepositoryOrientationSignal(repositories),
    handoff: contextHandoffSignal(pullRequestCoverage, pullRequests),
  }
}
