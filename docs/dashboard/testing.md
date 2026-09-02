# Dashboard Validation

**Version:** 1.1.0
**Status:** active
**Updated:** 2026-09-02

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

## Evidence review

When a score looks surprising, inspect in this order:

1. personal non-merge commit count;
2. category breakdown and fallback status;
3. selected patch SHAs and filenames sent to AI;
4. AI verdict and accepted adjustment;
5. raw chart totals and the final role/grade.

This prevents a chart value, a deterministic baseline, and an AI-adjusted
final value from being mistaken for three different scoring systems.
