# Prompt / Contract Revision

## Purpose

This document turns the current roast planning decisions into a concrete backend change package.

It defines:
- what changes in the prompt
- what changes in the shared contract
- what stays out of the contract for now
- how streaming should behave
- what should be persisted for later analytics

This is the implementation bridge between:
- `docs/roast-output-spec.md`
- `server/roast/prompt-builder.ts`
- `shared/roast/contracts.ts`
- the stream orchestrator
- later loading/result frontend work

## Current Problems

The current backend has three structural gaps:

1. intensity affects evidence budget more than output form
- the current profiles already change token budget, temperature, and evidence limits
- they do not strongly change roast line count, feedback count, or comedic escalation

2. the roast voice is too narrow
- current prompt voice is `dry technical GitHub roast assistant`
- this is directionally correct, but too restrained for the intended product
- it does not clearly encode the desired `sharp maintainer review` energy

3. the contract is missing one durable product value
- `roastIntensity` is requested by the client
- but it is not part of the canonical response shape
- that makes later UI, share, leaderboard, and analytics work weaker than necessary

## Recommended Revision Scope

This revision should do four things only:

1. revise roast voice and output instructions
2. make output density intensity-specific
3. add durable intensity data to the canonical response
4. keep stream event types stable for now

This revision should not yet:
- add `temperature` as a canonical API field
- add `grillState` as a stored field
- add extra novelty metrics just for theme
- redesign the final frontend reveal timing in the backend

## Recommended Output Shape

Keep the current product result structure:

1. `title`
2. `roastLines`
3. `feedback`
4. `metrics`
5. `meta`
6. `receipt`

Add:
- `intensity`

### Proposed canonical addition

```json
{
  "intensity": {
    "level": 3,
    "label": "medium"
  }
}
```

Rationale:
- durable and analyzable
- useful in share views
- useful in leaderboard detail views
- useful for result choreography and future dashboards
- avoids leaking full backend tuning values into the public contract

## Explicit Non-Changes

### Do not add `temperature` yet

Reason:
- it is thematically attractive
- but it is not yet clear whether it is a stored product metric or a UI-derived flourish
- adding it now creates migration and presentation obligations too early

Recommendation:
- derive temperature later from intensity + metrics if needed

### Do not add `verdictLine` yet

Reason:
- the desired closer can still be represented as the final roast line
- a dedicated field is only worth adding once the frontend reveal proves it needs a separate semantic slot

Recommendation:
- revisit after the first result-experience pass

### Do not add `grillState`

Reason:
- grill state should stay a presentation mapping
- not a canonical stored roast fact

## Roast Voice Revision

## Current direction

Current prompt framing:
- dry
- technical
- evidence-based

This should evolve into:
- sharp
- funny
- technically literate
- unimpressed
- precise enough that the humor feels earned

## Target voice

The model should sound like:
- a blunt senior maintainer
- technically competent
- witty because it notices real engineering smells
- harsh on code and habits, not on the person

It should not sound like:
- generic insult comedy
- terminal meme spam
- chatty assistant filler
- celebrity impersonation

## Prompt guidance changes

The prompt should explicitly say:
- roast the work, not the person
- make each line feel specific and earned
- prefer technical metaphors over generic slang
- use sharper comedic escalation at higher intensities
- use callbacks at higher intensities when they help
- keep the final output concise enough to reveal elegantly
- avoid turning every line into a rhetorical question
- make the roast body read like one reviewer talking, not unrelated punchlines

## Intensity-Specific Output Targets

These targets should become prompt instructions and validation targets.

### Rare
- title: 1
- roast lines: 2-3
- feedback items: 2-3
- tone: restrained, dry, lightly sarcastic

### Medium Rare
- title: 1
- roast lines: 3-4
- feedback items: 3
- tone: balanced, sharp, funny

### Medium
- title: 1
- roast lines: 4-5
- feedback items: 3-4
- tone: harsher, more playful, more specific callbacks

### Burned To Crisp
- title: 1
- roast lines: 5-7
- feedback items: 4
- tone: most brutal, most memorable, still policy-safe and technically grounded

## Contract Changes

## Shared schema changes

