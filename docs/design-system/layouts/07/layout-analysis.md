# Layout 07 — Image Stage / Floating Metrics

## Referenzen

- Layout: `07_layout.png`
- Mock: `07_mock.png`

## Sichtbare Struktur

07 verwendet eine breite helle Shell auf einem dunklen Interior-Hintergrund. Oben steht eine kleine Navigation. Eine sehr große typografische Aussage liegt über beziehungsweise vor einer großen gerundeten Innenraumaufnahme. Kleine Metrik-Karten sitzen als ruhige Overlays am oberen Rand. Unten ergänzen Caption, CTA, Statistik und Testimonial-Pill die Stage.

## Räumliche Logik

Die große Stage trägt gleichzeitig Bild und Aussage. Die kleinen Karten schweben darüber und liefern Kontext, ohne den Blickfang zu zerlegen. Die Inhalte sind nicht gleichberechtigt verteilt; die Bühne bleibt klar dominant.

## Charakteristische Mechanik

- Große gerundete Stage als Hauptobjekt.
- Typografie sitzt teilweise über dem Bild.
- Kleine Metriken schweben an kontrollierten Ankerpunkten.
- Caption und CTA bilden eine ruhige Fußzeile.

## Adaption für Roast-1

07 eignet sich für einen reduzierten Roast-Hero:

- Stage: Titel, Grade und kurze Roast-Line.
- Floating Metrics: drei Scores als kleine, verankerte Cards.
- Untere Caption: sachliche Einordnung oder ein kurzer Fix-Satz.
- Testimonial-Pill: optional eine besonders prägnante Evidence-Aussage.

Die Scores sollten nicht über dem Text schweben, wenn sie die Lesbarkeit beeinträchtigen. Zwei bis drei feste Ankerpositionen reichen; auf Mobile werden sie als lineare Zeile unter dem Hero ausgegeben.

## Daten-Mapping

- Stage: `title`, `grade`, erste `roastLine`.
- Metrics: die drei Score-Felder mit Kurzdefinition.
- Caption: `feedback`-Zusammenfassung.
- Testimonial/Evidence: ausgewählte Commit- oder Diff-Evidence.

## Design-System-Leitplanken

- Bone Stage auf Basalt-Seite oder Basalt Stage auf Bone-Surface, abhängig von der Section.
- Floating Cards mit dokumentierten Card-Radien und klarer Elevation.
- Bricolage Grotesque für den großen Titel, Azeret Mono für Metriken.
- Overlays müssen in DOM-Reihenfolge und Fokus-Reihenfolge nachvollziehbar bleiben.

## Eignung

**Fit: hoch für den Verdict-Hero.** 07 ist eine gute Referenz für starke Aussage plus Scores, aber nicht für die vollständige Evidence-Tiefe.

