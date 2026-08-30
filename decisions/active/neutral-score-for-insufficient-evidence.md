# Neutral score for insufficient evidence

- Status: accepted
- Date: 2026-08-31
- Owner: dashboard profile scoring

## Problem

The public GitHub sample can be too narrow or misleading for a category. A
sample may contain mostly integration/merge commits, omit useful patches, or
simply provide no evidence for the signal being scored. Missing tests, CI,
documentation, or pull requests are not proof of a defect. Treating those
absences as negative evidence makes profiles such as `torvalds` look worse than
the collected data justifies.

## Decision

When a category does not have enough category-specific evidence for a reliable
judgment, its deterministic score falls back to a neutral `50`.

- `50` means **not enough evidence**, not average quality and not a ranking.
- A missing signal does not create a negative deduction.
- A confirmed negative signal may still lower the score when the category's
  evidence contract explicitly allows that deduction.
- Positive evidence may raise the score only when it is actually present and
  relevant to that category.
- The score must eventually carry a visible evidence status such as
  `scored` or `insufficient-evidence`, so the dashboard does not present the
  fallback as a measured performance level.
- Profiles without the minimum evidence required by the role matrix remain
  `Unclassified`; the fallback must not manufacture a role.

Current examples:

- Safety without usable patch evidence returns `50` with low confidence.
- Workflow with only merge/integration commits returns `50`; merge activity
  remains context and is not treated as personal workflow failure.

## Alternatives not chosen

- **Start at 60:** would add an unsupported positive assumption and make
  evidence-poor profiles look better than the data allows.
- **Keep the normal formula:** would turn missing observations into hidden
  penalties or rewards, depending on the category.
- **Infer the result from AI alone:** is not reproducible and can rank profiles
  from claims that are not grounded in the fetched commits.

## Consequences

The scoring remains conservative and comparable across incomplete samples. A
neutral fallback can lower an overall average, so the UI and roast copy must
distinguish a measured score from an evidence-limited score. Category formulas
must define their own minimum evidence gate before they are allowed into the
final role and grade calculation.

## Review condition

Revisit this decision after repository-wide metadata, a larger commit window,
or a validated unified AI evidence classification is available. Those inputs
may improve confidence, but they must not turn missing evidence into an
automatic positive score.
