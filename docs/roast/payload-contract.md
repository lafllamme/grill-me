# Roast Payload Contract (v3.4)

Payload-first contract for request/response, stream events, receipt handoff, share/submit flow, and persistence semantics.

Schema source:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## 1) Client -> Roast Request

```json
{
  "githubUsername": "lafllamme",
  "debugLevel": "full",
  "variationMode": "moderate",
  "roastIntensity": 4
}
```

## 2) Canonical Roast Output (`/api/roast` and `done.data`)

```json
{
  "username": "lafllamme",
  "title": "Do You Ship Bugs Before Coffee Too?",
  "roastLines": ["..."],
  "roast": "...",
  "feedback": ["..."],
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

Notes:
- `done.data` is the canonical stream final state.
- `receipt` is server-owned and required for `share` and `official submit`.
- `roastIntensity` stays numeric (`1..4`); debug profile labels map to `rare`, `medium_rare`, `medium`, `burned_to_crisp`.

## 3) Public Stream Event Shapes

```json
{"type":"meta","requestId":"a28ccb80","username":"lafllamme"}
{"type":"status","phase":"calling_ai","message":"Calling Cloudflare Workers AI..."}
{"type":"roast_title","title":"..."}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"debug","debug":{"username":"lafllamme","requests":[],"timingsMs":{}}}
{"type":"done","data":{"username":"lafllamme","title":"...","roastLines":["..."],"roast":"...","feedback":["..."],"metrics":{"spaghettiIndex":87.4,"stinkScore":88,"egoDamage":84,"grade":"D-","specialTitle":"Git Force Enthusiast"},"meta":{"commitCount":12,"prCount":0,"selectedCommitCount":8},"receipt":"<signed-hmac-receipt>"}}
```

Interleave rule:
- `roast_line` and `feedback_item` may interleave.

## 4) AI Prompt Payload (server -> model)

```json
{
  "username": "lafllamme",
  "commits": [
    {
      "repo": "lafllamme/grill-me",
      "sha": "fd791ad",
      "message": "feat: improve content box for roast",
      "additions": 39,
      "deletions": 20,
      "changedFiles": 2,
      "files": [
        {
          "filename": "app/components/RoastCard.vue",
          "status": "modified",
          "additions": 16,
          "deletions": 18,
          "patch": "@@ ..."
        }
      ]
    }
  ],
  "prs": []
}
```

## 5) Share and Submit Contracts

### `POST /api/roast/share`

Request:

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

### `GET /api/roast/share/:token`

Response:

```json
{
  "token": "share_...",
  "expiresAt": "2026-04-27T12:00:00.000Z",
  "data": {
    "username": "lafllamme",
    "title": "...",
    "roastLines": ["..."],
    "roast": "...",
    "feedback": ["..."],
    "meta": {
      "commitCount": 12,
      "prCount": 0,
      "selectedCommitCount": 8
    },
    "metrics": {
      "spaghettiIndex": 87.4,
      "stinkScore": 88,
      "egoDamage": 84,
      "grade": "D-",
      "specialTitle": "Git Force Enthusiast"
    }
  }
}
```

### `POST /api/leaderboard/submit`

Request:

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

## 6) End-to-End Payload Sequence

1. Roast completes -> canonical payload includes `receipt`.
2. Client calls `/api/roast/share` with that `receipt`.
3. Server verifies receipt, persists run data, issues `share` token + URL.
4. Browser opens `/share/:token`, frontend calls `/api/roast/share/:token`.
5. API returns unofficial snapshot payload from persisted run data.
6. For official board, client calls `/api/leaderboard/submit` with same receipt.
7. Server enforces self-ownership (`session.login === receipt.username`) and upserts official entry.

## 7) Persistence Rules

- Roast without login: no automatic persistence by default.
- Share: receipt-backed persistence + `roast_shares` token with TTL.
- Official submit: receipt-backed persistence + official projection upsert.

## 8) Candidate vs Selected Commit Semantics

- `meta.commitCount`: enriched/candidate commit pool size.
- `meta.selectedCommitCount`: commits selected into final prompt evidence.
- `debug.selectionSummary.configuredMaxCommitRefs`: candidate cap.
- `debug.selectionSummary.configuredMaxSelectedCommits`: selected cap.
