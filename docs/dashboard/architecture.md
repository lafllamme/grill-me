# Dashboard architecture

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-03

The dashboard is a reusable result surface. Explorer and the future landing
page consume the same normalized model; neither owns GitHub calls, formulas,
or AI response parsing.

## Product flow

```text
input → bounded GitHub evidence → deterministic category scores
      → one AI review → final roast dashboard
```

The server phases are sequential. The client exposes honest progress and
renders evidence only after its phase is available. A loading state may reveal
the UI progressively, but it must not fabricate scores or evidence.

## Ownership

| Layer | Owns |
| --- | --- |
| host page | username, conditions, theme, route concerns |
| analysis composable | request lifecycle, cancellation, phase, retry, model mapping |
| dashboard composition | grid, panels, normalized view model |
| category modules | metrics, formulas, evidence gates, category AI context |
| patch selection | deterministic sample and payload budget |
| AI review | prompt, parser, grounding, bounded adjustments, explanation |
| server service | GitHub → score → one review → final response |

The dashboard boundary is [`server/roast/dashboard/`](../../server/roast/dashboard/).
Its [`index.ts`](../../server/roast/dashboard/index.ts) is the public server
entry point. The module and trace contract are documented in the dashboard
[README](../../server/roast/dashboard/README.md).

## Normalized boundary

```ts
interface DashboardModel {
  source: 'mock' | 'live'
  identity: { username: string; repositories: number; commits: number; files: number }
  profile: { scores: Record<'clarity' | 'safety' | 'workflow' | 'complexity' | 'context', number>; grade: string; role: string }
  verdict: { headline: string; note: string }
  charts: Record<string, unknown>
}
```

The production API contract remains in
[`shared/dashboard/contracts.ts`](../../shared/dashboard/contracts.ts). It is
not changed by this migration.

## Stream phases

`idle → collecting-github → scoring → reviewing-ai → finalizing → complete`

Errors are retryable and belong to the phase that failed. Deterministic scores
are held until the final review event so the UI never shows a temporary value
that is later replaced by the final one.

## Invariants

- one analysis request per user action;
- no database migration or API response change;
- no AI call without the bounded patch budget;
- no score adjustment without grounded evidence;
- no role assignment when evidence is insufficient;
- no automatic commit or push during the migration.

Detailed chart behavior remains in the existing chart contract; formula details
belong to the category READMEs and dated calibration evidence belongs in
[`calibration/history.md`](./calibration/history.md). Runtime trace behavior,
redaction, and payload observability belong to the module README.
