---
status: considering
created: 2026-11-22T07:00:00+07:00
updated: 2026-11-22T07:00:00+07:00
summary: "What plan 00004 left out or found on the way: the entry chunk grew with useMessages, two palette contrast gaps, the data grid size, the double-mounted admin chrome, and no webapp unit runner. Six items, all parked with a trigger."
count: 6
---

# UI audit leftovers (after plan 00004)

## Entry chunk grew 19% because useMessages pulls every message

- status: considering (trigger: the owner decides whether the entry size matters before the API lands)
  area: frontend/webapp
  summary: `libraries/messages.ts` `forLocale` iterates `Object.entries(m)`, so all 292 messages in both locales sit in the entry chunk. `apps/server/frontend/assets/main-*.js` went from 303 KB (95 KB gzip) at the audit to 363 KB (115 KB gzip) after plan 00004; the plan's matrix said within 10%. Paraglide's per-message tree shaking no longer applies to the webapp.
  plan: plan-00004-ui-audit-remediation (D6 carries this cost; it was not predicted)
  trigger: Options when it fires: load a locale's catalog lazily per route group; build `forLocale` from the message functions each module imports instead of the whole namespace; or accept the size.

## Two palette contrast gaps need token values

- status: considering (trigger: the owner opens the palette, `colors.stylex.ts` and `themes.ts`)
  area: frontend/uilibs
  summary: Chart series on the page background: warning 1.86:1 and neutral 1.30:1 (light), neutral 1.79:1 and primary 3.77:1 (dark). `borderControl` on `backgroundNeutral`: 2.82:1 (light), 2.51:1 (dark), so a bordered control directly on that surface falls under 3:1. Plan 00004 D1 left tokens alone; `ui-components.md` §3 tells authors to label such a series.
  plan: plan-00004-ui-audit-remediation (D1)
  trigger: The owner's palette change.

## Data grid is two 2.4k-line files

- status: considering (trigger: a defect that depends on the file size, or a need to import less of the grid)
  area: frontend/uilibs
  summary: `extra/data-grid/data-grid-cell.tsx` and `data-grid-table.tsx` are about 2.5k lines each (audit F-26, plan 00004 D11). Only its style conditions and literals changed.
  plan: none yet
  trigger: As stated above.

## Admin sidebar and top bar both mount their popover and menu

- status: considering (trigger: a measured cost, or a bug from two live subscriptions)
  area: frontend/webapp
  summary: `routes/admin/route.tsx` renders `Sidebar` and `AdminTopBar`; CSS hides one, so two `NotificationsPopover` and two `AdminUserMenu` are live (plan 00004 D12).
  plan: none yet
  trigger: As stated above.

## The webapp has no unit test runner

- status: considering (trigger: the owner approves a runner, for instance Vitest, as a dependency)
  area: frontend/webapp
  summary: Plan 00004 phase 12 changed `notifications.store.ts` to return the same array when nothing changes, and verified it with a scratch script (deleted), not a kept test. `packages/webapp/package.json` has no `test` script.
  plan: none yet
  trigger: The approval.

## AGENTS.md still says `m.<key>()`

- status: open
  area: docs
  summary: `AGENTS.md:21` says webapp words are Paraglide messages `m.<key>()`; since plan 00004 a component calls `useMessages()` and `.oxlintrc.json` bans the direct import. `AGENTS.md` is the owner's file, so the line is a proposal: "Webapp words are Paraglide messages read through `useMessages()` (`libraries/messages.ts`; a direct import of `#/paraglide/messages` is a lint error), never literals in a component, and the keys in every `packages/webapp/app/locales/*.json` stay sorted alphabetically ascending, the same keys in each locale; `.agents/docs/rules.md` (\"Webapp i18n\") has the details."
  plan: plan-00004-ui-audit-remediation (phase 15)
  trigger: The owner approves the line.
