# Layout 05 — Central Product Stage / Supporting Rails

## Referenzen

- Layout: `05_layout.png`
- Mock: `05_mock.png`

## Sichtbare Struktur

05 verwendet eine breite dunkle Shell mit kompakter Navigation. Ein dominanter vertikaler Bild- oder Produkt-Stage sitzt in der Mitte. Links liegt eine schmale Text- und Metadaten-Rail, rechts eine dichtere Detail-Rail. Kleine Labels oder Controls dürfen in den zentralen Stage hineinragen.

## Räumliche Logik

Die mittlere Fläche ist der Blickfang und die beiden Rails beantworten zwei unterschiedliche Fragen: Was ist das? und Was sind die Details? Die Komposition ist eher eine Produktdetailseite als ein klassisches Karten-Dashboard.

## Charakteristische Mechanik

- Zentraler Stage mit hoher visueller Priorität.
- Linke Rail für Kontext und Identität.
- Rechte Rail für technische Details und Zustände.
- Kleine Overlays können den Stage annotieren.

## Adaption für Roast-1

05 eignet sich, wenn der Grade und der Roast-Titel maximal präsent sein sollen:

- linke Rail: Username, Level, Datenumfang und kurze Interpretation;
- zentraler Stage: Titel, Grade und primäre Roast-Line;
- rechte Rail: Score-Matrix, Feedback und Fix-CTA.

Evidence sollte nicht gleichzeitig in die rechte Rail und den Stage gelegt werden. Sie bleibt unterhalb oder in einem ausklappbaren Abschnitt, damit die zentrale Aussage lesbar bleibt.

## Daten-Mapping

- Linke Rail: `username`, `roastLevel`, Commit-/File-Counts.
- Stage: `title`, `grade`, `roastLines`.
- Rechte Rail: `stinkScore`, `spaghettiIndex`, `egoDamage`, `feedback`, `fixes`.
- Unterer Bereich: `diffEvidence` und Commit-/File-Details.

## Design-System-Leitplanken

- Basalt als Stage und Rail-Grundfläche, Bone für kontrastierende Evidence-Flächen.
- Signal Red nur für Grade, aktive Markierungen und Fix-CTA.
- Overlays mit kleinem technischem Radius und klarer z-index-Hierarchie bauen.
- Keine 3D- oder Fotorealismus-Anmutung aus der Referenz übernehmen.

## Eignung

**Fit: hoch für eine fokussierte Roast-Detailansicht.** 05 ist besonders geeignet, wenn Roast-1 weniger wie ein Dashboard und mehr wie ein Urteil mit Beweisführung wirken soll.

