# Clarity

Clarity asks whether another developer can understand the intent, names, and
local shape of the sampled personal changes. The category owns naming and
structure signals plus its evidence ceiling. Workflow message quality remains
an input supplied by the shared metrics composition.

## Formula

```text
raw = workflowMessageQuality * 0.35
    + clarityNamingSignal * 0.30
    + clarityStructureSignal * 0.35
Clarity = min(raw, evidenceCap)
```

The gate is neutral `50` below three total and three personal commits. The
evidence cap is `90` for a thin patch sample and `95` for a broad sample.
Conventional-message ratio is diagnostic Workflow context, not a Clarity input.

`ai-context.ts` describes the question and breakdown for the combined review;
AI may only make the existing bounded adjustment after grounding.

`constants.ts` is the typed source of truth for the weights, evidence gates,
caps, and signal penalties.