Update `shared/roast/contracts.ts` so the canonical response includes:
- `intensity.level`
- `intensity.label`

Recommended schema:

```ts
const roastResultIntensitySchema = z.object({
  level: z.number().int().min(1).max(4),
  label: z.enum(['rare', 'medium_rare', 'medium', 'burned_to_crisp']),
})
```

Add this field to:
- `roastResponseSchema`
- `roastPublicResultSchema`
- stream `done.data`

## Stream event changes

Keep the current public stream events:
- `meta`
- `status`
- `roast_title`
- `roast_line`
- `feedback_item`
- `debug`
- `done`
- `error`

Do not add new event types in this pass.

Reason:
- frontend choreography can already be improved without expanding the wire contract
- changing event shapes now adds unnecessary moving parts

## Status event strategy

Keep existing machine phases:
- `fetching_github`
- `selecting_evidence`
- `building_prompt`
- `calling_ai`
- `parsing_output`
- `finalizing`

Frontend can later map these into:
- premium assistant-facing labels
- staged thought lines
- shimmer / step UI

This keeps the backend honest while allowing the UI to feel more agentic.

## Prompt Builder Changes

## Required changes in `server/roast/prompt-builder.ts`

1. replace the fixed sync output instruction
- remove the hardcoded `roastLines: array of 6-10`
- remove the hardcoded `feedback: array of 3-5`
- inject intensity-specific count targets

2. revise the persona language
- move away from only `dry technical`
- encode `sharp maintainer review energy`

3. increase output-form specificity
- explicitly instruct a hybrid output:
  - hook title
  - sequence of roast lines
  - concrete feedback items

4. increase intensity differentiation
- higher intensity should explicitly allow:
  - more lines
  - stronger callbacks
  - bolder metaphors
  - harsher phrasing

## Suggested helper extraction

Create small helpers for:
- intensity-specific output ranges
- intensity-specific phrasing rules
- shared persona block

This keeps prompt instructions readable and versionable.

## Parser and Validation Changes

## Parser behavior

The parser should remain JSON-first.

That is correct and should not change.

## Validation additions

Add lightweight normalization and validation so the final canonical payload respects:
- per-intensity roast line count targets
- per-intensity feedback count targets

This does not need to hard-fail immediately if the model is close.

Recommended behavior:
- clamp extra items down to max target
- allow small underflow fallback rather than failing the whole roast
- still fail when output is structurally unusable

## Suggested limits update

Review `ROAST_LIMITS` and split global limits from structure targets.

Example direction:
- keep `maxRoastWords`
- keep `maxStreamChunkChars`
- replace global feedback min/max with per-intensity target helpers

## Streaming Recommendation

Backend recommendation:
- continue emitting `roast_line` and `feedback_item` as soon as they are parsed

Frontend recommendation:
- group feedback visually after the roast body has started
- do not require backend gating for that first UX pass

Reason:
- preserves existing stream simplicity
- keeps frontend free to orchestrate timing later
- avoids mixing presentational timing with transport semantics too early

## Persistence and Analytics

The following values should be treated as durable:
- username
- title
- roast lines
- feedback
- metrics
- prompt version
- intensity level
- intensity label
- commit count
- PR count
- selected commit count

The following should remain derived or optional for now:
- temperature
- grill state
- theatrical thought lines

## Suggested Implementation Order

1. add this contract decision to shared schemas
2. revise prompt-builder output instructions
3. revise parser/normalizer to respect intensity targets
4. keep stream event types stable
5. update roast docs to match
6. only then build the new loading/result UI

## Files Expected To Change In The Next Implementation Step

- `shared/roast/contracts.ts`
- `shared/roast/intensity.ts`
- `server/roast/prompt-builder.ts`
- `server/roast/output-parser.ts`
- `server/roast/final-normalizer.ts`
- `server/roast/orchestrator-sync.ts`
- `server/roast/orchestrator-stream.ts`
- `docs/roast/payload-contract.md`
- `docs/roast/api.md`

## Acceptance Criteria

This revision is correct when:
- intensity visibly changes output length and aggression
- the roast voice feels sharper and funnier without becoming generic
- canonical responses include durable intensity data
- stream event types stay stable
- frontend can later stage feedback timing without another backend redesign
