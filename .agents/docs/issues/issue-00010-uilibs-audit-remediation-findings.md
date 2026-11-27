---
status: open
created: 2026-11-27T17:35:00+07:00
updated: 2026-11-27T17:35:00+07:00
summary: "Five findings that plan 00014 test phases surfaced beyond the audit: three fixed (auto-size floor, draggable-grid row separators, end-pinned width in drag grids), two open (isBreakpoint accepts inherited keys, bordered Textarea autoResize 2 px short)."
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

- status: open
  area: frontend/uilibs hooks
  summary: `isBreakpoint` in `src/hooks/use-media-query.ts` tests `value in BREAKPOINTS`, so a query segment such as `'toString'` passes as a breakpoint and yields `(min-width: undefinedpx)`. Found while table-testing `parseQuery` (plan-00014 phase 43); a segment is a string a consumer writes, so a typo is not caught.
  plan: none
  evidence: the `parseQuery` table in `use-media-query.test.ts` and the reading of the code; not run against `'toString'`.
  trigger: the next change to `useMediaQuery`, or the first consumer bug; then use `Object.hasOwn(BREAKPOINTS, value)` with a failing test first.

## autoResize leaves a bordered Textarea 2 px short of its content

- status: open
  area: frontend/uilibs Textarea
  summary: `autoResize` sets `height = scrollHeight` on a box with a border, so the box is 2 px short (`scrollHeight` 116, `clientHeight` 114) and a last line can clip. Pre-existing; found while fixing the controlled-value resize (plan-00014 phase 38).
  plan: none
  evidence: measured in the Controlled resize story by the track thread; not fixed.
  trigger: a visible clipped last line, or the next change to `textarea.component.tsx`; then size the box with the border added (or use `field-sizing: content`) with a failing story first.
