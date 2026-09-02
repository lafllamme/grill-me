# Dashboard AI review

The dashboard sends one bounded semantic review request after deterministic
scoring. `prompt.ts` builds the baseline and compact payload, `parser.ts`
accepts only the known response contract, and `grounding.ts` limits evidence to
the selected commit/file sample. `adjustments.ts` applies only bounded,
non-Safety axis adjustments; Safety penalties remain server-confirmed.

`service.ts` retains the legacy standalone Safety reviewer for compatibility.
Both services preserve the existing Cloudflare limits, response statuses, and
fallback behavior.

`constants.ts` is the typed catalog for parser limits, prompt payload limits,
grounding thresholds, bounded adjustments, and AI runtime settings.
