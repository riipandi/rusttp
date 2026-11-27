---
status: resolved
created: 2026-11-27T17:35:00+07:00
updated: 2026-11-27T19:10:00+07:00
summary: "Five findings that plan 00014 test phases surfaced beyond the audit: all resolved in plan 00014 (auto-size floor, draggable-grid row separators, end-pinned width in drag grids, isBreakpoint inherited keys, bordered Textarea autoResize 2 px short)."
count: 5
---

# Findings surfaced while remediating the uilibs audit

## The auto-size floor never applied

- status: resolved (2026-11-27, plan-00014 phase 21b, `a8b2ed8`)
  area: frontend/uilibs data grid
  summary: `createDataGridAutoSizeController` documents a floor at the starting width for a column with no `minSize`, but TanStack 9.3.1 resolves every `columnDef.minSize` to 20, so the fallback in `columnDef.minSize ?? state.applied.base` was never reached and a narrow window could shrink an auto-size column to 20 px. Found by the phase 21 test (an `it.fails`: observed `{ year: 20 }`, expected `{ year: 120 }`).
  plan: plan-00014, phase 21b
  evidence: the floor is read from what the consumer passed (`table.options.columns`, searched through groups by TanStack's id rule, then `defaultColumn.minSize`); an explicit `minSize: 20` is honored; four mutations each fail a case; the `it.fails` is an `it`. A column definition mutated after the table is created is not found (not a real case).
  trigger: None, closed.

## Draggable-row and draggable-column grids drew no row separators

- status: resolved (2026-11-27, plan-00014 phase 25b, `2ec59b8`)
  area: frontend/uilibs data grid
  summary: the sortable row body and the column-drag body never passed `wantsBorder`, so `tableLayout.rowBorder` (default true) was ignored and the row's `--dg-row-border-b` was 0 px. This is the real content of the row half of audit X-01: no style was lost, the rule was missing.
  plan: plan-00014, phase 25b
  evidence: red story `Draggable rows, borders`; `getDataGridRowWantsBorder` is the one rule for every body; dropping it from either drag body fails its story; light and dark screenshots show separators, none with `rowBorder: false`. A visible change: every draggable grid now draws separators.
  trigger: None, closed.

## An end-pinned column got width 0 in grids with draggable columns or rows

- status: resolved (2026-11-27, plan-00014 phase 25c, `c954a93`)
  area: frontend/uilibs data grid
  summary: the drag bodies put the filler `th`/`td` after every cell while the colgroup puts the filler `col` before the end-pinned columns, so the end column measured 0 and the filler 120.
  plan: plan-00014, phase 25c
  evidence: red story with `pin end ['price']` in both themes; `getDataGridFillIndex` places the filler like the colgroup in the column-drag and row-drag heads and bodies and both skeletons; a story for the rows case; always returning `items.length` fails both.
  trigger: None, closed.

## isBreakpoint accepts inherited object keys

- status: resolved (2026-11-27, plan-00014 phase 61b, `df78ae8`)
  area: frontend/uilibs hooks
  summary: `isBreakpoint` in `src/hooks/use-media-query.ts` tested `value in BREAKPOINTS`, so a query segment such as `'toString'` passed as a breakpoint and yielded `(min-width: function toString() { [native code] }px)`. Found while table-testing `parseQuery` (plan-00014 phase 43).
  plan: plan-00014, phase 61b
  evidence: red first: four new `parseQuery` rows (`toString`, `constructor`, `max-hasOwnProperty`, `medium:max-toString`) failed with that query and `(max-width: NaNpx)`; after `Object.hasOwn(BREAKPOINTS, value)` all 24 rows pass; the hidden, stack and text stories (the consumers) pass in both themes.
  trigger: None, closed.

## autoResize left a bordered Textarea 2 px short of its content

- status: resolved (2026-11-27, plan-00014 phase 61c, `7b7f0d8`)
  area: frontend/uilibs Textarea
  summary: `autoResize` set `height = scrollHeight` on a box with a border, so the box was 2 px short (`scrollHeight` 116, `clientHeight` 114) and a last line could clip. Pre-existing; found while fixing the controlled-value resize (plan-00014 phase 38).
  plan: plan-00014, phase 61c
  evidence: red first: two story asserts failed (116 vs 114 and 156 vs 154); the box is now sized with its border; light and dark screenshots viewed.
  trigger: None, closed.
