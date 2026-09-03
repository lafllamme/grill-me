# Dashboard scoring contract

**Version:** 1.4.0
**Status:** active
**Updated:** 2026-09-03

This page is the shared overview. The executable formula and evidence rules
live in the README of each category folder.

## Pipeline

```text
GitHub evidence → category metrics → deterministic scores
               → one grounded AI review → final score, grade, role
```

The server owns facts, formulas, bounds, evidence status, grade, and role
eligibility. The AI interprets selected patches and writes explanations; it
never replaces a numeric score.

## Axes

| Axis | Question | Canonical implementation |
| --- | --- | --- |
| Clarity | Can another developer understand the intent and local shape? | [category README](../../server/roast/dashboard/categories/clarity/README.md) |
| Safety | Do visible changed lines protect users or introduce a concrete risk? | [category README](../../server/roast/dashboard/categories/safety/README.md) |
| Workflow | Does work arrive in understandable, reviewable slices? | [category README](../../server/roast/dashboard/categories/workflow/README.md) |
| Complexity | Is the observed change surface controlled? | [category README](../../server/roast/dashboard/categories/complexity/README.md) |
| Context | Does the change explain itself and leave orientation? | [category README](../../server/roast/dashboard/categories/context/README.md) |

All scores are bounded to `0–100`; higher always means a stronger signal.
Merge commits are excluded from personal category evidence. Fewer than three
personal commits, or missing category-specific evidence, returns neutral `50`
and marks the evidence insufficient. The score is not a reputation ranking.

## AI boundary

The combined review receives the same bounded patch selection for all five
axes. Grounded non-Safety reviews may adjust the deterministic value only
within the shared small cap. Safety accepts only independently verified
introduced risks or defensive evidence. See the [AI review overview](./ai-review.md).

## Overall result

```text
overallScore = round(mean(clarity, safety, workflow, complexity, context))
```

The grade is derived from that mean and never selected from the role matrix.
Roles describe a dominant pattern; unmatched or insufficient evidence remains
`Unclassified`. The role rules live in
[`server/roast/dashboard/roles/`](../../server/roast/dashboard/roles/).

## Dashboard mapping

| Surface | Source |
| --- | --- |
| Radar / Ring | five normalized axis scores |
| Verdict | grade, role, headline, grounded AI explanation |
| Evidence | raw window totals and axis breakdowns |
| Activity charts | factual commit, change, rhythm, and repository metrics |

The composition owner is
[`scoring.ts`](../../server/roast/dashboard/scoring.ts).
The former flat server file is a compatibility facade.

For calibration and limitations, use the
[archive](./calibration/history.md). For validation commands, use
[testing.md](./testing.md).
