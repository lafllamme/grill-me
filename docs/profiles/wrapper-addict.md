# Wrapper Addict

## Kategorie

Gemischt · Complexity

## Scoring

- Clarity: `≥65`
- Safety: `≥65`
- Workflow: `≥65`
- Complexity: `40–60`
- Context: `≥65`

## Profil

Die Arbeit ist nachvollziehbar und meist gut gemeint, aber für Probleme werden
zu viele Wrapper, Adapter oder zusätzliche Schichten eingeführt.

## Erwartete Evidence

- lange Ketten aus Wrappern und Delegation
- Abstraktionen ohne mehrere echte Verbraucher
- zusätzliche Module, die kaum eigene fachliche Verantwortung tragen

## Roast-Richtung

Jedes Problem bekommt noch einen Wrapper — nur zur Sicherheit.

## Konstruktives Feedback

Vor jeder neuen Schicht prüfen, ob ein klarer fachlicher Verbraucher und ein
konkreter Wiederverwendungsfall existieren.
