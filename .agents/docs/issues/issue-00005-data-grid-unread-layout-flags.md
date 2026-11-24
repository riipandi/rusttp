---
status: open
created: 2026-11-24T12:05:00+07:00
updated: 2026-11-24T12:05:00+07:00
summary: "Two Data Grid tableLayout flags are declared, defaulted, and documented, but no code reads them; found while building the Data Grid Playground in plan-00010 phase 4."
count: 2
---

# Data grid layout flags that nothing reads

## tableLayout.rowRounded has no effect

- status: open
  area: packages/uilibs
  summary: `data-grid.tsx:703` declares `rowRounded`, `:944` defaults it to `false`, and `data-grid.mdx:116` documents "Rounded row corners", but `rg rowRounded packages/uilibs/src/extra/data-grid` finds no read outside those lines (`data-grid-table*.tsx`, `data-grid-cell*.tsx` never mention it). The Basics stories `Without table borders` and `Striped rows` pass it and look the same with or without it.
  resolution: None yet. Either wire it to a row style or remove it and its docs row, as issue-00004 did for the other unread props; the owner decides. The Data Grid Playground has no `rowRounded` control until then.
  trigger: A decision on wiring or removing the flag.

## tableLayout.rowsDraggable has no effect

- status: open
  area: packages/uilibs
  summary: `data-grid.tsx:716` declares `rowsDraggable`, `:958` defaults it to `false`, and `data-grid.mdx:129` says it "Lets rows be dragged in `DataGridTableDndRows`", but nothing reads it. `DataGridTableDndRows` is chosen by the story rendering that component, and the `Draggable rows` story never sets the flag.
  resolution: None yet. Wire it (render `DataGridTableDndRows` behaviour from the flag) or remove it with its docs row; the owner decides. The Playground has no `rowsDraggable` control until then.
  trigger: A decision on wiring or removing the flag.
