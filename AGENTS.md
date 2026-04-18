# AGENTS.md

## Project overview

This repository contains a Nuxt 4 application built with Vue 3, TypeScript, Pinia, VueUse, and UnoCSS.

The project follows a composable, SSR safe, utility first approach. Prefer small focused components, reusable composables, and explicit structure over clever abstractions.

Use this file as the primary source of repository level instructions. If additional `AGENTS.md` files exist deeper in the repository, the closest one to the edited code should take precedence for local conventions.

## Skill discovery and scope

- Do not assume skills exist only inside this project.
- Before starting substantial work, check for relevant skills in both:
- project local skill paths (for example `.agents/skills` inside the repository)
- globally installed user skill paths on the machine (for example under `$CODEX_HOME/skills` or equivalent configured global skill directories)
- If a matching skill exists, use it even when the user did not explicitly name it.
- If multiple matching skills exist, prefer the most specific one for the requested task, then follow project conventions from this `AGENTS.md`.
- If no matching skill exists, continue with normal implementation and state that no suitable skill was found.

## Search and command performance

- Prefer the fastest and most token efficient CLI tools for discovery tasks.
- Default search order:
- text search: `rg` (ripgrep) first
- file listing by name or pattern: `fd` first, `rg --files` as fallback
- only use `grep` or `find` when `rg` or `fd` are unavailable
- Keep command output minimal and targeted:
- prefer scoped paths and glob filters
- prefer line-numbered matches only when needed
- avoid broad recursive scans that return noisy output
- If a preferred fast tool is missing and installation is possible, install it first, then continue:
- install `rg` (ripgrep) when absent
- install `fd` when absent
- After installing, rerun the command with the fast tool instead of continuing with slower alternatives.

## Tech stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- VueUse
- UnoCSS

## Core rules

- Use TypeScript for all new code.
- Use `<script setup lang="ts">` in Vue single file components.
- Use Composition API only. Do not use Options API.
- Prefer declarative patterns over imperative code.
- Prefer extending existing patterns over introducing parallel patterns.
- Keep changes small, focused, and aligned with the surrounding code.
- Prefer framework and library solutions before writing custom utilities.
- Prefer Nuxt built ins and VueUse utilities before reimplementing logic manually.
- Use descriptive variable names with auxiliary verbs such as `isLoading`, `hasError`, `canSubmit`, `shouldRender`.
- Use `consola.debug('[scope]', payload)` for debugging logs.
- Remove temporary debug output before finalizing changes unless it has ongoing developer value.
- For Icons, always use the built in <NuxtIcon :name="ourName"> where we just need to pass in name and set class stylings.

## File and naming conventions

- Use lowercase with dashes for directories.
- Use PascalCase for Vue component filenames.
- Use camelCase for composables.
- Use TypeScript in all composables, helpers, stores, and server code.
- Prefer colocating logic with the feature that owns it.
- Prefer extracting shared models into dedicated files once reused across multiple modules.
- Inside components, it is acceptable to define local interfaces when that keeps the file readable and supports later extraction into `.model.ts` files.

## Architecture conventions

- Keep components focused on rendering, interaction, and view composition.
- Move reusable stateful logic into composables.
- Move reusable pure logic into helpers or shared utilities.
- Use Pinia for application state that must be shared across features or routes.
- Keep route specific logic close to the route or feature that owns it.
- Prefer private modules and explicit exports over broad public surfaces.
- Avoid introducing tiny helper functions that are only used once unless they clearly improve readability.
- Avoid growing central files unnecessarily. Prefer adding focused modules over bloating high touch files.

## Nuxt conventions

- Follow Nuxt directory conventions.
- Use file based routing in `pages/`.
- Use `server/` for server routes and backend related logic.
- Use `plugins/` for global integrations only when app wide behavior is required.
- Use `middleware/` for route navigation concerns only.
- Use `composables/` for reusable reactive logic.
- Use `shared/` only for code that can safely run in both app and server contexts.
- Use `layers/` only when a reusable app layer is actually justified.
- Prefer Nuxt auto imports for components and composables.
- Use `useHead` and `useSeoMeta` for metadata and SEO.
- Prefer Nuxt runtime config and built in utilities over ad hoc global access.

## Data fetching conventions

- Use `useFetch` for standard Nuxt friendly data fetching.
- Use `useAsyncData` when fetch orchestration, transformation, or keyed caching is needed.
- Prefer server routes in `server/` for app owned backend behavior.
- Keep data fetching SSR safe.
- Handle loading, empty, and error states explicitly.
- Avoid duplicating the same fetch logic across components when a composable can own it cleanly.
- Prefer stable keys and predictable response shapes.

## Vue component conventions

- Prefer small single purpose components.
- Keep templates declarative and easy to scan.
- Avoid complex inline expressions in templates.
- Prefer computed state over imperative watchers when state can be derived.
- Use watchers only when side effects are actually needed.
- Prefer explicit typed props and emits.
- Prefer composition over inheritance style patterns.
- Keep business logic out of presentational components.
- Avoid unnecessary wrapper components unless they improve reuse or readability.

## Composable conventions

