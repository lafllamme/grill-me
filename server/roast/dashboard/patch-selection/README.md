# Patch selection

Patch selection owns the bounded, deterministic sample sent to the single AI
review. Budget limits, generated-file filtering, selection reasons, and safety
relevance stay separate from category score formulas.

The contract is at most three authored commits, twelve files, 700 characters
per patch, 9,000 total patch characters, and 3,200 output tokens. Selection is
deterministic: latest, typical-sized, and safety-relevant candidates are added
in that order, with merge, generated, vendored, lock, and build artifacts
excluded.

The typed `budget.ts` catalog is the only source for payload budgets and
selection heuristics; `patterns.ts` contains only generated-file matching.
