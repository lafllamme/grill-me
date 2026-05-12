# Roast Stream Contract (v3.2)

Public typed SSE contract for `POST /api/roast/stream`.

Schema source:
- `/Users/flame/Developer/Projects/grill-me/shared/roast/contracts.ts`

## Public Stream Events

Stable event types:
- `meta`
- `status`
- `roast_title`
- `roast_line`
- `feedback_item`
- `debug` (optional)
- `done`
- `error`

## Event Semantics

- `meta`: request envelope start (`requestId`, `username`).
- `status`: pipeline phase updates (0..n).
- `roast_title`: progressive title event.
- `roast_line`: indexed roast body line.
- `feedback_item`: indexed feedback line.
- `done`: canonical final truth with full `done.data`.
- `error`: typed failure envelope with `code` + `message`.

## Ordering and Interleave

Expected sequence:
1. `meta`
2. `status*`
3. `roast_title`
4. `roast_line | feedback_item` (interleaved allowed)
5. optional `debug`
6. `done` or `error`

Rules:
- `roast_line` and `feedback_item` may interleave freely.
- `done.data` is canonical over partial stream events.
- Server may emit a final corrective `roast_title` when canonical title differs from an earlier streamed title.

## Canonical `done.data`

Required fields:
- `title`
- `roastLines`
- `feedback`
- `metrics`
- `receipt`

Missing required structure triggers typed `error` (`cloudflare_ai_incomplete_output`).

## Title Contract (Primary Source)

`done.data.title` (and streamed `roast_title`) follows:
- question-first hook (`?`)
- target length 6-12 words
- spicy-clean tone
- evidence-grounded, non-generic wording
- intensity-aware tone ramp (`rare` -> `medium_rare` -> `medium` -> `burned_to_crisp`)

Server applies title normalization before final canonical output.

## Internal Model Envelope (Reference)

Model emits NDJSON-like objects that server parses incrementally:

```json
{"type":"title","title":"..."}
{"type":"roast_line","index":0,"text":"..."}
{"type":"feedback_item","index":0,"text":"..."}
{"type":"done"}
```

This envelope is internal; public contract remains typed SSE above.
