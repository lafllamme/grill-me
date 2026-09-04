# Complexity Scoring

**Version:** 2.2.0
**Status:** calibrated
**Updated:** 2026-09-04

## Question

Is the observed personal change surface controlled?

GitHub does not provide a reliable AST, call graph, cyclomatic complexity, or
duplication count in this payload. Complexity v2.2 is therefore an observable
change-surface proxy, not a claim about intrinsic code complexity.

## Deterministic formula

~~~text
effectiveFiles(commit)
  = runtime/config files * 1.00
  + test files * 0.50
  + documentation files * 0.25
  + generated/lock/vendor/build/release/non-code files * 0
  + omitted files * average(visible file weights)

effectiveFilesP75 = p75(effectiveFiles(personal commits))
scopeSignal = 100 - clamp((effectiveFilesP75 - 2) * 5, 0, 60)
outlierSignal = 100 - broadOrRelativeOutlierRatio

churnSignal = 100 - min((deletionRatio - 10) * 0.5, 35)
Complexity = scopeSignal * 0.50
           + outlierSignal * 0.35
           + churnSignal * 0.15
~~~

The active weights are `scope 0.50`, `outlier 0.35`, and `churn 0.15`.
Scope and outlier breadth are partially correlated, so v2.2 avoids letting
their overlap dominate the score while keeping breadth as the primary signal.
Deletion-heavy churn remains a weak supporting signal; low deletion volume is
not treated as proof of simple code. The 75th percentile prevents one release
commit from defining the profile. Merge commits are excluded before
calculation. Fewer than three total or three personal commits returns neutral
50. Three to seven personal commits cap the observed score at 92; eight or
more cap it at 95 because a bounded patch window cannot prove intrinsic
complexity is absent.

## AI second check

The combined AI review may explain deep nesting, duplication, coupling, or
indirection in selected patches. With confidence ≥70 and two grounded patch
references, it may apply only +4 or -4. It cannot infer complexity from
repository size, popularity, commit count, or truncated context.

## Validation

| Scenario | Expected |
| --- | --- |
| focused personal commits touching one or two runtime files | above 80 |
| broad personal commits | lower score with visible scope pressure |
| runtime plus tests/docs/lockfiles | runtime surface weighted primarily |
| focused history plus huge merge commits | same as personal history |
| fewer than three personal commits | neutral 50 |
| deletion-heavy refactor without broad scope | weak influence only |

## v2.2 calibration replay

Using the same current six-profile evidence window as the previous comparison,
the Complexity values are:

| Profile | v2.1 | v2.2 | Change |
| --- | ---: | ---: | ---: |
| laflamme | 54 | 56 | +2 |
| danielroe | 95 | 95 | capped |
| torvalds | 95 | 95 | capped |
| sindresorhus | 91 | 91 | unchanged |
| antfu | 95 | 95 | capped |
| kentcdodds | 79 | 80 | +1 |

The replay changes only the deterministic Complexity weights. The evidence
cap, category inputs, AI adjustment limit, public API, and UI contract remain
unchanged. The result is intentionally a small correction rather than a
profile-specific boost.

## Recorded calibration

For lafllamme, the deterministic baseline was 76; the grounded AI second check
applied +4, producing final Complexity 80. The breakdown is kept in
[calibration history](../calibration/history.md), not repeated in every implementation note.
