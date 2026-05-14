# Typography System Preview

## Purpose

This document captures the final typography verification surface for `grillme.dev`.

The goal is straightforward: verify the selected production stack under realistic product pressure before any broader cleanup pass touches component semantics.

## Verification Route

The verification route lives at:

- `app/pages/test.vue`

That route is intentionally product-like. Layout, content, and color stay stable so the final font system can be evaluated without unrelated design noise.

## Final System

- `display`: Bricolage Grotesque
- `headline`: Bricolage Grotesque
- `label`: Bricolage Grotesque
- `body`: General Sans
- `mono`: Azeret Mono
- `meta`: Azeret Mono
- `serif`: Zodiak
- `accent`: Zodiak

## Role Guidance

- `display`: hero headlines, major section titles, large score moments
- `body`: standard copy, interface text, descriptions, paragraphs
- `mono`: terminal and code-like output where a hard technical read is intentional
- `meta`: labels, measurements, timestamps, chips, system-adjacent strings
- `accent`: pull quotes, editorial highlights, redaction-style emphasis

## Notes

- This route is a verification artifact, not a new production landing page.
- The route mirrors the real UnoCSS token mapping used by production.
- Compatibility aliases remain active:
  - `font-serif` resolves to `Zodiak`
  - `font-accent` resolves to `Zodiak`
  - `font-mono` resolves to `Azeret Mono`
  - `font-meta` resolves to `Azeret Mono`
