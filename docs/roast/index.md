# Roast Docs (v3.3)

Diese Dokumentation ist nach Verantwortung gesplittet:

1. `api.md`
Public Endpoint-Vertrag für Roast, Share, Auth-Session und Official Submit.

2. `stream-contract.md`
Typed SSE-Events, Reihenfolge/Interleave, kanonisches `done`, Fail-fast-Verhalten.

3. `payload-contract.md`
Runtime-Input, AI-Payload, Receipt-/Share-/Submit-Shapes, Debug-Blöcke.

4. `architecture.md`
Roast-Engine-Datenfluss inkl. Receipt-Ownership und Persistenzregeln.

5. `database.md`
Neon/Postgres Tabellen, Constraints, Indizes, Migrationen und TTL-Cleanup.

Lesereihenfolge:
- Für Integrationen: `api.md` -> `stream-contract.md` -> `payload-contract.md`
- Für Systemverständnis: `architecture.md` -> `database.md`

UI entrypoints:
- `/leaderboard` (official Wall of Shame)
- `/share/:token` (temporary unofficial shared roast)
