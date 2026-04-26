# Roast Architecture (v3.2)

This document describes the server-owned roast pipeline and module ownership.

## Pipeline Overview

Flow:
1. Request validation and runtime resolution
2. GitHub context collection
3. Evidence selection
4. Prompt + payload build
5. AI execution (sync or stream)
6. Parser + canonical final normalizer
7. Deterministic scoring
8. Response shaping + stream emission
9. Persistence write path (Neon)

## Ownership Boundaries

- Collector: fetches and enriches GitHub commits/PRs.
- Selector: scores commits and picks prompt evidence.
- Prompt builder: builds system prompt + compact payload and computes effective AI config.
- NDJSON parser: incrementally parses model stream fragments.
- Final normalizer: asserts canonical output shape (`title`, `roastLines`, `feedback`).
- Scoring engine: deterministic metrics (`spaghettiIndex`, `stinkScore`, `egoDamage`, `grade`, `specialTitle`).
- Orchestrators:
  - sync path returns canonical JSON response.
  - stream path emits typed events and final `done`.

## Core Invariants

- Server is contract owner for stream and final response.
- `done.data` is canonical and must be structurally complete.
- Content events may interleave; consumer must aggregate by type/index.
- Parse/normalization failures fail-fast with typed `error`.
- Title quality is guarded by server normalization before final response.
- Metrics are server-owned and deterministic (not LLM-owned).

## Persistence and Read Model

- Persistence: canonical roast result is written to normalized run/content/metrics tables.
- All-time leaderboard: served from `roast_user_stats` (+ latest run joins).
- 24h leaderboard: served from windowed aggregation over recent `roast_runs` + metrics.

See `database.md` for schema/constraints/indexes.

## Debug Observability

Dev logs include:
- request/runtime/intensity resolution
- collector summary and optional content snapshots
- evidence selection summary
- prompt/payload summaries
- AI effective config
- stream counters + raw output snapshot (full debug)

See:
- `payload-contract.md` for debug field shapes
- `stream-contract.md` for event-level behavior
