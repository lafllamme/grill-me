# 3D Scene Note

The landing page now includes a client-only TresJS scene rendered through `@tresjs/nuxt`.

## Rendering approach

- The landing scene is fully procedural and uses Tres/Three primitives only.
- No GLB or GLTF asset is required for the landing grill stage.
- The scene is mounted client-side only and only when the section becomes visible.

## Heat-driven model

The scene is driven by a single normalized `heat` value.

- `heat=0` keeps the meat raw and the coals dim.
- mid heat builds a seared crust and stronger ember glow.
- max heat pushes the meat into char, raises fire height, and brightens the ambient warmth.

The helper that owns this mapping lives in `app/utils/grill-heat-state.ts`.

## Component behavior

- Render component: `app/components/GrillScene.client.vue`
- Orbit helper: `app/components/GrillSceneOrbitControls.ts`
- Landing wrapper: `app/components/LandingGrillSceneSection.vue`
- The scene uses:
  - procedural grill geometry
  - a single heat slider
  - full orbit + zoom
  - material interpolation for meat browning

## Tuning points

If the scene needs visual adjustment, the main levers are:

- camera position and orbit target in `GrillScene.client.vue`
- zoom bounds in `GrillSceneOrbitControls.ts`
- color stops and intensity mapping in `app/utils/grill-heat-state.ts`
- stage part positions/scales in `GrillScene.client.vue`
