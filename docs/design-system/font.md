# Typography

## Active Concept

Für `grillme.dev` verwenden wir das Konzept **Signal Editorial**: klare
General-Sans-Flächen, technische Azeret-Mono-Metadaten und expressive
Bricolage-Grotesque-Urteile. Orange ist keine typografische Verantwortung.

## Font Stack

- `display`: General Sans
- `headline`: General Sans
- `label`: General Sans
- `body`: General Sans
- `mono`: Azeret Mono
- `meta`: Azeret Mono
- `accent`: Bricolage Grotesque
- `wordmark`: Climate Crisis (nur Wortmarke)

Plus Jakarta Sans ist kein aktiver Produktfont mehr. Die frühere Query-
Parameter-Exploration wurde entfernt, damit der Homepage-Wordmark und die
laufende Typografie nicht zwei konkurrierende neutrale Grotesks mischen.

## Implementation Rules

- Font-Loading erfolgt ausschließlich über `@nuxt/fonts` in `nuxt.config.ts`.
- Font-Token-Mapping erfolgt ausschließlich über UnoCSS Theme (`uno.config.ts`, `theme.font`).
- Verwendete Utility-Klassen:
  - `font-headline`
  - `font-display`
  - `font-label`
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
- Zitate, Reviews und redaktionelle Stellen: `font-accent` mit Bricolage Grotesque

## Homepage Roles

- `General Sans`: Hero-Unterstützungstext, neutrale Kapitel-Headlines, Navigation, Prozesszeilen, FAQ und Body.
- `Bricolage Grotesque`: expressive Quotes, Reviews und besondere Roast-Urteile über `font-accent`.
- `Climate Crisis`: ausschließlich der Hero-Wordmark; nicht für UI, Cards oder Body-Text.
- `Azeret Mono`: Metazeilen, Kapitelmarker, Stream-Status, Commit-SHAs und technische Evidence.
- Bricolage Grotesque bleibt auf seltene expressive Zitate, Reviews und Roast-Urteile begrenzt.

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

- `font-body` bleibt `General Sans`.
- `font-accent` greift nur dort, wo ein bewusst expressiver Bricolage-Moment
  gebraucht wird.

## Compatibility Aliases

- `font-mono` und `font-meta` mappen beide auf `Azeret Mono`
- Neue UI-Arbeit sollte bevorzugt `font-meta` für Labels/Meta-Strings und
  `font-accent` nur für Quotes/Editorial einsetzen.

## Do Not

- Keine separaten Font-CSS-Dateien wie `typography.css` anlegen.
- Keine externen `<link rel="stylesheet">` oder `<style>`-Font-Definitionen in Komponenten.
- Keine Font-Definitionen außerhalb von `@nuxt/fonts` + UnoCSS Theme einführen.
