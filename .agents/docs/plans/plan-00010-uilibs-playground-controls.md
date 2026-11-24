---
status: in-progress
created: 2026-11-24T11:03:41+07:00
updated: 2026-11-24T12:20:00+07:00
phases:
    - id: 1
      title: Controls mechanism and the pilot (Button, Badge, Dialog)
      status: done
      note: Controls off globally in preview.tsx; Button, Badge, Dialog Playgrounds wired. Gate 952 of 952. Dialog has no `position` prop, so its routed part args are size, blurredOverlay, showCloseButton.
    - id: 2
      title: Base component Playgrounds
      status: done
      note: All 35 base Playgrounds wired; checker 35 of 35, Controls panel lists exactly each include list, gate 952 of 952. Progress drops its timer so `value` takes effect; Separator controls color and inset only (its Playground draws three separators; `Orientations` keeps the axis); Form controls validationMode; Checkbox, Switch, and Collapsible remount on `defaultChecked`/`defaultOpen` so the control takes effect.
    - id: 3
      title: Extra component Playgrounds
      status: done
      note: 26 of 27 extra files plus icons wired; checker clean for all but kanban and sortable (phase 4); gate 952 of 952 (one run flaked on input-group Sizes, 26 vs 32 px, and passed twice in isolation and on a full rerun). OWNER DECISION NEEDED: DescriptionList has no prop that fits D3 (only `render` and `style`), so its Playground is unchanged and shows no controls. Deviations: Icon Playground now draws three icons driven by size and color (the two fixed-color icons are gone); Skeleton drives the wide line only; Pagination adds a `page` story arg that sets `isActive`; Label and Empty add story-only `label` and `title` text args.
    - id: 4
      title: Kanban, Sortable, and Data Grid Playgrounds
      status: done
      note: Kanban and Sortable Playgrounds (4 controls each, D6) and data-grid-playground.stories.tsx (19 controls grouped by category, D5) landed; gate 956 of 956 (952 plus 2 stories in light and dark). Deviation from D5/D6: `rowRounded` and `rowsDraggable` are not controls because no code reads them (issue-00005). Probe: `dense` 37 to 33 px rows, `pagination` off hides the pager, `isLoading` shows skeleton rows (spinner mode shows Loading...), `empty` shows the message, `rowSelection` adds checkboxes, `headerSticky` sets thead sticky.
    - id: 5
      title: Chart Playgrounds
      status: done
      note: All 18 chart Playgrounds wired; checker 18 of 18, Controls panel lists exactly each include list, gate 956 of 956 (unchanged). Probe on LineChart (points doubles the circles, potter off halves the lines, legend off removes it) and BarChart (bars switches vertical, horizontal, stacked, grouped). Deviations from D7: a chart with no legend and one series (boxplot, lollipop) gets only a `legend` control that defaults off and adds the existing ChartLegend; the markup charts have no series, so their control is the part they draw (category-bar boundaryLabels, tracker weekLabels, heatmap period, progress-circle fraction, bar-list highlightFirst, spark-chart and slopegraph choose which cards or houses show).
    - id: 6
      title: Docs sync, agent docs sync, ledger close, handover
      status: pending
      note: —
    - id: 7
      title: Final validation
      status: pending
      note: —
---

# Wire Storybook controls into every Playground — and show them nowhere else

## Objective

The owner wants every component's props easy to try in Storybook: each component gets one `Playground` story whose controls drive the rendered component, and every other story shows no controls. Today controls appear on every story, while most Playgrounds ignore their args, and four components (Data Grid, Kanban, and the contracts) have no Playground. The plan touches only stories, `.storybook/preview.tsx`, and docs. Component code stays as it is.

## Current state (verified in the tree, 2026-11-24)

- **Controls are on for every story.** `.storybook/preview.tsx:35` sets only `controls.matchers` and never `disable`. Storybook 10.6.8 (`pnpm-workspace.yaml:83`) therefore shows the Controls panel on every story with a `component` or `args`.
- **93 stories files.** 82 of them have `export const Playground`. These 11 do not:
  - `extra/data-grid/stories/data-grid-{basics,columns,editing,footers,infinite,rows,states}.stories.tsx` (7 files; the metas set no `component`, e.g. `data-grid-basics.stories.tsx:27`).
  - `extra/kanban/kanban.stories.tsx` (no `component`; stories start at `PlaceholderOverlay`, `:449`).
  - `contracts/{control-sizes,focus-visible,ref}.stories.tsx` (cross-component test contracts, not components).
