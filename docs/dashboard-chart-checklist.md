# Dashboard Chart Checklist

Kurze Arbeitsliste für die Charts im GrillMe-Roast-Dashboard.

## Ziel

Die Charts machen sichtbar, warum ein Repository den Roast verdient. Das
Dashboard bleibt dabei einfach: Verdict, Profil, Evidence und erst danach
Details. Mock-Daten sind erlaubt, müssen aber als solche erkennbar bleiben.

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

### Profilachsen-Konzept

Für das Radar sind vier Achsen fachlich bestätigt:

- **Clarity** — Wie schnell lässt sich der Code verstehen? Dazu gehören
  Benennung, lokale Lesbarkeit, Struktur und konsistente Patterns.
- **Safety** — Wie robust und sicher geht der Code mit Fehlern, Daten und
  Vertrauensgrenzen um?
- **Workflow** — Wie sauber, granular und nachvollziehbar wird Arbeit geliefert
  und in Git festgehalten?
- **Complexity** — Wie gut wird strukturelle und architektonische Komplexität
  kontrolliert?

Als fünfte Achse ist **Context** aktuell der stärkste Kandidat. Sie bewertet
nicht die Anzahl von Dokumentationsdateien, sondern ob das Repository seine
Absichten, Entscheidungen und den Weg zur nächsten sicheren Änderung erklärt.
Mögliche Evidence sind README-/Setup-Qualität, Architekturhinweise, relevante
Kommentare, API-Kontext, Aktualität und Auffindbarkeit. „Context“ ist damit
bewusst etwas anderes als „Clarity“: Clarity erklärt den Code selbst, Context
erklärt, warum und wie das Projekt als Ganzes funktioniert.

Die Alternativen **Docs**, **Guidance** und **Orientation** bleiben bis zur
finalen Mock-Story offen. `Docs` soll nicht als bloße Dokumentationsquote
interpretiert werden.

## Chart-Auswahl und Quellen

| Status | Chart | Dashboard-Rolle | Dokumentation | GitHub-Code | Nächster Schritt |
| --- | --- | --- | --- | --- | --- |
| [x] | Ring Chart | Kompakte Profil-Zusammenfassung | [Docs](https://bklit.com/docs/components/ring-chart) | [Source](https://github.com/bklit/bklit-ui/tree/main/packages/ui/src/charts) | Mit echten Profilwerten verbinden |
| [x] | Radar Chart | Gesamtprofil über mehrere Dimensionen | [Docs](https://bklit.com/docs/components/radar-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/radar-chart.tsx) | Mit echten Profilwerten verbinden |
| [x] | Bar Chart | Additions, Deletions und Commit-Volumen | [Docs](https://bklit.com/docs/components/bar-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/bar-chart.tsx) | Mit Commit-Evidence verbinden |
| [x] | Line Chart | Entwicklung eines Signals über Zeit | [Docs](https://bklit.com/docs/components/line-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/line-chart.tsx) | Mit echten Zeitreihendaten verbinden |
| [x] | Gauge | Commitfrequenz im Analysezeitraum, auf eine 100-Commit-Skala normalisiert | [Docs](https://bklit.com/docs/components/gauge-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/gauge.tsx) | Mit echter API-Evidence verbinden |
| [x] | Sunburst Chart | Repository-Struktur und Churn nach Verzeichnis/File-Hierarchie | [Docs](https://bklit.com/docs/components/sunburst-chart) | [Source](https://github.com/bklit/bklit-ui/blob/main/packages/ui/src/charts/sunburst-chart.tsx) | Mit echter API-Evidence verbinden |
| [-] | Composed Chart | Nicht erforderlich: Bar und Line decken die Evidence-Fragen bereits getrennt ab | [Docs](https://bklit.com/docs/components/composed-chart) | [Source](https://github.com/bklit/bklit-ui/tree/main/packages/ui/src/charts) | Aus dem Dashboard-Scope entfernt |

## Reihenfolge

1. Ring Chart — erledigt.
2. Bar Chart — erledigt.
3. Radar Chart — erledigt.
4. Line Chart — erledigt.
5. Gauge — erledigt als erklärbare Explorer-Karte.
6. Sunburst — erledigt als erklärbare Explorer-Karte.
7. Composed Chart — gestrichen; Bar und Line bleiben getrennte Evidence-Ansichten.

## Aktueller Stand

- Daten sind zunächst explizit als Mock-Daten markiert.
- Die vier Mock-Profile sind direkt über `01` bis `04` auswählbar und befüllen
  alle Dashboard-Karten aus demselben Profil-Datensatz.
- Das Radar verwendet fünf nachvollziehbare Kategorien mit je einem Wert von
  `0–100`. Jeder Wert ist ein Punkt auf einer Kategorieachse; die verbundenen
  Punkte bilden die eine Profilfläche. Eine zusätzliche Fläche wird nicht
  künstlich ergänzt, nur damit das Diagramm voller wirkt.
- Die Radar-Legende zeigt den Namen des aktiven Profils und dessen errechneten
  Durchschnitt. Ring, Gauge, Timeline, Change Volume und Sunburst wechseln mit
  dem ausgewählten Mock-Profil.
- Der API-Vertrag bleibt unverändert.
- Keine weiteren Charts hinzufügen, nur weil eine freie Fläche existiert.
- Kein Chart gilt als portiert, bevor Verhalten und Darstellung im Browser geprüft wurden.
- Die vorläufigen Roast-Rollen und ihre Score-/Evidence-Muster stehen in
  [dashboard-profile-roles.md](./dashboard-profile-roles.md).

## Nächster Schritt

**Sunburst** ist als Explorer-Karte umgesetzt. Für die nächste Iteration:

- [x] Dokumentation und Showcase vollständig prüfen.
- [x] Exakten GitHub-Entry-Point und alle Imports erfassen.
- [x] Passende Roast-Frage festlegen: Wie viel Commit-Scope erzeugt Review-Druck?
- [x] Mock-Dataset und spätere API-Felder getrennt dokumentieren.
- [x] Nach Browser-Abgleich in den Dashboard-Flow übernehmen.
- [x] Repository-Hierarchie, Hover-Dimming, Hover-Grow und Drill-down im Browser prüfen.
