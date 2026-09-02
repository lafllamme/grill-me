# Complexity

Complexity measures controlled personal change surface, not intrinsic AST or
cyclomatic complexity. Runtime files have full weight; tests, docs, generated
files, lockfiles, vendor/build output, and non-code artifacts are weighted
according to the active Complexity v2 contract.

## Formula

```text
effectiveFiles = runtime * 1 + tests * .5 + docs * .25
               + generated/lock/vendor/build/non-code * 0
               + omitted * average(visible weights)
Complexity = scopeSignal * .50 + outlierSignal * .30 + churnSignal * .20
```

The p75 effective file surface and the relative outlier ratio prevent one
large or generated-only change from defining the profile. Fewer than three
total or personal commits returns neutral `50`. AI may only apply the shared
grounded `±4` second-check adjustment.

`constants.ts` owns the typed file weights, thresholds, and score weights so
the formula code contains no category-specific magic numbers.
