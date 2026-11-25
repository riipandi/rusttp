---
status: resolved
created: 2026-11-23T23:30:00+07:00
updated: 2026-11-24T01:00:00+07:00
summary: "Data grid parts declared props that nothing read; found while writing the props page in plan-00009 phase 7. Two were wired and covered by stories, five were removed on the owner's decision (2026-11-24)."
count: 4
---

# Data grid props that nothing reads

## DataGridPagination declared four unread props

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid-table-pager.tsx` declared `sizesInfo`, `sizesLabel`, `sizesDescription`, and `more`, and no code in the folder read them.
  resolution: removed on the owner's decision. The rows-per-page label stays `rowsPerPageLabel` / the `rowsPerPage` i18n label, and the page-number group stays gated by `pageCount` and `moreLimit`. `rg "sizesInfo|sizesLabel|sizesDescription"` over `packages`, `.agents`, and `docs` finds only this file; the props page rows are gone.
  trigger: None — closed.

## DataGridTableHeadRow declared an unread rowId

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid-table-head.tsx` typed `{ children, rowId }` and destructured only `children`.
  resolution: wired. The row renders `data-header-row-id={rowId}`, not `data-row-id`, because the cell logic in `data-grid-cell.tsx` reads `data-row-id` to find data rows. The story `Data Grid/Basics > Header row id` asserts the attribute is `start_0:center_0:end_0` and that `thead tr[data-row-id]` stays absent while `tbody tr[data-row-id]` exists.
  trigger: None — closed.

## DataGridContainer declared an unread border

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid.tsx` declared `border?: boolean` with the comment "Accepted for backwards compatibility; currently has no effect", which the project rule against compatibility shims rules out.
  resolution: wired. `border` adds the `containerBordered` style (1px `borderNeutralFaded` edge, `radius.large`). The story `Data Grid/Basics > Container border` asserts a 0px edge by default and a 1px edge with 10px corners with `border`.
  trigger: None — closed.

## DataGridColumnHeader declared pinnable

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid-column.tsx` declared `pinnable?: boolean` as "reserved" and nothing read it.
  resolution: removed on the owner's decision. Pin controls stay gated by `tableLayout.columnsPinnable` and `column.getCanPin()`; `rg "pinnable\b"` finds no use outside this file's history.
  trigger: None — closed.
