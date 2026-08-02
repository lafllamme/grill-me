# Hero Choreography Design

## Goal

Make the landing hero feel calmer and more intentional without changing the Prism shader, its settings, or the existing page composition.

## Design

- Keep the WebGL background renderer and all shader parameters unchanged.
- Use one page-level reveal state for the hero content after the entry overlay has released the page.
- Let the header move only as a small group reveal; keep the visible stagger on the individual navigation items.
- Keep the wordmark as the dominant upward movement, with a small delay after the header begins.
- Keep the copy reveal subtle and shorter than the wordmark movement.
- Remove the extra canvas opacity transition so the background has one visual reveal instead of nested fades.
- Preserve the current scroll-linked hero drift, hero exit, and reduced-motion behavior.

## Acceptance Criteria

- No shader code or shader settings change.
- Header, navigation, copy, and wordmark enter in a predictable order.
- The background does not receive two simultaneous opacity fades.
- Reduced-motion users still receive a non-animated presentation.
- Typecheck, lint, and unit tests remain passing.
