# Experience Blueprint

## Purpose

This document defines the intended user experience for `grillme.dev` before additional frontend implementation starts.

The goal is to prevent random UI exploration and align product flow, AI behavior, motion, and module design around one clear system.

## Product Core

`grillme.dev` is not a 3D grill demo and not a chatbot.

It is an AI roast engine with:
- strong brand tone
- playful but technically grounded humiliation
- repeatable entertainment value
- shareable outcomes
- leaderboard and rank mechanics

Primary value:
- users enter a GitHub username
- the system analyzes public evidence
- the user receives a funny, specific roast review
- the user can compare, share, and submit the result

## Experience Priorities

Priority order:
1. understand the world and tone quickly
2. start roasting quickly
3. make the roast result feel alive and premium
4. make sharing and ranking feel valuable
5. keep visual gimmicks secondary

Non-goals:
- terminal-first UI
- 3D-first UI
- generic AI app look
- dashboard-first result presentation

## Main Screens

### 1. Entry Overlay
Purpose:
- gate the experience
- set tension and tone
- act as a theatrical threshold into the product

Current direction:
- black/dark overlay
- warning copy
- clear action choice

Success criteria:
- feels like entering a dangerous but funny place
- does not overstay its welcome
- transitions cleanly into the landing

### 2. Landing / Roast Start
Purpose:
- communicate product promise
- establish humor and world
- focus attention on input and roast action

Must contain:
- strong hero statement
- short explanation
- GitHub username input
- roast intensity control
- primary CTA

Secondary modules may include:
- featured roast / roast of the day
- metrics / system stats
- wall of shame teaser
- trust / social proof

### 3. Loading / Thinking Experience
Purpose:
- prevent dead time
- make the AI process feel active and intentional
- bridge from input into roast reveal

This should be a hybrid model:
- real pipeline steps where useful
- stylized AI-thinking language where helpful

It should not look like raw debug logs.

### 4. Roast Result Experience
Purpose:
- deliver the main product moment
- make the roast feel like a premium AI review reveal

This is the primary screen of the product.

The result should feel like:
- a sharp review
- theatrically revealed
- specific and funny
- grounded in technical evidence

### 5. Share / Submit Layer
Purpose:
- convert fun into retention and virality
- let users share unofficial results
- let verified users submit official runs

Must support:
- 24h share flow
- official leaderboard submit
- re-roast / retry loop

### 6. Leaderboard / Wall of Shame
Purpose:
- make results social
- reward repeat use
- surface notable roasts and rankings

Potential modes:
- official leaderboard
- roast of the day / week / month
- wall of shame highlights
- featured public roast cards

## Result Experience Structure

Chosen direction:
- review-first
- reveal-driven
- scores after text
- grill as supporting flavor only

Recommended stack:
1. reveal transition
2. roast title
3. roast lines revealed progressively
4. feedback block
5. compact score layer
6. actions: share / submit / roast again
7. small grill payoff panel

This is intentionally not:
- giant dashboard first
- giant 3D card first
- metrics before copy

## Loading / Thinking Pattern

Chosen direction:
- hybrid, agent-like, not terminal-like

### Real system steps
These are meaningful pipeline phases already aligned with the backend stream contract:
- fetching GitHub context
- selecting evidence
- building prompt
- calling AI
- parsing output
- finalizing roast

### Experience-facing thinking language
These lines can be partially real and partially staged for effect:
- Thinking...
- Scanning public repos...
- Pulling recent commits...
- Selecting the most suspicious evidence...
- Analyzing bad code...
- Deciding how to explain this politely...
- Writing your roast...
- Calculating emotional damage...

Rule:
- user should never stare at static text for multiple seconds
- motion and copy must imply active intelligence

## AI Visual Language

Target feel:
- assistant-like
- dark, premium, technical
- not generic chatbot chrome
- not raw logs

Visual inspirations to absorb conceptually:
- shimmer text for active thinking
- compact reasoning / steps disclosure
- streamed text reveal
- assistant-style status bars
- collapsible evidence / process views

Do not copy:
- foreign color systems
- generic shadcn defaults
- bright multi-accent AI aesthetics

Use our own system:
- Ember / Basalt / Bone
- final typography system
- dark-first surfaces

## Reference Patterns To Translate Into Vue

The following examples from the current ideation input should be treated as interaction references, not direct visual imports.

### High-priority references
- `TextShimmer`
  - use for `Thinking...` and active reasoning/status language
  - role: premium loading copy, not decorative headline treatment
