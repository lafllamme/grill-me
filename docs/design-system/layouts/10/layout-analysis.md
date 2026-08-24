# Layout 10 — Operations Dashboard / Evidence Control Room

## Referenzen

- Layout: `10_layout.png`
- Mock: `10_mock.png`

## Sichtbare Struktur

10 zeigt ein dichtes, dunkles Smart-Home- beziehungsweise Operations-Dashboard in einer breiten, leicht transparenten Shell auf einem fotografischen Hintergrund. Links sitzt eine persistente Icon-Rail. In der Mitte liegt ein großer Hero mit Navigation. Rechts steht eine vertikale Liste für Räume oder Zustände. Unten folgen mehrere operative Karten mit Bild, Status und Medien-/Kontrollinformationen.

## Räumliche Logik

Das Layout organisiert viele gleichzeitige Zustände über feste Verantwortungsbereiche: Navigation links, Hauptstatus in der Mitte, Auswahl rechts und Aktionen unten. Es ist für wiederholte Steuerung und Monitoring optimiert, nicht für eine einzelne expressive Aussage.

## Charakteristische Mechanik

- Persistente Seiten-Rail.
- Großer zentraler Status- beziehungsweise Media-Hero.
- Rechte Liste für Auswahl und Filter.
- Untere Karten für parallele operative Details.
- Viele kleine Controls und Status-Chips.

## Adaption für Roast-1

10 sollte nicht als Hauptlayout verwendet werden. Es ist sinnvoll für eine spätere Evidence- oder Debug-Ansicht:

- linke Rail: Roast-Runden und Abschnittsnavigation;
- Mitte: aktueller Roast, Fix oder Diff;
- rechts: Scores, betroffene Dateien oder Evidence-Index;
- unten: parallele Commit-, File- und Test-Details.

Für die publikumstaugliche Roast-Page wäre die Dichte zu hoch. Die klare Rail-Logik kann aber helfen, eine separate Analyseansicht von der emotionalen Ergebnisansicht zu trennen.

## Daten-Mapping

- Rail: stabile Abschnitts- oder Rundenindizes.
- Mitte: aktuell ausgewählte `roastLine`, `feedback`, `fix` oder Diff-Evidence.
- Rechte Liste: Score- und Evidence-Auswahl.
- Untere Karten: Commits, Dateien und technische Detailinformationen.

## Design-System-Leitplanken

- Controls klein und technisch halten, aber mit sichtbaren Fokus- und Disabled-Zuständen.
- Azeret Mono für Status/Metadata; General Sans für erklärende Inhalte.
- Basalt als Strukturfläche, Bone nur für fokussierte Detailkarten.
- Keine dauerhafte Bewegung in Navigation oder Statusflächen; Motion nur bei Auswahlwechseln.

## Eignung

**Fit: mittel für eine sekundäre Evidence-Ansicht, niedrig für den Roast-Hero.** 10 ist stark, wenn viele Daten effizient navigiert werden müssen, würde aber die wichtigste Roast-Aussage zu stark in ein Kontrollzentrum verwandeln.

