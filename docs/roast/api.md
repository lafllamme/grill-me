# Roast API (v5)

This document describes the current roast pipeline and stream contract after the v3 live-stream cutover.

## Endpoints

- `POST /api/roast`
  - sync JSON response
- `POST /api/roast/stream`
  - SSE response (`text/event-stream`)

Source of truth:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## Request

```json
{
  "githubUsername": "lafllamme",
  "debugLevel": "minimal",
  "variationMode": "moderate",
  "roastIntensity": 2
}
```

## Final response (`/api/roast` and stream `done.data`)

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

Canonical requirements:
- `title` required
- `roastLines` required, non-empty
- `feedback` required, non-empty

## Stream events (v3)

Allowed stream events:
- `meta`
- `status`
- `roast_title`
- `roast_line`
- `feedback_item`
- `debug` (optional)
- `done`
- `error`

Interleave rule:
- `roast_line` and `feedback_item` may interleave.
- `done` is final canonical truth.

Typical sequence:
1. `meta`
2. `status*`
3. `roast_title`
4. `roast_line | feedback_item` (live, interleaved)
5. optional `debug`
6. `done`

## Internal model stream contract (server-owned)

For stream mode, the model is instructed to emit NDJSON lines:

```json
{"type":"title","title":"..."}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done"}
```

Important:
- This NDJSON format is internal model-to-server contract.
- Public client contract remains SSE typed events listed above.

## Error behavior

Error envelope:

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

Fail-fast rules:
- No silent fallback to marker parsing for stream events.
- If mandatory structure is missing (`title`, `roastLines`, `feedback`), stream ends with typed error.
