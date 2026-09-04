# Dashboard Documentation

**Version:** 1.3.0
**Status:** active
**Updated:** 2026-09-04

This is the entry point for the GrillMe dashboard contract. It describes how
one bounded GitHub analysis becomes an evidence-backed profile, one combined AI
review, and the final roast dashboard.

## Source map

| Concern | Canonical document | Implementation | Validation |
| --- | --- | --- | --- |
| Dashboard execution order and current work | [Roadmap](./roadmap.md) | app/components/dashboard-explorer/ and app/composables/useDashboardAnalysis.ts | dashboard state and browser checks |
| System flow, loading, streaming, ownership, quota | [Architecture](./architecture.md) | app/composables/useDashboardAnalysis.ts | tests/e2e/dashboard-explorer.spec.ts |
| Authored evidence window, merge filtering, bounded fallback | [Architecture](./architecture.md) and [active decision](../../decisions/active/2026-09-03-dashboard-authored-evidence-window.md) | server/roast/github-collector.ts and patch-selection/ | sampling controls in [Testing](./testing.md) |
| Shared score contract, grades, evidence gates | [Scoring](./scoring.md) | server/roast/dashboard/scoring.ts | tests/unit/dashboard-profile-scoring.test.ts |
| One AI request, patch selection, payload limits | [AI review](./ai-review.md) | server/roast/dashboard/ai-review/ and patch-selection/ | tests/unit/dashboard-ai-scoring.test.ts |
| Category formulas | [Categories](./categories/README.md) | server/roast/dashboard/categories/ | category tests in the scoring suite |
| Role matrix and resolver rules | [Roles](./roles.md) | server/roast/dashboard/roles/ | scoring and model tests |
| Chart meaning and Bklit parity | [Charts](./charts.md) | app/components/dashboard-explorer/ | browser checks and E2E |
| Cross-category checks and probe set | [Testing](./testing.md) | tests/ | lint, typecheck, unit, E2E |
| Trace, logging, payload observability, module ownership | [Dashboard module README](../../server/roast/dashboard/README.md) | shared/dashboard/trace.ts | trace unit tests and dashboard stream checks |
| Historical calibrations and limitations | [Calibration archive](./calibration/history.md) | — | reviewed before formula changes |

The individual role cards remain in [docs/profiles](../profiles/). Active
technical decisions remain in [decisions/active](../../decisions/active/) and
are linked from the relevant canonical document instead of copied here.

## Current category status

| Category | Version | Deterministic baseline | AI role | Status |
| --- | --- | --- | --- | --- |
| Clarity | v4 | message intent, visible naming, local patch structure, evidence ceiling | explain grounded patch evidence within the server cap | calibrated |
| Safety | v4 | safety-surface and defensive-coverage signals with patch-coverage scaling, bounded AI defense lift, and confirmed introduced-risk penalties | verify grounded defensive signals and risks; never return a number | calibrated |
| Workflow | v3 | median/p75 delivery scope, outliers, message quality | bounded second check | calibrated |
| Complexity | v2.2 | weighted effective change surface, outliers, churn | bounded second check | calibrated |
| Context | v5 | neutral 70, direct context evidence, lighter orientation and handoff signals | bounded second check | calibrated |

The versions describe behavior contracts, not every wording edit. A formula,
evidence gate, payload shape, or role threshold change requires a versioned
changelog entry and a focused validation run.

## Current execution focus

The five scoring categories, evidence window, AI second review, and role
resolution are ready for UI integration. The next change is loading-state
parity: the first frame should already use the final Bento geometry, while
GitHub facts and the final reviewed profile become ready in honest stages.
Streaming follows only after that render contract is stable. The active
sequence and acceptance criteria live in the [Dashboard execution roadmap](./roadmap.md).

## One analysis, five views

~~~text
username + conditions
  → bounded GitHub evidence
  → category-owned deterministic metrics
  → five base scores and evidence status
  → one combined AI review of selected patches
  → bounded adjustments and explanations
  → grade, role, roast, and chart model
~~~

The server owns facts, formulas, bounds, grades, and role eligibility. The AI
interprets selected code and writes grounded explanations; it does not invent
numeric scores. The client renders one normalized dashboard model and never
starts a request per chart.

The dashboard implementation is exposed through `server/roast/dashboard/index.ts`.
The public API response and shared contracts do not change.

## Documentation checks

Before a dashboard contract change is considered complete:

1. Update the owning category or contract document.
2. Add or update a synthetic control and, where appropriate, a named-profile
   calibration check.
3. Record evidence status and known limitations.
4. Run the focused test and the repository checks listed in [Testing](./testing.md).
5. Add a dated entry to [docs/changelog.md](../changelog.md) for behavioral
   changes.

The dashboard docs use Version, Status, and Updated metadata. Editorial
clarifications only update the date; changes to behavior bump the relevant
contract version.
