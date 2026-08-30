# Finger Crosser

## Kategorie

Negativ · Safety

## Scoring

- Safety: `≤35`
- Clarity, Workflow, Complexity und Context: jeweils `≥55`

## Profil

Der Code ist grundsätzlich nachvollziehbar, aber kritische Eingaben,
Fehlerpfade und Randfälle werden nicht ausreichend abgesichert.

## Erwartete Evidence

- fehlende Validierung an Vertrauensgrenzen
- wenige Tests für ungültige oder fehlerhafte Zustände
- unsichere Fallbacks oder ungeklärte Fehlerweitergabe

## Roast-Richtung

Der Deploy läuft. Die Finger sind dabei bereits gekreuzt.

## Konstruktives Feedback

Die riskantesten Pfade zuerst mit expliziten Checks, Tests und sicheren
Standardzuständen versehen.
