# Backgrounds

Diese Seite dokumentiert den globalen PixelBlast-Hintergrund.

## Integration

- Komponente: `PixelBlastBackground.client.vue`
- Integrationsebene: `app/layouts/default.vue`
- Ziel: globales Hintergrund-Layer hinter allen Routen

Warum `.client.vue`:

- Die Komponente nutzt WebGL (`three`) und Browser-APIs (`window`, `document`, `ResizeObserver`).
- Dadurch wird SSR/Hydration stabil gehalten, ohne serverseitige DOM-Zugriffe.

## Dependencies

Runtime-Abhängigkeiten:

- `three`
- `postprocessing`

## Projekt-Defaults

Aktuelle Defaults für den globalen Einsatz:

- `variant: 'square'`
- `pixelSize: 4`
- `color: '#FF5633'`
- `patternScale: 2`
- `patternDensity: 1`
- `pixelSizeJitter: 0`
- `enableRipples: true`
- `rippleSpeed: 0.3`
- `rippleThickness: 0.1`
- `rippleIntensityScale: 1`
- `liquid: false`
- `liquidStrength: 0.1`
- `liquidRadius: 1`
- `liquidWobbleSpeed: 4.5`
- `speed: 0.5`
- `edgeFade: 0.25`
- `noiseAmount: 0`
- `transparent: true`

## Adaptive Fallback

Die Komponente reduziert Last automatisch bei:

- `prefers-reduced-motion: reduce`
- coarse pointer / touch devices
- kleinen Viewports

Verhalten in Adaptive-Mode:

- Basis-Pixel-Layer bleibt aktiv
- teure Effekte werden reduziert bzw. deaktiviert (z. B. `liquid`, `noise`)
- Ziel: stabile Performance bei konsistentem Marken-Look
