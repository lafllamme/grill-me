# Backgrounds

Diese Seite dokumentiert die globalen und route-spezifischen Hintergrund-Layer.

## Global Background

- Komponente: `GrainientBackground.client.vue`
- Integrationsebene: `app/layouts/default.vue`
- Ziel: globales Hintergrund-Layer hinter allen Routen

Warum `.client.vue`:

- Die Komponente nutzt WebGL (`three`) und Browser-APIs (`window`, `document`, `ResizeObserver`).
- Dadurch wird SSR/Hydration stabil gehalten, ohne serverseitige DOM-Zugriffe.

## Entry Overlay Background (`/`)

- Komponente: `LandingEntryOverlay.vue`
- Integrationsebene: `app/pages/index.vue`
- Ziel: vollständiger Blackout-Einstieg vor dem eigentlichen Landing-Content

Verhalten:

- Overlay wird bei initialem Render deterministisch angezeigt (`visible = true`) auf Server und Client.
- Erst nach CTA-Interaktion wird der eigentliche Seiteninhalt sichtbar/interaktiv.
- Keine Persistenz in v1 (kein Cookie/LocalStorage/SessionStorage).

Visuelle Regeln:

- Nur Ember/Basalt/Bone-Design-System-Tokens verwenden.
- Struktur über `background`, `surface*`, `divider`, `border`, `on-*`.
- Orange nur als Signal über `primary`, `primary-strong`, `primary-soft` oder `primary-container`.
- Keine zusätzlichen externen Font- oder CSS-Quellen.
- Primäre und sekundäre Overlay-CTAs sind als `rounded-full` (pill) auszuführen.

## Dependencies

Runtime-Abhängigkeiten:

- `three`
- `postprocessing`

## Adaptive Fallback

Die Global-Background-Komponente reduziert Last automatisch bei:

- `prefers-reduced-motion: reduce`
- coarse pointer / touch devices
- kleinen Viewports

Verhalten in Adaptive-Mode:

- Basis-Layer bleibt aktiv
- teure Effekte werden reduziert bzw. deaktiviert (z. B. `liquid`, `noise`)
- Ziel: stabile Performance bei konsistentem Marken-Look

## Layering rules

- Base charcoal → noise texture → radial ember glow, in that order.
- Glow layers use `mix-blend-mode: screen` and must stay below 40% opacity.
- Never stack two animated background layers; one carries the motion.
- Open question: does noise texture need its own section?
