import type { AggregateStat, PublicRoastReceipt } from '~/models/rebrand-fuel'

export const PUBLIC_ROAST_RECEIPTS: readonly PublicRoastReceipt[] = [
  {
    id: 'torvalds-kernel-guard',
    username: 'torvalds',
    year: '2026',
    status: 'Filed',
    title: 'The guard is small. The code path it protects is not.',
    grade: 'B-',
    stinkScore: 58,
    evidenceClaim: 'A narrow lifetime check lands in a path whose ownership story still needs a diagram.',
    commit: {
      sha: '9f2c71a',
      message: 'bpf: verifier: guard socket clone lifetime',
      repo: 'torvalds/linux',
      additions: 42,
      deletions: 18,
      changedFiles: 4,
    },
    files: [
      { filename: 'kernel/bpf/verifier.c', additions: 31, deletions: 12 },
      { filename: 'net/core/sock_map.c', additions: 11, deletions: 6 },
    ],
  },
  {
    id: 'sindresorhus-parser-surface',
    username: 'sindresorhus',
    year: '2026',
    status: 'Archived',
    title: 'The utility stayed tiny. Its option surface did not.',
    grade: 'B',
    stinkScore: 49,
    evidenceClaim: 'Three compatibility branches now protect a parser whose public API was supposed to fit in one sentence.',
    commit: {
      sha: 'c13a55e',
      message: 'Add strict parsing option and preserve legacy behavior',
      repo: 'sindresorhus/parse-json',
      additions: 96,
      deletions: 27,
      changedFiles: 5,
    },
    files: [
      { filename: 'index.js', additions: 38, deletions: 14 },
      { filename: 'index.d.ts', additions: 24, deletions: 3 },
    ],
  },
  {
    id: 'gaearon-cache-boundary',
    username: 'gaearon',
    year: '2025',
    status: 'Archived',
    title: 'A clean cache boundary with a migration guide the size of the feature.',
    grade: 'B+',
    stinkScore: 41,
    evidenceClaim: 'The implementation is disciplined, but the compatibility layer carries two generations of assumptions.',
    commit: {
      sha: '7ad82bd',
      message: 'Refine cache invalidation semantics for server actions',
      repo: 'facebook/react',
      additions: 184,
      deletions: 73,
      changedFiles: 9,
    },
    files: [
      { filename: 'packages/react-server/src/ReactFlightServer.js', additions: 83, deletions: 29 },
      { filename: 'packages/react-dom/src/__tests__/ReactDOMFizzServer-test.js', additions: 62, deletions: 31 },
    ],
  },
] as const

export const AGGREGATE_STATS: readonly AggregateStat[] = [
  {
    id: 'commits',
    label: 'Commits analyzed',
    value: 4324,
    suffix: '+',
    description: 'Public commit metadata and bounded diff excerpts processed by preview environments.',
  },
  {
    id: 'repositories',
    label: 'Repositories checked',
    value: 401,
    suffix: '+',
    description: 'Public repositories represented across local demos and product validation runs.',
  },
  {
    id: 'diff-lines',
    label: 'Diff lines ranked',
    value: 401312,
    suffix: '+',
    description: 'Added and removed lines considered before dependency and generated-file noise is removed.',
  },
  {
    id: 'roasts',
    label: 'Public roasts filed',
    value: 286,
    suffix: '+',
    description: 'Preview receipts used to validate the editorial result experience.',
  },
] as const
