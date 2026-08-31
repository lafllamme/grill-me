# Dashboard Architecture

## Purpose

This document is the source of truth for how the dashboard turns a GitHub
username into an inspectable profile read. It defines ownership, data flow,
phases, UI boundaries, and the migration path from the current single response
to progressive delivery.

The dashboard is a reusable result surface. The Explorer page is only one host
for it; the same composed dashboard must later be embeddable in the landing
page without copying the charts or their data wiring.

Related documents own narrower concerns:

- [Dashboard Profile Scoring](./dashboard-profile-scoring.md) owns category
  formulas, score calibration, evidence gates, and role resolution.
- [Dashboard AI Review](./dashboard-ai-review.md) owns patch selection, payload
  limits, the combined AI contract, and grounded findings.
- [Dashboard Chart Roadmap](./dashboard-chart-roadmap.md) owns chart meaning,
  Bklit parity, and the porting checklist.
- [Experience Blueprint](./experience-blueprint.md) owns product-level loading,
  reveal, and roast presentation principles.

## Product flow

The analysis is one product flow with three data phases:

```text
1. Input      username, requested window, analysis conditions
      ↓
2. Evidence   GitHub profile, repositories, personal commits, files, PRs,
               checks, deterministic derived metrics and base scores
      ↓
3. Review     one bounded AI request receives selected patch evidence,
               classifies semantic signals, and writes the final roast layer
```

The phases are sequential on the server, but the client must be able to render
useful information as each phase becomes available. The first implementation
may finish through one HTTP response; it must not invent intermediate results
that the server has not produced.

## Ownership boundaries

| Layer | Owns | Must not own |
| --- | --- | --- |
| Host page | route metadata, username input, mock selector, theme controls | chart calculations, API response mapping, panel layout rules |
| `useDashboardAnalysis` | request lifecycle, cancellation, phase, error/retry, API-to-model mapping | visual markup, per-chart fetches, score formulas |
| `DashboardExplorer` | dashboard grid and composition, shared loading/error surface | GitHub calls, AI calls, role/grade inference |
| Feature panels | rendering one chart/card and its local interaction | raw API contracts, cross-panel data transformations |
| Server pipeline | GitHub collection, deterministic metrics/scores, one AI review, canonical response | client-only presentation decisions |
| Bklit primitives | chart geometry, interaction, motion, responsive sizing | dashboard business meaning |

Props are the default boundary from the dashboard root into its panels. The
existing `provide/inject` contexts remain appropriate inside a chart primitive
because they coordinate the chart's own children. Pinia is not needed for this
route-local analysis state unless the same in-progress run must survive
navigation between multiple pages.

## Shared dashboard model

The UI consumes one normalized `DashboardModel`, never the raw GitHub context
and never the AI response directly. The model has stable top-level sections:

```ts
interface DashboardModel {
  source: 'mock' | 'live'
  key: string
  identity: {
    username: string
    repositories: number
    commits: number
    files: number
    window?: { from?: string, to?: string }
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
```

The production TypeScript type is intentionally more specific than this
overview and lives beside the dashboard feature. Its purpose is to keep the
chart props explicit while allowing mock and live sources to share the exact
same render contract.

## Analysis state

The analysis composable exposes a discriminated phase instead of a single
boolean hidden in the page:

```ts
type DashboardAnalysisPhase =
  | 'idle'
  | 'collecting-github'
  | 'scoring'
  | 'reviewing-ai'
  | 'ready'
  | 'error'
```

Current transport limitation:

- the existing `POST /api/dashboard-profile` completes GitHub collection,
  deterministic scoring, and the combined AI review before returning;
- the client therefore uses `collecting-github` as the honest loading phase for
  the request and switches to `ready` only after the complete model is present;
- no timer is allowed to pretend that a score or roast already exists.

Future stream events can update the same model without changing the panels:

```text
analysis_started
github_progress
github_evidence
deterministic_scores_ready
ai_review_ready
dashboard_ready
error
```

The existing roast SSE contract remains separate. Dashboard streaming may
reuse its event discipline, but must not silently change the public roast
contract.

## Request and quota policy

There is one dashboard request from the client and one combined AI review from
the server. Panels never make their own requests. The existing collector and
patch sampler remain the quota boundary:

- GitHub collection stays bounded and merge-aware.
- Patch evidence is selected deterministically before AI is called.
- All five profile axes are reviewed in one AI request.
- The AI explains and classifies evidence; the server owns numeric scores.
- Payload and output limits remain governed by
  [Dashboard AI Review](./dashboard-ai-review.md).

This keeps the dashboard fast and prevents adding a new card from multiplying
Cloudflare requests.

## Migration sequence

### Phase A — foundation

- Move the client-facing dashboard response types into a reusable contract.
- Extract `useDashboardAnalysis()` from the Explorer page.
- Normalize mock and live data into one `DashboardModel`.
- Extract `DashboardExplorer.vue` as a presentational composition root.
- Keep the current single-response API and preserve the existing mock stories.

### Phase B — host integration

- Reduce `dashboard-explorer.vue` to route shell, controls, and theme state.
- Mount the same `DashboardExplorer` from the landing result surface.
- Keep landing-specific roast copy and actions outside the dashboard component.
- Add explicit idle, loading, empty, error, and ready states to the shared root.

### Phase C — progressive transport

- Add a typed dashboard event contract on the server.
- Let the composable merge GitHub evidence, deterministic scores, AI findings,
  and final roast content into the same model.
- Replace the single request inside the composable with SSE/fetch streaming.
- Keep panels and their props unchanged unless a new visible field is approved.

## Current implementation status

- Feature panels already exist under `app/components/dashboard-explorer/`.
- Mock profiles already populate every chart from one profile definition.
- `POST /api/dashboard-profile` already performs bounded GitHub collection,
  deterministic scoring, and one combined AI review.
- The remaining structural problem is that the Explorer page still owns the
  response types, live-data transformations, request lifecycle, and panel
  composition in one file.
- This refactor addresses that boundary first; it does not change scoring
  formulas or introduce persistence.

## Non-goals for this refactor

- no database migration or persistence;
- no per-chart AI prompts;
- no new score formula;
- no fake streaming delays;
- no deletion of the legacy dashboard primitives before parity is verified;
- no visual redesign of the already ported Bklit charts.

## Review condition

Revisit this architecture after the shared model is used by both Explorer and
the landing page. If both hosts require materially different information
hierarchies, split the composition with explicit variants or slots rather than
duplicating the data pipeline.
