import type { SelectionSummary } from '~~/shared/roast/contracts'
import type { GithubCommit, GithubContext } from './github-collector'
import { ROAST_LIMITS } from '~~/shared/roast/contracts'

export interface SelectedEvidence {
  username: string
  commits: GithubCommit[]
  prs: GithubContext['prs']
  summary: SelectionSummary
}

const NOISE_KEYWORDS = [
  'readme',
  'chore',
  'typo',
  'format',
  'lint',
  'deps',
  'version',
  'bump',
  'lockfile',
]

const CODE_HINTS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.vue',
  '.go',
  '.rs',
  '.py',
  '.rb',
  '.java',
  '.kt',
  '.cs',
]

/**
 * Scores one commit based on code density, size and non-noise signals.
 */
function scoreCommit(commit: GithubCommit): number {
  const message = commit.message.toLowerCase()
  const messagePenalty = NOISE_KEYWORDS.some(keyword => message.includes(keyword)) ? -2 : 0
  const mergePenalty = message.startsWith('merge ') ? -8 : 0
  const sizeScore = Math.min(6, Math.floor((commit.additions + commit.deletions) / 40))
  const changedFilesScore = Math.min(4, Math.floor(commit.changedFiles / 2))

  const codeFileScore = commit.files.reduce((score, file) => {
    const lower = file.filename.toLowerCase()
    return CODE_HINTS.some(ext => lower.endsWith(ext)) ? score + 2 : score + 0.5
  }, 0)

  const patchScore = commit.files.reduce((score, file) => {
    if (!file.patch)
      return score
    return score + Math.min(2, Math.floor(file.patch.length / 180))
  }, 0)

  return sizeScore + changedFilesScore + codeFileScore + patchScore + messagePenalty + mergePenalty
}

/**
 * Selects the highest-value evidence for prompt context.
 */
export function selectEvidence(context: GithubContext): SelectedEvidence {
  const candidates = context.commits
    .map(commit => ({ commit, score: scoreCommit(commit) }))
    .sort((left, right) => right.score - left.score)

  const selectedCommits = candidates
    .slice(0, ROAST_LIMITS.maxSelectedCommits)
    .map(item => item.commit)

  let selectedFiles = 0
  let selectedPatchChars = 0
  for (const commit of selectedCommits) {
    selectedFiles += commit.files.length
    for (const file of commit.files) {
      selectedPatchChars += file.patch?.length || 0
    }
  }

  return {
    username: context.username,
    commits: selectedCommits,
    prs: context.prs,
    summary: {
      candidateCommits: candidates.length,
      selectedCommits: selectedCommits.length,
      selectedFiles,
      selectedPatchChars,
    },
  }
}
