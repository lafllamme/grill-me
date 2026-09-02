import type { GithubCommit } from './github-collector'

export const safetyFilePattern = /(?:^|\/)(?:auth|security|permission|permissions|secret|secrets|credential|database|db|payment|payments|validator|validation|schema|middleware|guards?)(?:\/|\.|$)|(?:^|\/)(?:\.github\/workflows|\.circleci|\.buildkite)(?:\/|$)|(?:^|\/)(?:dockerfile|jenkinsfile|azure-pipelines\.ya?ml)$/i
export const safetySurfaceFilePattern = /(?:^|\/)(?:auth|security|permission|permissions|credential|secret|secrets|session|oauth|jwt|csrf|validator|validation|schema|middleware|guards?|sanitiz(?:er|ation)?|serializ(?:er|ation)?|deserializ(?:er|ation)?|database|db|query|sql|command|shell|upload|filesystem|crypto|encryption)(?:\/|\.|$)/i
export const safetySurfacePatchPattern = /(?:\b(?:eval|child_process|exec|spawn)\s*\(|\binnerHTML\s*=|dangerouslySetInnerHTML|\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^;\n]{0,120}(?:\+|\.|\$\{|format\s*\()|real_escape_string|\b(?:fetch|axios|request|readFile|writeFile|deserialize|unserialize|JSON\.parse|validate|sanitize|escape|authorize|permission|fallback|rateLimit|csrf|safeParse|parseInt|parseFloat|getenv|process\.env|throw new|try|catch)\b|\b(?:bypassAuthorization|bypassAuth|skipAuthorization|skipAuth)\s*\(|\b[\w$]*(?:api[_-]?key|secret|password|token)\b)/i
export const safetyPatchPattern = safetySurfacePatchPattern
const generatedFilePattern = /(?:^|\/)(?:node_modules|vendor|dist|build|coverage|\.next|\.nuxt)(?:\/|$)|(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb|minified|generated)/i

function commitTimestamp(commit: GithubCommit): number {
  if (!commit.committedAt)
    return 0

  const timestamp = Date.parse(commit.committedAt)
  return Number.isFinite(timestamp) ? timestamp : 0
}

function compareNewest(left: GithubCommit, right: GithubCommit): number {
  return commitTimestamp(right) - commitTimestamp(left) || right.sha.localeCompare(left.sha)
}

function isMergeCommit(commit: GithubCommit): boolean {
  return commit.isMerge ?? (commit.parentCount !== undefined
    ? commit.parentCount > 1
    : /^merge\s/i.test(commit.message) || /\bmerge branch\b/i.test(commit.message))
}

function commitSafetyRelevance(commit: GithubCommit): number {
  return commit.files.reduce((score, file) => {
    if (generatedFilePattern.test(file.filename))
      return score

    const patch = file.patch ?? ''
    return score
      + (safetyFilePattern.test(file.filename) || safetySurfaceFilePattern.test(file.filename) ? 2 : 0)
      + (safetyPatchPattern.test(patch) ? 3 : 0)
  }, 0)
}

/**
 * Selects the only commits that the Safety reviewer may inspect. The sample
 * is stratified across the newest personal patch, a typical-sized personal
 * patch, and the strongest visible Safety signal.
 */
export function selectSafetyCommits(commits: readonly GithubCommit[]): GithubCommit[] {
  const eligible = commits.filter(commit => !isMergeCommit(commit) && commit.files.some(file => file.patch && !generatedFilePattern.test(file.filename)))
  const latest = [...eligible].sort(compareNewest)[0]
  const sizes = eligible.map(commit => commit.additions + commit.deletions).sort((left, right) => left - right)
  const medianSize = sizes.length ? sizes[Math.floor((sizes.length - 1) / 2)]! : 0
  const typical = [...eligible]
    .filter(commit => commit.sha !== latest?.sha)
    .sort((left, right) => Math.abs(left.additions + left.deletions - medianSize) - Math.abs(right.additions + right.deletions - medianSize) || compareNewest(left, right))[0]
  const relevant = [...eligible]
    .map(commit => ({ commit, relevance: commitSafetyRelevance(commit) }))
    .filter(item => item.relevance > 0)
    .sort((left, right) => right.relevance - left.relevance || compareNewest(left.commit, right.commit))[0]
    ?.commit

  const selected: GithubCommit[] = []
  for (const commit of [latest, typical, relevant]) {
    if (commit && !selected.some(selectedCommit => selectedCommit.sha === commit.sha))
      selected.push(commit)
  }

  return selected.slice(0, 3)
}
