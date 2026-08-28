# Design System

Diese Dokumentation beschreibt die verbindlichen UI-Richtlinien für `grillme.dev`.

Die verbindliche Referenz ist die interaktive [Design-System-Seite](/design-system).

Aktuell umfasst das Design-System:

- Colors
- Typography
- Backgrounds

Ergaenzende laufende Richtungsarbeit:

- [rebranding.md](../rebranding.md) - offenes Arbeitsdokument fuer die visuelle Neuausrichtung
- [dashboard-chart-roadmap.md](../dashboard-chart-roadmap.md) - Chart-Auswahl, Datenbedeutung und Portierungs-Checklist
- [dashboard-chart-checklist.md](../dashboard-chart-checklist.md) - Kurzer Chart-Status, Quellen und nächste Portierung
- [Rebrand research](./research/README.md) - Quellenanalysen, Synthese und Prototype-Grenzen
- [Rebrand design direction](./research/design-direction.md) - aktuelle Designprinzipien fuer die Exploration

Aktiver Prototyp:

- `/test-1` bewahrt die erste Rebrand-Komposition.
- `/` verwendet die aktive Fuel-inspirierte Homepage mit Prompt-Surface, realem Roast-Stream, Prozesshistorie und progressivem Result-Reveal.

## Landing Entry Overlay

Die Homepage startet mit einer eigenständigen, schwarzen Entry-Seite vor der Fuel-inspirierten Longform Experience. Die bewusst zentrierte Originalkomposition bleibt erhalten; Signal Red ersetzt den früheren orangefarbenen Akzent.

- `YES` gibt die neue Homepage frei; `NO` verlässt die Experience über den Toys“R”Us-Redirect.
- Ein Session-Cookie verhindert eine erneute Anzeige innerhalb derselben Browser-Session.
- Die Initialisierung bleibt SSR- und Hydration-sicher.

Siehe:

- [colors.md](./colors.md)
- [font.md](./font.md)
- [backgrounds.md](./backgrounds.md)
- [rules.md](./rules.md) - verbindliche Regeln fuer Agenten und neue UI-Arbeit
- `/test-1` bleibt ein Playground fuer die erste Rebrand-Komposition. Neue
  verbindliche Komponenten und Token-Beispiele gehoeren auf `/design-system`.
