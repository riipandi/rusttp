---
title: "Audit: packages/uilibs data grid (src/data-grid)"
status: in_review
created_at: 2026-11-25T18:30:00+07:00
updated_at: 2026-11-25T18:30:00+07:00
completed_at: null
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
    by_status: { open: 15, fixed: 0, deferred: 0, wont_fix: 0, false_positive: 0 }
    verified: 10
    unverified: 5
cleanup_candidates: 0
optimization_opportunities: 0
open_questions: 2
tests_added: 0
standards: [WCAG 2.2 AA (1.3.1, 2.1.1, 2.3.3, 4.1.3), WAI-ARIA 1.2 (grid, table)]
generated_by: ui-audit
---

# Audit: the uilibs data grid

Report only (plan-00011 phase 56, Q64): nothing here changes code. The grid is `packages/uilibs/src/data-grid`, 16 files and 11,215 lines, with eight story files and a Playground. Its details are in the audit-00002 exclusion "data grid internals beyond axe, probe and one focus check"; this audit lifts it.

## Method

1. **Story probe.** Playwright over all 38 grid stories, in light and dark, at 390 and 1440 px (152 cases): console errors and warnings, horizontal overflow, unnamed interactive elements, targets under 24 px, Tab stops, table names, and the grid role.
2. **Static contract scan.** Literal sizes and opacities, raw media queries, motion without a reduced-motion rule, and `labels` coverage.
3. **Source read.** The semantic parts: `data-grid-table.tsx`, `-table-head.tsx`, `-table-body.tsx`, `-column.tsx`, `-table-pager.tsx`, `-table-dnd.tsx`, and the labels.

## Findings

| ID | Severity | Category | Location | Title | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | medium | a11y (2.1.1) | `data-grid-table-head.tsx:505-510` | Column resizing is pointer only | verified | open |
| F-02 | medium | a11y (2.1.1) | `data-grid-table-body.tsx:245` | `onRowClick` rows have no keyboard path | verified | open |
| F-03 | low | a11y (1.3.1) | `data-grid-table.tsx:143` | The table has no accessible name | verified | open |
| F-04 | low | a11y | `data-grid-labels.tsx:25-32`, `data-grid-table-body.tsx:799,860,924` | Every row control has the same name | verified | open |
| F-05 | low | a11y (4.1.3) | `data-grid-table-body.tsx:754-762,1003-1013` | Loading is not announced | verified | open |
| F-06 | low | a11y | `data-grid-column.tsx:454,487` | A header button is disabled, not focusable, while loading | unverified | open |
| F-07 | low | defect | `data-grid-column.tsx:240-248,481-492` | A non-sortable resizable column header may sort | unverified | open |
| F-08 | low | a11y | `data-grid-table-pager.tsx:204` | The pager is a `div`, not a named navigation | verified | open |
| F-09 | low | a11y | `data-grid-table-dnd.tsx:334,833` | Keyboard drag announcements are dnd-kit's defaults | unverified | open |
| F-10 | low | a11y (2.3.3) | `data-grid-table.stylex.ts:428-443` | The expand chevron rotates under reduced motion | verified | open |
| F-11 | low | StyleX contract | `data-grid.stylex.ts:508,510,521,542,545`, `data-grid-table.stylex.ts:59,911` | Literal sizes, opacities, and a blur | verified | open |
| F-12 | low | story | `.storybook/preview.tsx:142-145`, `stories/data-grid-playground.stories.tsx` | The Playground logs a Storybook "color control" warning | unverified | open |
| F-13 | low | story | `stories/data-grid-editing.stories.tsx:197`, `stories/data-grid-states.stories.tsx:711` | Two search inputs are named only by their placeholder | verified | open |
| F-14 | info | story | `stories/data-grid-basics.stories.tsx:91,142,287,404` | Cell links are 19 to 20 px high in four stories | unverified | open |
| F-15 | low | test quality | `src/data-grid/` | No unit test covers the 11,215 lines | verified | open |

### F-01 Column resizing is pointer only

