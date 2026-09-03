# Use a replenished authored evidence window

- Status: accepted — implemented
- Date: 2026-09-03
- Owner: dashboard profile scoring

## Problem

The dashboard is intended to roast a developer's recent authored work, not a
maintainer's merge throughput or the current state of a repository. The
collector currently takes a global detailed-commit window and filters merge
commits afterwards. A merge-heavy user can therefore lose most of the small
evidence window before personal patches are available for scoring or AI review.

## Decision

Use a replenished, merge-aware authored evidence window:

1. Discover a bounded set of active owner repositories.
2. Collect commit references with author, committer, parent, repository, and
   timestamp metadata.
3. Classify integration commits before detailed enrichment whenever GitHub
   already provides authoritative parent metadata.
4. Build the recent personal candidate pool across repositories, keeping a
   small per-repository representation where available and then prioritizing
   recency.
5. Enrich personal candidates with file-level patches until the target
   personal evidence count is reached or the hard GitHub budget is exhausted.
   If the current repository window is merge-heavy, use the already discovered
   fallback repositories and at most one bounded history refill per repository.
6. Select the AI sample only from that final personal pool. Keep one AI request
   and the existing patch/token limits.

Repository data may supplement Context and Repository Anatomy. It must not
replace missing authored patches for code-quality claims.

## Evidence states

| State | Meaning | Scoring behavior |
| --- | --- | --- |
| `sufficient` | Enough personal, usable evidence was enriched | Score normally, with category gates |
| `expanded-window` | The first window was merge-heavy and bounded fallback was used | Score normally and expose the expanded scope |
| `limited-history` | The account has too little authored history | Category defaults and `Unclassified` where required |
| `limited-patches` | Authored commits exist, but usable patches are unavailable | Metadata-only categories may score; patch categories remain insufficient |

`insufficient` describes the evidence, not the developer. Merge volume remains
visible as integration context and is never attributed as personal code.

## Pattern and AI boundary

Existing safe-list and negative-list patterns remain useful for candidate
selection and patch prioritization. A pattern is not, by itself, semantic
proof. Commit-message patterns may inform Workflow or Context because the
message is the observed artifact. File and patch patterns must point to
concrete changed lines before they affect code-quality conclusions. Safety
risk still requires a grounded AI finding with `risk` and `introduced` impact;
the AI continues to provide a bounded second check rather than an unbounded
numeric score.

## Alternatives not chosen

- **Filter only after the top detailed window:** keeps the current bias and
  under-samples merge-heavy maintainers.
- **Fetch entire repositories when personal patches are scarce:** attributes
  other contributors' current code to the profile owner and increases quota
  cost.
- **Let AI decide which commits count:** makes the evidence window expensive and
  non-reproducible.

## Consequences and migration notes

The collector and patch selector now expose an explicit evidence ledger containing
candidate, skipped-integration, enriched, personal, patch-available,
backfilled, and AI-selected counts. The public API and database contracts do
not change. Existing score formulas remain frozen while sampling is migrated;
the six named probes and merge-heavy synthetic controls have been rerun. Later
formula calibration is documented in the category scoring documents and does
not change the evidence-window decision.

## Review condition

Review this decision after live runs show per-repository counts, merge skips,
backfill usage, and patch coverage. Keep the decision if `torvalds`-style
merge-heavy histories receive a representative authored sample without
exceeding the GitHub or Cloudflare budgets.
