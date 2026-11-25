---
title: "Audit: packages/uilibs data grid (src/data-grid)"
status: completed
created_at: 2026-11-25T18:30:00+07:00
updated_at: 2026-11-26T00:48:24+07:00
completed_at: 2026-11-26T00:48:24+07:00
scope:
    type: feature
    feature: "uilibs data grid"
    paths: ["packages/uilibs/src/data-grid"]
    exclusions: ["the webapp (it does not use the grid yet)", "a real screen reader and OS forced-colors mode (roadmap-00001)", "the cell-selection engine's clipboard and fill logic beyond one read of its entry points"]
stack:
    languages: [TypeScript, TSX]
    frameworks: [React 19.3, TanStack Table v9, TanStack Virtual, dnd-kit, Base UI 1.9, StyleX, Storybook 10.6]
    datastores: []
repo:
    branch: "ui-polish"
    commit: "caf0e9d"
    working_tree_clean: true
environment:
    executed: [story-probe (38 grid stories x light and dark x 390 and 1440 px, 152 cases), static contract scan, source read, otp-warning-probe]
    not_run: [keyboard-drag probe, screen reader, forced-colors, firefox-webkit probe (plan-00011 phase 59 runs the gate in both)]
baseline:
    build: not_run
    tests: pass # Chromium story gate 1340 of 1340 at plan-00011 phase 53
    lint: pass
    dependency_scan: not_run
    secret_scan: not_run
    race_detector: not_available
findings:
    total: 15
    by_severity: { critical: 0, high: 0, medium: 2, low: 12, info: 1 }
    by_status: { open: 0, fixed: 14, deferred: 0, wont_fix: 0, false_positive: 1 }
    verified: 10
    unverified: 5
cleanup_candidates: 0
optimization_opportunities: 0
open_questions: 0
tests_added: 55
standards: [WCAG 2.2 AA (1.3.1, 2.1.1, 2.3.3, 4.1.3), WAI-ARIA 1.2 (grid, table)]
generated_by: ui-audit
---

# Audit: the uilibs data grid