- `ThinkingBar`
  - use as a compact AI status rail above or inside the loading/result container
  - role: assistant presence without turning the product into a chat app
- `chunk-based text reveal`
  - use for roast title / roast lines / feedback cadence
  - role: avoid dead plops, preserve streamed feeling
- `Reasoning`
  - use as collapsible supporting process view
  - role: show AI process flavor without dumping raw logs
- `Steps`
  - use for hybrid loading phases and optional expandable process trace
  - role: bridge real backend phases and staged agent thoughts

### Medium-priority references
- `ChainOfThought`
  - useful if adapted into a lighter “process trail” component
  - do not expose it as literal chain-of-thought
- `Tool`
  - useful as inspiration for structured status blocks, not for exposing raw tool invocation UI
- `FeedbackBar`
  - useful later for result actions or lightweight response controls

### Rules for translation
- implement in Vue/Nuxt, not React
- keep our token system, not the source palette
- prefer chunk/line reveal over per-word spam when readability matters
- preserve dark, premium AI-review feeling
- avoid literal copied assistant chrome if it distracts from the roast product

## Motion Policy

### Functional motion
Should be implemented first:
- overlay enter / exit
- CTA feedback
- loading to result transition
- roast line reveal
- feedback reveal
- score reveal

### Atmospheric motion
Can support the experience later:
- shimmer
- glow pulses
- subtle smoke / background drift
- gentle stagger

### Editorial motion
Should come later, not first:
- stack cards
- heavy scroll storytelling
- complex pinned sections
- highly choreographed narrative scroll

## 3D Grill Role

The grill is a flavor layer, not the product core.

Allowed role:
- payoff visual
- post-result garnish
- small state-driven module
- optional score-linked detail

Not allowed role:
- primary result view
- main interaction surface
- blocker to shipping the result experience

## Candidate Modules

### Landing modules
- EntryOverlay
- HeroStatement
- HeroInputBeam
- RoastIntensityControl
- TrustOrStatsRail
- FeaturedRoastCard
- WallOfShameTeaser
- FooterCTA

### Loading modules
- ThinkingBar
- StepsRail
- ShimmerStatusText
- ProcessTimeline
- Optional compact evidence counter

### Result modules
- RoastTitle
- RoastReviewStream
- FeedbackList
- VerdictBar
- MetricsCluster
- ShareActions
- SubmitActions
- GrillPayoffCard

### Social modules
- RoastOfTheDay
- WallOfShameList
- LeaderboardTableOrCards
- FeaturedVictimCard
- HistoricalTrendCard

## Data Shaping Recommendations

Current canonical result already contains:
- `title`
- `roastLines`
- `feedback`
- `metrics.spaghettiIndex`
- `metrics.stinkScore`
- `metrics.egoDamage`
- `metrics.grade`
- `metrics.specialTitle`
- `meta.commitCount`
- `meta.prCount`
- `meta.selectedCommitCount`

Recommendations:
- keep current metrics core
- keep `specialTitle`
- consider adding one short `verdictLine` later
- do not introduce too many fake gimmick metrics

Potential additions worth considering:
- `temperature` as a derived roast-style/support metric
- `rankDelta` or comparison to previous official runs later
- `repeatOffender` or trend-style stat later

Potential additions to avoid for now:
- explicit `grillState` in API
- too many novelty fields that do not support result comprehension
- fake numerical scores without future product usage

## AI Persona Direction

Target voice:
- senior maintainer review energy
- technically literate
- funny because it is true
- sharp, witty, and brutal
- evidence-grounded
- not generic meme slang
- not personal abuse

This is not a direct imitation of a public person.
It is a product-defined roast voice with strong maintainer energy.

## Open Decisions

Still to finalize:
- exact result layout hierarchy
- exact loading text inventory
- whether reasoning view is always visible or collapsible
- whether score layer appears during stream or only after roast text
- whether feedback is streamed live or grouped after roast lines

## Pacing notes

- Landing → input: under 5 seconds, no explanation needed.
- The wait is part of the show: campfire scene carries the generation delay.
- Reveal beats: build-up, punchline, then immediate re-roast affordance.
- Note: reveal pacing behaves as expected in latest testing.
- Clarified: scene handoff applies to production builds only.
- Decision: keep wait-state choreography as documented for now.
- Reminder: sync wait-state choreography docs with implementation changes.
- Clarified: input affordance applies to production builds only.
