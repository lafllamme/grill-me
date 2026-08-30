# Dashboard Profiles

Arbeitsgrundlage für die Profilrollen im GrillMe-Dashboard. Die Rollen werden
aus fünf normalisierten Achsen und konkreter GitHub-Evidence abgeleitet. Die
Dokumentation trennt dabei bewusst zwischen Score, Rolle und Note:

- **Score** beschreibt eine einzelne Eigenschaft von `0–100`.
- **Rolle** beschreibt ein wiederkehrendes Arbeitsmuster.
- **Note** beschreibt die Gesamtbewertung des Repositories.

## Profilachsen

| Achse | Was gemessen wird |
| --- | --- |
| **Clarity** | Lesbarkeit, Benennung, lokale Struktur und nachvollziehbare Patterns |
| **Safety** | Error Handling, Validierung, Tests sowie Daten- und Vertrauensgrenzen |
| **Workflow** | Commit-Granularität, Messages, Reihenfolge und nachvollziehbare Arbeitspakete |
| **Complexity** | Kontrolle von Verschachtelung, Abhängigkeiten, Zyklen, Duplikation und Abstraktion |
| **Context** | Dokumentation, Projektorientierung und Erklärbarkeit der nächsten Änderung |

Ein hoher Wert ist immer gut. Bei **Complexity** bedeutet ein hoher Wert also
gute Komplexitätskontrolle, nicht mehr Komplexität.

## Rollenmatrix

`—` bedeutet: Für die Rolle gibt es auf dieser Achse keinen eigenen
Spezialschwellwert. Unterstützende Mindestwerte verhindern trotzdem, dass eine
Rolle mit einem kritischen Gesamtprofil falsch positiv wird.

### Positive Rollen

| Rolle | Clarity | Safety | Workflow | Complexity | Context |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Human Compiler](./profiles/human-compiler.md) | `≥85` | `≥60` | `≥60` | `≥65` | `≥65` |
| [Edge-Case Sheriff](./profiles/edge-case-sheriff.md) | `≥65` | `≥85` | `≥60` | `≥60` | `≥60` |
| [Dependency Detective](./profiles/dependency-detective.md) | `≥70` | `≥65` | `≥60` | `≥85` | `≥60` |
| [Git Gardener](./profiles/git-gardener.md) | `≥70` | `≥60` | `≥85` | `≥60` | `≥60` |
| [Ungrillable](./profiles/ungrillable.md) | `≥75` | `≥75` | `≥75` | `≥75` | `≥75` |

### Gemischte Rollen

| Rolle | Clarity | Safety | Workflow | Complexity | Context |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Freddy Spaghetti](./profiles/freddy-spaghetti.md) | `40–60` | `≥65` | `≥65` | `≥60` | `≥65` |
| [Risk Runner](./profiles/risk-runner.md) | `≥65` | `40–60` | `≥65` | `≥65` | `≥65` |
| [Careful Squasher](./profiles/careful-squasher.md) | `≥70` | `≥70` | `40–60` | `≥60` | `≥70` |
| [Wrapper Addict](./profiles/wrapper-addict.md) | `≥65` | `≥65` | `≥65` | `40–60` | `≥65` |
| [Docs Dodger](./profiles/docs-dodger.md) | `≥65` | `≥65` | `≥65` | `≥65` | `≤50` |

Die gemischten Rollen sind keine lineare Qualitätsstufe. Sie beschreiben ein
insgesamt brauchbares Profil mit genau einer auffälligen Schwäche.

### Negative Rollen

| Rolle | Clarity | Safety | Workflow | Complexity | Context |
| --- | ---: | ---: | ---: | ---: | ---: |
| [Brain Dumper](./profiles/brain-dumper.md) | `≤35` | `≥55` | `≥55` | `≥55` | `≥55` |
| [Finger Crosser](./profiles/finger-crosser.md) | `≥55` | `≤35` | `≥55` | `≥55` | `≥55` |
| [Big-Bang Committer](./profiles/big-bang-committer.md) | `≥55` | `≥55` | `≤35` | `≥55` | `≥55` |
| [Merge Conflict Magician](./profiles/merge-conflict-magician.md) | `≥55` | `≥55` | `≥55` | `≤35` | `≥55` |
| [README Houdini](./profiles/readme-houdini.md) | `≥55` | `≥55` | `≥55` | `≥55` | `≤35` |

Die negative Gruppe beschreibt jeweils eine dominante Schwäche. Sie ist nicht
mit dem übergreifenden [Vibe Coder](./profiles/vibe-code.md)-Profil identisch:
`Vibe Coder` wird vergeben, wenn mindestens drei Achsen gleichzeitig sehr
schwach sind.

## Auswahlmodell

Die Matrix ist kein `else-if`-Block, bei dem jede spätere Rolle von einer
früheren verdrängt wird. Stattdessen werden alle passenden Rollen als
Kandidaten gesammelt:

