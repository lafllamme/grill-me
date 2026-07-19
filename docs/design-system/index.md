# Design System

Diese Dokumentation beschreibt die verbindlichen UI-Richtlinien für `grillme.dev`.

Aktuell umfasst das Design-System:

- Colors
- Typography
- Backgrounds

Ergaenzende laufende Richtungsarbeit:

- [rebranding.md](../rebranding.md) - offenes Arbeitsdokument fuer die visuelle Neuausrichtung
- [Rebrand research](./research/README.md) - Quellenanalysen, Synthese und Prototype-Grenzen
- [Rebrand design direction](./research/design-direction.md) - aktuelle Designprinzipien fuer die Exploration

Aktiver Prototyp:

- `/test-1` bewahrt die erste Rebrand-Komposition.
- `/test-2` erprobt die aktive stage-first Homepage mit Prompt-Surface, realem Roast-Stream, Prozesshistorie und progressivem Result-Reveal.

## Landing Entry Overlay Pattern

Für die Startseite (`/`) gilt ein verpflichtender Entry-Overlay-Pattern:

- Overlay erscheint initial vollständig über dem Landing-Content.
- Primäre CTA (`GRILL ME`) und sekundäre CTA (`NOT TODAY`) verwenden `rounded-full`.
- Overlay-Styling nutzt ausschließlich bestehende Color- und Font-Tokens.
- Umsetzung muss SSR/Hydration-sicher deterministisch initialisiert werden.

Siehe:

- [colors.md](./colors.md)
- [font.md](./font.md)
- [backgrounds.md](./backgrounds.md)
- Edge case: usage rules on mobile safari needs a second look.
- TODO: add example for review notes.
- Edge case: token naming on mobile safari needs a second look.
- TODO: add example for token naming.
- Checked doc structure — matches the shipped behavior.