- **Most Playgrounds ignore their args.** A scratch scan of each Playground body (does `render` take `args`, or is there no `render`?) found about 30 that pass args through. Examples that render fixed JSX: `base/alert-dialog/alert-dialog.stories.tsx:82` (`render: () =>`, no `argTypes`), `base/avatar` (has `argTypes.size`, render ignores it), `base/progress` (`args.value` set, render ignores it), `base/tooltip`, `extra/item`, `extra/icon`. Examples already wired: `base/button/button.stories.tsx:56`, `extra/badge`, `extra/text`, `base/toggle-group`.
- **`argTypes` live on the meta.** For example, `button.stories.tsx:20-29` puts them on the meta, so they show on every Button story.
- **Sortable's Playground takes no args** (`extra/sortable/sortable.stories.tsx:383`, `render: () => <ListOfItems />`), and its meta has no `component`.
- **Charts have Playgrounds without args.** All 18 files in `charts/stories/` have a `Playground` with `component: undefined`, e.g. `charts/stories/line-chart.stories.tsx:82` renders `<MultipleLines />`. Chart options live in `defineChart` marks (`lineY(..., { points, strokeWidth })`), not in component props.
- **58 Playgrounds carry a `play`** (scratch scan: every base overlay and menu, all 18 charts, plus card, item, table, textarea and others). Yet `.agents/docs/frontend.md:32` says "`Playground` (controls, no `play`)". The rule and the tree disagree.
- **Data Grid props are mostly a layout object.** `DataGridProps` (`extra/data-grid/data-grid.tsx:635`) takes `recordCount`, `isLoading`, `loadingMode: 'skeleton' | 'spinner'`, `emptyMessage` and `tableLayout`. `tableLayout` holds about 25 flags: `dense`, `cellBorder`, `rowBorder`, `rowRounded`, `stripped`, `headerBackground`, `headerSticky`, `width`, `columnsResizable`, `columnsPinnable`, `columnsMovable`, `rowsDraggable`, `cellSelection`, `cellSelectionMode` and more. The table itself comes from `useTable` in the story (`data-grid-basics.stories.tsx:44`), with data from `stories/_mocks.tsx`.
- **The docs pages render stories through `<Canvas of={Stories.X} />`**, and canvas controls are already hidden on docs pages (`fdd3f08`). No page uses `<Controls>` or `<ArgTypes>`.

## Decisions

- **D1 (2026-11-24): controls are off globally and on only in `Playground`.** `preview.tsx` gets `controls: { disable: true, matchers }`. Each `Playground` sets `parameters: { controls: { disable: false, include: [...] } }`, and the `include` list names exactly the controls it offers. With `include`, a Base UI root that infers 40 props shows only the curated ones.
  - Cost: every Playground repeats one `parameters` line.
  - Rejected: `parameters.controls.disable: true` on every non-Playground story. That means about 480 edits, and a new story would show controls by default.
  - Rejected: a shared `playgroundParameters` helper. It is one more name for a one-line object.
- **D2 (2026-11-24): `argTypes` move from the meta to the `Playground`.** Story-level `argTypes` keep the control definitions next to the one story that shows them. Meta `args` that every story needs, such as `onClick: fn()` on Button, stay on the meta.
- **D3 (2026-11-24): what a Playground controls.**
  - **Controlled props:** the root component's own visual and behavior props: `variant`, `color`, `size`, `disabled`, `orientation`, `side`, `align`, `multiple`, numeric ranges, and so on.
  - **Compound components:** for Dialog, Select, menus, Popover, Tabs and the like, the props that shape the look live on a part (`DialogContent` `size` and `position`, `SelectContent` `side`). The Playground routes those args to that part in `render`. It is typed as `StoryObj<PlaygroundArgs>` with a local `type PlaygroundArgs = ComponentProps<typeof Root> & Pick<ComponentProps<typeof Part>, ...>`.
  - **Text content:** the main text gets one `text` control where it is the point of the component (Button label, Badge, Kbd, Text, Alert title). Its name is `children` when the root takes text children, otherwise a story-only arg named for what it is (`title`, `label`).
  - **Never controls:** `style`, `render`, `className`, `labels`, `i18n`, refs, React-node slots, and data arrays. Callbacks are `fn()` args so the Actions panel logs them, with no control.
  - **Every option control has explicit `options`,** taken from the component's stylex map keys (`Object.keys(buttonSizes)`) or its union type, never a hand-typed list that can drift. Radio controls for up to 5 options, select above that.
- **D4 (2026-11-24): a Playground's `play`, when it has one, stays and asserts only what holds under its default args.** Moving 58 plays into new behavior stories is churn without coverage gain. The gate runs plays with default args only. `frontend.md:32` is corrected to match.
  - Rejected: delete or move every Playground `play`. That loses or duplicates coverage, and the rule it serves was never followed.
