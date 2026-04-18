# Typography

## Active Concept

Für `grillme.dev` verwenden wir das Konzept **Experimental Dev**.

## Font Stack

- `display`: Bricolage Grotesque
- `serif`: DM Serif Display
- `body`: Outfit
- `mono`: Space Mono

## Implementation Rules

- Font-Loading erfolgt ausschließlich über `@nuxt/fonts` in `nuxt.config.ts`.
- Font-Token-Mapping erfolgt ausschließlich über UnoCSS Theme (`uno.config.ts`, `theme.font`).
- Verwendete Utility-Klassen:
  - `font-display`
  - `font-serif`
  - `font-body`
  - `font-mono`

## Usage Guidance

- Hero-Headlines, harte Labels und Navigations-Branding: `font-display`
- Zitate und „Verdict“-ähnliche redaktionelle Stellen: `font-serif`
- Standard-Text, Copy, Beschreibungen: `font-body`
- Terminal/Code-Ausgabe und systemnahe Strings: `font-mono`

## Do Not

- Keine separaten Font-CSS-Dateien wie `typography.css` anlegen.
- Keine externen `<link rel="stylesheet">` oder `<style>`-Font-Definitionen in Komponenten.
- Keine Font-Definitionen außerhalb von `@nuxt/fonts` + UnoCSS Theme einführen.
