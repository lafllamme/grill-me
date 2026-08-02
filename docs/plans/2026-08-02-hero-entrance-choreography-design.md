# Hero Entrance Choreography

## Goal

Match the measured Fuel-style hero entrance while preserving Grillme's existing
visual system and avoiding extra shader work during the intro.

## Design

- Keep the Prism background mounted, but place a black compositor-friendly veil
  above it and fade that veil out over approximately 1.3 seconds.
- Animate the large `GRILL ME` wordmark first from below.
- Animate the header logo and start badge from above shortly after the wordmark.
- Animate navigation items from above with a 100 ms stagger.
- Reveal the left copy and CTA after the header sequence.
- Keep the existing reduced-motion path and avoid animating the shader itself.
- Align the header against the measured Fuel geometry and constrain the
  wordmark to a comparable right-aligned width.

## Verification

- Refresh the local homepage and inspect the first 1.5 seconds in the browser.
- Confirm no red background flash occurs before content appears.
- Confirm header and hero positions remain stable after entrance completes.
- Run lint, typecheck, unit tests, and the UI E2E suite.
