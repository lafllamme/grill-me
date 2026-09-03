# Changelog

## 2026-09-03

### Dashboard evidence window
- made dashboard collection merge-aware before detail enrichment so integration
  commits cannot consume the personal evidence budget
- added deterministic authored-reference ordering with one recent ref per
  repository before recency fill
- added bounded fallback to up to two discovered owned repositories and one
  additional history page per active repository, while keeping detail calls
  capped at 18
- added an internal sampling ledger for candidate refs, skipped integrations,
  personal refs, detailed commits, usable patches, and backfilled evidence;
  public dashboard contracts remain unchanged
- added a Markdown trace checker and tests for lifecycle order, sampling
  fields, and optional AI provider events

### Dashboard scoring guardrails
- added typed Safety risk scopes so test, docs, generated, and unknown paths
  remain context instead of becoming production penalties
- added a 70% AI confidence gate and exact filename grounding for Safety risk
  deductions; low-confidence or speculative findings cannot lower the score
- prioritized dominant-axis roles before the generic Human Compiler label and
  reserved Ungrillable for profiles scoring at least 80 on every axis
- recalibrated Complexity so scope and outliers carry the signal, deletion churn
  stays a weak pressure indicator, and bounded samples cannot score as perfect
- recalibrated Context to weight direct patch explanations and commit intent
  above repository metadata and handoff proxies
- tightened Safety risk deductions so a commit-level AI claim without an exact
  changed filename cannot lower the score

## 2026-09-02

### Dashboard documentation
- moved dashboard scoring implementation behind category, AI-review,
  patch-selection, shared, and role modules under `server/roast/dashboard/`
  while preserving the flat import facades and all public contracts
- added code-folder READMEs and calibration/category indexes so formulas,
  ownership, evidence limits, and historical probes have one navigable home
- consolidated the dashboard architecture, scoring, AI review, chart contract,
  testing rules, roles, and calibration history under docs/dashboard/
- split category formulas into focused documents so each scoring axis has one
  owner, one evidence gate, and one validation record
- kept legacy dashboard documentation paths as compatibility links
- added document version/status metadata and a required validation checklist
- replaced Context v1's workflow-heavy formula with Context v2 signals based on
  visible explanations, orientation artifacts, commit rationale, repository
  orientation, and weak handoff evidence
- recalibrated Context as v3 around a neutral 60 midpoint once evidence is
  sufficient, strengthened concrete commit-context signals, and reduced the
  overlapping handoff weight so missing public context is not treated as bad
  work
- calibrated Context v4 so actual patch explanations and commit context drive
  70% of the score movement, while root metadata and handoff signals together
  contribute only 10%
- replaced Safety v1's indirect test/PR rewards with Safety v2's patch-centred
  formula; validation and CI remain weak corroborators, while only grounded AI
  findings for introduced risks can subtract points
- calibrated Safety v3 around added patch lines and a patch-coverage multiplier;
  the deterministic layer uses the bounded personal sample while the AI review
  selects latest, typical-sized, and Safety-relevant patches within the same
  payload budget
- raised the Safety v3 patch-backed baseline from 60 to 70 so a visible sample
  without a confirmed introduced risk is not presented as a mediocre result;
  insufficient evidence remains 50 and all risk penalties stay unchanged
- replaced Safety v3.1's flat patch-backed interpretation with Safety v4's
  safety-surface model; defensive coverage now drives the observed score,
  normal non-safety patches remain neutral at 70, and the combined AI review
  may add only a server-verified defense lift of up to eight points
- recorded the Safety v4 positive/neutral/negative boundary run; controlled
  probes now demonstrate the range from insufficient 50 through neutral 70 and
  capped positive 95 down to confirmed critical-risk 20
- calibrated Clarity v4 with an evidence ceiling: thin samples cap at 90 and
  broad patch-backed samples cap at 95, while the existing signal weights and
  grounded AI adjustment remain unchanged
- recalibrated Context v5 around a neutral 70 for sufficient samples; generic
  or empty commit subjects now count as direct negative context evidence, while
  missing documentation, comments, PRs, or patch text remain neutral

## 2026-05-14

### Color system
- consolidated the production color system around `Ember / Basalt / Bone`
- introduced semantic surface/content/accent tokens in UnoCSS
- documented the final color system and usage rules
- tightened CTA accessibility behavior for orange fills

### Typography
- final font system remains:
  - `Bricolage Grotesque`
  - `General Sans`
  - `Azeret Mono`
  - `Zodiak`
- `/test` was kept as the proving ground for system validation

### Accessibility
- verified key dark-surface text pairs
- corrected the main `light text on Ember 500` problem by revising usage patterns
- established current CTA guidance:
  - lighter orange backgrounds need careful contrast validation
  - darker Ember steps are preferred for text-bearing buttons with light text

### Product direction
- confirmed the product is a roast engine, not a 3D demo or generic chatbot
- confirmed the result screen should be review-first and reveal-driven
- confirmed the grill is a secondary flavor element only
- confirmed the loading moment should feel hybrid and agent-like, not terminal-like

### Planning docs added
- `docs/experience-blueprint.md`
- `docs/roast-output-spec.md`
- `docs/prompt-contract-revision.md`
- `docs/roadmap.md`
- `docs/changelog.md`

### Current strategic decisions
- result format should be hybrid:
  - title
  - multiple roast lines
  - feedback
  - optional closer/verdict later
- intensity should change both tone and output density
- canonical roast results should gain durable intensity data before the next frontend pass
- stream transport should stay stable while frontend reveal timing gets orchestrated later
- future implementation should start with backend/prompt and result choreography before decorative exploration
- Dashboard AI reviews now carry grounded axis summaries and patch evidence
  through the live model into the Profile panel; Clarity signal components and
  its evidence cap are shown alongside the deterministic score.
