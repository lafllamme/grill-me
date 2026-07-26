# Grillme Result Experience: Design Exploration Brief

Use this document as the complete input for a new design exploration. Do not begin by polishing the current component. First reconsider the information architecture and propose materially different ways to present the same live product output.

## Your role

Act as a senior product designer and frontend design architect. Your task is to explore a better result experience for Grillme, an AI-assisted GitHub roast application.

The output should feel editorial, modern, elegant, calm, and technically credible. Avoid generic AI-dashboard styling, chat clones, card walls, gratuitous pills, and decorative metrics that consume more space than the evidence itself.

## Product context

The user enters a public GitHub username and selects a roast intensity. Grillme then:

1. fetches public GitHub activity;
2. enriches recent commits with file-level evidence;
3. selects roast-worthy changes;
4. sends a compact evidence payload to an AI model;
5. streams observable progress, evidence, title, roast lines, and feedback to the browser;
6. returns final scores, a grade, and a signed result receipt.

The experience is not a general-purpose chat. It is a focused investigation followed by a verdict. The product value is the combination of entertainment, real code evidence, and useful technical feedback.

## Scope of this exploration

Redesign the **live roast result area** only. You may change its composition, hierarchy, grouping, labels, responsive behavior, and reveal choreography.

Do not redesign the entire homepage, backend contract, input stage, or selected brand palette. The existing reasoning/analysis component is liked and should remain part of the real-world flow, although its placement relative to the result may be reconsidered.

Current implementation references:

- `app/components/rebrand/RebrandLiveRoastStage.vue`
- `app/components/rebrand/RebrandReasoning.vue`
- `app/components/rebrand/RebrandProcessTrail.vue`
- `app/composables/useRoastReasoning.ts`
- `app/pages/index.vue`
- `shared/roast/contracts.ts`

## Implementation environment

If you create an interactive prototype in this repository, work within the existing stack:

- Nuxt 4
- Vue 3 Composition API
- TypeScript
- UnoCSS utilities
- existing project fonts and color tokens

Do not install a React AI component library merely because it inspired the interaction. Translate useful patterns into native Vue components. Do not add standalone component CSS when UnoCSS can express the design. Visible UnoCSS borders require an explicit width, color, and `border-solid`.

The selected direction is now the production homepage at `/`. Alternative explorations must not silently change its tokens or public roast contracts.

## Current design and concrete criticism

The current direction is a focused bento with:

- a full-width reasoning rail;
- a large `Verdict + Grade` module;
- a separate numerical evidence module;
- a wide `Roast points + Useful damage` module.

It is acceptable as a first direction, but it is not the final answer.

The concrete problems are:

1. **The headline is too large.** It dominates the composition, wraps aggressively, and forces unnecessary scrolling.
2. **The numerical section consumes too much space.** Grade, stink score, commit count, and file count are useful, but they should not visually outweigh the actual roast and evidence.
3. **The analyzed commits are too small.** The real source material is reduced to tiny tags even though evidence is one of the product's strongest differentiators.
4. **The content labels are confusing.** Labels such as `The verdict`, `Evidence at a glance`, `Roast points`, `Useful damage`, `Live`, and `Filed` create too many competing semantic layers and do not form one clear reading order.
5. **The composition still feels like content placed into arbitrary cards.** It needs a stronger editorial system and a more deliberate relationship between verdict, evidence, and actionable feedback.
6. **The first result viewport should communicate the important outcome faster.** Users should not need to scroll through oversized typography before understanding the grade, verdict, inspected commits, and key findings.

Do not solve these issues by simply shrinking every element. Reconsider hierarchy and information grouping.

## Desired first-glance hierarchy

Within the first desktop viewport of the result stage, the user should be able to understand most of the following:

- who was analyzed;
- whether analysis is still running or complete;
- the verdict title;
- the final grade when available;
- a compact sense of severity or score;
- which commits or repositories were inspected;
- the first important roast finding;
- that useful technical feedback exists.

Not every roast line or feedback item must fit above the fold. The overview and strongest evidence must.

## Brand and visual language

### Direction

Grillme should feel like a calm, dark analysis chamber in which Signal Red builds pressure and the roast becomes the loudest event.

