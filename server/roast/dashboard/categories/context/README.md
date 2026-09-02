# Context

Context asks whether a sampled change explains itself and leaves enough
orientation for the next safe change. Missing documentation, comments, or PRs
remain neutral; direct explanatory additions and meaningful commit context are
the stronger signals.

## Formula

```text
Context = 70
  + (patchExplanationSignal - 50) * .22
  + (orientationArtifactSignal - 50) * .10
  + (commitContextSignal - 50) * .28
  + (repositoryOrientationSignal - 50) * .05
  + (handoffSignal - 50) * .05
```

The neutral midpoint is `70` once three total and three personal commits are
available. Below that gate the score is `50` and insufficient. Repository and
handoff signals are intentionally weak; missing docs never becomes an invented
failure.

`constants.ts` contains the typed context weights, commit bonuses/penalties,
artifact weights, and evidence gates used by the metric and score modules.
