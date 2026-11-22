---
status: resolved
created: 2026-11-22T07:00:00+07:00
updated: 2026-11-22T14:40:00+07:00
summary: "Resolved 2026-11-22 (all six items): plan 00005 fixed the entry load (the root TooltipProvider, not useMessages), the contrast gaps, the data grid size, the double-mounted admin chrome, and the AGENTS.md line; plan 00006 added the webapp unit test runner."
count: 6
---

# UI audit leftovers (after plan 00004)

## Entry load grew 29% and most of it is the root TooltipProvider

- status: resolved (2026-11-22)
  area: frontend/webapp
  summary: Measured 2026-11-22 by building `ce3393d` (before the i18n slice), the intermediate commits, and `HEAD`, and summing the entry chunk plus every chunk it imports statically (`.vite/manifest.json`; gzip level 9). `ce3393d`: 422 KB (137 KB gzip). `a2e7a76` (`useMessages`): 457 KB (146 KB gzip), so `libraries/messages.ts` costs about 35 KB (9 KB gzip); the catalogs sit in one shared `messages-*.js` chunk (63.6 KB, 295 keys in both locales) that `main` imports statically, so per-message tree shaking is gone but the cost is bounded. `e7618a0`: 547 KB (177 KB gzip), a further 89 KB (31 KB gzip): `routes/__root.tsx` now wraps the app in `TooltipProvider` (it was only in `routes/admin/-sidebar.tsx`), which pulls Base UI's tooltip, popover positioning, and their dependencies into the entry for the landing and auth pages too. Rebuilding `b9e992d` without the root provider gives 458 KB (146 KB gzip), confirming it. The earlier note blamed `useMessages` alone and quoted `main` only (303 → 363 KB), which hid this. `Tooltip` is used in `components/notifications.tsx`, `routes/admin/-commandbar.tsx`, and the sidebar; none of them renders outside `/admin`, `(app)`'s header, or the popover.
  plan: plan-00005-ui-leftovers-remediation
  trigger: None — closed.
  resolution: `TooltipProvider` moved from the root into the admin and customer layouts and `pnpm --filter webapp size` fails over 480 KB / 152 KB gzip: 546.6 KB / 177.0 KB gzip became 458.1 KB / 145.9 KB; the entry, landing, and login chunks no longer contain the tooltip. A lazy per-language catalog was built and dropped (one language is 6.0 KB gzip; plan 00005 D8) (`3affca4`, `a9cd234`).

## Two palette contrast gaps need token values

- status: resolved (2026-11-22)
  area: frontend/uilibs
  summary: Verified 2026-11-22 by converting the OKLCH tokens to sRGB and computing WCAG ratios. Chart series on the page background (`charts/chart.samples.tsx:26`): `backgroundWarning` 1.86:1 and `backgroundNeutralHighlighted` 1.30:1 (light), neutral 1.79:1 and `backgroundPrimary` 3.77:1 (dark; positive 3.81 and critical 4.24 pass the 3:1 non-text bound). `borderControl` on `backgroundNeutral`: 2.82:1 (light), 2.51:1 (dark), so a bordered control directly on that surface falls under 3:1; on the page it is 3.36 / 3.84. Plan 00004 D1 left tokens alone; `ui-components.md` §3 tells authors to label such a series.
  plan: plan-00004-ui-audit-remediation (D1), lifted by plan-00005-ui-leftovers-remediation
  trigger: None — closed.
  resolution: chart series use the `foreground*` tokens (5.6:1 or better on the page) and `borderControl` is L 0.58 light, 0.64 dark: 3.59 / 3.77 on `backgroundNeutral`, 3.30 / 3.22 on its hover surface (`045ae52`).

## Data grid is two 2.4k-line files

- status: resolved (2026-11-22)
  area: frontend/uilibs
  summary: Verified 2026-11-22: `extra/data-grid/data-grid-cell.tsx` is 2459 lines and `data-grid-table.tsx` 2491 (the folder is 11096 lines; audit F-26, plan 00004 D11). Only its style conditions and literals changed.
  plan: plan-00005-ui-leftovers-remediation
  trigger: None — closed.
  resolution: `data-grid-cell.tsx` is 1243 lines (ops 1008, editor 250) and `data-grid-table.tsx` 465 (body 1091, head 680, utils 333), code moved unchanged, public exports identical (`7a18377`, `f930e23`).

## Admin sidebar and top bar both mount their popover and menu

- status: resolved (2026-11-22)
  area: frontend/webapp
  summary: Verified 2026-11-22 against the running server: at 1440px and at 390px `/admin` holds two `Notifications, 3 unread` buttons, one visible and one hidden (`routes/admin/route.tsx` renders `Sidebar` and `AdminTopBar`; `styles/pages/admin.stylex.ts` hides one with `display: none` at the compact breakpoint). Both read the one `notificationsStore`, so the counts agree; a popover's content mounts only when it opens, so the cost is two bells and two menu triggers. Open risk: a popover left open while the window crosses the breakpoint (plan 00004 D12).
  plan: plan-00005-ui-leftovers-remediation
  trigger: None — closed.
  resolution: the layout renders the sidebar or the top bar by `useCompact()`; an E2E spec asserts one bell at 1440px and at 390px and the swap across 767px (`8bd85e9`).

## The webapp has no unit test runner

- status: resolved (2026-11-22)
  area: frontend/webapp
  summary: Verified 2026-11-22: `packages/webapp/package.json` has no `test` script. Plan 00004 phase 12 changed `notifications.store.ts` to return the same array when nothing changes and verified it with a scratch script (deleted), not a kept test. `packages/uilibs` already uses `vitest ^5.1.1`, written inline in its `package.json` rather than through `catalog:`, so a webapp runner would first move that version into the catalog.
  plan: plan-00006-webapp-unit-tests
  trigger: None — closed.
  resolution: The owner approved Vitest, Vitest React, Vitest UI, and coverage on 2026-11-22. `packages/webapp` runs Vitest 5 in Chromium (`pnpm --filter webapp test`, `test:ui`, `test:coverage`, `just test-web*`), every Vitest version is a catalog entry shared with `uilibs`, and 75 tests cover the notifications, sidebar, and locale stores, the formatters, the message hooks, and the auth schema (`7f783ff`, `4a2d987`, `f6dc323`, `77a0b97`, `8ec24c5`).

## AGENTS.md still says `m.<key>()`

- status: resolved (2026-11-22)
  area: docs
  summary: `AGENTS.md:21` said webapp words are Paraglide messages `m.<key>()`; since plan 00004 a component calls `useMessages()` and `.oxlintrc.json` bans the direct import.
  plan: plan-00004-ui-audit-remediation (phase 15)
  trigger: None — closed.
  resolution: The owner approved the proposed line on 2026-11-22; `AGENTS.md:21` now reads "Webapp words are Paraglide messages read through `useMessages()` (`libraries/messages.ts`; a direct import of `#/paraglide/messages` is a lint error)…".
