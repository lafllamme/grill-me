# Complexity

Complexity measures controlled personal change surface, not intrinsic AST or
cyclomatic complexity. Runtime files have full weight; tests, docs, generated
files, lockfiles, vendor/build output, and non-code artifacts are weighted
according to the active Complexity v2.2 contract.

## Formula

```text
effectiveFiles = runtime * 1 + tests * .5 + docs * .25
               + generated/lock/vendor/build/non-code * 0
               + omitted * average(visible weights)
churnSignal = 100 - min((deletionRatio - 10) * .5, 35)
Complexity = scopeSignal * .50 + outlierSignal * .35 + churnSignal * .15
```

The p75 effective file surface and the relative outlier ratio prevent one
large or generated-only change from defining the profile. They overlap as
signals because both describe breadth, so v2.2 reduces the scope weight and
restores a small amount of churn as a supporting signal. Churn still cannot
rescue broad or outlier-heavy work. Fewer than three total or personal commits
returns neutral `50`; three to seven personal commits cap the observed score
at `92`, and broader evidence caps it at `95`. This prevents a small, focused
sample from being presented as mathematically perfect. AI may only apply the
shared grounded `±4` second-check adjustment.

`constants.ts` owns the typed file weights, thresholds, and score weights so
the formula code contains no category-specific magic numbers.
