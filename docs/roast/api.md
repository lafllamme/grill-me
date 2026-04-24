# Roast API (v3.2)

Public endpoint contract for roast generation.

## Endpoints

- `POST /api/roast`
  - synchronous JSON response (canonical roast payload)
- `POST /api/roast/stream`
  - typed SSE stream (`text/event-stream`, see `stream-contract.md`)

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

Used by sync endpoint and by `done.data` in stream:

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

Related docs:
- `index.md`
- `stream-contract.md`
- `payload-contract.md`
- `architecture.md`

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
