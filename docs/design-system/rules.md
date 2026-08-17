# Grillme Design-System-Regeln

## 1. Priorität

1. Diese Regeln und die Token in `uno.config.ts` sind die Quelle der Wahrheit.
2. `colors.md`, `font.md` und `backgrounds.md` erklären die Entscheidungen.
3. `/design-system` zeigt die Regeln live.
4. `/test-1` ist ein historischer Rebrand-Playground. Neue verbindliche
   Komponenten und Token-Beispiele gehören auf `/design-system`.

## 2. Farbverantwortung

### Signal Red

Signal Red ist der einzige aktive Produktakzent.

- `primary` / `signal-red-700`: ausgewählte Tabs, CTA, aktive Navigation,
  Grade, fokussierte Kennzahlen.
- `primary-strong` / `signal-red-500`: Live-Status, Fokuslicht, kleine
  Hervorhebungen und Warnsignale.
- `primary-container` / `signal-red-900`: tiefe Akzentfläche und ausgewählte
  dunkle Zustände.
- `primary-soft` und `primary-muted`: Chips, Hover-Flächen und dezente
  Statusflächen.

Signal Red ist Signal, nicht Hintergrund. Ein Modul darf maximal eine primäre
Akzentfläche und wenige sekundäre Akzentdetails gleichzeitig tragen.

### Basalt und Bone

- Basalt trägt Seitenhintergrund, Shells, Cards, Divider und Elevation.
- Bone trägt Haupttext, warme Kontraste und gezielte Papier-/Receipt-Flächen.
- Ember ist Legacy-/Exploration-Palette. Neue Produkt-UI darf `ember-*` nicht
  verwenden.
- Reines Schwarz ist eine bewusst begrenzte Bühnenfarbe für Hero, Entry-Overlay
  und harte Full-Bleed-Übergänge. Für normale Seiten- und Modulflächen bleibt
  Basalt die Quelle der Wahrheit.
- Keine freien Hex-Werte in Komponenten. Ausnahmen gehören in `uno.config.ts`
  und müssen hier dokumentiert werden.

## 3. Typografie

- General Sans (`font-body`): UI, Navigation, erklärende Headlines und Body.
- Bricolage Grotesque (`font-display`/`font-headline`): Brand, große Urteile,
  Grade und einzelne expressive Statements.
- Azeret Mono (`font-meta`/`font-mono`): Status, IDs, technische Daten, Scores,
  Commit-SHAs und Evidence.
- Climate Crisis: nur der Hero-Wordmark.
- Bricolage Grotesque (`font-accent`): seltene expressive Quotes, Reviews und
  Roast-Urteile; nicht als Default-Display.

Keine Schrift darf nur wegen ihres visuellen Reizes eingesetzt werden. Jede
Verwendung braucht eine klar erkennbare inhaltliche Rolle.

## 4. Grid und Layout

- Desktop: 12 Spalten mit einem gemeinsamen äußeren Container.
- Mobile: 4 Spalten; Inhalte dürfen nicht horizontal überlaufen.
- Der äußere Container definiert die Seitenränder. Komponenten erfinden keine
  eigenen, konkurrierenden Maximalbreiten.
- Fuel-/Rebrand-Seiten nutzen große Editorial-Flächen; interne Module bleiben
  innerhalb dieses Rasters.
- Primäre Information steht zuerst. Evidence, technische Details und Debug-
  Informationen sind sekundäre Zonen und dürfen den Hauptfluss nicht stören.

## 5. Radius, Border und Elevation

- `0/2px`: technische Kanten, Tabellen, Evidence-Raster.
- `8px`: Controls, Inputs, kompakte Statusflächen.
- `16px`: Cards und Module.
- `24px+`: große Page-Shells oder bewusst weiche Hero-Flächen.
- Sichtbare Borders setzen immer Breite und Farbe explizit.
- Shadows sind lokal und ruhig: eine dunkle strukturelle Ebene plus höchstens
  ein kleiner Signal-Glow bei aktivem Fokus.
- Keine schrägen Card-Schnitte, zufälligen Rotationen oder dekorativen
  Schattenstapel in produktiven Modulen.

## 6. States und Bewegung

Jede interaktive Komponente muss Default, Hover, `:focus-visible`, Active,
Disabled, Loading und Error sinnvoll behandeln.

- Fokus ist immer sichtbar und darf nicht nur über Farbe kommunizieren.
- Bewegungen nutzen bevorzugt `opacity` und `transform`.
- Kein Layout-Shift beim Nachladen.
- Staggering ist kurz und hierarchisch: Hauptinhalt zuerst, Metadaten danach.
- `prefers-reduced-motion` deaktiviert nicht notwendige Bewegung.
- Motion erklärt Zustandswechsel; sie ersetzt keine Information.

## 7. Komponenten-Workflow

1. Bestehende Komponenten und Tokens suchen.
2. Semantische Tokens statt Raw-Scale oder Hex verwenden.
3. Mobile-first und SSR-sicher bauen.
4. Alle Zustände auf `/design-system` oder in einer Story-/Testfläche zeigen.
5. Bei sichtbaren UI-Änderungen Lint, Typecheck und relevante Tests ausführen.