The design language is:

- editorial rather than dashboard-like;
- dark and atmospheric, but not cyberpunk;
- rounded at macro scale, not pill-heavy;
- sparse and composed rather than densely decorated;
- glassy only where the surface has enough opacity and visual mass;
- animated in the live center while surrounding framing remains calm.

### Selected palette

Use the existing Signal Red exploration palette. Do not introduce purple, magenta, blue AI gradients, orange, or parallel accent systems.

```text
Primary ink           #080708
Soft ink              #100B0D
Panel                 rgba(18, 12, 14, 0.72)
Panel high            rgba(32, 17, 21, 0.86)
Subtle border         rgba(255, 235, 239, 0.12)
Elevated border       rgba(255, 235, 239, 0.20)
Warm copy             #F8EEEE
Muted copy            #C5B2B4
Signal Red 900        #7E1D26
Signal Red 700        #B91F2B
Signal Red 500        #F0444D
Signal glow           rgba(217, 45, 54, 0.34)
```

Signal Red is pressure and state, not wallpaper. Most readable areas should remain warm-black, graphite, and warm off-white.

### Typography roles

Do not introduce another font family.

- Display/headlines: Bricolage Grotesque
- Body/copy: General Sans
- Metadata/code/system strings: Azeret Mono
- Editorial quotes or carefully selected accents: Zodiak Italic

Use extreme display sizing selectively. The roast title must be prominent but should not consume the entire result viewport.

### Geometry

Working radius hierarchy:

- macro shell: `32-48px`
- module: `20-28px`
- control: `12-16px`
- pill: only for actions, real statuses, or compact selectors

Do not put every payload field into its own rounded card.

### Background behavior

The animated Signal Red Prism background belongs primarily to the opening hero and target stage. The result lives in a mostly black content chapter. Transitions use masks, black fades, and broad off-canvas red blurs instead of a hard colored rectangle.

The result design must remain readable without relying on the animated background behind every surface.

### Visual references

Use these references to understand composition, atmosphere, containment, and transitions. Do not clone their content or branding.

