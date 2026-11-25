---
status: resolved
created: 2026-11-24T11:58:50+07:00
updated: 2026-11-24T12:26:04+07:00
summary: "Two Data Grid tableLayout flags were declared, defaulted, and documented, but no code read them; found while building the Data Grid Playground in plan-00010 phase 4. Both were removed on the owner's decision (2026-11-24)."
count: 2
---

# Data grid layout flags that nothing reads

## tableLayout.rowRounded has no effect

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid.tsx` declared `rowRounded` in `tableLayout` and defaulted it to `false`, and `data-grid.mdx` documented "Rounded row corners", but nothing in `extra/data-grid` read it. The Basics stories `Without table borders` and `Striped rows` passed it with no visible effect.
  resolution: removed on the owner's decision, with no shim, as issue-00004 did for the other unread props. The type key, its default, the `data-grid.mdx` row, both Basics story usages, and the Playground comment that explained its absence are gone. `rg rowRounded packages` finds nothing; gate 956 of 956.
  trigger: None — closed.

## tableLayout.rowsDraggable has no effect

- status: resolved (2026-11-24)
  area: packages/uilibs
  summary: `data-grid.tsx` declared `rowsDraggable` and defaulted it to `false`, and `data-grid.mdx` said it "Lets rows be dragged in `DataGridTableDndRows`", but nothing read it; row dragging comes from rendering `DataGridTableDndRows`.
  resolution: removed on the owner's decision. The type key, its default, and the `data-grid.mdx` row are gone; row dragging stays chosen by rendering `DataGridTableDndRows` (story `Draggable rows`). `rg rowsDraggable packages` finds nothing.
  trigger: None — closed.
