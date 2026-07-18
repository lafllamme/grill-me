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

Finalization rule:
- server streams valid partial events immediately
- server then derives canonical `done.data` from incremental parser state, with raw-text fallback when the streamed structure is incomplete
- `error` is emitted only when canonical finalization fails after both passes

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
- `intensity`
- `title`
- `roastLines`
- `feedback`
- `metrics`
- `receipt`

Missing required structure triggers typed `error` (`cloudflare_ai_incomplete_output`) only when neither streamed structure nor raw-text fallback can produce a canonical final payload.

## Title Contract (Primary Source)

`done.data.title` (and streamed `roast_title`) follows:
- short hook line
- target length 6-12 words
- spicy-clean tone
- evidence-grounded, non-generic wording
- question optional, not mandatory
- intensity-aware tone ramp (`rare` -> `medium_rare` -> `medium` -> `burned_to_crisp`)

Server applies title normalization before final canonical output.

## Internal Model Shape (Reference)

Model emits one JSON object and the server parses it progressively as text arrives:

```json
{
  "title": "...",
  "roastLines": ["..."],
  "feedback": ["..."]
}
```

Notes:
- public contract is still typed SSE
- internal parser extracts completed `title`, `roastLines[*]`, and `feedback[*]` values incrementally from the growing JSON text
- final canonicalization may merge progressive parser state with raw-text fallback parsing before emitting `done`

## Chunk semantics

- Chunks are UTF-8 text deltas; client must not assume word boundaries.
- A `done` event follows successful canonical finalization.
- Errors mid-stream emit an `error` event; partial output stays rendered.
