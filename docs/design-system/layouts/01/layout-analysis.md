# Layout 01 — Editorial Split / Visual Blueprint

## Referenzen

- Layout: `01_layout.png`, `01_layout_1.png`, `01_layout_2.png`
- Mock: `01_mock.png`, `01_mock_1.png`, `01_mock_2.png`, `01_mock_full.png`

## Sichtbare Struktur

Das Mockup zeigt eine schmale, zentrierte Website auf einem vollflächigen, texturierten Hintergrund. Die linke Hälfte ist die ausgearbeitete visuelle Seite, die rechte Hälfte bleibt als graue Wireframe- beziehungsweise Blueprint-Ansicht sichtbar. Die reale Seite arbeitet mit großen fotografischen Flächen, typografischen Überschriften, Bild-Text-Splits und kleineren Kartenrastern.

## Räumliche Logik

Die Seite ist nicht als klassisches Dashboard organisiert. Sie wirkt wie eine kontrollierte Präsentation innerhalb eines begrenzten Viewports. Große Bildflächen bilden jeweils den Abschnittsanker; Text, Metadaten und kleinere Karten werden an diese Anker angelegt. Der Split zwischen fertigem Design und Wireframe ist Teil des Präsentationskonzepts, nicht der Produktoberfläche.

## Charakteristische Mechanik

- Ein zentraler Seitenrahmen sitzt auf einem atmosphärischen Hintergrund.
- Bildflächen übernehmen die visuelle Führung.
- Text- und Bildbereiche wechseln sich in klaren, vertikalen Abschnitten ab.
- Kleine Karten strukturieren Details, ohne den Hero zu dominieren.
- Der Wireframe-Split erklärt die Konstruktion, wäre aber für eine fertige Roast-Seite zu technisch.

## Adaption für Roast-1

Als direkte Seitenstruktur ist 01 nur bedingt geeignet. Übernehmen würde ich die Trennung zwischen einem starken Verdict-Bereich und einer klar abgegrenzten Evidence-Zone:

1. Oben: Username, Roast-Level und Titel als kompakter Identitätsblock.
2. Darunter: großer Verdict-Hero mit Grade und einer einzigen zentralen Roast-Aussage.
3. Danach: ein Bild- beziehungsweise Kartenraster für Scores, Feedback/Fixes und Evidence.

Die Wireframe-Hälfte sollte nicht in die fertige Produktansicht gelangen. Ihr Nutzen liegt eher als internes Konzept für die Informationsarchitektur: links die verständliche Aussage, rechts die Belege, die sie nachvollziehbar machen.

## Daten-Mapping

- `username`, `roastLevel`, `grade`, `title`: Identitäts- und Verdict-Bereich.
- `roastLines`: große Aussage oder zitierfähige Pull-Quote.
- `stinkScore`, `spaghettiIndex`, `egoDamage`: kompakte Score-Karten.
- `feedback` und `fixes`: darunterliegende erklärende Karten.
- `commits`, `files`, `diffEvidence`: sekundäres Evidence-Raster.

## Design-System-Leitplanken

- Basalt als struktureller Hintergrund, Bone nur für wichtige Kontrastflächen.
- Signal Red ausschließlich für Grade, aktive Zustände und entscheidende Markierungen.
- General Sans für UI und Bricolage Grotesque nur für den expressiven Verdict-Titel.
- Azeret Mono für Scores, technische Metadaten und Evidence.
- Keine Wireframe-Graus als neue Produktfarben und keine zusätzlichen Farbverläufe.

## Eignung

**Fit: mittel.** Die redaktionelle Hierarchie ist wertvoll, der sichtbare Wireframe-Split aber nicht. Für Roast-1 eignet sich 01 vor allem als Strukturreferenz für Hero, Aussage und nachgelagerte Belege.

