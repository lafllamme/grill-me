# Layout 02 — Image-led Editorial / Masked Sections

## Referenzen

- Layout: `02_layout.png`, `02_layout_1.png`, `02_layout_2.png`
- Mock: `02_mock.png`, `02_mock_1.png`, `02_mock_2.png`, `02_mock_full.png`

## Sichtbare Struktur

Das Mockup zeigt eine schmale, zentrierte Editorial-Seite auf einem großen blauen, wasserartigen Hintergrund. Die reale Seite beginnt mit einem großen Bild-Hero und einer prägnanten Überschrift. Danach folgen Text-Bild-Überlagerungen, unterschiedlich große Galerie-Kacheln, wechselnde Text- und Bildabschnitte sowie eine größere Quote- beziehungsweise Testimonial-Zone. Rechts steht eine monochrome Wireframe-Interpretation derselben räumlichen Abfolge.

## Räumliche Logik

02 arbeitet mit einem starken visuellen Einstieg und anschließendem Rhythmuswechsel. Der Hero nimmt viel Raum ein, während die folgenden Abschnitte bewusst unterschiedlich dicht sind. Bilder dürfen über Abschnittsgrenzen hinweg in den nächsten Bereich greifen. Maskierte oder weich gerundete Übergänge verhindern, dass die Seite wie eine Folge gleich großer Bento-Boxen wirkt.

## Charakteristische Mechanik

- Dominanter Hero statt vieler gleichgewichteter Karten.
- Wechselnde Bild-Text-Richtung erzeugt Bewegung ohne hektische Animation.
- Galerie- beziehungsweise Evidence-Karten besitzen unterschiedliche Größen.
- Maskierte Übergänge verbinden helle und dunkle Flächen.
- Testimonials und kurze Aussagen bekommen deutlich mehr Raum als technische Details.

## Adaption für Roast-1

02 ist die beste Grundlage für Roast-1. Die Struktur kann direkt auf die Roast-Hierarchie übertragen werden:

1. **Verdict-Hero:** Username, Roast-Level, Titel und Grade in einer großen, ruhigen Einstiegszone.
2. **Score-Matrix:** drei unterschiedlich gewichtete Score-Flächen für Stink, Spaghetti und Ego Damage.
3. **Roast / Fix:** Roast-Line und sachliches Feedback als wechselnder Text-Bild- beziehungsweise Text-Card-Abschnitt.
4. **Evidence-Galerie:** Commits, Dateien und Diff-Evidence in unterschiedlich großen, aber klar beschrifteten Karten.
5. **Abschluss:** kompakte Zusammenfassung mit konkreten Fixes und optionalem Receipt als sekundäres Artefakt.

Die Maskierung eignet sich besonders für den Übergang vom dunklen Verdict in eine helle Evidence-Fläche. Sie sollte die Abschnittsgrenze formen, nicht den Inhalt verstecken.

## Daten-Mapping

- Hero: `username`, `roastLevel`, `title`, `grade`.
- Primäre Aussage: erste `roastLine` und kurze `feedback`-Zusammenfassung.
- Score-Matrix: `stinkScore`, `spaghettiIndex`, `egoDamage` mit erklärenden Unterzeilen.
- Evidence-Galerie: `commits`, `files`, `diffEvidence`.
- Abschluss/Fix: `fixes` und verbleibende sachliche Handlungsempfehlungen.

## Design-System-Leitplanken

- Masken und Übergänge ausschließlich mit bestehenden Radius- und Surface-Tokens bauen.
- Basalt als dunkle Informationsfläche, Bone als warme Evidence-Fläche, Signal Red als aktive Linie oder Grade.
- Keine blaue Wasserästhetik aus dem Mock übernehmen; sie gehört zum Referenzmotiv, nicht zum GrillMe-System.
- Bricolage Grotesque sparsam für Verdict/Quote, Azeret Mono für alle Datenzeilen.
- Auf Mobile die Abfolge beibehalten: Verdict → Scores → Roast/Fix → Evidence.

## Eignung

**Fit: sehr hoch.** 02 liefert die passendste Grundarchitektur für eine informative Roast-Page mit klarer Dramaturgie, kontrollierter Maskierung und genug Raum für echte Insights.

