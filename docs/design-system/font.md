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

- Markenname, Roast-Urteile und expressive Akzente: `font-display` oder `font-headline`
- Neutrale Editorial-Headlines, Navigation, UI und Standard-Copy: `font-body`
- Kurze emphatische Brand-Tags: `font-label`
- Terminal/Code-Ausgabe und systemnahe Strings: `font-mono` oder `font-meta`
- Metazeilen, Kapitelnummern, Status und Evidence-IDs: `font-meta`
- Zitate und redaktionelle Stellen außerhalb der Homepage: `font-serif` oder `font-accent`

## Homepage Roles

- `General Sans`: Hero-Unterstützungstext, neutrale Kapitel-Headlines, Navigation, Prozesszeilen, FAQ und Body.
- `Bricolage Grotesque`: Grillme-Wortmarke, primäres Hero-Statement, Grade und finales Roast-Urteil.
- `Azeret Mono`: Metazeilen, Kapitelmarker, Stream-Status, Commit-SHAs und technische Evidence.
- `Zodiak`: auf der Homepage nicht verwenden. Die Serifenschrift bleibt für bewusst redaktionelle Flächen außerhalb des Fuel-basierten Homepage-Systems reserviert.

Neutrale Editorial-Headlines auf der Homepage verwenden den gemeinsamen
`fuel-editorial-headline`-Shortcut und `RebrandScrollHeadline`:

- Mobile: `30px / 30px`, `-1.1px` Tracking
- Large: `38px / 38px`, `-1.2px` Tracking
- Desktop ab `xl`: `70px / 70px`, `-2.1px` Tracking
- Gewicht: `500`

Der Text wird als zusammenhängender typografischer Lauf gemessen und danach
entlang der tatsächlichen Browser-Zeilen maskiert. Manuell vorgegebene
Zeilenumbrüche sind nur für bewusste Brand-Kompositionen wie den Hero erlaubt.
Dadurch bleiben Kerning, Tracking und responsive Umbrüche zwischen Messung und
sichtbarer Headline identisch.

Die Reveal-Maske erhaelt eine kleine vertikale Metrikreserve, weil die
Glyphenbox von General Sans die sichtbare `70px`-Zeilenbox ueberschreiten kann.
Ein gegenlaeufiger negativer Rand haelt den Layout-Rhythmus trotzdem bei
`70px / 70px`; die Reserve darf die Kapitelhoehe nicht veraendern.

Hero-Statements, Wortmarke und Roast-Urteile dürfen weiterhin Bricolage
Grotesque verwenden. Sie teilen bei Bedarf dieselbe maskierte
Zeilen-Reveal-Mechanik, aber nicht zwingend die neutralen Fuel-Metriken.

## Clarification

- `Zodiak` ist aktuell kein Body-Font.
- `font-body` bleibt `General Sans`.
- Die neue Zodiak-Italic-Datei greift nur dort, wo `font-serif` oder `font-accent` zusammen mit kursiver Typografie verwendet wird.
- Aktuell betrifft das praktisch nur `font-accent italic`-Stellen wie Zitate und interne Explorationen, nicht die Homepage.

## Compatibility Aliases

- `font-mono` und `font-meta` mappen beide auf `Azeret Mono`
- `font-serif` und `font-accent` mappen beide auf `Zodiak`
- Neue UI-Arbeit sollte bevorzugt `font-meta` für Labels/Meta-Strings und `font-accent` für Quotes/Editorial einsetzen

## Do Not

- Keine separaten Font-CSS-Dateien wie `typography.css` anlegen.
- Keine externen `<link rel="stylesheet">` oder `<style>`-Font-Definitionen in Komponenten.
- Keine Font-Definitionen außerhalb von `@nuxt/fonts` + UnoCSS Theme einführen.
