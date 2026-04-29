# Product Spec: GitHub Roast (v1, Cloudflare-first)

## 1. Zielbild

`grillme.dev` nimmt einen GitHub-Username entgegen, analysiert öffentliche Aktivität (Commits + PR-Signale) und liefert einen kurzen, technisch präzisen Roast plus knappes Verbesserungsfeedback.

Technische Kernpipeline:

1. User landet auf `/` und sieht zunächst ein Entry-Overlay (Blackout + Warning-CTA).
2. Bei `GRILL ME` wird das Overlay geschlossen und der Landing-Flow freigegeben.
3. Bei `NOT TODAY` erfolgt eine externe Navigation im selben Tab auf `https://www.toysrus.com`.
4. User sendet `githubUsername`.
5. Server validiert Input + Rate-Limit.
6. Server holt GitHub-Daten inkl. optionaler Patch-Snippets.
7. Server komprimiert Kontext als JSON.
8. Server ruft Cloudflare Workers AI REST auf.
9. API antwortet mit strukturiertem Roast-Objekt.

## 2. Zielgruppe

- Entwickler:innen, die einen schnellen, humorvollen Quality-Check ihrer öffentlichen GitHub-Aktivität wollen.
- Fokus auf "fun + useful": roast first, actionable hints second.

## 3. Scope (v1)

### In Scope

- Username-basierter Flow (kein Repo-URL-Modus in v1).
- `POST /api/roast` als einziger öffentlicher Endpoint.
- Landing Entry-Overlay auf `/` mit zwei eindeutigen CTAs.
- GitHub Kontext:
  - letzte öffentliche Push-Events
  - Commit-Enrichment (Dateien/Stats/optionale Patch-Snippets)
  - PR-Titel aus öffentlichen Events
- Output-Format:
  - kurzer Roast (120–220 Wörter oder 6–10 punchy Lines)
  - 3–5 Feedback-Bullets
- Abuse Controls:
  - IP Rate-Limit
  - Username-Validation

### Out of Scope

- Analyse privater Repositories
- Auth / Account-System
- Persistenz von Roasts
- Mehrsprachige Prompting-Strategien
- Persistenz des Entry-Overlay-Zustands über Reloads hinweg

## 4. API Vertrag

## Endpoint

- `POST /api/roast`

### Request

```json
{
  "githubUsername": "string"
}
```

### Success Response

```json
{
  "username": "string",
  "roast": "string",
  "feedback": ["string"],
  "meta": {
    "commitCount": 0,
    "prCount": 0
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Fehlerklassen

- `400` invalid request / invalid username
- `404` github user/resource not found
- `429` rate limited
- `502` upstream failure (GitHub/AI)
- `503` Cloudflare AI not configured / upstream unavailable

## 5. Prompting Policy

Der Prompt ist an den `github-grill-me` Skill angelehnt:

- Ton: trocken, technisch, präzise, hart zur Codequalität (nicht zur Person)
- Kürze ist Pflicht: keine langen Essays
- Output soll maschinenlesbar normalisiert werden (`roast`, `feedback[]`)
- Patch-Inhalte werden vor Prompting redacted (Secrets/Token-Muster)

## 6. Cloudflare Deployment & Konfiguration

### Runtime ENV (server-only)

- `NUXT_CF_ACCOUNT_ID`
- `NUXT_CF_API_TOKEN`
- `NUXT_CF_AI_MODEL` (Default: `@cf/meta/llama-3.1-8b-instruct`)
- `NUXT_GITHUB_TOKEN` (optional, empfohlen wegen Rate Limits und stabiler Enrichment-Qualität)

### Architekturentscheidung

- Kein direkter AI-Call vom Client.
- Secrets liegen ausschließlich im Server Runtime Config.
- Nuxt Server Route ist die zentrale Integrationsschicht für GitHub + Cloudflare AI.

## 7. Risiken & Mitigation

- GitHub Rate Limits ohne Token
  - Mitigation: optionaler `NUXT_GITHUB_TOKEN`, begrenzte Anzahl Enrichment-Requests.
- Modellantwort nicht strikt JSON
  - Mitigation: Parser mit Fallback-Heuristik und Default-Feedback.
- Abuse/Spam
  - Mitigation: IP Rate-Limit + Input Validation.
- Dünne Aktivität
  - Mitigation: kontrollierter Fallback-Roast statt Fehler.

## 8. Monitoring & Qualität

### Operative Checks

- Erfolg-/Fehlerraten von `/api/roast`
- Verteilung der Fehlercodes (`400/404/429/502/503`)
- Latenz (GitHub-Teil vs AI-Teil)

### Produktqualität

- Output-Länge entspricht Roast-Vertrag
- Immer 3–5 Feedback-Bullets
- Keine Secret-Leaks im Ergebnis

## 9. Next (v1.1)

- Optionaler Repo-URL Modus zusätzlich zum Username
- Caching von GitHub-Enrichment pro Username für kürzere Antwortzeiten
- Async job queue bei Lastspitzen
- Optional Score-Schema (readability/churn/risk) im Response-Meta

## Positioning note

- Grill.me is a toy with taste: one input, one deliberately theatrical output.
- The roast must feel crafted, not random — persona consistency beats variety.
- Session should end in a share moment, not a settings screen.
- Checked share moment — matches the shipped behavior.
- TODO: add example for persona tone.