- [Reform Studio](https://reformstudio.framer.website/): highest-priority reference for editorial scale, rounded macro-surfaces, and composed negative space.
- [Jayden Portfolio](https://jayden-portfolio.framer.website/): colored atmosphere fading into black chapters without a hard rectangular cut.
- [Powder](https://powder.framer.website/): restrained dark product framing and nested border hierarchy.
- [Fusion AI](https://fusionai.framer.website/): animated/colorful opening atmosphere transitioning into a stable black content canvas.
- [Nubien](https://nubien.framer.website/): calm rounded composition and sparse dark surfaces.
- [Paymark](https://paymark.framer.website/): modern macro-containment and product-led hierarchy.
- [eBay Playbook Combobox](https://playbook.ebay.com/design-system/components/combobox/?tab=design): useful reference for mature soft geometry and control ergonomics, not for overall brand styling.

The recurring pattern to extract is: atmosphere first, a small number of large structural surfaces second, and one dominant product story rather than many equal cards.

## Actual request payload

The browser starts a roast with this shape:

```json
{
  "githubUsername": "lafllamme",
  "roastIntensity": 2,
  "variationMode": "moderate",
  "includeDebug": false,
  "debugLevel": "minimal",
  "stream": true
}
```

Relevant constraints:

- `githubUsername`: public GitHub username
- `roastIntensity`: integer from `1` to `4`
- intensity labels: `rare`, `medium_rare`, `medium`, `burned_to_crisp`
- the result can contain up to 7 roast lines and 4 feedback items
- evidence selection can include several commits, files, repositories, and pull requests

## Actual streaming contract

The transport is NDJSON. Each complete line is an independent JSON event. Events arrive progressively and must become visible without waiting for the final result.

The event union is:

```ts
type RoastStreamEvent =
  | { type: 'meta'; requestId: string; username: string }
  | { type: 'status'; phase: RoastPhase; message: string }
  | { type: 'evidence'; commits: CommitEvidence[]; prs: PullRequestEvidence[] }
  | { type: 'roast_title'; title: string }
  | { type: 'roast_line'; index: number; text: string }
  | { type: 'feedback_item'; index: number; text: string }
  | { type: 'debug'; debug: DebugPayload }
  | { type: 'done'; data: RoastResponse }
  | { type: 'error'; error: { code: string; message: string } }
```

Observable status phases:

```text
fetching_github
selecting_evidence
building_prompt
calling_ai
parsing_output
finalizing
```

Typical chronological sequence:

```text
meta
status: fetching_github
status: selecting_evidence
status: building_prompt
evidence
status: calling_ai
status: parsing_output
roast_title
roast_line 0
roast_line 1
...
feedback_item 0
feedback_item 1
...
status: finalizing
done
```

The exact spacing and number of events can vary. The design must not depend on fake percentages or fixed durations.

### Important availability rule

Design around when data actually exists:

- username and intensity are known before streaming begins;
- progress statuses arrive during investigation;
- selected commits, repositories, files, and pull requests arrive in the `evidence` event before the completed roast;
- title, roast lines, and feedback items then arrive progressively;
- final `grade`, scores, metadata, and receipt arrive only in the `done` event;
- an error may occur before the final event, while already received content should remain understandable.

Do not design a static final-state dashboard and treat streaming as an afterthought.

## Evidence payload available to the UI

```ts
type CommitEvidence = {
  repo: string
  sha: string
  message: string
  additions: number
  deletions: number
  changedFiles: number
  files: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
  }>
}

type PullRequestEvidence = {
  repo: string
  title: string
  url: string
  state: string
}
```

Realistic example:

```json
{
  "type": "evidence",
  "commits": [
    {
      "repo": "lafllamme/grill-me",
      "sha": "1c83407",
      "message": "feat: add evidence-aware roast reasoning preview",
      "additions": 522,
      "deletions": 101,
      "changedFiles": 11,
      "files": [
        {
          "filename": "app/components/rebrand/RebrandLiveRoastStage.vue",
          "status": "modified",
          "additions": 17,
          "deletions": 83
        },
        {
          "filename": "app/components/rebrand/RebrandReasoning.vue",
          "status": "added",
          "additions": 85,
          "deletions": 0
        },
        {
          "filename": "app/composables/useRoastReasoning.ts",
          "status": "added",
          "additions": 98,
          "deletions": 0
        }
      ]
    }
  ],
  "prs": []
}
```

Evidence is not secondary metadata. It proves that the roast is grounded in real public code. Commit messages, repository names, SHAs, file paths, change volume, and file status deserve more visual presence than tiny chips.

## Final response payload

```ts
type RoastResponse = {
  username: string
  intensity: {
    level: 1 | 2 | 3 | 4
    label: 'rare' | 'medium_rare' | 'medium' | 'burned_to_crisp'
  }
  title: string
  roastLines: string[]
  roast: string
  feedback: string[]
  meta: {
    commitCount: number
    prCount: number
    selectedCommitCount?: number
  }
  metrics: {
    spaghettiIndex: number
    stinkScore: number
    egoDamage: number
    grade: 'F-' | 'F' | 'D-' | 'D' | 'C-' | 'C' | 'B' | 'A'
    specialTitle: string
  }
  receipt: string
  debug?: DebugPayload
}
```

Realistic final example:

```json
{
  "username": "lafllamme",
  "intensity": {
    "level": 2,
    "label": "medium_rare"
  },
  "title": "Abstraction Witness Protection",
  "roastLines": [
    "You did not remove complexity. You gave it aliases and hoped nobody would check the imports.",
    "That helper wraps a one-line API so thoroughly it now needs onboarding documentation.",
    "Your component tree has the confidence of an architecture diagram and the boundaries of spilled soup.",
    "The naming is immaculate, which is useful because the behavior certainly is not."
  ],
  "roast": "Abstraction Witness Protection ...",
  "feedback": [
    "Delete pass-through wrappers that do not own state, policy, or transformation.",
    "Move repeated request-state handling into one typed composable with an explicit contract.",
    "Add one behavior-level test before the next abstraction gets a factory."
  ],
  "meta": {
    "commitCount": 12,
    "prCount": 1,
    "selectedCommitCount": 6
  },
  "metrics": {
    "spaghettiIndex": 71,
    "stinkScore": 78,
    "egoDamage": 84,
    "grade": "C-",
    "specialTitle": "Abstraction Witness Protection"
  },
  "receipt": "signed-result-receipt-value"
}
```

Notes:

- `roast` is a compatibility aggregate of the result; the UI should normally use `title` and `roastLines`.
- `receipt` is an internal capability for sharing and leaderboard submission. Do not present the raw token.
- `debug` is developer information and not part of the consumer-facing result design.
- `specialTitle` may overlap semantically with the roast title. Do not show both merely because both exist; propose a clear role or omit one from the primary hierarchy.
- Do not give all three scores equal visual dominance by default. Decide whether one score, the grade, or a compact combined signature best supports comprehension.

## Reasoning component already established

The reasoning experience is based on observable workflow phases, not hidden model chain-of-thought. It currently:

- opens while the roast is running;
- displays paced GitHub, selection, prompt, AI, parsing, and finalization phases;
- can show repositories, commits, and files associated with relevant phases;
- uses Signal Red shimmer only for active readable text;
- records elapsed thinking time and stops when the result begins;
- collapses after result content arrives but remains available for inspection.

This interaction direction is liked. Preserve its credibility and restraint. You may propose whether it should remain above the result, become a compact rail, move beside the result, or collapse into a receipt-like summary.

Do not expose or fabricate private model reasoning.

## Interaction and animation requirements

The presentation must work as a progressive live composition:

1. the result region establishes a stable frame without a large empty card;
2. reasoning and evidence arrive first;
3. the title appears when streamed;
4. roast lines enter one by one;
5. feedback follows progressively;
6. grade and scores settle in only when `done` arrives;
7. the layout should not jump aggressively when final metrics appear;
8. auto-follow should stop fighting the user if they scroll away;
9. `prefers-reduced-motion` must reveal content without typewriter or transform-heavy motion.

Use motion to clarify arrival and hierarchy, not to delay already available data.

## Responsive expectations

### Desktop

Optimize the principal composition for approximately `1440 × 900` and wider editorial layouts. The initial result viewport should show a useful overview rather than one enormous headline or a mostly empty score module.

### Mobile

Do not simply stack every desktop card into a long feed. Establish a deliberate mobile reading order. Commit evidence must remain readable, scores must become compact, and progressive arrivals must not cause excessive layout shift.

## Explicit non-goals

- no generic chatbot transcript;
- no terminal window as the primary result metaphor;
- no wall of equally weighted cards;
- no card for every metric, file, or feedback item;
- no giant grade tile consuming a third of the layout;
- no tiny commit chips that hide meaningful evidence;
- no repeated eyebrow labels for every block;
- no purple AI gradients;
- no red-on-black cyberpunk overload;
- no fake percentage progress;
- no fabricated chain-of-thought;
- no backend or payload redesign as a shortcut around the UI problem.

## Your assignment

Develop **three genuinely different result-system directions**. They must differ in information architecture, not only border radius, card color, or alignment.

For each direction, provide:

1. a short concept name and one-sentence thesis;
2. the reading order during streaming;
3. the desktop information architecture;
4. the mobile information architecture;
5. the role and placement of reasoning;
6. how commit and file evidence receives meaningful visual weight;
7. how grade and metrics remain compact but legible;
8. how title, roast lines, and feedback progressively enter;
9. the exact labels you would use, including labels you would remove;
10. risks and trade-offs;
11. a concrete high-fidelity visual proposal or implementable prototype, not only prose.

At least one direction should avoid a conventional outer card entirely and treat the black page as the result canvas. At least one direction should use a strong editorial split or evidence-led composition. The third direction may explore a compact dossier, report, timeline, or another defensible metaphor.

After presenting all three directions:

- compare them against scanability, evidence visibility, streaming stability, scroll cost, brand fit, and mobile behavior;
- recommend one direction;
- explain what should be validated in an interactive prototype before production implementation;
- do not silently choose the existing focused bento as the answer.

The goal is not to make the current card prettier. The goal is to discover a coherent result design system for a live, evidence-backed AI roast.
