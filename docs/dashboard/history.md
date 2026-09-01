# Dashboard Scoring History

**Status:** calibration record
**Updated:** 2026-09-01

This file contains calibration evidence that should not be mixed into the
active formula contract. The values describe a bounded public sample, not a
general ranking of the named developers.

## Latest six-profile audit

| Profile | Clarity | Safety | Workflow | Complexity | Context | Overall | Main limitation |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| lafllamme | 77 | 66 | 68 | 66 | 82 | 72 | broad product changes in a small sample |
| danielroe | 89 | 68 | 76 | 89 | 66 | 78 | little visible defensive evidence |
| torvalds | 56 | 65 | 62 | 69 | 60 | 62 | only a few personal commits after merge filtering |
| sindresorhus | 34 | 73 | 46 | 32 | 61 | 49 | package/release breadth and vague subjects |
| antfu | 90 | 67 | 83 | 95 | 74 | 82 | broad sampled surface despite focused patterns |
| kentcdodds | 60 | 75 | 64 | 81 | 66 | 69 | small public sample |

These values motivated ownership separation, merge filtering, the Complexity
v2 change, and the neutral evidence fallback. They must not be copied into a
mock or used as fixed expectations for a future live fetch.

## Recorded Complexity v2 example

For lafllamme, the deterministic baseline was:

~~~text
scope       60 × 0.50 = 30.0
outliers    88 × 0.30 = 26.4
churn      100 × 0.20 = 20.0
                         ─────
                         76.4 → 76
~~~

A grounded AI review with two patch references applied the allowed +4, so the
final Complexity value became 80. The AI did not replace the formula.

## Historical interpretation

- torvalds is evidence-limited after merge commits are excluded; a neutral
  result is not a claim about engineering ability.
- sindresorhus demonstrates why raw average files per commit over-penalizes
  release and package changes.
- Commit frequency is a factual chart signal, not a quality bonus.
- The six-profile audit is a regression lens; larger evidence windows are
  required before role thresholds become production rankings.
