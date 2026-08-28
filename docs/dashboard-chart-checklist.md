# Dashboard Chart Checklist

Kurze Arbeitsliste für die Charts im GrillMe-Roast-Dashboard.

## Grundidee

Die Charts machen sichtbar, warum ein Repository den Roast verdient. Sie
unterstützen Verdict, Profil, zeitliche Entwicklung und Commit-Evidence. Sie
ersetzen nicht die Erklärung des Roasts und erzeugen keine unbegründeten
Scores.

## Verbindliche Portierung

Für jeden Chart sind die verlinkte Dokumentation und der verlinkte GitHub-Code
die einzige Implementierungsquelle. Vor dem Coding:

- [ ] Dokumentationsseite vollständig prüfen.
- [ ] Showcase-Variante und Dataset identifizieren.
- [ ] Alle Imports und abhängigen Subcomponents im Repository verfolgen.
- [ ] Props, Defaults, Datenform, Geometrie und responsive Größen übernehmen.
- [ ] Motion, Entrance-Animation, Hover, Loading, Empty und Reduced Motion übernehmen.
- [ ] Die ausgewählte Variante in Vue portieren, ohne visuelle Eigeninterpretation.
- [ ] Im Browser gegen Dokumentation und Showcase vergleichen.
- [ ] Erst danach in das Dashboard einsetzen und als erledigt markieren.

Eine bewusste Abweichung wird vor der Umsetzung hier dokumentiert.

### Radar-Entrance-Referenz

Die offizielle Radar-Animation läuft phasenweise: Grid-Level expandieren zuerst,
danach wachsen die Achsen, die Grid-Werte und Labels faden gestaffelt ein, und
anschließend expandieren die Areas und ihre Punkte. Die Labelpositionen nutzen
Springs, Grid und Areas den offiziellen 1100ms-Reveal-Tween. Diese Reihenfolge
ist Teil der Portierung und darf nicht durch eine gemeinsame CSS-Animation
ersetzt werden.

## Chart-Auswahl

| Status | Chart | Dashboard-Rolle | Dokumentation | GitHub-Code | Nächster Schritt |
| --- | --- | --- | --- | --- | --- |
| [x] | Ring Chart | Kompakte Profil-Zusammenfassung | [Docs](https://bklit.com/docs/components/ring-chart) | [Source](https://github.com/bklit/bklit-ui/tree/main/packages/ui/src/charts) | Mit echten Profilwerten verbinden |
| [x] | Radar Chart | Gesamtprofil über mehrere Dimensionen | [Docs](https://bklit.com/docs/components/radar-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/radar-chart.tsx) | Mit echten Profilwerten verbinden |
| [x] | Bar Chart | Additions, Deletions und Commit-Volumen | [Docs](https://bklit.com/docs/components/bar-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/bar-chart.tsx) | Mit Commit-Evidence verbinden |
| [ ] | Line Chart | Entwicklung eines Signals über Zeit | [Docs](https://bklit.com/docs/components/line-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/line-chart.tsx) | Als nächstes portieren |
| [ ] | Gauge | Ein einzelnes Verdict, z. B. Testability | [Docs](https://bklit.com/docs/components/gauge) | [Source](https://github.com/bklit/bklit-ui/tree/main/packages/ui/src/charts) | Erst nach erklärbarem Score entscheiden |
| [ ] | Composed Chart | Volumen und Trend in einer Evidence-Ansicht | [Docs](https://bklit.com/docs/components/composed-chart) | [Source](https://github.com/bklit/bklit-ui/tree/main/packages/ui/src/charts) | Nach dem Line Chart evaluieren |

## Reihenfolge

1. Ring Chart — erledigt.
2. Bar Chart — erledigt.
3. Radar Chart — erledigt.
4. Line Chart — als nächstes.
5. Composed Chart — nur wenn Bar und Line gemeinsam einen echten Mehrwert liefern.
6. Gauge — optional für ein einzelnes, erklärbares Verdict.

## Aktueller Stand

- Daten sind zunächst explizit als Mock-Daten markiert.
- Der API-Vertrag bleibt unverändert.
- Keine weiteren Charts hinzufügen, nur weil eine freie Fläche existiert.
- Kein Chart gilt als portiert, bevor Verhalten und Darstellung im Browser geprüft wurden.
