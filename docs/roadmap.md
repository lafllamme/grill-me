# Roadmap

## Goal

Move from current landing + terminal-era prototype toward a premium roast engine experience with:
- strong AI review feeling
- clear result choreography
- durable content system
- leaderboard and social replay loops

## Phase 1: Blueprint and Content System

### 1. Experience Blueprint
Deliverables:
- screen map
- state map
- module inventory
- motion policy

### 2. Roast Output Spec
Deliverables:
- intensity-specific output structure
- roast voice definition
- streaming choreography rules
- additional field recommendations

### 3. Prompt / Contract Revision
Deliverables:
- concrete backend change package
- contract decision on durable intensity data
- parser / stream scope boundaries
- persistence recommendations

### 4. Changelog Discipline
Deliverables:
- running project changelog
- notable decisions captured continuously

## Phase 2: Backend / Prompt First

This should happen before major result UI work.

### 1. Prompt overhaul
Tasks:
- revise roast voice toward sharp maintainer-review energy
- make intensity change output density, not only tone
- improve humor quality
- reduce generic phrasing

### 2. Contract review
Tasks:
- confirm whether existing response shape is sufficient
- decide whether `verdictLine` or `temperature` should be added
- keep database usefulness in mind

### 3. Stream behavior review
Tasks:
- confirm which states are real
- confirm what can be theatrically staged
- decide if feedback streams interleaved or grouped

## Phase 3: Result Experience

This is the highest-value frontend pass.

### 1. Replace terminal output pattern
Tasks:
- remove raw terminal framing from primary result flow
- design AI review container
- implement title + line reveal pattern
- implement grouped feedback reveal

### 2. Loading / thinking experience
Tasks:
- thinking bar
- steps / status rail
- shimmer status text
- hybrid real/staged progress language
- translate referenced AI UI patterns from the planning examples into Vue-native components

### 3. Score / action layer
Tasks:
- compact metrics cluster
- share action
- official submit action
- roast again action

### 4. Grill payoff
Tasks:
- small supporting grill card
- derived from score/intensity if useful
- no large settings panel in primary result flow

## Phase 4: Landing Refinement

Only after result experience is stable.

Tasks:
- align hero with final result promise
- refine input beam and CTA hierarchy
- rework supporting modules around actual product value
- improve wall-of-shame teaser and social proof blocks

## Phase 5: Social and Retention Systems

Tasks:
- roast of the day / week / month
- featured shared roasts
- richer leaderboard cards
- trend or repeat-user ideas if supported by stored data

## Phase 6: Motion and Editorial Polish

Only after the product flow is structurally sound.

Tasks:
- advanced reveal timing
- page-level transitions
- selective scroll choreography
- stack cards only where they support comprehension

## Immediate Recommendation

Start here:
1. prompt + output spec revision
2. loading / thinking experience definition
3. result UI architecture

Do not start here:
- big 3D polish
- deep browse-page styling
- heavy scroll FX
- decorative stack-card systems

## Priority shuffle

- Up: shareable roast cards — biggest organic loop we have.
- Hold: user accounts — no retention story yet that needs them.
- Down: multi-language roasts — quality bar not reachable this quarter.
- Note: seasonal themes behaves as expected in latest testing.
