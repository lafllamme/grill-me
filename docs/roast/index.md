# Roast Docs (v3.6)

Minimal doc map for the roast pipeline.

## Read This First

1. `architecture.md`
2. `api.md`
3. `stream-contract.md`
4. `payload-contract.md`

That set is enough for most agent work.

## What Each File Owns

- `architecture.md`: end-to-end flow, boundaries, and sequencing
- `api.md`: public endpoint behavior and error matrix
- `stream-contract.md`: SSE event order and finalization rules
- `payload-contract.md`: canonical payload shapes for sync, stream, share, and submit
- `database.md`: persistence model and leaderboard/share tables
- `operations.md`: DB operations and cleanup runbook

## Current Implementation Notes

- Public stream contract is typed SSE: `meta`, `status`, optional patch-free `evidence`, `roast_title`, `roast_line`, `feedback_item`, optional `debug`, then `done` or `error`.
- The model no longer needs to emit NDJSON-like event objects.
- Stream parsing now treats the model response as one progressively growing JSON object and emits partial SSE events as soon as `title`, `roastLines[*]`, or `feedback[*]` become complete.
- Final canonicalization merges progressive parser state with a raw-text fallback parser before emitting `cloudflare_ai_incomplete_output`.
- Canonical roast payloads now include `intensity: { level, label }`.

## Planning Docs

These are useful for product or UX follow-up, but not required for routine maintenance:

- `../roast-output-spec.md`
- `../prompt-contract-revision.md`

## UI Entrypoints

- `/leaderboard`: official Wall of Shame
- `/share/:token`: temporary unofficial shared roast