- **Location**: `data-grid-table-head.tsx:505-510`, the `span` with `data-slot='data-grid-table-resize-handle'`.
- **Problem**: the handle takes `onMouseDown`, `onTouchStart`, and `onDoubleClick` and nothing else: no `tabIndex`, no `role`, no key handler. `onKeyDown`, `ArrowLeft`, and `ArrowRight` appear in `data-grid-table-head.tsx` and `data-grid-column.tsx` only as icon names.
- **Impact**: with `columnsResizable`, a keyboard user cannot change a column's width (WCAG 2.1.1). The header menu offers move, pin, and sort, but no size.
- **Smallest fix**: a header-menu item pair ("Make wider" and "Make narrower", `labels` entries) calling `column.getSize` and the table's `setColumnSizing`, or a focusable separator with `role='separator'` and `aria-valuenow` that answers the arrows.
- **Confidence**: high. **Status**: open.

### F-02 `onRowClick` rows have no keyboard path

- **Location**: `data-grid-table-body.tsx:245` (`onClick` on the `tr`), with the hover cursor at `:124,248`.
- **Problem**: a clickable row is a `tr` with a mouse handler. Nothing makes it focusable (`tabIndex` is set on no row; the only `tabIndex` in the grid is the cell-selection focus target, `data-grid-cell.tsx:1042`) and no key invokes it. `data-grid.mdx:112` documents the prop as "Makes rows clickable".
- **Impact**: whatever `onRowClick` opens, a keyboard user cannot reach. With `cellSelection` on, the focus target moves between cells, and whether Enter calls `onRowClick` was not checked.
- **Smallest fix**: document that `onRowClick` is a pointer shortcut and that the action must exist as a control in the row; or add `tabIndex` and Enter and Space handling to a clickable row.
- **Confidence**: high for a plain grid. **Status**: open.

### F-03 The table has no accessible name

- **Location**: `data-grid-table.tsx:143` (`<table>`). `DataGridTable` takes only `footerContent`, `renderHeader`, and `table`, so a consumer cannot pass `aria-label`, and `DataGridLabels` has no table name. `data-grid.mdx` does not mention naming.
- **Evidence**: the probe found a `table` with no `aria-label`, `aria-labelledby`, or `caption` in all 38 stories (light, 1440 px).
- **Impact**: a screen reader announces "table" for each grid, so two grids on a page are not told apart. `Table` (the extra component) solved this with `labels.region` and the caption (plan-00011 phase 26).
- **Smallest fix**: `DataGrid` takes `aria-label` (or `labels.table`) and the table carries it.
- **Confidence**: high. **Status**: open.

### F-04 Every row control has the same name

- **Location**: `data-grid-labels.tsx:25-32` types `pinRow`, `selectRow`, `expandRow`, and `dragToReorderRow` as plain strings, defaults at `:62-69`; they reach the DOM at `data-grid-table-body.tsx:799` (pin), `:860` (select), `:924` (expand), and `data-grid-table-dnd.tsx:419-437` (drag).
- **Problem**: ten rows give ten checkboxes named "Select row". `unpinColumn` is already a function of the column title (`:21`), so the pattern exists.
- **Impact**: a screen reader's control list cannot tell the rows apart. Kanban and Sortable took this fix in phase 29 (`labels.handle` is a function of the item name).
- **Smallest fix**: make the four labels functions of the row (a `getRowLabel(row)` prop or a `meta.rowTitle`), as Kanban does; open question 1.
- **Confidence**: high. **Status**: open.

### F-05 Loading is not announced

- **Location**: the spinner mode, `data-grid-table-body.tsx:754-762` (`DataGridTableLoader`) and `:1003-1013` (the loading row); the skeleton mode at `:964`.
- **Evidence**: in `data-grid-states--loading-skeleton` the probe found no `role='status'`, no `aria-live`, and no `aria-busy` on the table or its container. The spinner mode was not probed; `Spinner` draws `role='status'` unless it is decorative (`spinner.component.tsx:57-58`), so it may announce there.
- **Impact**: a screen reader user is not told the data is loading, or that it has loaded (WCAG 4.1.3).
- **Smallest fix**: `aria-busy` on the table while `isLoading`, and a visually hidden live region with `labels.loading`.
- **Confidence**: high for skeleton. **Status**: open.

