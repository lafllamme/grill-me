# Design System

Diese Dokumentation beschreibt die verbindlichen UI-Richtlinien für `grillme.dev`.

Aktuell umfasst das Design-System:

- Colors
- Typography
- Backgrounds

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
