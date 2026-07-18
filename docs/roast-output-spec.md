# Roast Output Spec

## Purpose

This document defines the desired roast output shape independently from the current implementation details.

It is the bridge between:
- AI prompt design
- backend contracts
- frontend result choreography
- persistence and later analytics

## Product Principle

The roast should feel like:
- a sharp AI review
- funny and memorable
- technically specific
- structured enough to animate and share

It should not feel like:
- generic internet insults
- random bullet spam
- a dry lint report
- an overlong essay

## Target Result Structure

Chosen structure:
1. `title`
2. `roastLines`
3. `feedback`
4. optional short closing / verdict line in future
5. metrics and actions in UI

### 1. Title
Requirements:
- hook line
- short, punchy, memorable
- evidence-grounded enough to feel earned
- not generic
- question optional, not mandatory

### 2. Roast Lines
Purpose:
- main entertainment payload
- should feel like a sequence of review hits
- each line can target one commit pattern, habit, or repo smell

Guidelines:
- distinct lines, not filler
- specific references when possible
- funny without losing technical clarity
- should feel like a short review flow, not a stack of isolated tweet replies
- do not force every line into a rhetorical-question pattern
- should allow streamed reveal line by line or chunk by chunk

### 3. Feedback
Purpose:
- justify the roast with useful takeaways
- keep repeat usage interesting

Guidelines:
- actionable and concrete
- one sentence each
- less theatrical than roast lines
- still brand-consistent

## Intensity Design

Intensity must change:
- tone
- density
- roast line count
- feedback depth
- callback aggression

It should not only change temperature and evidence budget in the backend.

### Rare
Intent:
- lightly seared
- restrained and deadpan

Target shape:
- 1 title
- 2-3 roast lines
- 2-3 feedback items

Voice:
- light sarcasm
- more understated

### Medium Rare
Intent:
- balanced default
- sharp and funny

Target shape:
- 1 title
- 3-4 roast lines
- 3 feedback items

Voice:
- witty, direct, specific

### Medium
Intent:
- stronger takedown
- more references and heavier phrasing

Target shape:
- 1 title
- 4-5 roast lines
- 3-4 feedback items

Voice:
- harsher and more playful
- stronger callback structure

### Burned To Crisp
Intent:
- max chaos while staying technically grounded

Target shape:
- 1 title
- 5-7 roast lines
- 4 feedback items

Voice:
- most brutal and funniest mode
- more elaborate callback and escalation
- still concise, still policy-safe

## Streaming Behavior

The backend already exposes:
- `meta`
- `status`
- `roast_title`
- `roast_line`
- `feedback_item`
- `debug`
- `done`
- `error`

Frontend behavior direction:
- title appears first
- roast lines stream as the main reveal body
- feedback should be visually grouped after the roast body has started

Chosen direction:
- title first
- roast lines as primary progressive moment
- feedback revealed after at least 2 roast lines have landed
- final metrics and actions after completion

## Prompt Recommendations

Current implementation in [`/Users/flame/Developer/Projects/grill-me/server/roast/prompt-builder.ts`](/Users/flame/Developer/Projects/grill-me/server/roast/prompt-builder.ts) forces:
- `roastLines: 6-10`
- `feedback: 3-5`

This should be revised.

Recommended prompt changes:
- make line counts intensity-specific
- explicitly request stronger comedic variance by intensity
- ask for callback structure at higher intensities
- keep evidence grounding mandatory
- define the roast voice more clearly as maintainership review energy

Recommended persona guidance:
- blunt senior maintainer energy
- technically literate and unimpressed
- funny because of precision
- no generic slang filler
- no personal attacks

## Candidate Additional Fields

### Worth considering
- `verdictLine`
  - short closer line
  - useful for end-cap animation and share cards
- `temperature`
  - thematic and mappable to UI
  - must be meaningful, not random

### Not recommended right now
- `grillState`
  - should remain a UI-derived flavor effect
- too many novelty metrics
  - they reduce clarity and increase persistence noise

## Persistence / Analytics Recommendations

Since this data lands in the database and may power future dashboards, keep fields:
- durable
- analyzable
- useful beyond one UI pass

Good long-term fields:
- roast intensity
- prompt version
- title
- roast lines
- feedback
- metrics
- commit / PR counts
- selected commit count
- eventual verdict line if adopted

Avoid storing throwaway theatrical artifacts unless they become product features.

## Frontend Reveal Recommendations

For the result UI:
- do not dump the full roast at once
- do not reveal only one line and then wait too long
- do not make feedback feel detached from the roast

Recommended rhythm:
- title reveal
- roast lines stream in chunks / lines
- compact pause
- feedback reveal
- metrics reveal
- actions
- optional grill payoff
