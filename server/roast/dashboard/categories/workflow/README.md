# Workflow

Workflow asks whether delivery arrives in understandable, reviewable slices.
The category owns message quality, median/p75 scope, outlier, and evidence-cap
logic. Commit frequency and merge ratio remain factual context.

## Formula

```text
fileScope = medianScope * .65 + p75Scope * .35
granularity = fileScope * .75 + outlierSignal * .25
Workflow = messageSignal * .45 + granularity * .40 + reviewSignal * .15
```

When no PR evidence exists, the observed terms are normalized by `.85` rather
than penalized. The result is capped at `50`, `84`, `89`, or `95` according to
the personal and patch evidence gates. AI may only apply the shared grounded
`±4` adjustment before the cap.

`constants.ts` is the typed catalog for message scoring, scope thresholds,
percentiles, weights, and evidence caps.
