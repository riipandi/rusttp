---
status: in-progress
created: 2026-11-23T15:32:00+07:00
updated: 2026-11-23T17:40:00+07:00
phases:
    - id: 1
      title: Button and Badge props
      status: done
      note: 'Parity 96 of 96 identical; gate 910 of 910. Deviations from the text, found while building: Button inherit solid is a 16 percent currentColor tint (a cut-out label is impossible, currentColor is the button own color, and a darker tint failed axe at 4.1:1); Badge highlighted is opacity 0.8 as in Reshaped, because our Badge has no hover fill; the Badge Icons story replaces WithGlyph.'
    - id: 2
      title: Alert, Skeleton, Table props
      status: done
      note: 'Parity 86 of 86 elements identical in both themes, except the Skeleton pulse opacity, which is animation timing; gate 920 of 920 (5 new stories); 390 px probe 32 of 32 clean. Added unitLength and UnitStep to styles/utils.stylex.ts, the shared unit-step helper (D2). Alert inline wraps the action under the text when the row is narrow. Table border and columnBorder drop the HTML border attribute from the Table props.'
    - id: 3
      title: Tabs, Toggle, ToggleGroup, Accordion, Select, ScrollArea props
      status: pending
      note: ''
    - id: 4
      title: Tooltip, Popover, menu item, Dialog, Sheet props
      status: pending
      note: ''
    - id: 5
      title: Component docs pilot - template, Button, Badge
      status: pending
      note: ''
    - id: 6
      title: Component docs - base
      status: pending
      note: ''
    - id: 7
      title: Component docs - extra
      status: pending
      note: ''
    - id: 8
      title: Docs sync and agent docs sync
      status: pending
      note: ''
    - id: 9
      title: Ledger close and handover
      status: pending
      note: ''
    - id: 10
      title: Final validation
      status: pending
      note: ''
---

# Add the safe Reshaped props to uilibs and document each component beside its stories

## Objective

After plan-00008 the `uilibs` props follow Reshaped's `color` and `variant` model, but several Reshaped props are still missing. The owner had the missing props curated against Base UI and chose to implement every prop judged safe. A prop is safe when it changes only the look: a StyleX style, an attribute Base UI already emits, or an `aria-hidden` glyph. It must not touch Base UI's state, focus, keyboard handling, ARIA roles, portal, or positioning. The owner also wants a short docs page next to each component (`<name>.stories.mdx`) that lists its props. Usage examples stay in the stories. After this plan, the 29 curated props exist with defaults that render exactly as today, every new value has an axis story that passes axe in light and dark, and every `base` and `extra` component folder holds a props page attached to its stories. Base UI behavior, the size names, and the design tokens do not change.

## Current state (verified in the tree, 2026-11-23)

- **The curated props are absent.** Verified by reading each file:
  - Button: `ButtonColor` has five roles and no `media` or `inherit`, and there is no `highlighted` (`button.component.tsx:18,28-51`).
  - Badge: no `endIcon` and no `highlighted` (`badge.component.tsx:29-48`).
  - Alert: only `color` (`alert.component.tsx:11-14`).
  - Skeleton: only `style` (`skeleton.component.tsx:5-7`).
  - Table parts: only `style` and `labels.region` (`table.component.tsx:22-93`).
  - Tabs: `TabsVariant = 'pills' | 'bordered' | 'borderless'` with no `itemWidth`, and no `Tabs.Indicator` is rendered (`tabs.component.tsx:26-101`).
  - Toggle: `ToggleColor = 'neutral' | 'primary' | 'critical'` and no `selectedVariant` (`toggle.component.tsx:17-30`). ToggleGroup passes both through context (`toggle-group.component.tsx:20-52`).
  - Accordion: the chevron is fixed after the label (`accordion.component.tsx:52-53`).
  - SelectTrigger: no leading glyph (`select.component.tsx:63-90`).
  - ScrollArea: renders one vertical `ScrollBar` and no other (`scroll-area.component.tsx:45-47`). The bar is hidden at rest and fades in on `[data-hovering]` or `[data-scrolling]` (`scroll-area.stylex.ts:16-34`).
  - TooltipContent: `color` is `neutral | inverted` (`tooltip.component.tsx:46`).
  - PopoverContent: `elevation` only; padding is `unit.x4` and radius is `radius.medium` (`popover.stylex.ts:14,25`).
  - DropdownMenuItem: `color` is `neutral | critical` with no `icon` (`dropdown-menu.component.tsx:96-108`). `ContextMenuItem` and `MenubarItem` alias it (`context-menu.component.tsx:112`, `menubar.component.tsx:53`).
  - DialogContent: no `size`, width is `container.xxlarge` (`dialog.stylex.ts:52`). AlertDialog has `size` `sm | md` (`alert-dialog.stylex.ts:113-121`).
  - DialogOverlay and SheetOverlay: a 50% black backdrop with no blur option (`dialog.stylex.ts:9-10`, `sheet.component.tsx:18-23`).
