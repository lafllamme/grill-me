# Roast API (v5.1)

This document describes the public roast contract and the current server-owned
streaming architecture.

## Endpoints

- `POST /api/roast`
  - synchronous JSON response
- `POST /api/roast/stream`
  - typed SSE stream (`text/event-stream`)

Source of truth for schemas:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## Request Shape

```json
{
  "githubUsername": "lafllamme",
  "debugLevel": "minimal",
  "variationMode": "moderate",
  "roastIntensity": 2
}
```

## Final Response Shape

Used by sync endpoint and `done.data` in stream:

```json
{
  "username": "lafllamme",
  "title": "Monorepo Meltdown",
  "roastLines": ["Line 1", "Line 2"],
  "roast": "Line 1 Line 2",
  "feedback": ["Action 1", "Action 2", "Action 3"],
  "meta": {
    "commitCount": 12,
    "prCount": 0,
    "selectedCommitCount": 8
  }
}
```

Canonical final requirements:
- `title` non-empty
- `roastLines` non-empty
- `feedback` non-empty

## Stream Event Contract

Public stream event types (stable):
- `meta`
- `status`
- `roast_title`
- `roast_line`
- `feedback_item`
- `debug` (optional)
- `done`
- `error`

Interleave rules:
- `roast_line` and `feedback_item` may interleave.
- `done` is canonical final truth.

Expected sequence:
1. `meta`
2. `status*`
3. `roast_title`
4. `roast_line | feedback_item` (live)
5. optional `debug`
6. `done` or `error`

## Internal Stream Architecture

Server modules:
- `orchestrator-sync.ts`: sync execution path
- `orchestrator-stream.ts`: live stream execution path
- `orchestrator-common.ts`: context prep, response shaping, shared error helpers
- `stream-ndjson-parser.ts`: incremental model-stream parser
- `final-normalizer.ts`: canonical final payload normalization/assertion

Model-to-server streaming protocol (internal):

```json
{"type":"title","title":"..."}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done"}
```

Notes:
- Parser accepts NDJSON and concatenated JSON objects split across chunk boundaries.
- Invalid fragments are skipped and counted in debug (`ndjsonInvalidLineCount`).
- Canonical final payload remains server-owned.

## Error Envelope and Codes

```json
{
  "error": {
    "code": "cloudflare_ai_incomplete_output",
    "message": "Cloudflare AI returned incomplete structured output"
  }
}
```

Common codes:
- `invalid_username`
- `github_not_found`
- `github_timeout`
- `github_upstream_error`
- `rate_limited`
- `cloudflare_ai_not_configured`
- `cloudflare_ai_timeout`
- `cloudflare_ai_error`
- `cloudflare_ai_empty_output`
- `cloudflare_ai_unparseable_output`
- `cloudflare_ai_incomplete_output`

Fail-fast guarantees:
- No marker-based textual stream contract.
- If required structure cannot be formed (`title`, `roastLines`, `feedback`), stream ends with typed `error`.