- **D5 (2026-11-24): Data Grid gets one new file, `extra/data-grid/stories/data-grid-playground.stories.tsx`, titled `Data Grid/Playground`.**
  - **Args are a flat story-only set, not `DataGridProps`.** They cover:
    - Each useful `tableLayout` boolean as its own control: `dense`, `cellBorder`, `rowBorder`, `rowRounded`, `stripped`, `headerBackground`, `headerSticky`, `columnsResizable`, `columnsPinnable`, `columnsMovable`, `columnsVisibility`, `rowsDraggable`, `cellSelection`.
    - Two layout selects: `cellSelectionMode` and `width`.
    - Root props: `isLoading`, `loadingMode`, and `empty`, a boolean that swaps in an empty data set to show `emptyMessage`.
    - Two feature switches that change the composed parts: `pagination`, which adds `DataGridPagination` with a `pageSize` number, and `rowSelection`, which adds the select column.
  - **Composition:** `render` builds `useTable` from `_mocks.tsx` data inside a component, and folds the flat args into `tableLayout`.
  - **Controls panel grouping:** `argTypes` sort the controls into Layout, Columns, Rows, Cells and State with `table.category`.
  - **Other files:** the seven existing Data Grid files get no Playground and no controls. The Data Grid docs page keeps attaching to `data-grid-basics.stories`.
  - Rejected: a Playground in each of the seven files. That means seven half-overlapping control sets.
  - Rejected: exposing `tableLayout` as one object control. JSON editing is not easy simulation.
- **D6 (2026-11-24): Kanban gets a new `Playground`, and Sortable's is rewired.** Both are drag containers whose props are callbacks and data, so their controls are:
  - **Kanban:** a `restoreOnCancel` boolean, a `columns` count (2 to 4), the column handle on or off, and the overlay on or off.
  - **Sortable:** `strategy` (the `STRATEGY_MAP` keys), a layout select (`list` or `grid`), the handle on or off, and the overlay on or off.
  - **Data:** both keep their current data shape. The Kanban Playground's tasks use the house sample data (Dan Brown and Harry Potter); the existing stories' generic task names are out of scope.
- **D7 (2026-11-24): Chart Playgrounds control the chart's options, not component props.** Each chart Playground takes only options its file's other stories already vary, such as `points`, `curve`, stacked or grouped, `orientation`, show or hide the legend, and which series show. The render passes them into `defineChart`. A chart whose stories vary nothing gets only legend and series-visibility controls. `component` stays `undefined`, and the controls come from story `argTypes`.
- **D8 (2026-11-24): the three `contracts/` files get no Playground.** They are cross-component test contracts, not components, and they stay under the `Contracts` sidebar group.

## Execution rules