- **The tokens the new props need exist.**
  - `unit` steps `x0_5` to `x20` (2 to 80 px, base 4 px) in `tokens.stylex.ts:121-138`.
  - `radius` `xsmall` to `full` (`tokens.stylex.ts:151-159`).
  - Constant `colors.black` and `colors.white`, identical in both themes (`colors.stylex.ts:8-14`).
  - No token is added by this plan (`packages/uilibs/AGENTS.md`: tokens change only on the owner's decision).
- **Reshaped's props** come from `reshaped@4.3.0` `dist/components/<Name>/<Name>.types.d.ts`, read 2026-11-23:
  - Button `color` adds `media | inherit` and has `highlighted`.
  - Badge has `endIcon` and `highlighted`.
  - Alert has `icon`, `inline`, and `bleed: Responsive<number>`.
  - Tabs `variant` adds `pills-raised` and has `itemWidth: 'equal'`.
  - ToggleButton has `selectedVariant` and `selectedColor: ButtonProps['color']`.
  - Tooltip `color` is `inverted | dark`.
  - Popover has `padding: number` and `borderRadius: 'medium' | 'large'`.
  - MenuItem `color` is `neutral | critical | primary` and has `icon`.
  - Table has `border` and `columnBorder`. Row has `highlighted`. Cell has `align`, `verticalAlign`, `width`, and `minWidth`.
  - ScrollArea `orientation` is `vertical | horizontal | both` and `scrollbarDisplay` is `visible | hover | scroll | hidden`.
  - Accordion has `iconPosition: 'start' | 'end'`.
  - Select has `icon`.
  - Modal has `size` and `blurredOverlay`.
  - Skeleton has `width`, `height`, and `borderRadius` (documented props, not in the 4.3.0 type file).
- **No component docs page exists.**
  - `find packages/uilibs/src -name '*.mdx'` is empty. The only MDX file is `.storybook/stories/introduction.mdx`.
  - `.storybook/main.ts` indexes `../src/**/*.stories.@(mdx|jsx|tsx)` with `remark-gfm`, so tables render.
  - Storybook is 10.6.8, and its dist has no special case for the `.stories.mdx` name (`rg -lF "stories.mdx" node_modules/storybook/dist` is empty), so the file indexes as a docs entry.
  - Autodocs is off in every story file (87 files set `tags: []`), so a page attached with `<Meta of={…} />` does not collide with an autodocs "Docs" entry.
  - There are 35 `base` component folders and 30 `extra` folders.
- **Gate baseline:** `pnpm --filter uilibs test` runs 910 tests, green (handover-00011). The tree is clean at `fb66e56`.

## Decisions

- **D1 (2026-11-23, owner): implement every prop in the curated "safe" list; leave out the "not safe" list.** The safe list is the 29 props in the Phases, from the curation in the thread's comparison artifact, section 4a. The reasons for the not-safe list are in "Explicitly out of scope". Rejected: implementing Reshaped's full prop set, which would break Base UI's state and ARIA model.
- **D2 (2026-11-23, owner): `padding` and `bleed` take Reshaped's number, counted in `unit` steps.** The value type is the set of existing `unit` keys as numbers (`0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 12 | 14 | 16 | 18 | 20`). A map in the component's `.stylex.ts` turns each number into a static style built on `unit.x*`, so no dynamic style and no new token is needed. Popover `padding` defaults to `4` (today's `unit.x4`). Rejected: named steps (`sm | md | lg`), which are further from Reshaped, and free pixel values, which escape the token scale.
- **D3 (2026-11-23, derived from D1 and the token rule): `media` and `dark` use the constant `colors.white` and `colors.black` and `color-mix`, with no new token.**
  - Button `color='media'`: `solid` is a white fill with black text. `faded` is `color-mix(white 20%, transparent)` with white text. `outline` is a white edge with white text. `ghost` is white text. Hover deepens the mix by one step.
  - Tooltip `color='dark'`: a black surface with white text in both themes, and the arrow follows.
  - Axe checks each value on a dark media backdrop (a story backdrop built from `colors.black`), not on the page background.
- **D4 (2026-11-23, derived): visual-only props emit no new data attribute.**
  - `highlighted` (Button, Badge, TableRow) applies the fill's hover style through StyleX. It sets no `data-highlighted`, because Base UI menu items own that attribute.
  - Base UI parts keep the attributes they already emit.
- **D5 (2026-11-23, derived): every default renders as today.**
  - `Tabs.itemWidth` is unset, `Toggle.selectedVariant` is unset (it follows `variant`), and `Accordion.iconPosition` is `end`.
  - `ScrollArea.orientation` is `vertical` and `scrollbarDisplay` is `hover`. Our `hover` shows the bar while hovering or scrolling, which is today's behavior. `scroll` shows it only while scrolling, `visible` always, `hidden` never.
  - `Popover.borderRadius` is `medium`, `Dialog.size` is `md` (today's `container.xxlarge`), and `blurredOverlay` is `false`.
  - The look-parity script from plan-00008 proves this per phase.
- **D6 (2026-11-23, derived): value sets that Reshaped does not fix.**
  - Toggle `selectedColor` becomes `neutral | primary | critical | positive | warning`; `media` and `inherit` are not taken, because a pressed state must stay distinguishable.
  - `selectedVariant` is `ghost | outline | solid`.
  - Dialog `size` is `sm | md`, where `sm` is `container.large` and `md` is today's width. `lg` would need a container token wider than `container.xxlarge`, so it is left for the owner.
  - `blurredOverlay` blurs by `unit.x1`.
  - Skeleton `width` and `height` take a CSS length or a number in `unit` steps (D2). A CSS length uses one dynamic StyleX style (`stylex.create` with a function), the documented way for runtime values. `borderRadius` takes a `radius` key.
  - Table cell `width` and `minWidth` follow Skeleton's rule.
  - Alert `bleed` sets a negative inline margin and drops the inline edges and corners.
- **D7 (2026-11-23, owner): each component folder gets `<name>.stories.mdx`, a short props reference with no usage examples.** The page holds:
  - `<Meta of={Stories} />`, which attaches it to the component's stories as their Docs entry.
  - The component name and one sentence on what it is for.
  - A link to the Base UI part it wraps, with a line saying the other Base UI props pass through.
  - One GFM table per exported part listing only the props this library adds or narrows: prop, values, default, and one short note.
  - Examples stay in the stories, so the page carries no code block.
  - Rejected: `<ArgTypes>`/`<Controls>`, because react-docgen lists every inherited Base UI and DOM prop and buries ours. Also rejected: usage sections that repeat the stories.
- **D8 (2026-11-23, derived): the docs page is part of the component's contract.**
  - `frontend.md` ("UI library") and `packages/uilibs/AGENTS.md` add the file to the component layout.
  - The rule becomes: a change to a prop updates the page in the same commit.
  - `.agents/docs/ui-components.md` stays the agent inventory, which is the LLM docs. The MDX page is the human reference inside Storybook, and the Storybook MCP addon serves it to agents too.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| New props, values, defaults | `ui-components.md` rows of each touched component; the component's `.stories.mdx` | each prop and its default |
| Props page convention (D7, D8) | `frontend.md` "UI library" (component layout line 20 and the stories bullet); `packages/uilibs/AGENTS.md` | the file, its shape, the same-commit rule |
| Unit-step numbers (D2), `media`/`dark` from constants (D3) | `stylex-authoring.md` (a short recipe for a unit-step prop map) | how to add the next one |
| Decision record | `architecture.md` | D1 to D8 with the rejected alternatives |
| Index rows | `index.md` | plan, handover |

## Execution rules

- **One atomic commit per phase** is authorized; each phase names its commit message. The owner's go-ahead for a phase authorizes that phase's commit and nothing else, and execution waits for an explicit "continue with phase N".
- **After the last phase** the agent stops and recommends the closing commit message with its paths. It does not commit that closing state.
- **No backward compatibility and no legacy code** (early-stage project).
- **Stage explicit paths.** `packages/uilibs/.storybook/manager.ts` and `packages/artifacts/` are never staged.
- **Base UI behavior is fixed.** A phase changes no Base UI part's props, handlers, roles, focus, or positioning. If a prop turns out to need any of that, the phase stops and asks the owner.
- **Stories follow the plan-00008 convention** (`frontend.md` "UI library"). Each new value joins the matching axis story (`Variants`, `Colors`, `States`) or a new axis story (`Widths`, `Paddings`, `Orientations`, `Displays`), and its `play` asserts that the value renders and differs from the default. Axe runs in light and dark.
- **Look parity in Phases 1 to 4**: the scratch Playwright script `.amp/in/probe/parity.mjs` (not committed) records computed styles of each touched component's defaults on the build before and after. Every default must be identical.
- **Never run Storybook and the test run together.** The 390 px probe serves the static build on port 6007 and stops it first.
- **Sample data** stays Dan Brown and Harry Potter (`rules.md`).
- **E2E**: n/a in Phases 1 to 9, because no `packages/webapp` file changes and the defaults are proven identical. Phase 10 runs `just e2e-test --project Chromium` once, because the webapp compiles `uilibs` from source. If a phase does touch a webapp file, it runs E2E too.

## Phases

1. **Button and Badge props.** Button `color` gains `media` and `inherit` (D3; `inherit` is `currentColor` for text and edges with a `color-mix` hover fill) and `highlighted` (D4). Badge gains `endIcon`, a glyph after the label and before the dismiss button, sized like `icon`, and `highlighted`. Stories: Button `Colors` gains the two columns, with the `media` row on a dark backdrop; `States` gains `highlighted`; the Badge `Icons` story gains `endIcon`; the Badge `States` story gains `highlighted`. Validation:
    - Parity shows the Button and Badge defaults identical.
    - Axe passes for every `media` and `inherit` fill in both themes.
    - `play` checks that the `endIcon` glyph is `aria-hidden` and sits before the dismiss button.
    - `just typecheck`, `pnpm lint`, `pnpm format:check`, and `pnpm --filter uilibs test` are green.

   _Commit: `feat(uilibs): add Button media, inherit, highlighted and Badge endIcon, highlighted`._
2. **Alert, Skeleton, Table props.**
    - Alert: `icon` (a leading glyph column), `inline` (content and actions on one row, which wraps at narrow widths), and `bleed` (D2, D6).
    - Skeleton: `width`, `height`, and `borderRadius` (D6).
    - Table: `border` and `columnBorder` on `Table`, `highlighted` on `TableRow`, and `align`, `verticalAlign`, `width`, `minWidth` on `TableHead` and `TableCell`.

   Stories: Alert `Layouts` (icon, inline, bleed), Skeleton `Shapes`, Table `Borders` and `Alignment`. Validation:
    - Parity shows the defaults identical.
    - Axe passes in both themes.
    - The 390 px probe shows no overflow for Alert `inline` and the Table stories (the region still scrolls a wide table).
    - The gates from Phase 1 are green.

   _Commit: `feat(uilibs): add Alert icon, inline, bleed, Skeleton dimensions, and Table borders and cell alignment`._
3. **Tabs, Toggle, ToggleGroup, Accordion, Select, ScrollArea props.**
    - Tabs: `variant='pills-raised'` (the pills list on the raised surface with the `shadow.raised` ring) and `itemWidth='equal'` (each trigger `flex: 1`).
    - Toggle and ToggleGroup: `selectedVariant` and `selectedColor` with `positive | warning` (D6), styled on `[data-pressed]`.
    - Accordion: `iconPosition` on `AccordionTrigger`, through flex `order`. DOM order and focus are unchanged.
    - SelectTrigger: `icon`, a glyph before `SelectValue`.
    - ScrollArea: `orientation` renders the matching Base UI `Scrollbar` parts plus `Corner` for `both`, and `scrollbarDisplay` is CSS on the existing data attributes (D5).

   Stories: Tabs `Variants` and `Widths`, Toggle and ToggleGroup `Colors` and `Variants`, Accordion `IconPositions`, Select `Icons`, ScrollArea `Orientations` and `Displays`. Validation:
    - Parity shows every default identical.
    - Keyboard `play`s still pass unchanged: Tabs arrows, Toggle Space, Accordion Enter, Select open.
    - ScrollArea `both` scrolls on both axes, checked with `scrollLeft` and `scrollTop` after a wheel event.
    - Axe passes in both themes, and the Phase 1 gates are green.

   _Commit: `feat(uilibs): add Tabs pills-raised and itemWidth, Toggle selectedVariant, and Accordion, Select, ScrollArea display props`._
4. **Tooltip, Popover, menu item, Dialog, Sheet props.**
    - Tooltip: `color='dark'` (D3).
    - PopoverContent: `padding` (D2, default `4`) and `borderRadius` `medium | large`.
    - DropdownMenuItem (and its ContextMenu and Menubar aliases): `icon` and `color='primary'`. The Checkbox and Radio items are unchanged.
    - DialogContent: `size` `sm | md` (D6).
    - DialogOverlay and SheetOverlay: `blurredOverlay`. It is passed on `DialogContent`/`SheetContent` when they render the overlay, or on the overlay part when it is used directly.

   Stories: Tooltip `Colors` (open for axe, like the existing `Open` story), Popover `Paddings` and `Radii`, the menu `Colors` story gains `primary`, menu `Icons`, Dialog `Sizes`, and Dialog and Sheet `Overlays`. Validation:
    - Parity shows every default identical.
    - Menu keyboard `play`s pass unchanged, and the icon is `aria-hidden` so the item's accessible name equals its label.
    - Axe runs with the popups open in both themes, and the Phase 1 gates are green.

   _Commit: `feat(uilibs): add Tooltip dark, Popover padding and radius, menu item icon and primary, Dialog size and blurred overlay`._
5. **Component docs pilot: template, Button, Badge.** Write `button.stories.mdx` (Button, LinkButton) and `badge.stories.mdx` in the D7 shape. Validation:
    - `pnpm storybook:build` succeeds.
    - `.output/storybook/index.json` holds a `type: "docs"` entry for each page, attached to the Button and Badge titles.
    - Both pages are screenshotted in light and dark and inspected: tables render, the theme follows the toolbar, and nothing overflows at 390 px.
    - The story gate count is unchanged, because docs entries are not tests.
    - The owner reviews this phase before Phases 6 and 7, because it fixes the page shape.
    - If Storybook refuses `.stories.mdx`, the phase stops and asks the owner.

   _Commit: `docs(uilibs): add the props reference page for Button and Badge`._
6. **Component docs: `base` (35 folders, Button already done).** One page per folder, each table read from the component's props interface. Validation:
    - `index.json` holds 35 `base` docs entries.
    - Every prop listed in a page exists in its `*.component.tsx`, and every prop declared there (not inherited) is listed. This is checked by a scratch script that diffs the interface keys against the table rows; the script is deleted afterwards.
    - Five pages are spot-screenshotted, and `pnpm format:check` and the build are green.

   _Commit: `docs(uilibs): add props reference pages for the base components`._
7. **Component docs: `extra` (30 folders, Badge already done).** Same as Phase 6. Data grid, kanban, and sortable document their exported parts and props; the chart recipes are out of scope. Validation: as Phase 6 with 30 entries. _Commit: `docs(uilibs): add props reference pages for the extra components`._
8. **Docs sync and agent docs sync.**
    - Human docs: `rg -il "storybook|stories" docs` is expected empty, which makes `docs/` n/a; the search is recorded.
    - Agent docs (this is the LLM-docs sync; there is no `llms.txt`):
        - `ui-components.md`: every new prop and default from Phases 1 to 4.
        - `frontend.md` "UI library": the component layout gains `.stories.mdx`, plus the page shape and the same-commit rule (D7, D8).
        - `stylex-authoring.md`: the unit-step prop map recipe (D2) and the constant-color rule for `media`/`dark` (D3).
        - `architecture.md`: the D1 to D8 decision record.
        - `packages/uilibs/AGENTS.md`: one line on the docs page.

   Validation: every path named in the changed docs resolves, and `rg -n "pills-raised|selectedVariant|blurredOverlay|scrollbarDisplay" .agents/docs/ui-components.md` finds each prop. _Commit: `docs(agents): sync the Reshaped props and the component docs page convention`._
9. **Ledger close and handover.** Set the plan to `done` and move it to `archive/`. Write `handover-00012-uilibs-reshaped-props-docs.md` and archive `handover-00011`. Move the `index.md` rows. Validation: `index.md` agrees with the tree, and there is no dangling reference. _Commit: `docs(agents): close plan 00009 and write handover 00012`._
10. **Final validation.** Run the matrix below over the tree. _Commit: none if green._ Fixes made on the way go into the recommended closing commit.

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Lint, format, types | `pnpm lint`, `pnpm format:check`, `just typecheck` | 0 errors |
| Story gate | `pnpm --filter uilibs test` (light and dark; Storybook stopped) | 0 failures; count recorded per phase (baseline 910) |
| New props | the axis stories of Phases 1 to 4 | each value renders, differs from the default in a computed style, passes axe in both themes |
| Look parity | `.amp/in/probe/parity.mjs` on the build before and after each of Phases 1 to 4 | every default of every touched component identical |
| Base UI behavior | the existing keyboard and interaction `play`s of Tabs, Toggle, ToggleGroup, Accordion, Select, ScrollArea, menus, Dialog, Sheet, Tooltip, Popover | pass unchanged |
| `media` and `dark` contrast | axe on a black backdrop | 0 violations |
| Docs pages | `pnpm storybook:build`; `index.json` docs entries; the scratch props diff | 65 pages, one per folder; no missing or extra prop |
| Docs render | screenshots of the pilot pages and five spot pages, light and dark, 390 and 1440 px | tables readable, no overflow, theme follows the toolbar |
| 390 px | `ovf-all.mjs` over the static build, both themes | no new overflow; the two known Contracts stories stay the only ones |
| Other engines | `STORYBOOK_TEST_BROWSER=firefox` and `webkit`, Phase 10 | Firefox green; WebKit fails only menubar F-12 and the known-flaky `select > Keyboard` |
| Webapp logic | `just test-web` (Phase 10) | green |
| E2E | `just e2e-test --project Chromium` (Phase 10 only; n/a earlier, no webapp file changes) | green |
| Entry budget | `just size` (Phase 10) | within 480 KB / 152 KB gzip |

## Explicitly out of scope

- **The not-safe Reshaped props:**
  - Button `loadingAriaLabel`: we keep the name plus `aria-busy`.
  - Badge `hidden` and `Badge.Container`: they collide with the HTML `hidden` attribute.
  - Switch `reversed`: there is no label inside the Switch.
  - Separator `contentPosition` with children: the children of `role="separator"` are presentational. Separator `blank` is also left out.
  - `startSlot`, `endSlot`, `prefix`, `suffix` on Input and Select: InputGroup owns these.
  - Menu item `selected` and `highlighted`: Base UI owns `aria-checked` and `data-highlighted`.
  - Slider `range`, Accordion and Collapsible `active`, Tabs `onChange` object, Card `onClick`/`href`, Pagination `total`/`page`, Breadcrumb `defaultVisibleItems`, Progress `duration`, Modal `position`, Calendar props, and responsive `{ s, m, l }` values.
- **Dialog `size='lg'`**: it needs a container token, which is the owner's decision.
- **Chart recipe docs pages** (`src/charts/stories`): recipes, not components with props.
- **The open audit-00002 findings** (F-02, F-03, F-04, F-08, F-10, F-11, F-12, F-13, F-14, F-15).
- **Design tokens.**
