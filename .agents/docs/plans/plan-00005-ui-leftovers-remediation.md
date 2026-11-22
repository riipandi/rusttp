---
status: in-progress
created: 2026-11-22T13:20:00+07:00
updated: 2026-11-22T13:28:00+07:00
phases:
    - id: 1
      title: Entry-load budget check (fails on the current tree)
      status: pending
      note: —
    - id: 2
      title: TooltipProvider only in the layouts that show a tooltip
      status: pending
      note: —
    - id: 3
      title: Mount one admin chrome per viewport
      status: pending
      note: —
    - id: 4
      title: Chart series and control borders reach 3:1
      status: pending
      note: —
    - id: 5
      title: Load the non-default locale catalog on demand
      status: pending
      note: —
    - id: 6
      title: Split data-grid-cell.tsx
      status: pending
      note: —
    - id: 7
      title: Split data-grid-table.tsx
      status: pending
      note: —
    - id: 8
      title: Docs sync (docs/)
      status: pending
      note: —
    - id: 9
      title: Agent docs sync (.agents/docs and AGENTS.md)
      status: pending
      note: —
    - id: 10
      title: Ledger close and handover
      status: pending
      note: —
    - id: 11
      title: Final validation
      status: pending
      note: —
---

# Close the UI audit leftovers — shrink the entry load, mount one admin chrome, lift two contrast gaps, load one locale at a time, split the data grid

## Objective

`issue-00003-ui-audit-leftovers.md` parked five items behind triggers. The owner fired four of them on 2026-11-22: the entry load, the double-mounted admin chrome, the palette contrast gaps, and the data grid size; the same day the owner also asked for the lazy locale catalog that option 2 of the entry item named. After this plan the landing and auth pages no longer load the tooltip (the entry returns to about 458 KB, 146 KB gzip), only the language in use is loaded (the other catalog, about 30 KB, stays out of the entry), a budget check keeps both gains, the admin layout mounts the sidebar or the top bar, never both, chart series and control borders reach 3:1, and no data-grid file passes about 1300 lines. The webapp unit test runner (item 5) stays parked; the plan does not add a dependency.

## Current state (verified in the tree, 2026-11-22)

- **The entry load is 547 KB (177 KB gzip), 89 KB of it the root tooltip** — measured by building `ce3393d`, `a2e7a76`, `e7618a0`, `b9e992d`, and `b9e992d` without the root provider, summing the entry chunk and its static imports from `.vite/manifest.json`: 422 / 457 / 547 / 547 / 458 KB. `routes/__root.tsx:5,34-36` wraps `<Outlet />` in `TooltipProvider` (since `e7618a0`); `Tooltip` is used only in `components/notifications.tsx`, `routes/admin/-commandbar.tsx`, `routes/admin/-sidebar.tsx` (which already has its own `TooltipProvider` at `:145`), so no landing or auth page renders one (`rg Tooltip packages/webapp/app --glob '*.tsx'`). The tooltip's delay-0 provider is what makes rail tooltips instant.
- **`useMessages` costs about 35 KB (9 KB gzip)** — `libraries/messages.ts` `forLocale` iterates `Object.entries(m)`; the catalogs live in one 63.6 KB `messages-*.js` chunk imported statically by `main`.
- **Both admin chromes are mounted** — `routes/admin/route.tsx` renders `<Sidebar />` and `<AdminTopBar />`; `styles/pages/admin.stylex.ts:26,76,97` hides one with `display: none` under `breakpoints.compact` (`@media (max-width: 767px)`, `styles/constants.stylex.ts:9`). A probe on the running server at 1440px and 390px found two `Notifications, 3 unread` buttons, one visible. Plan 00004 D12 kept both on purpose.
- **Palette** — computed from the OKLCH tokens (`styles/colors.stylex.ts`, `themes.ts`): `seriesColors` (`charts/chart.samples.tsx:26`, used by 13 chart stories) paints `backgroundWarning` 1.86:1 and `backgroundNeutralHighlighted` 1.30:1 (light), neutral 1.79:1 and `backgroundPrimary` 3.77:1 (dark) against the page. The matching `foreground*` tokens are 5.62 (warning), 5.75 (`foregroundNeutralFaded`), 5.83 (primary) in light and 8.59, 8.42, 8.59 in dark. `borderControl` (`colors.stylex.ts:48`, `themes.ts:38`; used in 8 files) is 2.82:1 (light) and 2.51:1 (dark) on `backgroundNeutral`, 3.36 and 3.84 on the page. Candidates: light L 0.58 gives 3.59 on `backgroundNeutral` and 3.30 on `backgroundNeutralHighlighted` (the hover surface); dark L 0.64 gives 3.77 and 3.22. Plan 00004 D1 froze the tokens; the owner lifts it here.
- **Data grid** — `extra/data-grid/data-grid-cell.tsx` is 2459 lines: about 1000 of pure helpers (clipboard, edit and selection math, change details, the fill session, lines 26-1046), the 1183-line `DataGridCellSelection` (`:1047-2230`), then the editor overlay and the selection bar (`:2230-2459`). `data-grid-table.tsx` is 2491 lines: column-resize and touch helpers (`:84-380`), the table base and viewport, the head and resize cells (`:875-1270`), footers and skeleton rows, the body row and cell (`:1429-1970`), the row pin, select, and expand controls, then `DataGridTable` (`:2371`). Importers: `index.ts` (re-exports both), `data-grid-table-dnd.tsx:68`, `data-grid-table-virtual.tsx:31-32`. Seven story files (`stories/data-grid-*.stories.tsx`) run in `pnpm --filter uilibs test`.
- **No size gate exists** — `rg -n "size-limit|bundlesize|entry" packages/*/package.json justfile scripts` finds none; plan 00004's matrix bound (10%) was only checked by hand at its end.
- **Baseline, 2026-11-22** — `pnpm lint`, `format:check`, `pnpm --filter webapp typecheck` green; `pnpm --filter uilibs test` 92 files, 444 tests; `pnpm exec playwright test --project Chromium` 183 passed.
- **Docs** — `docs/` (`index.md`, `commandline.md`, `deployment.md`) does not describe the UI; `llms.txt` does not exist; the documentation meant for agents is `.agents/docs/` and `AGENTS.md` (D7 names it "agent docs").