- **The owner's request (2026-11-24) authorizes running every phase in order in a new thread, with one commit per phase using that phase's message.** Do not push.
- **Stage explicit paths only.** Never stage `packages/uilibs/.storybook/manager.ts` or `packages/artifacts/` (the owner's own work).
- **Change no component source.** If a Playground reveals a component defect, file it in `.agents/docs/issues/` and keep the story to what works today.
- **Each phase runs its validation before its commit.** The story gate never runs while Storybook runs. Stop Storybook first: `lsof -ti :6006 -sTCP:LISTEN | xargs -r kill` (also for port 6007).
- **Sample data:** Dan Brown and Harry Potter only.
- **When a component's prop set does not fit D3, ask the owner** (`AGENTS.md`, "Ambiguous decisions"). Do not invent a control.

## Phases

1. **Controls mechanism and the pilot (Button, Badge, Dialog)**
   - **What lands:**
     - `preview.tsx` turns controls off globally (D1).
     - Button and Badge Playgrounds are converted to D1 to D3, with `argTypes` moved off the meta.
     - Dialog is converted as the compound-component reference: `DialogContent` `size` and `position` are routed through `PlaygroundArgs`.
     - The scratch checker `.amp/in/probe/controls.py` is added. It reports per stories file whether the Playground exists, has `controls.disable: false`, has an `include` list, and has a `render` that reads `args`, and whether any other story or the meta re-enables controls.
   - **Validation:**
     - In a built Storybook (`pnpm storybook:build`, previewed on port 6007), a browser probe opens the Button Playground. The Controls tab lists exactly the `include` names, and changing `variant` changes the button's `data-variant`.
     - On `Button/Variants` the Controls tab is absent.
     - `pnpm --filter uilibs exec tsc --noEmit` (or `just typecheck`) is clean.
     - The gate is 952 of 952.
   - _Commit: `feat(uilibs): show story controls only in the Playground`._
2. **Base component Playgrounds**
   - **What lands:** all 35 `src/base/*` stories files follow D1 to D4. Every Playground `render` reads its args, and meta `argTypes` move to the Playground.
   - **Validation:**
     - The checker reports 35 of 35 base files clean.
     - Typecheck is clean.
     - The gate passes with the same count.
     - A browser probe on five Playgrounds (Select, Tabs, Popover, Slider, Toggle Group) changes one control each and sees the change in the DOM.
   - _Commit: `feat(uilibs): wire Playground controls for the base components`._
3. **Extra component Playgrounds**
   - **What lands:** the 27 `src/extra/*` stories files other than kanban, sortable and data-grid follow D1 to D4, and so does `src/icons/icons.stories.tsx`.
   - **Validation:**
     - The checker reports every one clean.
     - Typecheck is clean.
     - The gate count is unchanged.
     - A browser probe on four Playgrounds (Alert, Item, Table, Text) changes one control each.
   - _Commit: `feat(uilibs): wire Playground controls for the extra components`._
4. **Kanban, Sortable, and Data Grid Playgrounds**
   - **What lands:** the new Kanban `Playground`, the rewired Sortable `Playground`, and the new `data-grid-playground.stories.tsx` (D5, D6).
   - **Validation:**
     - The checker is clean for these files.
     - The gate count is 952 plus the new stories, each in light and dark, and green.
     - A browser probe on `Data Grid/Playground`:
       - Toggling `dense` changes the row height.
       - `pagination` shows the pager.
       - `isLoading` shows the skeleton.
       - `empty` shows the empty message.
       - Each axe check is clean.
   - _Commit: `feat(uilibs): add Playgrounds for kanban, sortable, and the data grid`._
5. **Chart Playgrounds**
   - **What lands:** the 18 `src/charts/stories/*` Playgrounds take D7 args.
   - **Validation:**
     - The checker is clean.
     - Typecheck is clean.
     - The gate count is unchanged.
     - A browser probe on LineChart and BarChart toggles one option each and sees the SVG change.
   - _Commit: `feat(uilibs): wire Playground controls for the charts`._
6. **Docs sync, agent docs sync, ledger close, handover**
   - **What lands:**
     - **`frontend.md:32`:** the Playground rule now reads: controls only here, `include` list, routed part args, `play` asserts the defaults only, and the Data Grid Playground file.
     - **`packages/uilibs/AGENTS.md`:** the stories line says controls live only in `Playground`.
     - **`.storybook/stories/components.mdx`, "Conventions":** one sentence that each component's Playground is where its props can be tried.
     - **`docs/`:** n/a unless `rg -il "storybook|stories" docs` finds a page.
     - **Ledger:** this plan is closed and archived, the `index.md` rows move, and `handover-00013` is written.
   - **Validation:**
     - Every path the changed docs name resolves.
     - The rule text matches the tree: the checker is clean over all files except `contracts/`.
   - _Commit: `docs(uilibs): record the Playground controls convention`._
7. **Final validation**
   - **What runs:** the test matrix over the tree as it stands.
   - _Commit: none if green; the ledger note rides phase 6._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Playground coverage | `python3 .amp/in/probe/controls.py` | Every stories file outside `contracts/` and the seven Data Grid topic files has one Playground with controls on, an `include` list, and a `render` that reads args; no other story re-enables controls |
| Types | `just typecheck` | 0 errors |
| Format and lint | `pnpm format:check`, `pnpm lint` | Clean |
| Story gate | `cd packages/uilibs && pnpm test` (Storybook stopped) | All pass; the count is 952 plus the new Playgrounds |
| Build | `pnpm storybook:build` in `packages/uilibs` | Green; `index.json` has `data-grid-playground--playground` and `extra-components-kanban--playground` |
| Controls UI | Browser probe on port 6007: a Playground lists its `include` controls and a change reaches the DOM; a non-Playground story has no Controls tab; a docs page shows no canvas controls | All probed stories pass |
| E2E | n/a: stories only, no webapp change | — |

## Explicitly out of scope

- **`<Controls>` or `<ArgTypes>` blocks on the docs pages.** The pages stay prop tables plus `Canvas` examples; adding them is a separate owner decision.
- **Component source changes.** A defect found while wiring controls is filed, not fixed here.
- **Renaming the generic task data in the existing Kanban and Sortable stories.** Only the new Playground data follows the sample-data rule.
- **The `contracts/` stories** (D8).
