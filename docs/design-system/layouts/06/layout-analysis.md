# Layout 06 — Framed Hero / Masked Transition / Service List

## Referenzen

- Layout: `06_layout.png`
- Mock: `06_mock.png`

## Sichtbare Struktur

06 sitzt in einer breiten hellen Shell auf einem dunklen fotografischen Hintergrund. Ein großer dunkler Hero nimmt den oberen rechten und mittleren Raum ein. Links steht eine schmale helle Rail mit Logo, Überschrift, Text und Kennzahlen. Darunter folgt eine helle Inhaltsfläche mit zentraler Überschrift, CTA und einer rechts ausgerichteten Liste mit kleinen Bildkarten.

## Räumliche Logik

Der dunkle Hero ist die visuelle Bühne; die linke Rail liefert Orientierung und die untere Liste führt in die Details. Eine gerundete oder maskierte Übergangskante verbindet Hero und helle Inhaltsfläche. Dadurch wirkt der Wechsel physisch und nicht wie ein harter Containerwechsel.

## Charakteristische Mechanik

- Shell als klarer heller Rahmen.
- Dunkler, großer Hero mit lokaler Medienkontrolle.
- Schmale linke Informations-Rail.
- Untere Service-/Detail-Liste mit wiederholbaren Mini-Karten.
- Maskierter Übergang zwischen Hero und Detailbereich.

## Adaption für Roast-1

06 ist eine starke Ergänzung zu 02 und 04:

- Hero: Verdict, Grade und Roast-Titel auf Basalt.
- Linke Rail: Username, Level, Evidence-Counts und Score-Zusammenfassung.
- Untere helle Fläche: Score-Matrix und sachliches Feedback.
- Rechte Liste: Fixes, Commits oder Dateien als wiederholbare Evidence-Zeilen.

Die Maskierung kann den Übergang vom emotionalen Roast zum sachlichen Feedback markieren. Der Receipt-Printer bleibt dabei ein einzelnes Artefakt in der Rail oder im Evidence-Bereich und verändert nicht die gesamte Shell.

## Daten-Mapping

- Hero: `title`, `grade`, zentrale `roastLine`.
- Linke Rail: `username`, `roastLevel`, Counts, Scores.
- Untere Fläche: `feedback`, `fixes` und Score-Bedeutungen.
- Liste: `commits`, `files`, `diffEvidence`.

## Design-System-Leitplanken

- Bone als Shell/Detail-Surface und Basalt als Hero-Fläche.
- Signal Red für Grade, aktive Liste und CTA.
- Masken mit stabiler SSR-Geometrie rendern; keine clientseitige Layout-Ersetzung.
- Auf Mobile Hero zuerst, Rail direkt darunter, Evidence-Liste zuletzt.

## Eignung

**Fit: sehr hoch für die Übergänge.** Die Maskierungs- und Rail-Logik löst genau die gewünschte Trennung zwischen emotionalem Verdict und verständlicher Analyse.