### F-06 A header button is disabled, not focusable, while loading

- **Location**: `data-grid-column.tsx:487` (the sort button) and `:454`.
- **Problem**: `disabled={isLoading}` takes the button out of the Tab order, so a focused header loses focus when loading starts. `Button` has `focusableWhenDisabled` for this. Not reproduced.
- **Confidence**: medium (hypothesis). **Status**: open.

### F-07 A non-sortable resizable column header may sort

- **Location**: `data-grid-column.tsx:481-492` renders a `Button` with `onClick={handleSort}` when `canSort || (columnsResizable && canResize)`; `handleSort` (`:240-248`) calls `column.toggleSorting` with no `getCanSort` check.
- **Problem**: a resizable column with `enableSorting: false` gets a header button that calls `toggleSorting`. TanStack's `toggleSorting` is not guarded by `getCanSort` (the guard sits in `getToggleSortingHandler`), so the click may sort a column that must not. No story has a resizable, non-sortable column, so it was not reproduced.
- **Smallest fix**: guard `handleSort` with `column.getCanSort()`, and add the story.
- **Confidence**: medium (hypothesis). **Status**: open.

### F-08 The pager is a `div`, not a named navigation

- **Location**: `data-grid-table-pager.tsx:204`. The page buttons are named and the current one has `aria-current` (`:148-149`); the surrounding element is a `div` with no landmark.
- **Impact**: a screen reader's landmark list has no "pagination" entry. `Pagination` (the extra component) is a `nav`.
- **Smallest fix**: `<nav aria-label={labels.pagination}>`.
- **Confidence**: high. **Status**: open.

### F-09 Keyboard drag announcements are dnd-kit's defaults

- **Location**: `data-grid-table-dnd.tsx:334` and `:833` (`DndContext`), with `KeyboardSensor` at `:271` and `:760`.
- **Problem**: neither context passes `accessibility`, so dnd-kit speaks its English defaults, which name the draggable by its id, and they are not in `DataGridLabels`. The drag handles are named (`:153,419-437`). A keyboard drag was not run.
- **Smallest fix**: an `accessibility.announcements` object built from `labels`, as `Kanban` does (`labels` functions of the name, phase 29).
- **Confidence**: medium (hypothesis). **Status**: open.

### F-10 The expand chevron rotates under reduced motion

- **Location**: `data-grid-table.stylex.ts:428-443` (`rowExpandChevron`: `transitionProperty: 'transform'`, `duration.medium`).
- **Evidence**: no `data-grid*.ts` file contains `prefers-reduced-motion`; 20 other stylesheets in `src` do (`'@media (prefers-reduced-motion: reduce)': 'none'` on the transition).
- **Impact**: a user who asked for no motion sees a 90 degree rotation. The color transitions at `data-grid.stylex.ts:70-71` and `data-grid-table.stylex.ts:394-395,421-422` are not motion in this sense.
- **Smallest fix**: the same media query on `rowExpandChevron`. The `:dir(rtl)` rule beside it is issue-00007.
- **Confidence**: high. **Status**: open.

### F-11 Literal sizes, opacities, and a blur

- **Location**: `data-grid.stylex.ts:508` (`13`), `:510` and `:521` (`14`), `:542` (`width: 200`), `:545` (`maxHeight: 300`); `data-grid-table.stylex.ts:59` (`blur(2px)`) and `:911-915` (`opacity: 0.6`); `data-grid.stylex.ts:521` (`opacity: 0.5`).
- **Problem**: the contract is that every size comes from `src/styles` tokens. The glyph sizes should be `glyphSize`, the widths `unit` or `container` steps. The opacities are decorative (an idle icon, a spinner), not the disabled model of phase 11.
- **Not a finding**: the grid's local `gridLayer` ladder (`data-grid.stylex.ts:16-24`) is documented as local to the grid's stacking context.
- **Confidence**: high. **Status**: open.

### F-12 The Playground logs a Storybook "color control" warning

