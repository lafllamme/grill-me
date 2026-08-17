import type { RoastResponse, RoastResultIntensity } from '~~/shared/roast/contracts'

export type RoastExplorerLevel = RoastResultIntensity['label']

export interface RoastExplorerFile {
  filename: string
  status: string
  additions: number
  deletions: number
  patch: string
}

export interface RoastExplorerCommit {
  repo: string
  sha: string
  message: string
  additions: number
  deletions: number
  changedFiles: number
  files: RoastExplorerFile[]
}

export interface RoastExplorerFixture extends RoastResponse {
  evidence: {
    commits: RoastExplorerCommit[]
    prs: []
  }
}

const baseMeta = { prCount: 0 }

function buildFixture(fixture: Omit<RoastExplorerFixture, 'receipt'> & { receipt?: string }): RoastExplorerFixture {
  return {
    ...fixture,
    receipt: fixture.receipt ?? `GRILLME RECEIPT / ${fixture.username} / ${fixture.intensity.label}`,
  }
}

export const roastExplorerLevels: Array<{ value: RoastExplorerLevel, label: string }> = [
  { value: 'rare', label: 'Rare' },
  { value: 'medium_rare', label: 'Medium Rare' },
  { value: 'medium', label: 'Medium' },
  { value: 'burned_to_crisp', label: 'Burned to Crisp' },
]

