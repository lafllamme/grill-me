# Workflow Scoring

**Version:** 2.0.0
**Status:** calibrated
**Updated:** 2026-09-02

## Question

Does the observed delivery history arrive in understandable, reviewable slices
with clear intent?

Workflow describes delivery hygiene. It does not measure productivity, code
quality, or repository value.

## Deterministic formula

~~~text
medianScopeSignal = 100 - max(0, medianFilesPerCommit - 2) * 5
p75ScopeSignal = 100 - max(0, p75FilesPerCommit - 4) * 3
fileScopeSignal = medianScopeSignal * 0.65 + p75ScopeSignal * 0.35

outlierSignal = 100 - workflowLargeCommitRatio
granularitySignal = fileScopeSignal * 0.75 + outlierSignal * 0.25

if PR evidence exists:
  Workflow = messageSignal * 0.45
           + granularitySignal * 0.40
           + reviewSignal * 0.15
else:
  Workflow = (messageSignal * 0.45
            + granularitySignal * 0.40) / 0.85
~~~

The inputs are calculated from personal, non-merge commits. Commit frequency,
active days, repository size, and merge ratio remain factual context. If fewer
than three total or three personal commits remain, Workflow returns neutral 50.

## AI second check

The one combined AI review receives the message and scope breakdown plus up to
three authored patches. It may report supports, softens, contradicts, or
insufficient. A grounded review with two patch references can change the
deterministic result by at most four points. It never returns a replacement
score.

## Validation

| Scenario | Expected |
| --- | --- |
| small explicit commits with PR evidence | high Workflow |
| same commits without public PR evidence | no automatic failure |
| coherent broad refactor | AI may soften with grounded evidence |
| generic messages plus broad changes | low Workflow with visible reasons |
| merge-only history | neutral 50 |
| compressed burst versus spread-out history | same score; frequency remains factual |

## Known limits

A public sample cannot prove that an absent PR was never reviewed elsewhere.
Broad work can be coherent. The breakdown and confidence must remain visible.
