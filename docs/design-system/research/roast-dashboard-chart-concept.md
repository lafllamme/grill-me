# Roast Dashboard: Chart-Konzept

Status: MVP-Konzept, explorativ. API-Verträge bleiben unverändert; zusätzliche Dashboard-Daten dürfen zunächst gemockt werden.

## Leitentscheidung

Das Dashboard soll nicht möglichst viele Scores zeigen. Es soll nachvollziehbar erklären, was die AI aus Repository, Commits und Dateien ableitet:

- Was wurde untersucht?
- Was ist auffällig?
- Wie belastbar ist die Aussage?
- Was sollte der Nutzer als Nächstes ändern?

Jede Kennzahl braucht eine Definition, eine nachvollziehbare Quelle und sichtbare Evidenz. Begriffe wie „Human Readability“ sind nur sinnvoll, wenn klar ist, welche Code-Merkmale den Wert beeinflussen.

## Priorisierte Charts

### 1. Ring Chart — Profil- und Dimensionswerte

**Priorität: gesetzt.** Bereits als Vue-Port umgesetzt.

Geeignet für wenige, klar benannte Dimensionen: Human Readability, Testability, Maintainability und Complexity. Der Ring zeigt den aktuellen Wert; die Legend erklärt Wert, Prozent und kurze Evidenz. Die Bklit-Implementierung unterstützt animierte Arcs, Hover-Sync, Center-Value und Legend-Interaktion. [Referenzseite](https://bklit.com/charts/ring-chart)

### 2. Radar Chart — Profilform

**Priorität: sehr hoch.** Beste Darstellung für die Frage „Wie ist dieser Codebase-Typ insgesamt?“

Ein Radar eignet sich für fünf bis sechs stabile Dimensionen und kann ein aktuelles Profil gegen ein neutrales Zielprofil oder gegen den vorherigen Roast legen. Es darf nicht gleichzeitig mit weiteren Score-Systemen konkurrieren.

### 3. Area / Line Chart — Veränderung über Commit-Zeit

**Priorität: sehr hoch.** Der Zeitbezug kommt aus Commits, nicht aus erfundenen Business-Daten.

Sinnvolle Reihen sind Commits pro Zeitraum, Files changed, Lines added/deleted, Change volume und optional das Verhältnis von Additions zu Deletions. Area eignet sich für eine ruhige Entwicklungskurve; Line für präzise Marker, Tooltips und einzelne Ereignisse. Beide Varianten besitzen Loading- und Selection-Zustände. [Area-Varianten](https://bklit.com/charts/area-chart)

### 4. Bar Chart — Vergleichbare Mengen

**Priorität: hoch.** Bars sind die belastbarste Darstellung für Counts: Dateien nach Sprache, Dateien nach Änderungsvolumen, Commit-Anzahl pro Zeitraum, Testdateien vs. Produktionsdateien und Top-Dateien nach Änderungsfrequenz. Loading, grouped und stacked Varianten sind für den Roast besonders nützlich. Nicht als dekorative Balken für beliebige Scores verwenden.

### 5. Composed Chart — Volumen plus Richtung

**Priorität: hoch.** Bars für Commit-/Dateivolumen können mit einer Line für Additions, Deletions oder einen klar definierten Trend verbunden werden. Das ist der beste Kandidat für eine größere „Commit Evidence“-Karte.

Wichtig: eine Zeitachse, eine Erklärung, maximal zwei bis drei Reihen. Die Bibliothek unterstützt Bar + Line, Stacking, Marker, Loading und Projektionen. [Composed-Varianten](https://bklit.com/charts/composed-chart)

### 6. Sunburst Chart — Repository-Anatomie

**Priorität: hoch, aber erst nach Datenklärung.** Geeignet für Repository → Ordner → Datei, untersuchte Dateien und Change Volume sowie Hotspots nach Verzeichnis. Das ist kein Score-Chart, sondern erklärt, woher das Roast-Urteil kommt. Drill-down und Hover müssen auf konkrete Dateien zurückführen. [Sunburst-Chart](https://bklit.com/charts/sunburst-chart)

### 7. Gauge — ein einzelner, belastbarer Status

**Priorität: mittel.** Gauge nur für einen klaren Gesamtstatus verwenden, etwa „Maintainability risk“ oder einen Roast-Grade. Nicht parallel zu Ring und Radar für dieselben Dimensionen einsetzen. [Gauge-Varianten](https://bklit.com/charts/gauge-chart)

## Später prüfen

### Heatmap

Sinnvoll für Commit-Aktivität nach Wochentag/Stunde oder für Datei-Hotspots. Nur verwenden, wenn genug Commit- und Zeitdaten existieren. Eine Heatmap aus wenigen Mock-Punkten wäre irreführend.

### Scatter Chart

Potenzial für „Change Frequency vs. File Size“ oder „Complexity vs. Test Coverage“. Gute Analyseansicht, aber kein Hero-Chart. Beide Achsen und die Bedeutung eines Punktes müssen erklärt werden.

### Choropleth Chart

Technisch interessant, produktseitig aber optional. Eine IP-basierte Region ist keine Codequalität und kann privacy-seitig unangenehm wirken. Wenn überhaupt, dann als separate, consent-basierte Kontextkarte — nicht als Roast-Beweis.

## Bewusst überspringen

- **Candlestick:** Finanzmetapher ohne natürliche Roast-Daten.
- **Funnel:** Kein echter linearer Conversion-Prozess im Roast.
- **Pie:** Überschneidet sich mit Ring/Donut und ist für Vergleiche schwächer.
- **Sankey:** Kein sinnvoller Fluss, solange keine echte Datenflussfrage beantwortet wird.
- **Live Line:** Der Roast ist zunächst ein Snapshot. Live-Motion darf Analysefortschritt zeigen, aber keine künstlich live wirkende Code-Metrik.

## Empfohlene Dashboard-Struktur

### Variante A — Verdict / Profile

1. Roast-Headline und Note
2. Radar als Gesamtprofil
3. Ring als interaktive Detailaufschlüsselung
4. Evidence-Karte mit Commit-/Datei-Counts
5. konkrete Aftermath-Empfehlung

### Variante B — Investigation Timeline

1. Headline und untersuchter Zeitraum
2. Composed Chart für Commits, Additions und Deletions
3. Bar Chart für Sprachen, Dateien oder Hotspots
4. ausgewählte Commit-Evidenz
5. Roast-Fazit

### Variante C — Repository Anatomy

1. Headline und Gesamtprofil
2. Sunburst für Repo-/Dateihierarchie
3. Scatter für Change Frequency vs. File Size oder Complexity
4. Liste der wichtigsten Beweisdateien
5. priorisierte Handlungsempfehlungen

Für das MVP ist Variante A der stärkste Einstieg. B und C sind eigenständige Dashboard-Nodes für die nächste Explorationsrunde, nicht zusätzliche Karten, die alle gleichzeitig auf die erste Seite müssen.

## Daten, die der Agent später liefern sollte

```ts
type RoastMetric = {
  key: string
  label: string
  value: number
  maxValue: number
  definition: string
  evidence: string[]
}

type RoastTimelinePoint = {
  date: string
  commits: number
  filesChanged: number
  additions: number
  deletions: number
}

type RoastRepositoryNode = {
  name: string
  kind: 'repository' | 'directory' | 'file'
  value: number
  children?: RoastRepositoryNode[]
}
```

Diese Shapes sind Konzeptdaten und noch kein API-Vertrag. Bis die API erweitert wird, bleiben sie lokale Fixtures.

## Source-of-Truth- und Portierungsregel

Die Bklit-Website ist die visuelle Referenz; das öffentliche GitHub-Repository ist die technische Source of Truth. Vor jeder neuen Komponente werden Preview, Props, Animation, Hover-Verhalten und Loading-Zustand auf der Seite geprüft und anschließend im Repository gegengecheckt.

Die Originale sind React-Komponenten. Wir importieren sie nicht blind in Nuxt, sondern portieren ihr Verhalten nach Vue: Props, Arc-/Chart-Geometrie, Animation-Timing, Zustandsmodell und Interaktionen bleiben semantisch gleich. Die Vue-Komponente darf zusätzliche Adaptertypen besitzen, aber keine neue Produktlogik erfinden.

Referenzen: [Bklit Charts](https://bklit.com/charts/), [Bklit GitHub](https://github.com/bklit/bklit-ui).
