# Context Scoring

**Version:** 1.0.0
**Status:** baseline
**Updated:** 2026-09-02

## Question

Does the sampled work explain itself and leave enough orientation for the next
safe change?

Context is not a count of README files or comments. Public commit evidence
cannot prove that a missing file was never present elsewhere in the repository.

## Deterministic formula

~~~text
Context = workflowMessageQuality * 0.50
        + contextDocumentationSignal * 0.30
        + contextReviewSignal * 0.20

contextDocumentationSignal = 50, when no documentation file is visible
                           = 50 + min(documentationFileRatio * 2, 30), otherwise

contextReviewSignal = pullRequestCoverage, when PR evidence exists
                    = 50, otherwise
~~~

The same minimum gate as Clarity applies: at least three sampled commits and
three personal non-merge commits. Documentation and PR absence are neutral, not
penalties.

## AI second check

The combined AI review may explain README, Markdown, setup, architecture, or
orientation evidence in selected patches. It cannot replace the deterministic
score. A grounded axis review needs confidence ≥70 and two patch references
for a bounded adjustment.

## Validation

| Scenario | Expected |
| --- | --- |
| explicit commits with visible docs and PR evidence | above 75 |
| explicit commits without visible docs or PRs | above neutral, not penalized |
| vague messages without docs or PRs | below 45 |
| fewer than three personal commits | neutral 50 |

## Known limits

Documentation quality is only partially visible in a bounded commit sample.
Context must be read with raw evidence and confidence, not as proof that a
repository is documented or undocumented in full.
