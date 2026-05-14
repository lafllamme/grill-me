# Typography

## Active Concept

Für `grillme.dev` verwenden wir das Konzept **Experimental Dev**.

## Font Stack

- `display`: Bricolage Grotesque
- `headline`: Bricolage Grotesque
- `label`: Bricolage Grotesque
- `body`: General Sans
- `mono`: Azeret Mono
- `meta`: Azeret Mono
- `serif`: Zodiak
- `accent`: Zodiak

## Implementation Rules

- Font-Loading erfolgt ausschließlich über `@nuxt/fonts` in `nuxt.config.ts`.
- Font-Token-Mapping erfolgt ausschließlich über UnoCSS Theme (`uno.config.ts`, `theme.font`).
- Verwendete Utility-Klassen:
  - `font-headline`
  - `font-display`
  - `font-label`
  - `font-serif`
  - `font-accent`
  - `font-body`
  - `font-mono`
  - `font-meta`

## Usage Guidance

- Hero-Headlines, harte Labels und Navigations-Branding: `font-display` oder `font-headline`
- UI-Labels und kurze emphatische Tags: `font-label`
- Standard-Text, Copy, Beschreibungen: `font-body`
- Terminal/Code-Ausgabe und systemnahe Strings: `font-mono` oder `font-meta`
- Zitate und redaktionelle Stellen: `font-serif` oder `font-accent`

## Compatibility Aliases

- `font-mono` und `font-meta` mappen beide auf `Azeret Mono`
- `font-serif` und `font-accent` mappen beide auf `Zodiak`
- Neue UI-Arbeit sollte bevorzugt `font-meta` für Labels/Meta-Strings und `font-accent` für Quotes/Editorial einsetzen

## Do Not

- Keine separaten Font-CSS-Dateien wie `typography.css` anlegen.
- Keine externen `<link rel="stylesheet">` oder `<style>`-Font-Definitionen in Komponenten.
- Keine Font-Definitionen außerhalb von `@nuxt/fonts` + UnoCSS Theme einführen.