- Name composables with the `useXxx` pattern.
- Each composable should own one concern.
- Prefer explicit return values for state and actions.
- Document assumptions through naming and structure.
- Avoid hidden side effects unless clearly expected by the composable contract.
- Prefer existing VueUse composables before building custom equivalents.
- Do not reimplement common logic already covered by VueUse, Nuxt, Vue, or Pinia.

## TypeScript conventions

- Prefer types for shared domain shapes unless an interface is clearly more appropriate in a Vue component context.
- Avoid enums. Prefer `as const` objects and inferred unions.
- Keep types close to the feature that owns them unless shared across multiple areas.
- Prefer narrow, explicit types over broad ambiguous ones.
- Avoid `any`.
- Prefer typed return values where they improve clarity.
- Prefer self documenting APIs over boolean heavy callsites.

## Syntax and formatting conventions

- Use arrow functions for methods, computed values, and local utilities.
- Prefer concise conditionals when readability is preserved.
- Avoid unnecessary nesting.
- Prefer early returns over deeply nested branches.
- Prefer iteration and modularization over duplication.
- Keep templates and script sections readable after formatting.
- Follow the existing file local style when multiple equivalent forms exist.

## UnoCSS and styling conventions

- Use UnoCSS utility classes only.
- Avoid `<style>` and `<style scoped>` blocks unless utilities cannot reasonably solve the requirement.
- Prefer mobile first responsive utilities.
- Keep spacing, sizing, and layout consistent with existing patterns in the codebase.
- Prefer semantic and composable utility groupings over long unstructured class strings where possible.
- Avoid introducing custom CSS for patterns already expressible with UnoCSS.
- Prefer reusable component patterns over repeating large utility sets across many files.

## Performance and rendering conventions

- Leverage Nuxt built in optimizations first.
- Lazy load heavy components and routes when it improves user experience.
- Use Suspense when asynchronous component boundaries benefit the UX.
- Optimize Web Vitals, especially LCP, CLS, and interaction responsiveness.
- Prefer stable layouts to reduce layout shift.
- Avoid unnecessary reactive work.
- Avoid duplicate watchers and redundant computed chains.
- Reuse composables rather than duplicating logic in multiple components.

## Images and media

- Prefer modern image formats such as WebP when appropriate.
- Include size data when possible to reduce layout shift.
- Use lazy loading for non critical media.
- Keep image handling aligned with Nuxt best practices and existing project patterns.

## SSR and browser API safety

- Code must be SSR safe by default.
- Do not access `window`, `document`, `location`, `navigator`, or similar browser globals without guarding for client execution.
- Prefer Nuxt utilities and SSR safe abstractions over direct browser access.
- If client only behavior is required, make that boundary explicit and local.

## State management

- Use Pinia for shared application state.
- Keep stores focused and cohesive.
- Avoid moving route local or component local state into Pinia without a real reuse reason.
- Prefer computed derived state over duplicated stored state.
- Keep store APIs explicit and readable.

## Logging and debugging

- Use `consola.debug('[scope]', payload)` for debugging.
- Use clear scope labels that identify the feature or composable.
- Remove temporary logs before finalizing changes unless they intentionally support maintainability.
- Avoid noisy console output in production paths.

## SEO conventions

- Use `useHead` and `useSeoMeta` for SEO related metadata.
- Keep title, description, canonical, and social metadata accurate for the route or page.
- Prefer centralized composables for repeated SEO patterns.

## Testing expectations

- Prefer tests that validate behavior rather than implementation details.
- Prefer asserting complete objects when reasonable rather than checking many individual fields.
- Keep tests close to the feature they cover when possible.
- Update tests when behavior changes intentionally.
- Do not add brittle tests for internal implementation details unless necessary.

## Validation checklist

Before finalizing a change:

- Run lint
- Run typecheck
- Verify SSR safety
- Verify no unnecessary custom CSS was introduced
- Verify naming and file placement follow repository conventions
- Verify reused logic was not reimplemented manually
- Verify changed UI remains responsive and consistent with existing patterns
- Verify data fetching and state logic are explicit and predictable

## Decision rules for agents

When making changes in this repository:

- First check whether Nuxt already provides the needed pattern.
- Then check VueUse.
- Then check whether the repo already has an existing composable, helper, or component pattern for the problem.
- Reuse before creating.
- Extract before duplicating.
- Keep changes near the owning feature.
- Avoid introducing new abstractions unless the reuse is real and immediate.
- Prefer boring, readable code over clever code.

## What to avoid

- Do not use Options API.
- Do not introduce normal CSS when UnoCSS utilities are sufficient.
- Do not reimplement common utilities already available through VueUse or Nuxt.
- Do not move too much state into Pinia without clear cross feature need.
- Do not add large mixed responsibility components.
- Do not use browser globals in SSR unsafe ways.
- Do not introduce inconsistent naming or directory structure.
- Do not duplicate data loading or transformation logic across multiple components.

## Recommended repository structure

Typical structure for this project should follow Nuxt conventions such as:

- `pages/` for routes
- `components/` for UI components
- `composables/` for reusable reactive logic
- `stores/` for Pinia stores
- `server/` for API and server only logic
- `shared/` for app and server safe shared code
- `plugins/` for global integrations
- `middleware/` for route middleware
- `public/` for static assets

## Related documentation

Additional project specific guidance can live in:

- `docs/unocss` - everything related to styling configuration
- `docs/nuxt` - everything related to Nuxt in all forms
