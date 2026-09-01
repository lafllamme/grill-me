# Clarity Scoring

**Version:** 1.0.0
**Status:** baseline
**Updated:** 2026-09-02

## Question

Can another developer understand the intent and local shape of the sampled work?

Clarity is not a claim about the complete AST or every variable name. The
current public evidence measures communicated intent and reviewable scope.

## Deterministic formula

~~~text
Clarity = workflowMessageQuality * 0.55
        + workflowConventionalMessageRatio * 0.15
        + clarityScopeSignal * 0.30

clarityScopeSignal
  = 100 - max(0, workflowAverageFilesPerCommit - 1) * 7
~~~

All terms are clamped to 0–100. Messages are scored for specificity, action
language, and conventional prefixes. Generic subjects score low. Scope is a
reviewability proxy, not a code-quality verdict.

The score requires at least three sampled commits and three personal non-merge
commits. Otherwise it returns neutral 50 with insufficient evidence.

## AI second check

The combined AI request may explain or qualify the result using selected patch
excerpts. It cannot replace the deterministic score. A grounded axis review
needs confidence ≥70 and two distinct patch references before the bounded
adjustment is accepted.

## Validation

| Scenario | Expected |
| --- | --- |
| three small, explicit, conventional commits | above 85 |
| generic messages across broad changes | below 35 |
| one or two personal commits | neutral 50 |
| merge-only sample | neutral 50 |

## Limitation

A clear commit message can describe a poor implementation. Patch-level evidence
must remain separate from message clarity.
