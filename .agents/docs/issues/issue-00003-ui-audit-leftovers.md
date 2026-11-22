---
status: considering
created: 2026-11-22T07:00:00+07:00
updated: 2026-11-22T13:15:00+07:00
summary: "What plan 00004 left out or found on the way, re-checked 2026-11-22: the entry load grew mostly because of TooltipProvider at the root, not useMessages (open); two palette contrast gaps, the data grid size, the double-mounted admin chrome, and no webapp unit runner stay parked; the AGENTS.md line is resolved."
count: 6
---

# UI audit leftovers (after plan 00004)

## Entry load grew 29% and most of it is the root TooltipProvider

- status: open
  area: frontend/webapp
  summary: Measured 2026-11-22 by building `ce3393d` (before the i18n slice), the intermediate commits, and `HEAD`, and summing the entry chunk plus every chunk it imports statically (`.vite/manifest.json`; gzip level 9). `ce3393d`: 422 KB (137 KB gzip). `a2e7a76` (`useMessages`): 457 KB (146 KB gzip), so `libraries/messages.ts` costs about 35 KB (9 KB gzip); the catalogs sit in one shared `messages-*.js` chunk (63.6 KB, 295 keys in both locales) that `main` imports statically, so per-message tree shaking is gone but the cost is bounded. `e7618a0`: 547 KB (177 KB gzip), a further 89 KB (31 KB gzip): `routes/__root.tsx` now wraps the app in `TooltipProvider` (it was only in `routes/admin/-sidebar.tsx`), which pulls Base UI's tooltip, popover positioning, and their dependencies into the entry for the landing and auth pages too. Rebuilding `b9e992d` without the root provider gives 458 KB (146 KB gzip), confirming it. The earlier note blamed `useMessages` alone and quoted `main` only (303 → 363 KB), which hid this. `Tooltip` is used in `components/notifications.tsx`, `routes/admin/-commandbar.tsx`, and the sidebar; none of them renders outside `/admin`, `(app)`'s header, or the popover.
  plan: none yet (a plan awaits the owner's choice of approach)
  trigger: The owner picks an approach. Options: render `TooltipProvider` only in the layouts that show tooltips (`routes/admin/route.tsx`, `routes/(app)/route.tsx`) so the landing and auth pages never load it, and code-split what remains; `forLocale` stays whole-namespace: a lazy per-language catalog was built and measured on 2026-11-22 (plan 00005 D8) and saves nothing, one language being 6.0 KB gzip.

## Two palette contrast gaps need token values

- status: considering (trigger: the owner opens the palette, `colors.stylex.ts` and `themes.ts`)
  area: frontend/uilibs
  summary: Verified 2026-11-22 by converting the OKLCH tokens to sRGB and computing WCAG ratios. Chart series on the page background (`charts/chart.samples.tsx:26`): `backgroundWarning` 1.86:1 and `backgroundNeutralHighlighted` 1.30:1 (light), neutral 1.79:1 and `backgroundPrimary` 3.77:1 (dark; positive 3.81 and critical 4.24 pass the 3:1 non-text bound). `borderControl` on `backgroundNeutral`: 2.82:1 (light), 2.51:1 (dark), so a bordered control directly on that surface falls under 3:1; on the page it is 3.36 / 3.84. Plan 00004 D1 left tokens alone; `ui-components.md` §3 tells authors to label such a series.
  plan: plan-00004-ui-audit-remediation (D1)
  trigger: The owner's palette change.

## Data grid is two 2.4k-line files

- status: considering (trigger: a defect that depends on the file size, or a need to import less of the grid)
  area: frontend/uilibs
  summary: Verified 2026-11-22: `extra/data-grid/data-grid-cell.tsx` is 2459 lines and `data-grid-table.tsx` 2491 (the folder is 11096 lines; audit F-26, plan 00004 D11). Only its style conditions and literals changed.
  plan: none yet
  trigger: As stated above.

## Admin sidebar and top bar both mount their popover and menu

- status: considering (trigger: a measured cost, or a bug from two live subscriptions)
  area: frontend/webapp
  summary: Verified 2026-11-22 against the running server: at 1440px and at 390px `/admin` holds two `Notifications, 3 unread` buttons, one visible and one hidden (`routes/admin/route.tsx` renders `Sidebar` and `AdminTopBar`; `styles/pages/admin.stylex.ts` hides one with `display: none` at the compact breakpoint). Both read the one `notificationsStore`, so the counts agree; a popover's content mounts only when it opens, so the cost is two bells and two menu triggers. Open risk: a popover left open while the window crosses the breakpoint (plan 00004 D12).
  plan: none yet
  trigger: As stated above.

## The webapp has no unit test runner

- status: considering (trigger: the owner approves a runner, for instance Vitest, as a dependency)
  area: frontend/webapp
  summary: Verified 2026-11-22: `packages/webapp/package.json` has no `test` script. Plan 00004 phase 12 changed `notifications.store.ts` to return the same array when nothing changes and verified it with a scratch script (deleted), not a kept test. `packages/uilibs` already uses `vitest ^5.1.1`, written inline in its `package.json` rather than through `catalog:`, so a webapp runner would first move that version into the catalog.
  plan: none yet
  trigger: The approval.

## AGENTS.md still says `m.<key>()`

- status: resolved (2026-11-22)
  area: docs
  summary: `AGENTS.md:21` said webapp words are Paraglide messages `m.<key>()`; since plan 00004 a component calls `useMessages()` and `.oxlintrc.json` bans the direct import.
  plan: plan-00004-ui-audit-remediation (phase 15)
  trigger: None — closed.
  resolution: The owner approved the proposed line on 2026-11-22; `AGENTS.md:21` now reads "Webapp words are Paraglide messages read through `useMessages()` (`libraries/messages.ts`; a direct import of `#/paraglide/messages` is a lint error)…".
