# Patch selection

Patch selection owns the bounded, deterministic sample sent to the single AI
review. Budget limits, generated-file filtering, selection reasons, and safety
relevance stay separate from category score formulas.

The contract is at most three authored commits, twelve files, 700 characters
per patch, 9,000 total patch characters, and 3,200 output tokens. Selection is
deterministic: latest, typical-sized, and safety-relevant candidates are added
in that order from the final merge-aware personal evidence pool, with merge,
generated, vendored, lock, and build artifacts excluded.

The upstream collector owns that pool. It must not select a global detailed
window, remove merge commits afterwards, and silently continue with too few
personal candidates. When the recent window is merge-heavy, it may use the
bounded repository/history refill described in the active evidence-window
[decision](../../../../decisions/active/2026-09-03-dashboard-authored-evidence-window.md).
If the bounded search still finds too little authored history, the selection
reports limited evidence instead of substituting repository snapshot code.

The collector exposes its internal sampling ledger to the trace, not to the
public dashboard evidence DTO. This keeps the UI/API contract stable while
making candidate refs, skipped integrations, backfilled refs, and patch-ready
personal commits auditable in local logs.

The typed `budget.ts` catalog is the only source for payload budgets and
selection heuristics; `patterns.ts` contains only generated-file matching.
Existing category safe-list and negative-list patterns may prioritize a patch,
but a match is not semantic confirmation. Grounding and the single AI review
remain responsible for evidence-backed interpretation.
