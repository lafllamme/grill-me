# Colors

## Design Tokens: Magma & Basalt (grillme.dev)

Dieses Farbschema ist auf maximale Atmosphäre und "Hitze" ausgelegt: dunkler Basalt als Bühne, glühendes Magma als Akzent.

## Core Palette

- `primary` (Magma Orange): `#FF3300`
- `background` (Basalt Deep): `#131313`
- `surface` (Elevated): `#1C1B1B`
- `on-surface` (Text Primary): `#E5E2E1`
- `on-surface-variant` (Text Secondary): `#A3A1A0`

## Accent & Effects

- Glow / Shadow: `rgba(255, 51, 0, 0.15)`
- Border / Divider: `rgba(229, 226, 225, 0.1)`
- Warning/Crit: `#FF3300` (identisch zu `primary`)
- Success (optional): `#B8FF00`

## Usage Rules

- Primäre Actions, aktive Zustände und Warnakzente: `primary`
- Seitenhintergrund: `background`
- Karten/Sektionen/Module: `surface` und `surface-container-*`
- Standardtext und Headlines: `on-surface`
- Metadaten, Labels, Nebeninfos: `on-surface-variant`
- Glow-Effekte nur subtil einsetzen, um Lesbarkeit zu erhalten.

## Implementation Rules

- Farbdefinitionen zentral in `uno.config.ts` (`theme.colors`).
- Komponenten verwenden ausschließlich Token-Klassen, keine ad-hoc Hex-Werte.
- Ausnahmen sind nur erlaubt, wenn sie explizit im Design-System dokumentiert werden.
