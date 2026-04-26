# Roast Architecture (v3.3)

Server-owned roast pipeline with receipt-gated share and verified leaderboard submit.

## Pipeline Overview

Flow:
1. Request validation and runtime resolution
2. GitHub context collection
3. Evidence selection
4. Prompt + payload build
5. AI execution (sync or stream)
6. Parser + canonical final normalizer
7. Deterministic scoring
8. Response shaping + signed receipt issuance
9. Optional persistence (share/official submit)

## Ownership Boundaries

- Collector: fetches and enriches GitHub commits/PRs.
- Selector: scores commits and picks prompt evidence.
- Prompt builder: builds system prompt + compact payload and computes effective AI config.
- NDJSON parser: incrementally parses model stream fragments.
- Final normalizer: asserts canonical output shape (`title`, `roastLines`, `feedback`).
- Scoring engine: deterministic metrics (`spaghettiIndex`, `stinkScore`, `egoDamage`, `grade`, `specialTitle`).
- Receipt module: HMAC-signs canonical output, verifies integrity/expiry for share+submit.
- Orchestrators:
  - sync path returns canonical JSON response.
  - stream path emits typed events and final `done`.

## Core Invariants

- Server is contract owner for stream and final response.
- `done.data` is canonical and must be structurally complete.
- `done.data.receipt` is required for downstream actions.
- Content events may interleave; consumer aggregates by type/index.
- Parse/normalization failures fail-fast with typed `error`.
- Metrics are deterministic and server-owned (not LLM-owned).

## Persistence Model

- Roast generation endpoints do not auto-persist by default.
- Share flow:
  - verify receipt
  - persist run/content/metrics
  - persist `roast_shares` token with expiry (24h)
- Official submit flow:
  - require GitHub session
  - verify receipt
  - enforce `session.login === roasted username`
  - persist run (idempotent by `request_id`)
  - upsert `leaderboard_entries` (latest wins)

## Read Model

- `/api/leaderboard`: reads only from official `leaderboard_entries` joins.
- `/api/leaderboard/:username`: official run detail.
- `/share/:token`: public read for one temporary shared roast.

## Debug Observability

High-signal scopes:
- `receipt-issued`
- `share-created`
- `share-resolved`
- `official-submit-accepted`
- `official-submit-rejected`

See:
- `payload-contract.md` for payload shapes
- `stream-contract.md` for event behavior
- `database.md` for schema/index/TTL details