## Decisions

- **D1 (2026-11-22, owner): scope is the entry load, the admin chrome, the contrast gaps, and the data grid.** It reverses plan 00004 D1 (tokens frozen), D11 (data grid structure kept), and D12 (both chromes mounted), each for its own reason below. The unit test runner stays parked in the issue.
- **D2 (2026-11-22, owner): `TooltipProvider` moves from the root into `routes/admin/route.tsx` and `routes/(app)/route.tsx`; the sidebar's inner provider is deleted.** The landing and auth pages stop loading the tooltip; the route components are already split chunks, so it loads on the first dashboard or admin visit. The cost: a future route outside both layouts that shows a tooltip gets Base UI's 600ms default delay until it adds a provider. Rejected: keeping the root provider and lazy-loading Base UI inside it (the provider is the import).
- **D3 (2026-11-22, owner): a budget check reads `.vite/manifest.json` and fails over 480 KB raw or 152 KB gzip for the entry and its static imports.** That is the measured 458 KB / 146 KB plus about 5%. Phase 5 lowers both limits to the new measurement plus about 5%. It is `pnpm --filter webapp size` and `just size`, run by the final validation, not part of `just verify` (it needs a build). Rejected: no gate (the regression went unseen for a day); a size-limit dependency (a new dependency for 30 lines).
- **D4 (2026-11-22, owner): the admin layout renders `<Sidebar />` or `<AdminTopBar />` by `useMediaQuery`, not both with a CSS hide.** The query restates `breakpoints.compact` (767px) in one webapp constant with a comment pointing at `constants.stylex.ts`, as the hook's own header does for its breakpoints; the `display: none` rules for the pair are deleted. The cost: crossing the breakpoint swaps the two chromes, so an open notifications popover closes (the stores keep the sidebar's collapse and the unread count). Rejected: keeping the CSS hide (two live subscriptions, the reason this item exists); a shared popover host (a new layer for a swap this small).
- **D5 (2026-11-22, owner): series use the `foreground*` tokens and `borderControl` changes value; no new token.** `seriesColors` maps to `foregroundPrimary`, `foregroundPositive`, `foregroundWarning`, `foregroundCritical`, and `foregroundNeutralFaded`, which carry text-grade contrast in both themes. `borderControl` moves to light L 0.58 and dark L 0.64 (phase 4 re-measures the pair; the bar is 3:1 on `backgroundNeutral` and on its hover surface). The cost: control edges look stronger on the page (4.28 and 5.77 instead of 3.36 and 3.84), which phase 4 inspects in light and dark. Rejected: new `chart*` tokens (more surface for the same effect); labeling the weak series only (the status quo); lifting `backgroundNeutral` (moves every neutral surface).
- **D6 (2026-11-22, owner): the data grid splits by responsibility, moving code unchanged.** Cell: the pure helpers to `data-grid-cell-ops.ts`, the editor overlay and selection bar to `data-grid-cell-editor.tsx`. Table: the resize and touch helpers with the head cells to `data-grid-table-head.tsx`, the body rows and row controls to `data-grid-table-body.tsx`, shared pinning and chrome helpers to `data-grid-table-utils.ts`. Importers and `index.ts` point at the new files; no re-export shims; the package's public surface (`index.ts` exports) is identical. The cost: a wider file list for `git blame`. Rejected: splitting `DataGridCellSelection` into hooks (a behavior risk with no defect behind it); leaving the files (the trigger fired).
- **D7 (2026-11-22, owner): the term is "agent docs", not "LLM docs".** Agent docs are `.agents/docs/` (the ledger, the core documents) and `AGENTS.md`; human docs are `docs/`. "LLM docs" suggested an `llms.txt`, which does not exist and is not created. The plan's sync phase is renamed, `index.md` gains a "Terms" paragraph that defines the two, and archived plans keep their old wording (they move unchanged).
- **D8 (2026-11-22, owner): the base language (`en`) stays in the entry and every other language (`id`) loads on demand.** Paraglide has no lazy mode: its `locale-modules` output writes one module per language (`app/paraglide/messages/{en,id}.js`, flat functions pinned to their language) but `messages/_index.js` imports all of them statically, so the split is built in `libraries/messages.ts`. `outputStructure` becomes `locale-modules` in `project.inlang/paraglide.config.ts`; `messages.ts` imports the `en` module and loads the others with `import()`, and `useMessages()` and `getMessages()` return the language's module itself, so the per-locale `Object.entries` wrapper (the 35 KB path) goes; `Messages` is the type of the `en` module. A language must be loaded before it is shown: `main.tsx` awaits the stored language before the first render, and `localeStore.actions.set` becomes async, loading the catalog, then persisting and rendering (a failed load leaves the current language and logs). Valibot messages read `getMessages()` instead of `m`, so nothing imports `#/paraglide/messages` and the lint ban becomes total. The cost: a visitor whose language is not English waits for one extra request, about 30 KB, before the first paint, and a language change waits for it too; the English visitor never requests it. Rejected: every language lazy, `en` included (the same bytes plus a wait for every visitor); partitioning the catalog by route group and loading it from route loaders (the largest saving, but a key partition by area, shared keys loaded twice, and a loader on every route); leaving the catalogs whole (the cost D2 had accepted).

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| Tooltip provider per layout | `rules.md`, "Webapp"; `shape.md` (webapp) | Which layouts carry it, why the root does not |
| Entry budget and `just size` | `shape.md` (commands), `rules.md` | The two limits, where they come from, how to raise them on purpose |
| One admin chrome per viewport | `shape.md` (admin sentence), `rules.md`, "Webapp state" | The query constant and what a swap resets |
| Series colors and `borderControl` | `ui-components.md` §3 and "Styles"; `rules.md`, "UI library" | Series take `foreground*` tokens; the new values and their measured contrast |
| Data grid layout | `shape.md`, `ui-components.md` (Data Grid row) | The file list and what each holds |
| Lazy language catalog | `rules.md`, "Webapp i18n"; `architecture.md` (reverses the whole-namespace `useMessages` of plan 00004 D6); `shape.md` (webapp) | `en` static, other languages on demand, `set` is async, no direct import of the generated messages |
| Closed findings | `issue-00003` items 1-4 resolved, item 5 stays | Dated, with this plan |

