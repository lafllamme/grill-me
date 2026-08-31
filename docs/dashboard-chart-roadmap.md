# Roast Dashboard Chart Roadmap

## Purpose

This is the source of truth for the roast dashboard's chart work. It keeps the
dashboard purpose, chart order, source links, and porting status in one place
while the API contract remains unchanged.

For the executable implementation checklist, source links, and next-step status, see
[dashboard-chart-checklist.md](./dashboard-chart-checklist.md).

Additional dashboard fields may be mocked during exploration. A chart is not
ready for product use until its data has a clear explanation and its behaviour
has been checked against the Bklit reference in a real browser.

The scoring and evidence pipeline for those fields is documented in
[Dashboard Profile Scoring](./dashboard-profile-scoring.md).

The reusable dashboard composition, model boundaries, and input → GitHub → AI
flow are documented in [Dashboard Architecture](./dashboard-architecture.md).

## Porting rule

The source of truth for component behaviour is:

- [Bklit chart documentation](https://bklit.com/docs/components)
- [Bklit UI GitHub repository](https://github.com/bklit/bklit-ui)

For each selected chart we port only the required composition, but we preserve
the relevant source behaviour: props, geometry, hover states, loading states,
animation timing, tooltips, responsive sizing, and reduced-motion behaviour.

### Mandatory porting protocol

When a chart is requested, do not recreate the visible preview from memory.
First inspect the linked Bklit page and its GitHub source. Follow every import
used by the selected example until the composition is complete, including
context providers, child components, motion utilities, hooks, responsive
measurement, and interaction state. Port the required files and behaviours to
Vue one-to-one before adapting the data or placing the chart in the dashboard.
If a source behaviour is intentionally omitted, document the omission and get
that decision before calling the chart ported.

## Dashboard purpose

The dashboard turns commit analysis into one fast, legible profile read:

1. Verdict — what the agent concluded.
2. Profile — the dimensions behind the conclusion.
3. Evidence — the commits, files, and changes that support it.
4. Detail — the places where the repository needs attention.

The first implementation uses explicit mock fixtures. The API can replace those
fixtures later without changing the chart composition or the information order.

## Dashboard hierarchy

1. Verdict and headline: what the AI concluded.
2. Profile: why the conclusion is believable.
3. Evidence: which commits, files, and changes produced the read.
4. Detail: where the codebase needs attention.

Charts support this hierarchy; they do not replace the roast or introduce
unexplained scores.

## Chart checklist

| Chart | Dashboard role | Data for MVP | Status | Next action |
| --- | --- | --- | --- | --- |
| Ring Chart | Compare profile dimensions | readability, testability, maintainability | Ported and visually checked | Keep as compact profile summary |
| Radar Chart | Show the overall code profile | five normalized profile dimensions, 0–100 | Ported and browser-checked | Keep as the profile anchor; replace fixture values with API data later |
| Bar Chart | Show commit/change volume | additions and deletions per commit | Ported and visually checked | Keep as evidence card |
| Line Chart | Show change or quality trend over time | chronological commits and one or two explicit measures | Planned | Port Bklit source and choose the final metric |
| Composed Chart | Not required; Bar and Line remain separate evidence views | — | Skipped | Keep out of the dashboard scope |
| Gauge | Make one conclusion legible at a glance | commit frequency in the selected analysis window, normalized to 0–100 | Ported and browser-checked | Replace the exploration fixture with API evidence later |
| Sunburst Chart | Explore repository/file hierarchy | repository → directories → files → change volume | Ported and browser-checked | Replace the exploration fixture with API evidence later |
| Choropleth Chart | Optional geographic context | coarse region derived from request metadata | Deferred | Do not make location central to the roast |
| Scatter Chart | Compare two measurable signals | e.g. file churn versus test coverage | Deferred | Add only with a real two-axis question |
| Area Chart | Show a broad trend with emphasis | change volume or cumulative additions over time | Deferred | Compare against Line Chart first |
| Live Line Chart | Represent roast processing in motion | streamed analysis events or staged progress | Deferred | Use only if the stream exposes meaningful stages |
| Pie Chart | Part-to-whole breakdown | language or change-type distribution | Deferred | Ring Chart already covers the stronger use case |
| Funnel Chart | Sequential conversion | not currently relevant to a roast result | Skipped | Reconsider only for product analytics |
| Candlestick Chart | Open/high/low/close time series | no defensible roast data | Skipped | Do not use |
| Sankey Chart | Flow between categories | no defensible roast data | Skipped | Do not use |

## Definition of done per chart

- [ ] Meaning is stated in plain language.
- [ ] Every displayed value maps to a real or explicitly mocked field.
- [ ] Existing API contracts remain unchanged.
- [ ] Required Bklit source files and shared dependencies are identified.
- [ ] Vue props and data shape match the selected Bklit composition.
- [ ] Default, hover, active, loading, empty, and reduced-motion states are checked where relevant.
- [ ] The result is compared visually against the Bklit docs and GitHub implementation.
- [ ] Unit/type checks pass.
- [ ] The chart is committed before moving to the next component.

## Current sequence

1. Ring Chart — complete.
2. Bar Chart — complete.
3. Radar Chart — complete.
4. Line Chart — complete.
5. Gauge — complete as an evidence-backed exploration card.
6. Sunburst Chart — complete as a repository evidence card.
7. Composed Chart — skipped; Bar and Line remain separate evidence views.

## Data guardrails

Prefer a small number of explainable signals:

- human readability
- maintainability
- testability
- change discipline
- abstraction pressure
- documentation coverage
- additions/deletions per commit
- files touched per commit

## Mock profile contract

The dashboard explorer currently uses sixteen explicit mock profiles. Each
profile is selected with previous/next controls and supplies the data for every
chart card, so switching profiles changes the complete dashboard read rather
than only the headline.

The radar profile is intentionally modeled as one series with five category
values, each normalized to `0–100`:

```ts
{
  clarity: number
  safety: number
  workflow: number
  complexity: number
  context: number
}
```

The points are connected into one profile layer. The legend displays the active
profile name and the average of those five values. Low scores remain visually
small because the size is evidence of the score; no decorative second series is
added to fill the radar.

The remaining cards consume the same selected profile contract: ring values
represent profile signals, the gauge represents commit frequency, the timeline
contains commits and additions over time, the bar chart contains additions and
deletions per commit, and the sunburst contains repository folders and file
hotspots. These values are not independently random: workflow shapes commit
frequency and burstiness, safety shapes deletion/churn pressure, clarity and
complexity shape change volume and touched-file spread, and context shapes the
documentation share in the repository anatomy.

The evidence ring intentionally shows both the score and its percentage
equivalent because every profile signal is normalized to a `0–100` scale. Raw
GitHub totals stay in the evidence and frequency cards, where they answer a
different question from the quality scores.

Do not add scores simply because a chart has an empty slot. A metric must be
traceable to GitHub evidence or labelled as an exploration-only mock.

## Profile scoring concept

The visible profile radar currently has four agreed dimensions:

1. **Clarity** — code readability, naming, local structure, and predictable
   patterns.
2. **Safety** — validation, error handling, data boundaries, secure defaults,
   and coverage of critical paths.
3. **Workflow** — commit granularity, message quality, sequencing, and whether
   changes are delivered as understandable units.
4. **Complexity** — nesting, oversized units, dependency spread, cycles,
   duplication, indirection, and change scope.

The fifth dimension is still being explored. **Context** is the current
recommendation because it captures whether a repository communicates intent and
helps a newcomer make the next change safely. It should not become a count of
README files or comments. Candidate labels remain `Context`, `Guidance`, and
`Orientation`; the final choice requires one complete mock profile story.

All visible scores use the same direction: `100` is a strong signal. The score
must be based on explicit evidence and a documented scoring rule; the AI may
explain and roast the result, but must not invent an unsupported number.

The current role-name workshop is tracked separately in
[dashboard-profile-roles.md](./dashboard-profile-roles.md). Role names remain
provisional until each one has a reproducible score/evidence pattern and a
complete mock story.
