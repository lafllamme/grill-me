# Workflow Scoring

**Version:** 3.0.0
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

Workflow = min(rawWorkflow, evidenceCap)

if personalCommits < 3:
  evidenceCap = 50
else if personalCommits < 6 or patchCommits < 3:
  evidenceCap = 84
else if personalCommits < 10:
  evidenceCap = 89
else:
  evidenceCap = 95
~~~

The inputs are calculated from personal, non-merge commits. `patchCommits` is
the number of those commits with visible patch content. The cap is deliberate:
metadata can identify a promising pattern, but it cannot justify a strong
Workflow claim on a thin or patch-free sample. A score of 85 or higher needs at
least six personal commits and three patch-bearing commits; a score above 89
needs at least ten personal commits and three patch-bearing commits. The hard
maximum is 95.

Commit frequency, active days, repository size, and merge ratio remain factual
context. If fewer than three total or three personal commits remain, Workflow
returns neutral 50 rather than calling the author good or bad.

## AI second check

The one combined AI review receives the message and scope breakdown plus up to
three authored patches. It may report supports, softens, contradicts, or
insufficient. A grounded review with two patch references can change the
deterministic result by at most four points. The adjustment is applied before
the evidence cap, so AI can soften an overly strict scope interpretation but
cannot manufacture a high score from insufficient evidence. It never returns a
replacement score.

## Validation

| Scenario | Expected |
| --- | --- |
| small explicit commits with PR evidence | high Workflow |
| same commits without public PR evidence | no automatic failure |
| coherent broad refactor | AI may soften with grounded evidence |
| generic messages plus broad changes | low Workflow with visible reasons |
| merge-only history | neutral 50 |
| compressed burst versus spread-out history | same score; frequency remains factual |
| three clean-looking commits | capped at 84, not a free 90+ |
| ten personal commits with three visible patches | eligible for the 95 cap |

## Known limits

A public sample cannot prove that an absent PR was never reviewed elsewhere.
Broad work can be coherent. The breakdown, evidence quality, and cap must
remain visible. A capped score is a limitation of the evidence window, not a
claim about the developer's overall ability.
