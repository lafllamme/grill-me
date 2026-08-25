# Roast Dashboard Chart Roadmap

## Purpose

This is the checklist for the roast dashboard's data visualisations. It keeps the
information hierarchy, the intended roast meaning, and the Bklit porting work in
one place while the API contract remains unchanged.

Additional dashboard fields may be mocked during exploration. A chart is not
ready for product use until its data has a clear explanation and its behaviour
has been checked against the Bklit reference in a real browser.

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
| Radar Chart | Show the overall code profile | six mocked dimensions, normalised 0–100 | In progress | Finish visual comparison and loading state |
| Bar Chart | Show commit/change volume | additions and deletions per commit | Ported and visually checked | Keep as evidence card |
| Line Chart | Show change or quality trend over time | chronological commits and one or two explicit measures | Planned | Port Bklit source and choose the final metric |
| Composed Chart | Combine volume with a trend | bars for changes, line for cumulative or quality signal | Planned | Revisit after Line Chart |
| Gauge | Make one conclusion legible at a glance | one clearly named metric, e.g. testability | Candidate | Use only when the metric has a defensible range |
| Sunburst Chart | Explore repository/file hierarchy | repositories → directories → files → change volume | Candidate | Validate that file-level evidence exists |
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
3. Radar Chart — current.
4. Line Chart — next after Radar is visually signed off.
5. Composed Chart — only after the Line Chart establishes a useful trend.

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

Do not add scores simply because a chart has an empty slot. A metric must be
traceable to GitHub evidence or labelled as an exploration-only mock.
