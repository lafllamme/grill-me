# Layout 08 — Collection Preview / Dominant Visual

## Referenzen

- Layout: `08_layout.png`
- Mock: `08_mock.png`

## Sichtbare Struktur

08 sitzt in einer breiten hellen Shell auf einem warmen Landschaftshintergrund. Die Navigation kombiniert Kategorie-Pills mit einem CTA. Oben stehen mehrere kleine Vorschaukarten. Darunter folgen eine große Editorial-Überschrift und ein kurzer Beschreibungstext. Eine dominante Bildfläche nimmt den rechten und unteren Raum ein und trägt vertikale Nummern, kleine Labels und weitere Metadaten.

## Räumliche Logik

Die Seite führt von einer Auswahlübersicht in ein einzelnes Hauptobjekt. Kleine Karten sind nicht die eigentliche Informationstiefe, sondern dienen als Index oder Einstieg. Die dominante Fläche erhält den meisten Raum und wird mit wenigen präzisen Labels annotiert.

## Charakteristische Mechanik

- Vorschau-Karten funktionieren als Sammlung oder Index.
- Ein dominantes Hauptobjekt übernimmt die visuelle Führung.
- Nummern und Labels geben Orientierung im Hauptobjekt.
- Navigation und CTA bleiben kompakt und funktional.

## Adaption für Roast-1

08 eignet sich für die Roast-Runden und die Evidence-Navigation:

- kleine Vorschaukarten: Roast-Line, Score, Fix, Commit oder File als auswählbare Abschnitte;
- große Hauptfläche: aktuell ausgewählte Roast- oder Fix-Karte;
- vertikale Nummerierung: Runde beziehungsweise Evidence-Reihenfolge;
- linke Textzone: Titel, Grade und kurze Zusammenfassung.

Das Muster macht den vorhandenen interaktiven Card Stack verständlicher, solange die Auswahl tatsächlich den Hauptinhalt wechselt und nicht nur dekorative Pills zeigt.

## Daten-Mapping

- Vorschauen: `roastLines`, `feedback`, `fixes`, Commits und Dateien.
- Hauptfläche: aktuell ausgewählte Zeile oder Evidence-Detail.
- Nummern: stabile Indexwerte aus der vorhandenen Reihenfolge.
- Labels: Evidence-Typ, betroffene Datei oder Commit, sofern vorhanden.

## Design-System-Leitplanken

- Keine frei erfundenen Kategorien; Labels müssen aus dem Vertrag oder aus klaren UI-Begriffen stammen.
- Signal Red für den aktiven Index, Basalt/Bone für die Flächen.
- Interaktionszustände für Preview-Karten vollständig ausarbeiten: default, hover, focus-visible, active, disabled.
- Mobile: Vorschauen horizontal scrollen, Hauptinhalt darunter als eine Karte.

## Eignung

**Fit: hoch für die Evidence-/Round-Navigation.** 08 ist weniger passend als Hauptlayout, aber stark für einen fokussierten, interaktiven Roast- und Fix-Explorer.

