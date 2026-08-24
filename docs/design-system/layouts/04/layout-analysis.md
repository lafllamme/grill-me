# Layout 04 — Rounded Bento / Framed Product Shell

## Referenzen

- Layout: `04_layout.png`
- Mock: `04_mock.png`

## Sichtbare Struktur

04 sitzt als breite, stark gerundete helle Shell auf einem dunklen fotografischen Hintergrund. Eine kompakte Utility-Navigation liegt am oberen Rand. Im Inneren befindet sich ein asymmetrisches Drei-Spalten-Bento: links ein großes dunkles Feature, in der Mitte zwei kleinere gestapelte Karten, rechts ein hohes dunkles Feature. Kleine helle Metadatenleisten liegen innerhalb der Karten.

## Räumliche Logik

Die Shell ist der ruhige Rahmen; das Bento darin ist die aktive Inhaltsfläche. Links und rechts stehen die dominanten Flächen, während die Mitte als schmaler Informationsstapel funktioniert. Das erzeugt Hierarchie, ohne auf eine lineare Dashboard-Tabelle zurückzufallen.

## Charakteristische Mechanik

- Große Radius-Shell mit deutlicher Außenkante.
- Drei-Spalten-Bento mit dominanten Randkarten.
- Kleine sekundäre Karten als Belege oder Statusflächen.
- Externe Floating-Control unterhalb der Shell.

## Adaption für Roast-1

04 ist sehr gut als übergeordneter Desktop-Rahmen:

- links: Username, Roast-Level und Receipt/Score-Receipt;
- Mitte: Verdict-Titel, Grade und zentrale Roast-Line;
- rechts: interaktiver Roast-/Fix-Stack oder Evidence-Auswahl.

Die Mitte sollte nicht mit drei gleich großen Karten überladen werden. Die große zentrale Aussage bleibt dominant; die Bento-Logik dient nur der räumlichen Verteilung der drei Informationsrollen.

## Daten-Mapping

- Linke Rail: `username`, `roastLevel`, Counts und optional Receipt.
- Mitte: `title`, `grade`, primäre `roastLine`.
- Rechte Rail: `feedback`, `fixes`, Commit-/File-Evidence als auswählbare Karten.

## Design-System-Leitplanken

- Shell-Radius aus dem 24+-Tokenbereich; Kartenradius aus dem 16er-Bereich.
- Basalt für die dunklen Karten, Bone oder dokumentierte helle Surface für Receipts.
- Die Shell selbst darf nicht mit der Receipt-Bewegung animieren.
- Mobile wird aus vier Spalten auf eine lineare Reihenfolge reduziert; die physische Priorität bleibt erhalten.

## Eignung

**Fit: sehr hoch für den Desktop-Rahmen.** 04 liefert die beste Bento-Komposition für das bestehende Roast-Layout, sollte aber mit der editorialen Dramaturgie aus 02 verbunden werden.

