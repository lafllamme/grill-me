# Dashboard shared primitives

This folder contains only cross-category, pure helpers: score math, commit
classification, and patch-line extraction. Category-specific patterns and
scoring rules stay inside their owning category.

`analysis-patterns.ts` is the narrow exception for patterns that are factual
dashboard-wide metrics (tests, CI, docs, validation, risky files, and patch
signals). It is imported by composition and never by a category formula as a
hidden side effect.

`constants.ts` contains shared score bounds and metric units such as the
percentage scale, decimal precision, and day duration.
