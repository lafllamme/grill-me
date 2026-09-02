# Safety category

Safety is a conservative, patch-grounded category. The deterministic score
starts from the neutral baseline and adds only visible defensive evidence. A
deduction requires an AI-reported introduced risk that is grounded in a known
commit and confirmed by the server's added-line patterns.

Patterns live in `patterns.ts`; evidence verification lives in `evidence.ts`;
metric calculation and scoring are separate from the AI context contract.
`selection.ts` is retained for the legacy standalone Safety reviewer.

The public score remains compatible with
`server/roast/dashboard-profile-scoring.ts`. This folder is the implementation
source for new dashboard code during the migration.

## Formula

```text
multiplier = .5 + safetyPatchCommitRatio / 100 * .5
Safety = 70
  + safetyDefenseCoverage * .25 * multiplier
  + processBonus
  + aiDefenseBonus * multiplier
  - confirmedRiskPenalty
```

No personal patch evidence returns `50 / insufficient`; ordinary patch-backed
evidence stays at neutral `70`. Process evidence is capped at five points.
Only a grounded, server-confirmed introduced risk can subtract points.

`constants.ts` owns the typed Safety score rules, severity penalties, metric
weights, and standalone selection limits. The pattern catalog remains in
`patterns.ts`, separate from scoring.
