# Dashboard roles

The role matrix turns the five category scores into a roast label. It is
ordered from broad positive profiles through mixed and negative profiles; all
matching roles are returned as candidates and the first match is the primary
label. Sparse samples remain `Unclassified`.

The matrix is intentionally separate from score calculation. Threshold changes
belong here and must not silently alter category formulas or API contracts.

`constants.ts` owns the typed role thresholds and minimum evidence rule. The
matching code only interprets that catalog, keeping role calibration visible.
