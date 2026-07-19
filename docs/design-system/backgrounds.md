# Backgrounds

This page documents the current global background architecture and the rules for the rebrand exploration.

## Global Prism background

- Component: `app/components/PrismGradientBackground.client.vue`
- Integration: `app/layouts/default.vue`
- Settings: `app/composables/usePrismGradientSettings.ts`
- Developer controls: `app/components/PrismGradientDevPanel.vue`

The component renders the animated gradient directly with WebGL2. It is a client component because it uses canvas, `window`, `ResizeObserver`, `performance`, and animation frames.

The default layout keeps the Prism layer fixed behind route content. Production routes should not mount a second animated page background.

## Runtime behavior

- Three colors define the active palette for dark and light modes.
- Speed controls the animation rate.
- A small repeated texture can be layered over the canvas with configurable opacity and scale.
- `prefers-reduced-motion: reduce` renders one frame and stops the animation loop.
- If WebGL2 setup fails, the component renders a palette-aware static radial-gradient fallback.
- WebGL context loss temporarily reveals the fallback and attempts a clean renderer setup after context restoration.
- `ambientOpacity` can add a restrained palette-aware layer above the canvas so near-black shader phases do not visually erase the background.
- The developer panel is available only in development and stores its settings locally.

## Layering rules

The intended stack is:

1. fixed Prism canvas
2. optional static ambient stabilization
3. optional Prism noise
4. route-level masks or scrims
5. content shells

Only one layer carries continuous motion. Route content may add static gradients, shadows, and masks, but must not introduce another animated full-page background.

## Surface and transition rules

Large opaque sections can hide the global background when the narrative needs a quiet reading field. The transition must still be designed.

Preferred techniques:

- black-to-transparent or tinted gradient masks
- broad, hue-tinted shadows around section shells
- visible background gutters between macro shells
- translucent content islands with stable text contrast
- deliberate return of the background at major reveals and final calls to action

Avoid:

- abrupt rectangular cuts from Prism to pure black
- the animated gradient directly behind long body copy
- stacking glass panels until every surface has the same visual weight
- using bright accent color as a full-section fill by default

## Rebrand exploration

`/test-1` and `/test-2` own an isolated Signal Red Prism palette and do not use the default layout. This is intentional: the routes test the proposed visual direction without changing production settings or persisted developer controls.

The exploration uses:

- warm near-black as the base
- deep Signal Red as the main Prism color
- dusty rose as the bright Prism edge
- dark translucent shells for readable content
- gradient masks where the animated field fades into quiet black sections
- a low-opacity Signal Red ambient layer on `/test-2` to keep the visual field present during dark shader phases

See [Rebrand design direction](./research/design-direction.md) for the rationale. These colors are not yet the production background contract.

## Entry overlay (`/`)

`LandingEntryOverlay.vue` still provides the deterministic blackout entry before the landing content becomes interactive. Its visibility state must remain SSR and hydration safe.

The overlay is product UI above the global background, not a second background engine.
