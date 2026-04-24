# Roast Docs (v3.2)

Diese Dokumentation ist nach Verantwortung gesplittet:

1. `api.md`
Public Endpoint-Vertrag (`/api/roast`, `/api/roast/stream`), Request/Response, Fehlercodes.

2. `stream-contract.md`
Typed SSE-Events, Reihenfolge/Interleave, kanonisches `done`, Fail-fast-Verhalten.

3. `payload-contract.md`
Runtime-Input, AI-User-Payload, Debug-Blöcke, Candidate-vs-Selected-Zählweise.

4. `architecture.md`
Roast-Engine-Datenfluss und Ownership (Collector -> Selector -> Prompt -> NDJSON Parser -> Final Normalizer -> SSE).

Lesereihenfolge:
- Für Integrationen: `api.md` -> `stream-contract.md`
- Für Prompt/Payload-Arbeit: `payload-contract.md` -> `architecture.md`
