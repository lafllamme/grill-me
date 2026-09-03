# Dashboard Validation

**Version:** 1.2.0
**Status:** active
**Updated:** 2026-09-03

The dashboard is accepted only when the number, its evidence, and the visible
story agree. A passing parser test alone is not enough.

## Required checks

For a scoring or API change:

~~~bash
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:e2e
git diff --check
~~~

During a focused iteration, run the relevant unit file first, then the full
checks before committing. No result is described as validated unless the
command actually ran.

## Probe set

The named calibration set is:

lafllamme, danielroe, torvalds, sindresorhus, antfu, and kentcdodds.

These are evidence probes, not a ranking of engineering ability. The sample is
bounded, merge-aware, and may be Unclassified when too little personal work
survives filtering.

### Evidence-window controls

The sampling implementation must also be checked with these controls:

| Control | Expected behavior |
| --- | --- |
| merge-heavy maintainer | integration commits are reported, skipped for personal scoring, and personal candidates are replenished within the hard budget |
| multiple active repositories | the personal pool contains current authored work from more than one repository when available; one repository cannot silently consume the whole sample |
| fresh account | no bounded refill invents evidence; category defaults and `Unclassified` remain visible |
| authored commits without patches | Workflow/Context may use observed metadata, while patch-dependent categories remain insufficient |
| pattern-only match | safe-list or negative-list match prioritizes evidence but does not become semantic proof by itself |
| no usable personal patch | AI returns a no-evidence result and no repository snapshot is presented as authored code |

The trace must expose `candidateRefs`, `integrationSkipped`, `personalRefs`,
`detailsFetched`, `personalWithPatch`, `backfilled`, and `aiSelected` so each
run can be reviewed without guessing what the score actually saw.

The Markdown trace checker is exercised by
`tests/unit/dashboard-trace-checker.test.ts`. A complete local AI trace must
contain the collection ledger, patch selection, prompt, request metrics,
response, review, and finalization events in that order. A no-AI/local fallback
trace is checked with the provider events optional, but it still needs the
collection ledger and final score lifecycle.

### Named probe set

| Probe | Control |
| --- | --- |
| lafllamme | product-wide change with otherwise understandable delivery |
| danielroe | focused, explicit, high-volume history |
| torvalds | merge-heavy history; personal work must be separated |
| sindresorhus | package/release breadth without automatic complexity failure |
| antfu | consistently focused changes |
| kentcdodds | delivery shape, not a free test-file bonus |

## Category acceptance loop

Every category must have:

1. a one-sentence question;
2. category-owned metrics and formula;
3. an explicit minimum-evidence gate;
4. at least one positive, neutral, negative, and insufficient-evidence control;
5. the named probe set checked against the breakdown;
6. a documented AI second-check rule, if AI is used;
7. a note explaining known bias and what the number does not claim.

Dashboard runtime tracing is checked separately from product output. In
development, `NUXT_DASHBOARD_TRACE_LEVEL=summary` shows request-scoped phase,
count, timing, payload-size, and token-estimate entries in the server console;
`NUXT_PUBLIC_DASHBOARD_TRACE_LEVEL=summary` shows the client stream lifecycle.
Summary mode must not expose prompt text, patch bodies, or raw model output.
Server traces are also written as one Markdown file per analysis to
`logs/dashboard/` in development. Set `NUXT_DASHBOARD_TRACE_FILE_DIR=` to
disable file output; use `full` only for local inspection because those files
contain the prompt and model response.
Playwright's web server forces colored output; its configured Nuxt command
removes the inherited `NO_COLOR` flag so Node does not report a conflicting
`NO_COLOR`/`FORCE_COLOR` pair. This only affects test-server output.

## Safety controls

Safety also uses repository-scoped immutable commit probes. The current
negative controls and exact expected deductions are documented in
[Safety](./categories/safety.md) and implemented in
tests/fixtures/dashboard-safety-probes.ts.

| Control | Expected behavior |
| --- | --- |
| validation/error-handling patch | positive evidence, no automatic reward beyond the formula |
| ordinary feature patch | stays in the normal evidence range |
| introduced eval, auth bypass, or hard-coded secret | confirmed penalty |
| fix of a previously unsafe path | no risk penalty |
| no usable patch evidence | neutral 50, low confidence |

Repository probes are not assigned to a username score. They validate the
Safety contract for a supplied owner/repository and immutable commit.

### Latest Clarity boundary run

The Clarity v4 controls keep the existing message, naming, and structure
signals but prevent thin evidence from looking exceptional:

| Control | Expected behavior |
| --- | --- |
| three clear commits with visible patches | raw near-perfect signal is capped at 90 |
| six or more personal commits with at least three visible patches | strong evidence can reach 95, never 100 |
| generic names and deeply indented additions | remains a low signal, independent of the cap |
| fewer than three personal commits | neutral 50 and insufficient evidence |

### Latest Safety boundary run

The current Safety v4 controls produce a deliberate spread instead of a fixed
normal value:

| Case | Score | Expected interpretation |
| --- | ---: | --- |
| no patch evidence | 50 | insufficient evidence |
| ordinary patch without a Safety surface | 70 | neutral |
| sparse defensive patch | 84 | limited positive evidence |
| fully defensive patch | 95 | strong visible defense, capped |
| medium introduced risk | 55 | confirmed penalty |
| high `eval` risk | 40 | confirmed high-severity penalty |
| secret/auth bypass | 20 | confirmed critical penalty |

The focused Safety run currently passes 10 tests. These controls validate score
behavior; they do not turn the six named calibration profiles into a developer
ranking.

### Latest Context boundary run

Context v5 keeps sufficient samples at a neutral 70 unless the visible evidence
supports a higher or lower result. It distinguishes missing artifacts from
directly vague commit subjects:

| Control | Expected behavior |
| --- | --- |
| normal feature patches without visible docs/comments | around 70–76; no absence penalty |
| vague or empty commit subjects | lower 60s when the sample is otherwise sufficient |
| generated changelog-only work | neutral 70; release artifacts are not orientation proof |
| visible explanations, orientation artifacts, and reviewed PRs | strong 85+ result |
| fewer than three personal commits | neutral 50 and insufficient evidence |

## Evidence review

When a score looks surprising, inspect in this order:

1. personal non-merge commit count;
2. category breakdown and fallback status;
3. selected patch SHAs and filenames sent to AI;
4. AI verdict and accepted adjustment;
5. raw chart totals and the final role/grade.

This prevents a chart value, a deterministic baseline, and an AI-adjusted
final value from being mistaken for three different scoring systems.
