# Grill Scene Architecture

Die Landing-Grill-Szene läuft client-only auf TresJS (`@tresjs/nuxt`) und wird vollständig über einen normalisierten `heat`-Wert + lokale Tuning-Controls gesteuert.

## Komponentenübersicht

- Render-Orchestrator: `app/components/GrillScene.client.vue`
- Orbit: `app/components/GrillSceneOrbitControls.ts`
- Settings-Panel: `app/components/grill-scene/GrillSceneSettingsPanel.vue`
- Kohle/Fuel: `app/components/grill-scene/GrillSceneCoals.vue`
- Flammen: `app/components/grill-scene/GrillSceneFire.vue`
- Fleisch-Wrapper: `app/components/grill-scene/GrillSceneMeats.vue`
- Einzelmodelle:
  - `app/components/grill-scene/meats/GrillSceneSausage.vue`
  - `app/components/grill-scene/meats/GrillSceneSteak.vue`
  - `app/components/grill-scene/meats/GrillSceneBacon.vue`
- Shared Meat-Asset-Loader + Burn-Hook:
  - `app/components/grill-scene/meats/GrillSceneMeatAsset.vue`
  - `app/components/grill-scene/meats/useMeatBurn.ts`

## Interaktionsmodell

### 1. Heat Core

`app/utils/grill-heat-state.ts` liefert die Basiszustände für:

- Coals (Glow/Pulse)
- Fire (Color/Height/Flicker)
- Meat (Wobble + Browning-Range)
- Ambience/Light

### 2. Fuel Controls (Kohle)

Über das Settings-Panel werden `FuelControls` live verändert:

- `glowIntensity`
- `pulseSpeed`
- `coalDensity`

Diese Werte modulieren die Kohleanimation in `GrillSceneCoals.vue` (Briquette-ähnliche Capsule/Icosa-Kombination statt der alten kantigen Geometrie).

### 3. Flame Controls

Über `FlameControls` werden Flammenparameter live gesetzt:

- `height`
- `spread`
- `opacity`
- `flicker`

`GrillSceneFire.vue` rendert mehrlagige Flame-Shards (Cone-Layer), die durch `heat` und diese Controls dynamisch spiken und seitlich driften.

### 4. Meat Burn Controls

`BurnControls` steuern den Durchbrenn-Effekt:

- `charStrength`
- `charThreshold`

`useMeatBurn.ts` cached pro Mesh das Ursprungsmaterial und interpoliert bei steigender Hitze in Richtung verkohlter Farb-/Roughness-Werte.

## Persistenz (LocalStorage)

Die relevanten Szene-Tuning-Werte werden persistent gehalten:

- `grill-scene-camera-position-v1`
- `grill-scene-camera-target-v1`
- `grill-scene-camera-orbit-v1`
- `grill-scene-ember-offset-v2`
- `grill-scene-meat-offset-v2`
- `grill-scene-meat-adjustments-v1`
- `grill-scene-fuel-controls-v1`
- `grill-scene-flame-controls-v1`
- `grill-scene-burn-controls-v1`

## Erweiterungspunkte

- Weitere Meat-Modelle: neue Config + neue Meat-Komponente im `meats/`-Ordner.
- Alternative Flame-Visuals: `GrillSceneFire.vue` austauschbar, solange `FlameControls`-Contract stabil bleibt.
- Zusätzliche Burn-Stufen: in `useMeatBurn.ts` über zusätzliche Materialparameter/Curves erweitern.
