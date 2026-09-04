# Dashboard execution roadmap

**Version:** 1.0.0  
**Status:** active  
**Updated:** 2026-09-04

This is the working roadmap for the Dashboard Explorer. It is the execution
board for the dashboard-specific work; the broader product roadmap remains in
[`docs/roadmap.md`](../roadmap.md).

## Current position

The scoring foundation is ready for UI integration. The category formulas are
not declared immutable forever, but they are frozen for this integration pass:
any later formula change must go through the existing six-profile probe set,
the synthetic controls, and the category documentation.

| Area | Status | What is currently true |
| --- | --- | --- |
| Input and lifecycle | done | One username-driven analysis flow with retry, cancellation, and honest phases. |
| GitHub evidence | done | Bounded, merge-aware authored evidence with replenishment and an evidence ledger. |
| Deterministic scoring | done for integration | Clarity, Safety, Workflow, Complexity, and Context have versioned formulas, gates, and checks. |
| AI second review | done for integration | One bounded request explains selected patches and may apply grounded adjustments; it does not invent scores. |
| Roles and grade | done for integration | The role matrix resolves from the same final category scores and evidence status. |
| Dashboard model | in progress | Mock and live profiles share a model, but readiness is not yet granular enough for progressive rendering. |
| Loading choreography | in progress | Local preview and final-geometry loading shell are in place; panel-level readiness remains. |
| Streaming | queued | Transport phases exist; panel-level streaming waits for a stable render contract. |

### Scoring checkpoint

| Category | Current contract | AI involvement | Integration status |
| --- | --- | --- | --- |
| Clarity | v4 | Explain grounded naming and patch signals; no free numeric score | checked off |
| Safety | v4 | Verify defensive signals and introduced risks; only grounded findings can adjust | checked off |
| Workflow | v3 | Bounded second check of delivery shape and message evidence | checked off |
| Complexity | v2.2 | Bounded second check of change surface and outliers | checked off |
| Context | v5 | Bounded second check of orientation and handoff evidence | checked off |

The five baselines, their evidence gates, the named probe set, and the
positive/negative controls are therefore not the next work package. They remain
the regression boundary while the UI is wired. The category source of truth is
[`docs/dashboard/categories/README.md`](categories/README.md).

## The five product phases

This is the agreed end-to-end story. The fifth phase is the remaining product
work; the first four are the foundation that should not be redesigned while
the loading UX is being integrated.

```text
1 input
  → 2 GitHub pass
  → 3 deterministic profile
  → 4 one AI review
  → 5 final dashboard reveal / future stream
```

| Phase | Result | Status |
| --- | --- | --- |
| 1. Input | Username, conditions, theme, request lifecycle | done |
| 2. GitHub pass | Repositories, authored commits, patches, raw activity facts | done |
| 3. Profile pass | Five deterministic category baselines with evidence status | done for integration |
| 4. AI review | Grounded explanation and bounded second check over selected patches | done for integration |
| 5. Dashboard reveal | Same visual shell, progressive readiness, final roast, then stream | next |

## Next implementation sequence

### 1. Define panel readiness without changing the design

Create one small readiness contract at the dashboard boundary. It should say
which information is available at which phase and which values must stay
atomic until the final review:

| Surface | Earliest honest data | Reveal rule |
| --- | --- | --- |
| Header and analysis status | immediately after submit | Keep identity, phase, and progress stable. |
| Evidence totals and raw GitHub facts | GitHub evidence event | Show only fetched facts; never use mock values for a live run. |
| Change Volume, Commit Rhythm, Commit Frequency, Repository Anatomy | enriched authored evidence | Replace their loading content in place, keeping the final panel geometry. |
| Radar and Profile Signals | final reviewed assessment | Reveal the five scores as one coherent profile; do not show a deterministic value and later replace it. |
| Verdict and AI review | finalization / done | Reveal role, grade, headline, roast, and patch evidence together. |

This contract keeps the product honest: GitHub facts can arrive early, while
the score and roast remain one consistent final statement.

### 2. Make loading visually isomorphic to the final dashboard

The loading composition now uses the same twelve-column order, panel spans,
headings, and responsive heights as `DashboardExplorer.vue`. The loading state
remains visually quiet, but it occupies the same places as the final panels so
the result does not jump from one layout to another. Panel-level readiness is
still the next part of this step.

Acceptance criteria:

- the first frame already has the final Bento geometry;
- no panel is removed and recreated merely because data arrived;
- skeletons describe the actual panel content instead of generic line cards;
- idle, loading, empty, error, and ready states have explicit rendering rules;
- reduced motion keeps the same layout and removes only movement;
- a live run never displays mock chart data while waiting for GitHub or AI;
- the existing one-request lifecycle and final-score atomicity remain intact.

### 3. Wire every panel to the normalized model

Audit the live path panel by panel. Each chart must consume its typed slice of
the same `DashboardExplorerModel`, and every displayed number must have a
visible source in either the GitHub evidence or the final assessment.

The audit must explicitly cover identity counts, evidence totals, five scores,
grade, role, verdict, AI review, chart series, empty evidence, and the live
versus mock badge. No new box or new metric is part of this step.

### 4. Add progressive updates to the model boundary

Once the stable loading shell works with the current single response, extend
the client model update path for real readiness events. GitHub-derived panels
may hydrate first. Score panels hydrate only when the final reviewed assessment
is available. The final verdict and AI evidence arrive last.

This is where the existing stream events become visible UI state; it is not a
second request per chart and it does not move scoring into the client.

### 5. Add streaming as a transport improvement

Only after the non-streamed lifecycle and panel readiness are visually and
functionally stable, let the existing phases update the same model through
typed stream events. Keep cancellation, retry, one request, bounded payloads,
redaction, and the final-score atomicity as invariants.

### 6. Finish and simplify

After the UI flow is stable:

- add browser checks for idle → loading → evidence → final → error;
- verify the six named profiles and positive/negative controls still agree
  with their code and patch evidence;
- review trace output and payload sizes against the Cloudflare budget;
- remove dead compatibility files only after import, test, and documentation
  links are verified;
- keep category READMEs and this roadmap as the current sources of truth.

## Guardrails for this roadmap

- No new scoring formula while the loading/render contract is being integrated
  unless a probe exposes a real correctness defect.
- No new metric or chart box just because the server can provide another field.
- No fabricated partial scores, evidence, or AI explanations.
- No independent chart requests or independent chart timers.
- No streaming polish before the stable loading shell passes browser checks.
- No automatic commit or push as part of implementation work.

## Definition of done

The Dashboard Explorer is ready for the next product phase when a user can
submit a username and see one stable visual story: the same Bento structure is
present while GitHub facts arrive, the reviewed profile appears once without
changing its score afterward, the verdict is grounded in the selected patches,
and retry/error states do not destroy the layout.

The implementation sequence follows the accepted architecture decision in
[`decisions/active/2026-08-31-dashboard-analysis-orchestration.md`](../../decisions/active/2026-08-31-dashboard-analysis-orchestration.md).