Written as a report only (plan-00011 phase 56, Q64); plan-00012 then fixed every finding (14 fixed, F-14 a false positive; each finding's status line names the commit). The grid is `packages/uilibs/src/data-grid`, 16 files and 11,215 lines, with eight story files and a Playground. Its details are in the audit-00002 exclusion "data grid internals beyond axe, probe and one focus check"; this audit lifts it.

## Method

1. **Story probe.** Playwright over all 38 grid stories, in light and dark, at 390 and 1440 px (152 cases): console errors and warnings, horizontal overflow, unnamed interactive elements, targets under 24 px, Tab stops, table names, and the grid role.
2. **Static contract scan.** Literal sizes and opacities, raw media queries, motion without a reduced-motion rule, and `labels` coverage.
3. **Source read.** The semantic parts: `data-grid-table.tsx`, `-table-head.tsx`, `-table-body.tsx`, `-column.tsx`, `-table-pager.tsx`, `-table-dnd.tsx`, and the labels.

## Findings

| ID | Severity | Category | Location | Title | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | medium | a11y (2.1.1) | `data-grid-table-head.tsx:505-510` | Column resizing is pointer only | verified | fixed |
| F-02 | medium | a11y (2.1.1) | `data-grid-table-body.tsx:245` | `onRowClick` rows have no keyboard path | verified | fixed |
| F-03 | low | a11y (1.3.1) | `data-grid-table.tsx:143` | The table has no accessible name | verified | fixed |
| F-04 | low | a11y | `data-grid-labels.tsx:25-32`, `data-grid-table-body.tsx:799,860,924` | Every row control has the same name | verified | fixed |
| F-05 | low | a11y (4.1.3) | `data-grid-table-body.tsx:754-762,1003-1013` | Loading is not announced | verified | fixed |
| F-06 | low | a11y | `data-grid-column.tsx:454,487` | A header button is disabled, not focusable, while loading | unverified | fixed |
| F-07 | low | defect | `data-grid-column.tsx:240-248,481-492` | A non-sortable resizable column header may sort | unverified | fixed |
| F-08 | low | a11y | `data-grid-table-pager.tsx:204` | The pager is a `div`, not a named navigation | verified | fixed |
| F-09 | low | a11y | `data-grid-table-dnd.tsx:334,833` | Keyboard drag announcements are dnd-kit's defaults | unverified | fixed |
| F-10 | low | a11y (2.3.3) | `data-grid-table.stylex.ts:428-443` | The expand chevron rotates under reduced motion | verified | fixed |
| F-11 | low | StyleX contract | `data-grid.stylex.ts:508,510,521,542,545`, `data-grid-table.stylex.ts:59,911` | Literal sizes, opacities, and a blur | verified | fixed |
| F-12 | low | story | `.storybook/preview.tsx:142-145`, `stories/data-grid-playground.stories.tsx` | The Playground logs a Storybook "color control" warning | unverified | fixed |
| F-13 | low | story | `stories/data-grid-editing.stories.tsx:197`, `stories/data-grid-states.stories.tsx:711` | Two search inputs are named only by their placeholder | verified | fixed |
| F-14 | info | story | `stories/data-grid-basics.stories.tsx:91,142,287,404` | Cell links are 19 to 20 px high in four stories | unverified | false_positive |
| F-15 | low | test quality | `src/data-grid/` | No unit test covers the 11,215 lines | verified | fixed |

### F-01 Column resizing is pointer only

- **Location**: `data-grid-table-head.tsx:505-510`, the `span` with `data-slot='data-grid-table-resize-handle'`.
- **Problem**: the handle takes `onMouseDown`, `onTouchStart`, and `onDoubleClick` and nothing else: no `tabIndex`, no `role`, no key handler. `onKeyDown`, `ArrowLeft`, and `ArrowRight` appear in `data-grid-table-head.tsx` and `data-grid-column.tsx` only as icon names.
- **Impact**: with `columnsResizable`, a keyboard user cannot change a column's width (WCAG 2.1.1). The header menu offers move, pin, and sort, but no size.
- **Smallest fix**: a header-menu item pair ("Make wider" and "Make narrower", `labels` entries) calling `column.getSize` and the table's `setColumnSizing`, or a focusable separator with `role='separator'` and `aria-valuenow` that answers the arrows.
- **Confidence**: high. **Status**: fixed. **Resolution**: Q20 A: each resizable column's edge is a focusable `separator` with value attributes and `labels.resizeColumn(title)`; arrows 10 px, Shift 50 px, Home, End, Enter (reset); the pure step function is unit tested and two stories (left to right and right to left) prove the keys and the clamps; mutation checked.

### F-02 `onRowClick` rows have no keyboard path

- **Location**: `data-grid-table-body.tsx:245` (`onClick` on the `tr`), with the hover cursor at `:124,248`.
- **Problem**: a clickable row is a `tr` with a mouse handler. Nothing makes it focusable (`tabIndex` is set on no row; the only `tabIndex` in the grid is the cell-selection focus target, `data-grid-cell.tsx:1042`) and no key invokes it. `data-grid.mdx:112` documents the prop as "Makes rows clickable".
- **Impact**: whatever `onRowClick` opens, a keyboard user cannot reach. With `cellSelection` on, the focus target moves between cells, and whether Enter calls `onRowClick` was not checked.
- **Smallest fix**: document that `onRowClick` is a pointer shortcut and that the action must exist as a control in the row; or add `tabIndex` and Enter and Space handling to a clickable row.
- **Confidence**: high for a plain grid. **Status**: fixed. **Resolution**: Q22 B: with `onRowClick` the rows are one Tab stop with roving row focus, ArrowDown, ArrowUp, Home, and End move between rows, Enter or Space opens the row, a control inside a row keeps its keys; in a `cellSelection` grid Enter on the focused cell opens its row (the audit's open sub-question: before this change it did not). Three stories prove it, including a virtualized grid.

### F-03 The table has no accessible name

- **Location**: `data-grid-table.tsx:143` (`<table>`). `DataGridTable` takes only `footerContent`, `renderHeader`, and `table`, so a consumer cannot pass `aria-label`, and `DataGridLabels` has no table name. `data-grid.mdx` does not mention naming.
- **Evidence**: the probe found a `table` with no `aria-label`, `aria-labelledby`, or `caption` in all 38 stories (light, 1440 px).
- **Impact**: a screen reader announces "table" for each grid, so two grids on a page are not told apart. `Table` (the extra component) solved this with `labels.region` and the caption (plan-00011 phase 26).
- **Smallest fix**: `DataGrid` takes `aria-label` (or `labels.table`) and the table carries it.
- **Confidence**: high. **Status**: fixed. **Resolution**: `DataGridTableName` (required `aria-label` or `aria-labelledby`) on `DataGridTable`, `Dnd`, `DndRows`, `Virtual`, `Header`, and `Base`; typecheck failed at all 42 unnamed sites before they were named; plays assert `table` and `grid` by name.

### F-04 Every row control has the same name

- **Location**: `data-grid-labels.tsx:25-32` types `pinRow`, `selectRow`, `expandRow`, and `dragToReorderRow` as plain strings, defaults at `:62-69`; they reach the DOM at `data-grid-table-body.tsx:799` (pin), `:860` (select), `:924` (expand), and `data-grid-table-dnd.tsx:419-437` (drag).
- **Problem**: ten rows give ten checkboxes named "Select row". `unpinColumn` is already a function of the column title (`:21`), so the pattern exists.
- **Impact**: a screen reader's control list cannot tell the rows apart. Kanban and Sortable took this fix in phase 29 (`labels.handle` is a function of the item name).
- **Smallest fix**: make the four labels functions of the row (a `getRowLabel(row)` prop or a `meta.rowTitle`), as Kanban does; open question 1.
- **Confidence**: high. **Status**: fixed. **Resolution**: `getRowLabel` on `DataGrid`; `pinRow`, `unpinRow`, `selectRow`, `expandRow`, `collapseRow`, and `dragToReorderRow` are functions of the row name, `rowNumber` is the fallback, and column grips use `dragToReorderColumn(title)`; mutation checked. Audit question 1 answered: a `getRowLabel` prop (Q27 A).

### F-05 Loading is not announced

- **Location**: the spinner mode, `data-grid-table-body.tsx:754-762` (`DataGridTableLoader`) and `:1003-1013` (the loading row); the skeleton mode at `:964`.
- **Evidence**: in `data-grid-states--loading-skeleton` the probe found no `role='status'`, no `aria-live`, and no `aria-busy` on the table or its container. The spinner mode was not probed; `Spinner` draws `role='status'` unless it is decorative (`spinner.component.tsx:57-58`), so it may announce there.
- **Impact**: a screen reader user is not told the data is loading, or that it has loaded (WCAG 4.1.3).
- **Smallest fix**: `aria-busy` on the table while `isLoading`, and a visually hidden live region with `labels.loading`.
- **Confidence**: high for skeleton. **Status**: fixed. **Resolution**: `aria-busy` on the table while loading plus a polite live region saying `labels.loading` and then `labels.loaded(count)`; in spinner mode the audit's open question is answered: the spinner was a second `role='status'` (it would have spoken twice), so it is hidden; plays cover both modes.

### F-06 A header button is disabled, not focusable, while loading

- **Location**: `data-grid-column.tsx:487` (the sort button) and `:454`.
- **Problem**: `disabled={isLoading}` takes the button out of the Tab order, so a focused header loses focus when loading starts. `Button` has `focusableWhenDisabled` for this. Not reproduced.
- **Confidence**: medium (hypothesis). **Status**: fixed. **Resolution**: 5f546d4: reproduced first (focus left a header button when loading began), then `focusableWhenDisabled` on the sort button and the menu trigger; the play asserts focus stays and a click while loading does not sort.

### F-07 A non-sortable resizable column header may sort

- **Location**: `data-grid-column.tsx:481-492` renders a `Button` with `onClick={handleSort}` when `canSort || (columnsResizable && canResize)`; `handleSort` (`:240-248`) calls `column.toggleSorting` with no `getCanSort` check.
- **Problem**: a resizable column with `enableSorting: false` gets a header button that calls `toggleSorting`. TanStack's `toggleSorting` is not guarded by `getCanSort` (the guard sits in `getToggleSortingHandler`), so the click may sort a column that must not. No story has a resizable, non-sortable column, so it was not reproduced.
- **Smallest fix**: guard `handleSort` with `column.getCanSort()`, and add the story.
- **Confidence**: medium (hypothesis). **Status**: fixed. **Resolution**: 0f2a26a: reproduced first (the `Resizable, not sortable` play failed: clicking Genre sorted it), then `handleSort` guards `getCanSort()` and a non-sortable header is a plain label; the TanStack 9.3.1 source confirms `column_toggleSorting` has no guard.

### F-08 The pager is a `div`, not a named navigation

- **Location**: `data-grid-table-pager.tsx:204`. The page buttons are named and the current one has `aria-current` (`:148-149`); the surrounding element is a `div` with no landmark.
- **Impact**: a screen reader's landmark list has no "pagination" entry. `Pagination` (the extra component) is a `nav`.
- **Smallest fix**: `<nav aria-label={labels.pagination}>`.
- **Confidence**: high. **Status**: fixed. **Resolution**: the page buttons are a `nav` named `labels.pagination`; a play proves the contents.

### F-09 Keyboard drag announcements are dnd-kit's defaults

- **Location**: `data-grid-table-dnd.tsx:334` and `:833` (`DndContext`), with `KeyboardSensor` at `:271` and `:760`.
- **Problem**: neither context passes `accessibility`, so dnd-kit speaks its English defaults, which name the draggable by its id, and they are not in `DataGridLabels`. The drag handles are named (`:153,419-437`). A keyboard drag was not run.
- **Smallest fix**: an `accessibility.announcements` object built from `labels`, as `Kanban` does (`labels` functions of the name, phase 29).
- **Confidence**: medium (hypothesis). **Status**: fixed. **Resolution**: reproduced (dnd-kit's default names the id); both drag contexts now speak the row or column name from `labels`, reusing Kanban's tested `dragAccessibility`; the `Draggable rows` and `Draggable columns` plays fail without it.

### F-10 The expand chevron rotates under reduced motion

- **Location**: `data-grid-table.stylex.ts:428-443` (`rowExpandChevron`: `transitionProperty: 'transform'`, `duration.medium`).
- **Evidence**: no `data-grid*.ts` file contains `prefers-reduced-motion`; 20 other stylesheets in `src` do (`'@media (prefers-reduced-motion: reduce)': 'none'` on the transition).
- **Impact**: a user who asked for no motion sees a 90 degree rotation. The color transitions at `data-grid.stylex.ts:70-71` and `data-grid-table.stylex.ts:394-395,421-422` are not motion in this sense.
- **Smallest fix**: the same media query on `rowExpandChevron`. The `:dir(rtl)` rule beside it was dead and is removed (issue-00007).
- **Confidence**: high. **Status**: fixed. **Resolution**: 3795b01: `rowExpandChevron` takes `'@media (prefers-reduced-motion: reduce)': 'none'` on its transition property; the new `Motion` story fails without the rule (mutation checked) and passes in Chromium, Firefox, and WebKit.

### F-11 Literal sizes, opacities, and a blur

- **Location**: `data-grid.stylex.ts:508` (`13`), `:510` and `:521` (`14`), `:542` (`width: 200`), `:545` (`maxHeight: 300`); `data-grid-table.stylex.ts:59` (`blur(2px)`) and `:911-915` (`opacity: 0.6`); `data-grid.stylex.ts:521` (`opacity: 0.5`).
- **Problem**: the contract is that every size comes from `src/styles` tokens. The glyph sizes should be `glyphSize`, the widths `unit` or `container` steps. The opacities are decorative (an idle icon, a spinner), not the disabled model of phase 11.
- **Not a finding**: the grid's local `gridLayer` ladder (`data-grid.stylex.ts:16-24`) is documented as local to the grid's stacking context.
- **Confidence**: high. **Status**: fixed. **Resolution**: 77bf391: `blur(2px)`, the widths 160, 200, 300, 5, 176, and 240, and the 1 px nudge use `unit`, `container`, and `stroke` tokens; the three `size={16}` icon props use `glyphSize.small` and the menu icons `glyphSize.xsmall`. The scan found more literals than this audit listed (`data-grid-table.stylex.ts:559,873,874`, three icon props in `data-grid-table-body.tsx`). CORRECTION: the 13 px and 14 px header glyph sizes were dead rules (the Button the sort icon sits in sizes it to 16 px, before and after; screenshots of seven stories in both themes are byte-identical), so they were deleted, not replaced. The decorative opacities (6 places) stay, by the questionnaire's Q34 A: the library uses 12 more in Kanban, Sortable, Skeleton, InputPhone, and Badge, and a token scale needs its own plan.

### F-12 The Playground logs a Storybook "color control" warning

- **Location**: `.storybook/preview.tsx:142-145` (`matchers.color: /(background|color)$/i`) and the Playground's `headerBackground` and `footerBackground` args.
- **Evidence**: the probe logged "Addon controls: Control of type color only supports string, received boolean" on `data-grid-playground--playground` only. The explicit `argTypes` use `control: 'boolean'` and the controls render as checkboxes, so the warning looks like a matcher pass over the arg names; the cause was not confirmed. It is `console.warn`, so the story gate (`console.error` only) does not fail it.
- **Smallest fix**: rename the two args, or narrow the matcher to `/(^|[a-z])Color$/`.
- **Confidence**: medium. **Status**: fixed. **Resolution**: d451cfb: the cause was the matcher (`/(background|color)$/i` claimed `headerBackground` and `footerBackground`); it is now `/color$/i`. The two warnings were recorded before and are gone after; the `color` Playgrounds keep their explicit controls.

### F-13 Two search inputs are named only by their placeholder

- **Location**: `stories/data-grid-editing.stories.tsx:197` (`placeholder='Search novels...'`) and `stories/data-grid-states.stories.tsx:711` (`placeholder='Search...'`).
- **Evidence**: the probe found two unnamed `input`s, one in each story. axe passes them (the gate is green), because a placeholder counts as a name there; it is not a durable one.
- **Smallest fix**: `aria-label` on both; stories only, no component change.
- **Confidence**: high. **Status**: fixed. **Resolution**: 81d8bdc: `aria-label='Search novels'` on both inputs, each story asserts `getByRole('textbox', { name: 'Search novels' })`.

### F-14 Cell links are 19 to 20 px high in four stories

- **Location**: `stories/data-grid-basics.stories.tsx:91,142,287,404` (`<a>` in a cell).
- **Evidence**: 7 links of 19 to 20 px height in `dense-layout`, `auto-width-table-layout`, and `pagination` (probe, 1440 px). Story content, not a component. Whether the 2.5.8 spacing exception covers them was not measured.
- **Confidence**: low. **Status**: false_positive. **Resolution**: Measured, 2026-11-25: 19 to 20 px high in `pagination`, `dense-layout`, `striped-rows`, and `auto-width-table-layout`, but the nearest other target is at least 25 px from the center of every undersized link at 1200 px and 390 px (a 24 px circle needs more than 12 px), so WCAG 2.5.8's spacing exception applies. No change.

### F-15 No unit test covers the grid

- **Location**: `src/data-grid/` holds no `*.test.*` file. `data-grid-cell-ops.ts` (1,008 lines of clipboard parse and format, fill, and clear) and `data-grid-table-utils.tsx` (333) are pure logic that only the editing stories exercise.
- **Impact**: a change to paste or fill parsing is checked by one story play, in one browser run, with no case table.
- **Smallest fix**: a test in the `unit` project (plan-00011 phase 3) per pure function, starting with `cell-ops`.
- **Confidence**: high. **Status**: fixed. **Resolution**: 43c33a6 and 76498fa: 54 unit tests in `data-grid-cell-ops.test.ts` and `data-grid-table-utils.test.ts` (case tables written by hand; three scratch breaks in each file were caught). The functions that need a live table instance (`buildDataGridPasteDetails`, `buildDataGridClearDetails`) stay with the editing stories; `getDataGridStepTarget` is covered through a stub of the column getters and a DOM fixture.

## Not findings (checked)

- **Overflow**: none in any of the 152 cases at 390 and 1440 px (the 390 px overflow gate of phase 53 also holds the stories).
- **Console**: no `console.error` in any case; one warning (F-12).
- **Semantics**: with `cellSelection` on, the table is `role='grid'` with `aria-rowcount`, `aria-rowindex`, `aria-colindex`, `aria-multiselectable`, and `aria-activedescendant` on the focus target (`data-grid-table.tsx:138-158`, `data-grid-table-head.tsx:302`, `data-grid-table-body.tsx:244,405`, `data-grid-cell.tsx:142-159`); a header `th` carries `scope='col'` and `aria-sort` (`data-grid-table-head.tsx:341`); virtual spacer rows are `aria-hidden` (`data-grid-table-virtual.tsx:375`).
- **Tab stops**: `column-virtualization` has 20 (one sort button per header); no roving tabindex, which is a choice, not a defect.
- **Localization**: every built-in string except the dnd-kit announcements (F-09) comes from `DataGridLabels`.

## Open questions

Both were settled by the owner on 2026-11-25 (plan-00012 questionnaire, every recommendation accepted):

1. Row labels (F-04): yes, functions of the row. `getRowLabel(row)` on `DataGrid` names a row, `labels.rowNumber(position)` is the fallback, and the six row labels became functions of that name (Q27 A, Q28 A).
2. Table name (F-03): props, not `labels`. `aria-label` or `aria-labelledby` on the part that renders the `<table>`, required by type (Q24 A, Q25 A, Q26 A).

## Coverage and limitations

- The probe ran in Chromium only; plan-00011 phase 59 runs the story gate in Firefox and WebKit.
- Keyboard drag (F-09), the spinner-mode announcement (F-05), and the resize and sort interplay (F-07) need a play each; none was written, because this phase is report only.
- Reduced motion and forced colors were read from the source, not emulated.

## Closed here (audit-00002 F-14)

The OTP warning ("`<OTPField.Input>` ignores `aria-label` on the first input") came from two stories, `Variants` and `Sizes`, that gave every slot an `aria-label`, the first included. The component already names the first slot from the root (`aria-labelledby` the root's label or `aria-label`, `otp-field.component.tsx:139-144`). The probe resolved the first slot's name to "Code outline" (and its siblings), "Code small", and "Verification code": it is named. The two stories no longer set slot labels, and the ten OTP stories log nothing.