- **Location**: `.storybook/preview.tsx:142-145` (`matchers.color: /(background|color)$/i`) and the Playground's `headerBackground` and `footerBackground` args.
- **Evidence**: the probe logged "Addon controls: Control of type color only supports string, received boolean" on `data-grid-playground--playground` only. The explicit `argTypes` use `control: 'boolean'` and the controls render as checkboxes, so the warning looks like a matcher pass over the arg names; the cause was not confirmed. It is `console.warn`, so the story gate (`console.error` only) does not fail it.
- **Smallest fix**: rename the two args, or narrow the matcher to `/(^|[a-z])Color$/`.
- **Confidence**: medium. **Status**: open.

### F-13 Two search inputs are named only by their placeholder

- **Location**: `stories/data-grid-editing.stories.tsx:197` (`placeholder='Search novels...'`) and `stories/data-grid-states.stories.tsx:711` (`placeholder='Search...'`).
- **Evidence**: the probe found two unnamed `input`s, one in each story. axe passes them (the gate is green), because a placeholder counts as a name there; it is not a durable one.
- **Smallest fix**: `aria-label` on both; stories only, no component change.
- **Confidence**: high. **Status**: open.

### F-14 Cell links are 19 to 20 px high in four stories

- **Location**: `stories/data-grid-basics.stories.tsx:91,142,287,404` (`<a>` in a cell).
- **Evidence**: 7 links of 19 to 20 px height in `dense-layout`, `auto-width-table-layout`, and `pagination` (probe, 1440 px). Story content, not a component. Whether the 2.5.8 spacing exception covers them was not measured.
- **Confidence**: low. **Status**: open.

### F-15 No unit test covers the grid

- **Location**: `src/data-grid/` holds no `*.test.*` file. `data-grid-cell-ops.ts` (1,008 lines of clipboard parse and format, fill, and clear) and `data-grid-table-utils.tsx` (333) are pure logic that only the editing stories exercise.
- **Impact**: a change to paste or fill parsing is checked by one story play, in one browser run, with no case table.
- **Smallest fix**: a test in the `unit` project (plan-00011 phase 3) per pure function, starting with `cell-ops`.
- **Confidence**: high. **Status**: open.

## Not findings (checked)

- **Overflow**: none in any of the 152 cases at 390 and 1440 px (the 390 px overflow gate of phase 53 also holds the stories).
- **Console**: no `console.error` in any case; one warning (F-12).
- **Semantics**: with `cellSelection` on, the table is `role='grid'` with `aria-rowcount`, `aria-rowindex`, `aria-colindex`, `aria-multiselectable`, and `aria-activedescendant` on the focus target (`data-grid-table.tsx:138-158`, `data-grid-table-head.tsx:302`, `data-grid-table-body.tsx:244,405`, `data-grid-cell.tsx:142-159`); a header `th` carries `scope='col'` and `aria-sort` (`data-grid-table-head.tsx:341`); virtual spacer rows are `aria-hidden` (`data-grid-table-virtual.tsx:375`).
- **Tab stops**: `column-virtualization` has 20 (one sort button per header); no roving tabindex, which is a choice, not a defect.
- **Localization**: every built-in string except the dnd-kit announcements (F-09) comes from `DataGridLabels`.

## Open questions

1. Should the row labels (F-04) be functions of the row, as Kanban's are? It needs a way to name a row (a `getRowLabel` prop or `meta.rowTitle`).
2. Should the grid take an `aria-label` prop (F-03), or a `labels.table` entry, or both?

## Coverage and limitations

- The probe ran in Chromium only; plan-00011 phase 59 runs the story gate in Firefox and WebKit.
- Keyboard drag (F-09), the spinner-mode announcement (F-05), and the resize and sort interplay (F-07) need a play each; none was written, because this phase is report only.
- Reduced motion and forced colors were read from the source, not emulated.

## Closed here (audit-00002 F-14)

The OTP warning ("`<OTPField.Input>` ignores `aria-label` on the first input") came from two stories, `Variants` and `Sizes`, that gave every slot an `aria-label`, the first included. The component already names the first slot from the root (`aria-labelledby` the root's label or `aria-label`, `otp-field.component.tsx:139-144`). The probe resolved the first slot's name to "Code outline" (and its siblings), "Code small", and "Verification code": it is named. The two stories no longer set slot labels, and the ten OTP stories log nothing.