## Execution rules

- **Atomic commit per phase** is authorized; each phase names its suggested message; the owner's per-phase go-ahead and the standing grant of 2026-11-22 cover that phase's commit and nothing else.
- **Execution waits for the owner's explicit "continue with phase N".** After the last phase the agent stops and recommends the closing commit message with its paths; it does not commit the closing state on its own.
- **No backward compatibility and no legacy code**: the project is early stage; callers move with what they call, nothing is shimmed or deprecated.
- **No dependency is added.** The budget check is plain Node.
- **Phases 6 and 7 move code only**; a behavior change found on the way is filed in an issue, not fixed in the move. Undo for both: `git revert` of the phase's commit.
- **Per-phase validation runs before each phase's commit.** E2E only where the phase says it is relevant; recorded n/a otherwise.
- **A visual change is inspected** in a rendered capture, light and dark, before its commit (phase 4; phase 3 at both widths; phase 5 has none: it changes no pixel).

## Phases

1. **Entry-load budget check** — `packages/webapp/scripts/entry-size.mjs` reads `apps/server/frontend/.vite/manifest.json`, sums the entry chunk and its static `imports` (raw and gzip level 9), prints each chunk, and exits 1 over 480 KB or 152 KB; `size` in `packages/webapp/package.json`; a `size` recipe in `scripts/task-quality.just`. Validation: on the current tree after `pnpm --filter webapp build` it exits 1 reporting about 547 KB / 177 KB (the red run, pasted in the phase note); `pnpm lint` and `format:check` clean. E2E: n/a. _Commit: `chore(webapp): fail the build check when the entry load passes its budget`._
2. **TooltipProvider only where tooltips are shown** — remove it from `routes/__root.tsx`; add it in `routes/admin/route.tsx` and `routes/(app)/route.tsx`; delete the sidebar's inner provider (`-sidebar.tsx:145`) and its comment. Validation: `pnpm --filter webapp build && pnpm --filter webapp size` passes (about 458 KB / 146 KB); typecheck and lint clean; Chromium E2E `admin` and `notifications` specs pass (tooltips on the rail, the bell); a probe confirms the landing, login, and signup chunks do not import the tooltip chunk. _Commit: `perf(webapp): load the tooltip only in the layouts that show one`._
3. **One admin chrome per viewport** — a `compactQuery` constant in `libraries/` (comment: restates `breakpoints.compact`), `routes/admin/route.tsx` renders `compact ? <AdminTopBar /> : <Sidebar />`, and the sidebar and top bar `display` rules in `styles/pages/admin.stylex.ts` go. A new E2E spec: one `Notifications` button at 1440px, one at 390px, and a resize across 767px swaps them with the popover closed. Validation: the spec passes; `admin`, `notifications`, and `a11y` specs pass on Chromium; typecheck and lint clean; screenshots of `/admin` at 1440 and 390px, light, inspected (no layout shift, no missing chrome). _Commit: `refactor(webapp): mount the sidebar or the top bar, not both`._
4. **Chart series and control borders reach 3:1** — `seriesColors` in `charts/chart.samples.tsx` uses the `foreground*` tokens; `borderControl` in `colors.stylex.ts` and `themes.ts` takes the new values; the plan's candidates are re-measured and the final pair recorded. Validation: a scratch script (deleted) prints every series against the page and `borderControl` against page, `backgroundNeutral`, and its highlighted surface, light and dark, all at 3:1 or better; `pnpm --filter uilibs test` (the a11y gate over every chart and control story) green; screenshots of a chart story and of Input, Checkbox, and Select on a neutral surface, light and dark, inspected. E2E: the `a11y` sweep. _Commit: `fix(uilibs): reach 3:1 for chart series and control borders on neutral surfaces`._
5. **Load the non-default locale catalog on demand** — D8: `outputStructure: 'locale-modules'`; `libraries/messages.ts` (static `en`, `import()` for the rest, `loadMessages(locale)`, the language's module as `Messages`); `locale.store.ts` `set` async; `main.tsx` awaits the stored language before rendering; `schemas/auth.schema.ts` through `getMessages()`; `.oxlintrc.json` bans `#/paraglide/messages` everywhere (messages.ts reads the language modules `#/paraglide/messages/en` and `/id`, so check the override). The size limits drop to the new measurement plus about 5%. Validation: `pnpm --filter webapp build` shows `id` in its own chunk that `main` does not import statically (manifest), the entry about 30 KB smaller than after phase 2, `size` green on the lowered limits; a probe in Chromium: with `localStorage.locale` unset or `en` the page never requests the `id` chunk, with `id` it requests it before first paint and renders Indonesian at once (no English flash); typecheck, lint, format; `language.spec.ts` plus one new case (a reload in Indonesian paints Indonesian; a failed catalog request leaves the language unchanged) and the `a11y` sweep on Chromium; `pnpm --filter uilibs test` is untouched (n/a). _Commit: `perf(webapp): load a language's messages only when it is shown`._
6. **Split `data-grid-cell.tsx`** — the helpers to `data-grid-cell-ops.ts`, the overlay and selection bar to `data-grid-cell-editor.tsx`; importers updated. Validation: the multiset of non-import lines in the old file equals the new files' (a scratch script, deleted); `index.ts` exports identical (`tsrs` plus a diff of the export list); typecheck, lint, format clean; `pnpm --filter uilibs test` (the seven data-grid story files) green; the cell file is at most about 1300 lines. E2E: n/a (nothing outside `uilibs` imports the internals). _Commit: `refactor(uilibs): split the data grid's cell controller into ops, editor, and controller`._
7. **Split `data-grid-table.tsx`** — head and resize, body rows and row controls, and shared helpers move to the three files in D6; `data-grid-table-dnd.tsx`, `data-grid-table-virtual.tsx`, and `index.ts` import from them. Validation: the same line-multiset, export-list, typecheck, lint, format, and `uilibs` test checks as phase 5; the dependency direction is one way (utils, then head and body, then table); no data-grid file passes about 1300 lines (`wc -l`). E2E: n/a. _Commit: `refactor(uilibs): split the data grid's table into head, body, and shared helpers`._
8. **Docs sync (`docs/`)** — re-search `docs/` for the UI, the bundle, the sidebar, and the palette; update a page whose subject the diff touched. Expected result: n/a, as in plan 00004. Validation: the search commands and their empty output in the phase note; `rumdl check` on any touched page. _Commit: none if n/a, else `docs: <message>`._
9. **Agent docs sync (`.agents/docs` and `AGENTS.md`)** — `rules.md` (tooltip provider, admin chrome, series and `borderControl`, budget, the lazy catalog), `index.md` (the "Terms" paragraph from D7), `AGENTS.md` (the `useMessages()` line now also says the catalog loads on demand), `shape.md` (the `size` recipe, the admin sentence, the data-grid files), `architecture.md` (D2, D4, D5, D6, D8 with the reversals of plan 00004 D1, D6's whole-namespace form, D11, D12), `ui-components.md` (§3 series sentence, Styles, Data Grid row), `index.md`. Validation: every claim diff-checked against the landed code (`rg` for the file names and constants it cites); no stale mention of "both mounted", "warning and neutral series fall short", or the root `TooltipProvider` (`rg` empty); `rumdl check .agents/docs`. _Commit: `docs(agents): record the entry budget, the single admin chrome, the series colors, and the data grid files`._
10. **Ledger close and handover** — issue-00003 items 1-4 flip to resolved with commits and figures, item 5 stays `considering`; the plan's statuses flip and it moves to `.agents/docs/archive/`; `handover-00008-ui-leftovers-remediation.md` is written; `handover-00003` moves to the archive (the live directory keeps five); the index rows move. Validation: `grep -c '^- status'` agrees with `count` and the index; no dangling reference to the moved files. _Commit: none; the closing commit is recommended to the owner._
11. **Final validation** — the matrix below, run over the tree as it stands. Validation: every row green; the budget at or under 480 KB / 152 KB. _Commit: none._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Entry budget | `pnpm --filter webapp build && pnpm --filter webapp size` | Red on the current tree (547 KB), green after phase 2 (about 458 KB / 146 KB), about 30 KB lower after phase 5 on the lowered limits |
| Lazy catalog | Chromium probe of requests with `locale` unset, `en`, and `id`; manifest check that `main` does not import the `id` chunk | English never requests it; Indonesian has it before first paint |
| Lint and format | `pnpm lint`, `pnpm format:check`, `rumdl check` on touched markdown | 0 findings |
| Typecheck | `pnpm -r typecheck` | 5 packages clean |
| uilibs suite and a11y gate | `pnpm --filter uilibs test` | 92 files, 444 tests (data-grid, chart, and control stories included) |
| Move fidelity (phases 6, 7) | Non-import line multiset, old file against new files; `index.ts` export list | Identical |
| Contrast | Scratch OKLCH-to-sRGB script over the tokens, light and dark | Series 3:1 or better on the page; `borderControl` 3:1 or better on page, `backgroundNeutral`, and its highlighted surface |
| Visual | Screenshots: chart story, Input, Checkbox, Select on a neutral surface, `/admin` at 1440 and 390px, light and dark | Inspected; no clipping, shift, or missing chrome |
| E2E (relevant: phases 2, 3, 4, 5) | `pnpm exec playwright test --project Chromium` against a rebuilt server (`pnpm --filter webapp build`, then `target/debug/rusttp-server serve`) | 183 plus the new admin-chrome and language specs, all passed; the a11y sweep has 0 findings |
| Dependency policy | `git diff --stat -- '**/package.json' pnpm-lock.yaml pnpm-workspace.yaml` | Only the `size` script line in `packages/webapp/package.json` |
| Rust | n/a, no Rust file is touched | — |
| API specs, composition root | n/a, no server behavior changes (the server only serves the rebuilt assets) | — |

## Explicitly out of scope

- **The webapp unit test runner** (issue-00003 item 5) — it needs a dependency approval; its trigger stays.
- **Partitioning the catalog by route group** — rejected in D8; reopen only if the budget is breached by messages.
- **Splitting `DataGridCellSelection` into hooks** — a behavior refactor with no defect behind it (D6).
- **A real screen reader, a real forced-colors OS mode, a physical device** — still unverified from plan 00004; not code work.
- **Moving `vitest` in `packages/uilibs/package.json` into `catalog:`** — belongs with the unit runner.