export const roastExplorerFixtures: Record<RoastExplorerLevel, RoastExplorerFixture> = {
  rare: buildFixture({
    username: 'lafllamme',
    intensity: { level: 1, label: 'rare' },
    title: 'Mild seasoning only',
    roastLines: [
      'Your commit messages read like autocomplete gave up halfway through.',
      'You imported a whole date library to format one timestamp.',
    ],
    roast: 'A gentle nudge, technically.',
    feedback: [
      'Write commit messages that describe intent, not just “fix”.',
      'Use the native date formatter before reaching for a dependency.',
    ],
    meta: { ...baseMeta, commitCount: 1, selectedCommitCount: 1 },
    metrics: { spaghettiIndex: 32, stinkScore: 28, egoDamage: 21, grade: 'B', specialTitle: 'A gentle nudge, technically' },
    evidence: {
      commits: [{
        repo: 'lafllamme/grill-me',
        sha: '4e91a02',
        message: 'chore: format dates in dashboard header',
        additions: 214,
        deletions: 40,
        changedFiles: 6,
        files: [{ filename: 'app/components/DashboardHeader.vue', status: 'modified', additions: 40, deletions: 12, patch: '- const date = formatDate(value)\n+ const date = new Intl.DateTimeFormat("en-US").format(value)' }],
      }],
      prs: [],
    },
  }),
  medium_rare: buildFixture({
    username: 'lafllamme',
    intensity: { level: 2, label: 'medium_rare' },
    title: 'Abstraction witness protection',
    roastLines: [
      'You did not remove complexity. You gave it aliases and hoped nobody would check the imports.',
      'That helper wraps a one-line API so thoroughly it now needs onboarding documentation.',
      'Your component tree has the confidence of an architecture diagram and the boundaries of spilled soup.',
    ],
    roast: 'The architecture has entered witness protection.',
    feedback: [
      'Delete pass-through wrappers that own no state, policy, or transformation.',
      'Move repeated request handling into one typed composable with an explicit contract.',
      'Add one behaviour-level test before the next abstraction gets a factory.',
    ],
    meta: { ...baseMeta, commitCount: 2, selectedCommitCount: 2 },
    metrics: { spaghettiIndex: 71, stinkScore: 78, egoDamage: 84, grade: 'C-', specialTitle: 'The architecture has entered witness protection' },
    evidence: {
      commits: [
        { repo: 'lafllamme/grill-me', sha: '1c83407', message: 'feat: add evidence-aware roast reasoning preview', additions: 522, deletions: 101, changedFiles: 9, files: [{ filename: 'app/components/rebrand/RebrandLiveRoastStage.vue', status: 'modified', additions: 17, deletions: 83, patch: '- const status = ref("loading")\n+ const status = computed(() => roastStore.stateLabel)\n+\n+ watch(status, () => syncReasoning())' }] },
        { repo: 'lafllamme/grill-me', sha: '73e2475', message: 'feat: stream evidence into roast generation', additions: 249, deletions: 38, changedFiles: 9, files: [{ filename: 'server/roast/orchestrator-stream.ts', status: 'modified', additions: 104, deletions: 22, patch: '- yield createRoastEvent(result)\n+ yield createEvidenceEvent(evidence)\n+ yield* streamRoastEvents(result)' }] },
      ],
      prs: [],
    },
  }),
  medium: buildFixture({
    username: 'lafllamme',
    intensity: { level: 3, label: 'medium' },
    title: 'The ternary operator massacre',
    roastLines: [
      'Four nested ternaries in one return statement. This is not code, it is a hostage situation.',
      'You wrote an effect that calls another effect. The runtime did not consent to this.',
      'That “temporary” debug log has more commit history than some of your features.',
      'Your utils folder has 340 lines and exactly one function that is used twice.',
    ],
    roast: 'A branching decision with no survivors.',
    feedback: [
      'Replace nested ternaries with early returns or a lookup table.',
      'Derive state during render instead of chaining effects.',
      'Audit the utility layer and delete anything imported once.',
      'Gate debug logging behind an environment flag.',
    ],
    meta: { ...baseMeta, commitCount: 3, selectedCommitCount: 3 },
    metrics: { spaghettiIndex: 86, stinkScore: 81, egoDamage: 90, grade: 'D', specialTitle: 'A branching decision with no survivors' },
    evidence: {
      commits: [{ repo: 'lafllamme/grill-me', sha: '9af31cc', message: 'refactor: simplify render logic (it is not simple)', additions: 340, deletions: 210, changedFiles: 27, files: [{ filename: 'app/components/results/ResultCard.vue', status: 'modified', additions: 88, deletions: 140, patch: '- return isReady ? hasData ? renderData() : renderEmpty() : renderLoading()\n+ if (!isReady) return renderLoading()\n+ if (!hasData) return renderEmpty()\n+ return renderData()' }] }],
      prs: [],
    },
  }),
  burned_to_crisp: buildFixture({
    username: 'lafllamme',
    intensity: { level: 4, label: 'burned_to_crisp' },
    title: 'Structural integrity: none',
    roastLines: [
      'This diff touches 40 files to change one boolean. Somewhere, a git blame is crying.',
      'You have three date-formatting utilities and none of them agree with each other.',
      'The commit message says “final fix” for the fourth time this week.',
      'There is a try/catch here that catches everything and logs nothing. Bold strategy.',
    ],
    roast: 'The diff has achieved escape velocity.',
    feedback: [
      'Scope changes to the files that actually need to change.',
      'Consolidate date formatting into one utility and delete the rest.',
      'Write a regression test instead of shipping another “final fix”.',
    ],
    meta: { ...baseMeta, commitCount: 4, selectedCommitCount: 4 },
    metrics: { spaghettiIndex: 97, stinkScore: 94, egoDamage: 99, grade: 'F-', specialTitle: 'The diff has achieved escape velocity' },
    evidence: {
      commits: [{ repo: 'lafllamme/grill-me', sha: 'f00ba7e', message: 'fix: final final final state correction', additions: 620, deletions: 88, changedFiles: 40, files: [{ filename: 'server/roast/generate.ts', status: 'modified', additions: 60, deletions: 30, patch: '- try { await generate() } catch (error) { console.log(error) }\n+ try { await generate() } catch { return fallbackResult() }' }] }],
      prs: [],
    },
  }),
}

export const roastMetricDescriptors = [
  { key: 'stinkScore', label: 'Stink', descriptor: 'overall code smell' },
  { key: 'spaghettiIndex', label: 'Spaghetti', descriptor: 'complexity & entanglement' },
  { key: 'egoDamage', label: 'Ego damage', descriptor: 'roast severity' },
] as const