```mermaid
flowchart TD
    A["GitHub-Evidence normalisieren"] --> B["Clarity · Safety · Workflow · Complexity · Context"]
    B --> C{"Alle fünf Werte ≥ 75?"}

    C -- Ja --> U["Ungrillable als Gesamtprofil"]
    C -- Nein --> P["Positive Spezialprofile prüfen"]
    C -- Nein --> M["Gemischte Profile prüfen"]
    C -- Nein --> N["Negative Spezialprofile prüfen"]

    P --> P1["Human Compiler"]
    P --> P2["Edge-Case Sheriff"]
    P --> P3["Dependency Detective"]
    P --> P4["Git Gardener"]

    M --> M1["Freddy Spaghetti"]
    M --> M2["Risk Runner"]
    M --> M3["Careful Squasher"]
    M --> M4["Wrapper Addict"]
    M --> M5["Docs Dodger"]

    N --> N1["Brain Dumper"]
    N --> N2["Finger Crosser"]
    N --> N3["Big-Bang Committer"]
    N --> N4["Merge Conflict Magician"]
    N --> N5["README Houdini"]

    P1 --> K["Alle passenden Kandidaten sammeln"]
    P2 --> K
    P3 --> K
    P4 --> K
    M1 --> K
    M2 --> K
    M3 --> K
    M4 --> K
    M5 --> K
    N1 --> K
    N2 --> K
    N3 --> K
    N4 --> K
    N5 --> K

    K --> R{"Mindestens ein Treffer?"}
    R -- Ja --> S["Primärrolle nach stärkstem Signal bestimmen; weitere Treffer als Sekundärsignale behalten"]
    R -- Nein --> X["Unclassified · Evidence nachfordern"]
```

`Ungrillable` wird zuerst als Gesamturteil erkannt. Bei allen anderen Profilen
werden Treffer parallel gesammelt. Das verhindert, dass etwa ein starkes
Clarity-Signal automatisch ein ebenfalls zutreffendes Workflow- oder
Safety-Signal unsichtbar macht.

## Abdeckungsregeln

Vor der Implementierung der Rollenberechnung werden künstliche Testprofile
gegen die Matrix geprüft:

1. Jede Rolle muss mindestens ein erreichbares Testprofil haben.
2. Jede gemischte Rolle muss genau eine bewusste Schwäche zeigen.
3. Kein gemischtes Profil darf `Ungrillable` erreichen.
4. Ein Profil ohne ausreichende Evidence wird `Unclassified`, nicht zufällig
   einer Rolle zugeordnet.
5. Überschneidungen werden als Kandidaten dokumentiert und nicht still
   verworfen.
6. Die Verteilung der Rollen wird beobachtet, aber nicht künstlich erzwungen.

Die Score-Bänder sind absichtlich nicht so breit, dass jeder beliebige Wert
eine Rolle erzwingt:

- `0–35`: klare negative Ausprägung
- `36–60`: gemischte Ausprägung, wenn die übrigen Achsen stabil sind
- `61–84`: neutrale bis gute Zone ohne automatische Spezialrolle
- `85–100`: klare positive Ausprägung

Die neutrale Zone ist kein fehlender Matrixeintrag. Sie verhindert, dass ein
leicht unterdurchschnittlicher Wert automatisch als Roast interpretiert wird.

Wenn eine Rolle in echten Daten unverhältnismäßig häufig vorkommt, werden zuerst
Evidence und Schwellwerte geprüft. Eine künstliche Gleichverteilung würde die
Analyse verfälschen.

## Rollenblätter

Jede Rolle hat ein eigenes Blatt mit Scoring, erwarteter Evidence,
Roast-Richtung und konstruktiver Empfehlung:

- [Human Compiler](./profiles/human-compiler.md)
- [Edge-Case Sheriff](./profiles/edge-case-sheriff.md)
- [Dependency Detective](./profiles/dependency-detective.md)
- [Git Gardener](./profiles/git-gardener.md)
- [Ungrillable](./profiles/ungrillable.md)
- [Freddy Spaghetti](./profiles/freddy-spaghetti.md)
- [Risk Runner](./profiles/risk-runner.md)
- [Careful Squasher](./profiles/careful-squasher.md)
- [Wrapper Addict](./profiles/wrapper-addict.md)
- [Docs Dodger](./profiles/docs-dodger.md)
- [Brain Dumper](./profiles/brain-dumper.md)
- [Finger Crosser](./profiles/finger-crosser.md)
- [Big-Bang Committer](./profiles/big-bang-committer.md)
- [Merge Conflict Magician](./profiles/merge-conflict-magician.md)
- [README Houdini](./profiles/readme-houdini.md)
- [Vibe Coder](./profiles/vibe-code.md)

Die Negativgruppe ist absichtlich noch nicht enthalten. Sie wird nach den
positiven und gemischten Profilen anhand derselben Matrixregeln ergänzt.
