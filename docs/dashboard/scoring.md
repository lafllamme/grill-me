# Dashboard scoring contract

**Version:** 1.7.0
**Status:** active
**Updated:** 2026-09-04

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
Merge commits are excluded from personal category evidence and must not fill
the detailed personal evidence window before that exclusion. Fewer than three
personal commits, or missing category-specific evidence, returns neutral `50`
and marks the evidence insufficient. A merge-heavy history may use bounded
fallback repositories or older history to replenish personal evidence; a
genuinely young or sparse account remains insufficient. The score is not a
reputation ranking.

## AI boundary

The combined review receives the same bounded patch selection for all five
axes. Grounded non-Safety reviews may adjust the deterministic value only
within the shared small cap. Safety accepts only independently verified,
production-scoped introduced risks or defensive evidence, and ignores risk
penalties from reviews below 70% confidence. See the [AI review overview](./ai-review.md).

Patterns are evidence locators, not universal score modifiers. Commit-message
patterns may contribute to Workflow or Context because the message is itself
the observed artifact. File and patch patterns only nominate changed code for
closer inspection; they must not turn a filename or keyword into an automatic
code-quality claim.

Current calibration guardrails: Complexity v2.2 weights scope at `0.50`, outliers
at `0.35`, and deletion churn at `0.15`; breadth remains primary and a bounded
sample is capped below a perfect score. Context weights direct patch
explanations and commit intent more heavily than repository metadata. Safety
deductions require an assessed, high-confidence AI signal grounded to the exact
changed filename and a server-confirmed introduced production risk.

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
