# Layout 09 — Hero Metrics / Product Card

## Referenzen

- Layout: `09_layout.png`
- Mock: `09_mock.png`

## Sichtbare Struktur

09 zeigt eine helle, breit gerundete Shell auf einem warmen Interior-Hintergrund. Die Navigation sitzt oben. Im oberen Bereich liegen links kompakte Metriken und kleine Module, während rechts eine größere Bildkarte steht. Eine schmale, expressive Überschrift zieht sich durch den Hero. Unterhalb folgen kleinere Avatare, CTA-Elemente und eine strukturierte Linkzeile.

## Räumliche Logik

Der Hero teilt sich in eine informative linke Seite und eine visuelle rechte Seite. Die Metriken sind früh sichtbar, aber kleiner als die zentrale Überschrift. Die rechte Karte funktioniert als konkreter visueller Anker; der untere Bereich schließt die Section mit Navigation und Vertrauenssignalen ab.

## Charakteristische Mechanik

- Metriken erscheinen früh und kompakt.
- Eine schmale Display-Überschrift gibt der Section Charakter.
- Rechte Bildkarte hält die Komposition visuell zusammen.
- Untere Link-/Avatar-Zone schafft Abschluss und Vertrauen.

## Adaption für Roast-1

09 kann als Einstieg vor der tieferen Roast-Analyse dienen:

- links: Grade, Roast-Level und die drei Scores;
- Mitte: Titel und kurze Verdict-Erklärung;
- rechts: Receipt- oder Evidence-Karte als konkreter visueller Beleg;
- unten: Commit-/File-Counts, Analyseumfang und „weiter zur Evidence“-CTA.

Das Layout eignet sich gut, wenn der Nutzer schnell verstehen soll, wie schwer der Roast ausfällt, bevor er in einzelne Runden und Diffs einsteigt.

## Daten-Mapping

- Metriken: `stinkScore`, `spaghettiIndex`, `egoDamage`, `grade`.
- Display-Hero: `title` und kurze `feedback`-Zusammenfassung.
- Rechte Karte: Receipt oder ausgewählte Evidence.
- Untere Zone: Counts und Navigation zu `commits`, `files`, `diffEvidence`.

## Design-System-Leitplanken

- Metriken nicht ausschließlich über Farbe kommunizieren; immer Zahl und Bedeutung zeigen.
- General Sans für UI, Azeret Mono für Scores und technische Zeilen.
- Kontrastflächen über Basalt und Bone, Signal Red nur als semantische Hervorhebung.
- Auf Mobile zuerst Grade/Level, dann Titel, dann Score-Zeile und Beleg.

## Eignung

**Fit: hoch für einen Roast-Intro-Hero.** 09 ist eine gute Vorlage für die erste Bildschirmhöhe, wenn die Score-Interpretation stärker als der dekorative Card Stack werden soll.

