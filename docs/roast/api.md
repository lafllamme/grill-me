# Roast API (v3.3)

Public endpoint contract for roast generation, share links, auth-gated leaderboard submit, and official board reads.

## Endpoints

- `POST /api/roast`
  - synchronous JSON response (canonical roast payload + signed receipt)
- `POST /api/roast/stream`
  - typed SSE stream (`text/event-stream`, see `stream-contract.md`)
- `POST /api/roast/share`
  - creates a temporary public share link from a valid receipt
- `GET /api/roast/share/:token`
  - resolves one shared roast snapshot (unofficial, read-only)
- `POST /api/leaderboard/submit`
  - official submit, requires verified GitHub session and self-roast check
- `GET /api/leaderboard?window=all|24h&limit=50&search=...`
  - official leaderboard list (only submitted entries)
- `GET /api/leaderboard/:username`
  - official entry detail/history for one username
- `GET /api/auth/session`
  - client UX session helper (`loggedIn`, `user`)
- `POST /api/auth/logout`
  - clears auth session
- `GET /auth/github`
  - GitHub OAuth redirect entrypoint

Source of truth for schemas:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## Request Shape (`/api/roast`, `/api/roast/stream`)

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
  "title": "Do You Ship Bugs Before Coffee Too?",
  "roastLines": ["Line 1", "Line 2"],
  "roast": "Line 1 Line 2",
  "feedback": ["Action 1", "Action 2", "Action 3"],
  "metrics": {
    "spaghettiIndex": 87.4,
    "stinkScore": 88,
    "egoDamage": 84,
    "grade": "D-",
    "specialTitle": "Git Force Enthusiast"
  },
  "meta": {
    "commitCount": 12,
    "prCount": 0,
    "selectedCommitCount": 8
  },
  "receipt": "<signed-hmac-receipt>"
}
```

Canonical final requirements:
- `title` non-empty
- `roastLines` non-empty
- `feedback` non-empty
- `receipt` non-empty

## Share + Submit APIs

`POST /api/roast/share`:

```json
{
  "receipt": "<signed-hmac-receipt>"
}
```

Response:

```json
{
  "token": "share_...",
  "shareUrl": "https://.../share/share_...",
  "expiresAt": "2026-04-27T12:00:00.000Z"
}
```

`POST /api/leaderboard/submit`:

```json
{
  "receipt": "<signed-hmac-receipt>"
}
```

Response:

```json
{
  "ok": true,
  "username": "lafllamme",
  "submittedAt": "2026-04-26T12:00:00.000Z"
}
```

Self-submit rule:
- session GitHub login must match roasted username (`submit only yourself`).

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
- `receipt_secret_missing`
- `receipt_invalid`
- `receipt_invalid_signature`
- `receipt_invalid_payload`
- `receipt_expired`
- `official_submit_not_owner`
- `database_not_configured`
- `leaderboard_schema_missing`

OAuth redirect states (query on `/` after `/auth/github`):
- `auth=github_not_configured`
- `auth=github_session_failed`
- `auth=github_invalid_profile`
- `auth=github_failed`

Related docs:
- `index.md`
- `stream-contract.md`
- `payload-contract.md`
- `architecture.md`
- `database.md`
