# Treat merge commits as integration evidence

- Status: accepted
- Date: 2026-08-31
- Owner: dashboard profile scoring

## Problem

The public GitHub activity sample mixes a developer's own work with merge and
integration commits. That is especially misleading for maintainers such as
`torvalds`: a large merge-heavy sample can make personal delivery, clarity, or
complexity look worse even when the fetched data does not support that claim.

## Decision

Collect merge commits, but classify them as `integration` and exclude them from
personal profile scoring. Keep them available as clearly labelled repository
context:

- raw activity and merge volume may remain visible as repository facts;
- Clarity, Workflow, Complexity, Context, and Safety use personal, non-merge
  commits by default;
- pull-request coverage must use the personal commit denominator, not all
  integration activity;
- the AI receives personal patch evidence for scoring and may receive merge
  volume only as context, never as attributable code evidence;
- insufficient personal evidence returns neutral `50` and leaves the role
  `Unclassified`.

The collector should prefer authoritative GitHub parent/commit metadata for
classification. Until that metadata is carried through the payload, the
existing merge-message heuristic is only a temporary fallback and must not be
treated as perfect attribution.

## Alternatives not chosen

- **Drop merges during collection:** loses useful repository activity context
  and prevents the dashboard from explaining why the personal sample is small.
- **Count all commits equally:** systematically penalizes integration-heavy
  maintainers and attributes other people's changes to the profile owner.
- **Let the AI decide which commits count:** makes the evidence window
  non-reproducible and spends quota on a classification the API can provide.

## Consequences

Scores become more attributable and comparable across maintainers and smaller
personal repositories. The dashboard needs separate labels for total sampled
commits, personal commits, and integration commits so a neutral score is not
mistaken for poor performance. The current Workflow, Clarity, Context, and
Complexity paths already filter their personal sample; Safety still needs to be
aligned with this policy in a later scoring pass.

## Review condition

Revisit this decision when the collector carries commit parent/authorship
metadata and the personal-vs-integration classification is covered by live and
synthetic tests. A larger repository-aware evidence window may refine the
classification, but it should not restore equal weighting for merge commits.
