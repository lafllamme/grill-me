# Dashboard Profile Roles

> Die zentrale Rollenmatrix und die einzelnen Profilblätter stehen jetzt in
> [`profiles.md`](./profiles.md). Diese Datei bleibt als historische
> Gesprächsnotiz erhalten.

Arbeitsdokument für die Rollen, mit denen GrillMe ein Repository beschreibt und
roastet. Die Rollen werden aus den fünf Profilachsen und zusätzlicher Evidence
abgeleitet. Die Liste ist bewusst iterativ: Namen werden erst nach mehreren
Mock-Stories final festgeschrieben.

## Profilachsen

- **Clarity** — Lesbarkeit, Benennung, lokale Struktur und nachvollziehbare
  Patterns.
- **Safety** — Error Handling, Validierung, Daten- und Vertrauensgrenzen sowie
  Absicherung kritischer Pfade.
- **Workflow** — Commit-Granularität, Messages, Reihenfolge und nachvollziehbare
  Arbeitspakete.
- **Complexity** — Verschachtelung, Abhängigkeiten, Zyklen, Duplikation und
  unnötige Abstraktion.
- **Context** — Wie gut das Repository seine Absichten erklärt und eine sichere
  nächste Änderung ermöglicht.

Alle Werte laufen von `0–100`, wobei `100` immer ein starkes Signal bedeutet.
Eine Rolle ist kein Ersatz für die Note: Die Note bewertet die Gesamtqualität,
die Rolle beschreibt das charakteristische Arbeitsmuster.

## Aktuell festgehaltener Zwischenstand

Diese Rollen wurden im bisherigen Sparring als passend, witzig oder klar genug
markiert. Sie sind damit im jeweiligen Set aufgenommen, aber noch nicht als
endgültige Rollen-IDs implementiert.

### Positiv

| Rolle | Vorläufige Richtung |
| --- | --- |
| **Git Gardener** | Sehr hoher Workflow; kleine, präzise und nachvollziehbare Commits |

Weitere positive Muster, die gerade einzeln benannt werden:

| Muster | Status | Score-/Evidence-Muster | Aktuelle Namen |
| --- | --- | --- | --- |
| Sehr hohe Clarity | Festgelegt | Clarity `≥85`, Context `≥65`, Complexity `≥65` | `Human Compiler` |
| Sehr hohe Safety | Festgelegt | Safety `≥85`, Clarity `≥65`, Context `≥60` | `Edge-Case Sheriff` |
| Sehr hohe Complexity-Kontrolle | Festgelegt | Complexity `≥85`, Clarity `≥70`, Safety `≥65` | `Dependency Detective` |
| Überall stark | Festgelegt | alle fünf Werte `≥75` | `Ungrillable` |

`Naming Ninja`, `Syntax Sherlock`, `Readability Ranger`, `Semantic Sorcerer`,
`Logic Locksmith` und `10x Developer` bleiben außerhalb des aktuellen Sets.
Sie wurden durch `Human Compiler` beziehungsweise `Ungrillable` ersetzt.
Die Namen dürfen unterschiedliche Metaphern verwenden; entscheidend ist, dass
die Richtung des Scores und das beobachtete Verhalten verständlich bleiben.

### Gemischt

Noch keine Rolle ausgewählt.

### Negativ

| Rolle | Vorläufige Richtung |
| --- | --- |
| **Big-Bang Committer** | Große Sammel-Commits und schwache Workflow-Evidence |
| **Merge Conflict Magician** | Breite, schwer kontrollierbare Änderungsflächen und niedrige Complexity-Kontrolle |

Diese Liste ist der verbindliche Gesprächsstand. Neue Namensideen kommen nicht
automatisch in die Sets, sondern bleiben im Ideenpool, bis sie ausdrücklich
ausgewählt wurden.

## Namensprinzip

Die Rollen sollen wie kurze, merkbare Handles klingen:

- kein vorangestelltes „The“
- möglichst ein bis zwei Wörter
- übertrieben genug für einen Roast
- trotzdem aus dem beobachteten Verhalten erklärbar
- immer mit konkreter Evidence und einer konstruktiven Empfehlung verbunden

## Nächster Auswahlprozess

Wir wählen die Rollen setweise aus. Für jeden Namen prüfen wir:

1. Ist das Verhalten aus dem Namen erkennbar?
2. Passt der Name eindeutig in positiv, gemischt oder negativ?
3. Gibt es mindestens zwei messbare Evidence-Signale?
4. Liefert der Roast neben dem Witz eine konkrete Verbesserung?
5. Verwechselt der Name nicht Rolle, Note und einzelne Metrik?

Erst wenn diese Prüfung für eine Gruppe abgeschlossen ist, werden die Namen
als feste Rollen-IDs in den Mock-Datensatz übernommen.

Die positive Gruppe ist damit vorläufig vollständig. Als Nächstes werden die
gemischten Profile nach demselben Muster ausgearbeitet.
