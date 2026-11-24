---
status: done
created: 2026-11-24T12:40:00+07:00
plan: plan-00010-uilibs-playground-controls
---

# Handover: Plan 00010 closed, controls show only in each Playground and every Playground drives its component

## What this session did

The owner wanted every component's props easy to try in Storybook: controls only in a `Playground`, and every `Playground` wired to its args. A new thread ran the plan's seven phases in order, one commit each, without pushing.

- `.storybook/preview.tsx` turns controls off (`controls.disable: true`); each `Playground` sets `parameters.controls` with `disable: false` and an `include` list, and carries its own `argTypes` and `args` (D1, D2).
- 35 base files, 27 extra files plus `icons`, and the 18 chart files follow the rule. A compound component routes the part props that shape its look to that part (`DialogContent` `size`, `SelectContent` `side`, `PopoverContent` `padding`), typed as a local `PlaygroundArgs` (D3).
- New: `extra/data-grid/stories/data-grid-playground.stories.tsx` (19 flat controls grouped by `table.category`, folded into `tableLayout`, D5) and the Kanban `Playground`; Sortable's `Playground` was rewired (D6). The three `contracts/` files and the seven Data Grid topic files have none (D5, D8).
- Gate 952 of 952 after phases 1 to 3 and 5, 956 of 956 after phase 4 (the two new Playgrounds in light and dark) and at the close. A browser probe of every Playground confirmed that the Controls panel lists exactly its `include` list.
- Ledger: `issue-00005` (two Data Grid `tableLayout` flags that nothing reads) and `issue-00006` (DescriptionList has no prop to control) filed; plan-00010 and handover-00012 archived; docs synced in `frontend.md`, `packages/uilibs/AGENTS.md`, and `components.mdx`. `docs/` has no Storybook page.

## Commits (this slice)

- `feat(uilibs): show story controls only in the Playground` (`46b0501`) — preview switch, Button, Badge, Dialog.
- `feat(uilibs): wire Playground controls for the base components` (`c8eb855`)
- `feat(uilibs): wire Playground controls for the extra components` (`ba2be53`)
- `feat(uilibs): add Playgrounds for kanban, sortable, and the data grid` (`137e745`)
- `feat(uilibs): wire Playground controls for the charts` (`a92093a`)
- The closing commit (docs sync, ledger close, this handover).

## What stayed open / the trap

- `issue-00005`: `tableLayout.rowRounded` and `rowsDraggable` are declared and documented but nothing reads them, so the Data Grid Playground has no control for them. Next action: the owner decides to wire or remove them.
- `issue-00006`: DescriptionList's Playground shows no controls. Next action: the owner decides whether it takes a story-only control.
- Deviations from D7, for the owner to confirm: a chart with no legend and one series (boxplot, lollipop) gets a `legend` control that defaults off and adds the existing `ChartLegend`; the markup charts have no series, so their control is a part they draw (`boundaryLabels`, `weekLabels`, `period`, `fraction`, `highlightFirst`, and a checklist of cards or houses).
- The trap: `argTypes` without `parameters.controls.include` show every inferred Base UI prop (40 on a root), and a control on a prop that a `defaultChecked`/`defaultOpen` only seeds does nothing until the render remounts the component with a `key`. Progress's old timer also overrode `value`. One full gate run failed once on `input-group` Sizes (26 against 32 px) and passed on every rerun; it did not repeat.
