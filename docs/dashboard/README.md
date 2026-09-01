# Dashboard Documentation

**Version:** 1.0.0
**Status:** active
**Updated:** 2026-09-01

This is the entry point for the GrillMe dashboard contract. It describes how
one bounded GitHub analysis becomes an evidence-backed profile, one combined AI
review, and the final roast dashboard.

## Source map

| Concern | Canonical document | Implementation | Validation |
| --- | --- | --- | --- |
| System flow, loading, streaming, ownership, quota | [Architecture](./architecture.md) | app/composables/useDashboardAnalysis.ts | tests/e2e/dashboard-explorer.spec.ts |
| Shared score contract, grades, evidence gates | [Scoring](./scoring.md) | server/roast/dashboard-profile-scoring.ts | tests/unit/dashboard-profile-scoring.test.ts |
| One AI request, patch selection, payload limits | [AI review](./ai-review.md) | server/roast/dashboard-ai-scoring.ts | tests/unit/dashboard-ai-scoring.test.ts |
| Category formulas | [Categories](./categories/) | server/roast/dashboard-profile-scoring.ts | category tests in the scoring suite |
| Role matrix and resolver rules | [Roles](./roles.md) | server/roast/dashboard-profile-roles.ts | scoring and model tests |
| Chart meaning and Bklit parity | [Charts](./charts.md) | app/components/dashboard-explorer/ | browser checks and E2E |
| Cross-category checks and probe set | [Testing](./testing.md) | tests/ | lint, typecheck, unit, E2E |
| Historical calibrations and limitations | [History](./history.md) | — | reviewed before formula changes |

The individual role cards remain in [docs/profiles](../profiles/). Active
technical decisions remain in [decisions/active](../../decisions/active/) and
are linked from the relevant canonical document instead of copied here.

## Current category status

| Category | Version | Deterministic baseline | AI role | Status |
| --- | --- | --- | --- | --- |
| Clarity | v1 | message intent, conventional structure, scope proxy | explain grounded patch evidence | baseline |
| Safety | v1 | safeguard signals plus confirmed introduced-risk penalties | classify grounded risks only | calibrated |
| Workflow | v2 | median/p75 delivery scope, outliers, message quality | bounded second check | calibrated |
| Complexity | v2 | weighted effective change surface, outliers, churn | bounded second check | calibrated |
| Context | v1 | intent, visible orientation evidence, review context | explain grounded project context | baseline |

The versions describe behavior contracts, not every wording edit. A formula,
evidence gate, payload shape, or role threshold change requires a versioned
changelog entry and a focused validation run.

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
