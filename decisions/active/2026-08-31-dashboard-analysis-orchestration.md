# Centralize dashboard analysis orchestration

- Status: accepted
- Date: 2026-08-31
- Owner: dashboard architecture

## Problem

The Dashboard Explorer page currently mixes route controls, mock selection,
GitHub request state, API response types, live-data transformations, and the
composition of every dashboard card. That makes it difficult to reuse the
dashboard on the landing page and would make a later streamed response require
another page-level rewrite.

The product flow also has three meaningful stages — input, GitHub evidence and
deterministic scoring, then AI review and roast — while the current client only
has one final-response boolean.

## Decision

Use one normalized client-facing `DashboardModel`, one
`useDashboardAnalysis()` composable, and one presentational
`DashboardExplorer.vue` composition root.

- Host pages own controls and route-specific presentation.
- The composable owns the request lifecycle, analysis phase, errors, retry, and
  API-to-model mapping.
- The composition root receives typed model and phase props and renders the
  feature panels.
- Panels receive only the data slice they render.
- The server keeps ownership of GitHub collection, deterministic scores, the
  single combined AI review, and final roast content.
- The current single-response transport remains until the model and UI states
  are stable. A future stream updates the same model through typed events.

The full contract and migration sequence live in
[`docs/dashboard/architecture.md`](../../docs/dashboard/architecture.md).

## Alternatives not chosen

- **Keep orchestration in the page:** fastest short-term change, but blocks
  reuse and couples future streaming to one route.
- **Let each chart fetch its own data:** creates duplicate requests, divergent
  loading states, and a larger Cloudflare/GitHub quota footprint.
- **Put route-local analysis state in Pinia:** adds global lifetime and hidden
  coupling without a current cross-route persistence requirement.
- **Stream before the model boundary is stable:** makes transport behaviour and
  visual behaviour change at the same time, which is harder to verify.

## Consequences

The first refactor changes file ownership more than visible behaviour. Mock and
live data can use the same root component, and the landing page can adopt the
dashboard without copying chart markup. The client can expose honest phases
now and gain progressive rendering later without changing every panel.

The model and composable become shared feature contracts and must be kept
versioned when API fields or score semantics change. Scoring formulas remain in
the profile-scoring documentation and server modules, not in UI code.

## Review condition

Review after Explorer and landing both consume the model. Keep this decision
if only the host shell differs; introduce explicit component variants only if
the two hosts need different information hierarchy.
