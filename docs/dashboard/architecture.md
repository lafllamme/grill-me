# Dashboard Architecture

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-01

The dashboard is a reusable result surface. The Explorer page is one host for
it; the landing page must be able to consume the same normalized model without
copying the charts or starting a second GitHub/AI analysis.

## Product flow

~~~text
1. Input   username, requested window, analysis conditions
     ↓
2. Evidence GitHub profile, repositories, personal commits, files, PRs,
             checks, derived metrics and deterministic scores
     ↓
3. Review  one bounded AI request receives selected patch evidence and writes
             grounded findings and the final roast layer
~~~

The server phases are sequential, but the client exposes honest progress as
each phase becomes available. No timer may pretend that evidence or scores
already exist.

## Ownership

| Layer | Owns | Must not own |
| --- | --- | --- |
| Host page | route metadata, username input, mock selector, theme controls | formulas, GitHub calls, chart mapping |
| useDashboardAnalysis | request lifecycle, cancellation, phase, error/retry, model mapping | visual markup, score formulas |
| DashboardExplorer | grid and composition, shared loading/error surface | GitHub/AI calls, role inference |
| Feature panels | one chart/card and local interaction | raw API contracts, cross-panel transforms |
| Server pipeline | collection, metrics, scores, one AI review, canonical response | client presentation choices |
| Bklit primitives | geometry, interaction, motion, responsive sizing | dashboard business meaning |

Props are the default boundary from the dashboard root into panels. A chart's
internal provide/inject context is reserved for its own children. Pinia is not
needed for route-local analysis state.

## Normalized model

The UI consumes one DashboardModel, never raw GitHub context and never the AI
response directly:

~~~ts
interface DashboardModel {
  source: 'mock' | 'live'
  key: string
  identity: {
    username: string
    repositories: number
    commits: number
    files: number
    window?: { from?: string; to?: string }
  }
  profile: {
    scores: {
      clarity: number
      safety: number
      workflow: number
      complexity: number
      context: number
    }
    overallScore?: number
    grade: string
    role: string
  }
  verdict: {
    grade: string
    growthLevel: string
    headline: string
    note: string
  }
  charts: {
    radar: unknown
    ring: unknown
    gauge: unknown
    changeVolume: unknown
    commitRhythm: unknown
    repositoryAnatomy: unknown
  }
  evidence?: {
    derivedMetrics?: Record<string, number>
    commits?: unknown[]
  }
}
~~~

The production contract is more specific and lives beside the dashboard
feature. This overview is intentionally stable so mock and live data share the
same rendering boundary.

## Analysis phases and stream events

~~~ts
type DashboardAnalysisPhase =
  | 'idle'
  | 'collecting-github'
  | 'scoring'
  | 'reviewing-ai'
  | 'ready'
  | 'error'
~~~

The dashboard stream emits:

~~~text
analysis_started
github_progress
github_evidence
deterministic_scores_ready
ai_review_ready
dashboard_ready
error
~~~

GitHub progress contains counters only. Patch content is sent to the AI
review, never in progress events. The deterministic score milestone is kept
for orchestration but the UI does not show a provisional score that can later
change after the AI review. The ready dashboard enters once with a short,
reduced-motion-safe reveal.

## Quota and request policy

There is one dashboard request from the client and one combined AI request from
the server. Panels never fetch independently. Collection and patch limits are
defined in [AI review](./ai-review.md). Adding a chart must not multiply
Cloudflare or GitHub requests.

## Implementation status

- The response contract, normalized model, composable, and composition root
  are reusable and independently testable.
- The Explorer has explicit idle, loading, empty, error, and ready states.
- The Explorer uses one SSE request and merges GitHub progress, deterministic
  scores, AI findings, and the final response in order.
- The landing host is not allowed to start a duplicate analysis; it will consume
  the shared response contract when integrated.
- Persistence and database design remain deferred until the in-memory model is
  validated with real evidence and test scenarios.

## Non-goals

- no database migration or persistence in the scoring exploration;
- no per-chart AI prompts;
- no fake streaming delays;
- no visual redesign of already ported Bklit charts;
- no removal of legacy primitives before parity is verified.

The orchestration rationale is recorded in
[Centralize dashboard analysis orchestration](../../decisions/active/2026-08-31-dashboard-analysis-orchestration.md).
