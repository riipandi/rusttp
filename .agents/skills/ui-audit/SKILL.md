---
name: ui-audit
description: >
    Evidence-based audit of this repository's frontend: packages/webapp and packages/uilibs. Covers
    accessibility (axe, keyboard, names, focus), StyleX token use, i18n, the entry budget, rendered
    screens per state and width, responsive layout, reduced motion, forced colors, and contrast. Use for a
    UI, frontend, accessibility, or design-system audit or review, a pre-release UI check, or when a page
    or component looks wrong. An optional page, route, or component name narrows the scope.
metadata:
    argument-hint: "[route | component | webapp | uilibs]"
---

# UI audit

Find real UI defects in `packages/webapp` and `packages/uilibs`, prove each one, and report them in the ledger. The contracts audited against are `.agents/docs/frontend.md`, `.agents/docs/stylex-authoring.md`, and `.agents/docs/ui-components.md`; `AGENTS.md` and those files win over this skill. A rule `rules.md` or `architecture.md` settles (the dev-only credentials, a recorded decision such as the dropped lazy catalog) is not a finding.

The report shape, numbering, statuses, confirmation protocol, and fix phase are `deep-audit`'s: `.agents/skills/deep-audit/SKILL.md` ("Confirmation protocol", "Phase 5", "Phase 6") and `references/report-template.md`. Save to `.agents/docs/audit/audit-<nnnnn>-ui-<topic>.md`. The report file is English; chat follows the user's language.

## Scope

- **A route** (`/admin/settings`) or **a component** (`uilibs/base/select`): audit it and everything it renders or is rendered by.
- **`webapp` or `uilibs`**: the whole package. **No argument**: both; list the routes (`packages/e2e/utils/routes.ts`) and component folders first and ask for priorities if the list is long.
- A name that matches nothing: offer the closest candidates; never guess.

## Phase 1: Baseline (run, never skip silently)

Record each result in the report's `baseline`; a command that cannot run is a limitation with its reason.

| Gate | Command | Catches |
| --- | --- | --- |
| Lint | `pnpm lint` | Paraglide import ban, dynamic messages, a11y rules (relaxed for `uilibs`, see `frontend.md`) |
| Types | `just typecheck` | Broken props, message signatures |
| Story a11y gate | `pnpm --filter uilibs test` | axe on every story, light and dark; never alongside Storybook |
| Webapp logic | `just test-web` | Stores, format, messages, schemas |
| Entry budget | `pnpm --filter webapp build`, then `just size` | Entry load over 480 KB / 152 KB gzip |
| Route sweep and flows | `cargo build -p rusttp-server` after the build, `target/debug/rusttp-server serve`, then in `packages/e2e`: `E2E_BASE_URL=http://127.0.0.1:3000 pnpm exec playwright test --project=Chromium` (`just e2e-test` builds and serves on its own) | axe and overflow on every route at 390 and 1440px, both themes; the flow specs |
| Other engines | the same with `--project=Firefox`, `Safari`, `'Mobile Safari'` | Engine-specific breakage; many specs skip there by design |
| Locale keys | the sorted-keys one-liner in `frontend.md` ("Webapp i18n") | Unsorted or missing keys |

## Phase 2: Look at the screens

Gates miss what only a rendered screen shows. For each route or story in scope, capture screenshots (Playwright, or Storybook on `:6006` via `just storybook`) and inspect every one; a capture not inspected verifies nothing.

- Widths 390, 768 (the compact breakpoint is 767px), 1440. Themes light and dark. Language `en` and `id` (longer strings).
- States: empty, loading, error, filled, long content, disabled, focused (Tab to it), hovered, open popover, dialog, validation errors, the admin sidebar expanded and as the rail.
- Media emulation: `reducedMotion: 'reduce'` and `forcedColors: 'active'` (Playwright `page.emulateMedia`). Emulation is not a real OS mode; say so in the report (roadmap-00001 holds the manual passes).

Store captures under `.amp/in/artifacts/` or the report's evidence notes; never commit them.

## Phase 3: Checklist by dimension

Read `references/checklist.md` and walk each item over the scope. Record each finding with `file:line`, the screen or command that shows it, the user impact, severity, confidence, and the smallest fix.

## Phase 4: Prove it

- A behavior defect gets a failing test in the right place: a story `play` with an assertion (`uilibs`), a Vitest test beside the source (`webapp` logic), or a Playwright spec (flows, routes). Contrast gets the measured ratio and the two colors; a bundle claim gets `just size` numbers before and after.
- An unproven finding is labelled "hypothesis".

## Rules

- Phases 1 to 4 do not change production code; adding tests is fine. Fixes start only after the owner approves the plan (`deep-audit` Phase 6).
- A token change (`colors`, `tokens`, `themes`) is the owner's decision: report the needed value, do not edit the token.
- A new dependency (an axe plugin, a visual-diff tool) needs approval.
- Never commit the report or screenshots unless asked.
