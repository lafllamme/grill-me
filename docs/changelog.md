# Changelog

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
