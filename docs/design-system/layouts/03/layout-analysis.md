# Layout 03 — Contrast Bands / Product Editorial

## Referenzen

- Layout: `03_layout.png`
- Mock: `03_mock.png`

## Sichtbare Struktur

Das Mockup zeigt eine dunkle, minimalistische Produktseite mit warmer, texturierter Umgebung. Ein kompakter dunkler Hero führt in die Seite ein. Darauf folgen helle Inhaltsflächen mit Produktkarten und wechselnden Bild-Text-Bereichen. Ein schmaler, vollflächiger Ticker trennt die Bereiche. Später kommen wieder dunkle Flächen und ein Kachelraster.

## Räumliche Logik

Die Seite lebt vom Wechsel zwischen dunklen und hellen horizontalen Bändern. Jede Band hat eine eigene Aufgabe: Hero, Auswahl, Aussage, Detail. Die Navigation bleibt kompakt und die einzelnen Inhaltsgruppen werden nicht in einen einzigen Dashboard-Container gepresst.

## Charakteristische Mechanik

- Helle und dunkle Section-Surfaces wechseln bewusst.
- Ein Ticker oder Lauftext markiert einen Übergang, nicht den Inhalt selbst.
- Produktkarten erscheinen gruppiert, nicht als gleich große Vollraster.
- Bild-Text-Splits geben den Abschnitten eine klare Leserichtung.

## Adaption für Roast-1

03 eignet sich für die vertikale Dramaturgie unterhalb des Heroes:

- dunkler Verdict-Hero mit Titel und Grade;
- helle Score- oder Insight-Band mit der Score-Matrix;
- schmale Signal-Red-Tickerzeile als Übergang zwischen Roast und Evidence;
- dunkle Evidence-Band für Commits und Diff-Evidence;
- helle Fix-Band für konkrete nächste Schritte.

Der Ticker sollte nicht automatisch lange Roast-Texte bewegen. Eine statische, kurze Übergangszeile wie „EVIDENCE PRINTED / FIXES PENDING“ wäre robuster und barriereärmer.

## Daten-Mapping

- Hero: `title`, `grade`, `roastLevel`.
- Helle Score-Band: die drei Scores mit kurzer Bedeutung.
- Dunkle Evidence-Band: Commits, Files und Diff-Auszüge.
- Fix-Band: `feedback` und `fixes`.

## Design-System-Leitplanken

- Kontrast über Basalt/Bone-Flächen erzeugen, nicht über freie Grauwerte.
- Ticker und aktive Linien in Signal Red, technische Labels in Azeret Mono.
- Section-Wechsel mit den dokumentierten Masken und Radien; keine dekorativen Farbverläufe.
- Auf Mobile die Bänder als lineare Sections stapeln.

## Eignung

**Fit: hoch als Section-System.** 03 ist weniger eine komplette Roast-Komposition als eine gute Vorlage für die vertikale Dramaturgie und die Trennung von Verdict, Scores, Evidence und Fixes.

