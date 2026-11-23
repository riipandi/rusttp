---
status: considering
created: 2026-11-23T23:30:00+07:00
updated: 2026-11-23T23:30:00+07:00
summary: "Data grid parts declare props that nothing reads; found while writing the props page in plan-00009 phase 7. The page marks each as not read; the owner decides to wire or remove them."
count: 4
---

# Data grid props that nothing reads

## DataGridPagination declares four unread props

- status: considering
  area: packages/uilibs
  summary: `packages/uilibs/src/extra/data-grid/data-grid-table-pager.tsx:86-90` declares `sizesInfo`, `sizesLabel`, `sizesDescription`, and `more`, and no code in the folder reads them.
  plan: none
  trigger: the owner decides to wire them to the pager or drop them; the props page (`data-grid.mdx`) lists each as "Declared; not read" until then.

## DataGridTableHeadRow declares an unread rowId

- status: considering
  area: packages/uilibs
  summary: `packages/uilibs/src/extra/data-grid/data-grid-table-head.tsx:295` types `{ children, rowId }` and destructures only `children`.
  plan: none
  trigger: as above.

## DataGridContainer declares an unread border

- status: considering
  area: packages/uilibs
  summary: `packages/uilibs/src/extra/data-grid/data-grid.tsx:998` declares `border?: boolean` on the container props with the comment "Accepted for backwards compatibility; currently has no effect", which the project rule against compatibility shims rules out; the props page records it as not read.
  plan: none
  trigger: as above.

## DataGridColumnHeader pinnable is reserved

- status: considering
  area: packages/uilibs
  summary: `packages/uilibs/src/extra/data-grid/data-grid-column.tsx:203` declares `pinnable?: boolean`, the only mention of `pinnable` in the file; the props page records it as reserved.
  plan: none
  trigger: as above.
