---
status: done
created: 2026-11-24T02:00:00+07:00
plan: plan-00009-uilibs-reshaped-props-docs
---

# Handover: Plan 00009 closed, the safe Reshaped props are in uilibs and every component has a props page

## What this session did

The owner had the missing Reshaped props curated against Base UI and chose to implement every prop judged safe (visual only: a StyleX style, an attribute Base UI already emits, or an `aria-hidden` glyph), then asked for a props reference page next to each component. Plan 00009 (D1 to D8, in `architecture.md`) settled the shape. Phases 1 to 9 ran one commit each on the owner's go-ahead per batch. Phase 10 (final validation) ran afterwards on the owner's go-ahead; its result is below.

- Props, by phase:
  - Button `color` `media` and `inherit` and `highlighted`; Badge `endIcon` and `highlighted`.
  - Alert `icon`, `inline`, `bleed`; Skeleton `width`, `height`, `borderRadius`; Table `border`, `columnBorder`, row `highlighted`, cell `align`, `verticalAlign`, `width`, `minWidth`. `UnitStep` and `unitLength` in `styles/utils.stylex.ts` are the shared unit-step helper.
  - Tabs `pills-raised` and `itemWidth`; Toggle and ToggleGroup `selectedVariant` and the `positive`/`warning` `selectedColor`; Accordion `iconPosition`; SelectTrigger `icon`; ScrollArea `orientation` and `scrollbarDisplay`.
  - Tooltip `color='dark'`; Popover `padding` and `borderRadius`; menu item `icon` and `color='primary'`; Dialog `size` and `blurredOverlay`; Sheet `blurredOverlay`.
- Defaults render as before: a computed-style comparison before and after each of Phases 1 to 4 (96, 86, 174, 72 elements) found no difference, except one Skeleton animation frame.
- Docs: `<name>.mdx` per component folder (35 base, 30 extra, the data grid page attached to its Basics stories), attached to the stories with `<Meta of={Stories} />`. The first plan name, `<name>.stories.mdx`, cannot be indexed by Storybook 10 (addon-docs excludes it, `preset.js:865`); the owner chose `<name>.mdx` with the glob `../src/**/*.mdx` in `.storybook/main.ts`. `.storybook/docs-container.tsx` lets a table scroll inside the page. Phases 6 and 7 were written by parallel subagents and merged here.
- Data grid, outside the phase list: `issue-00004` (props that nothing read). `DataGridContainer` `border` and `DataGridTableHeadRow` `rowId` (as `data-header-row-id`) were wired and got stories; `sizesInfo`, `sizesLabel`, `sizesDescription`, `more`, `pinnable` were removed on the owner's decision. The issue is archived.
- Agent docs: `ui-components.md` (since moved to `packages/uilibs/.storybook/stories/components.mdx`), `frontend.md` (props page shape and the same-commit rule), `stylex-authoring.md` (unit-step recipe, constant-color rule), `architecture.md` (D1 to D8), `packages/uilibs/AGENTS.md`.

## Commits (this slice)

- `feat(uilibs): add Button media, inherit, highlighted and Badge endIcon, highlighted` (`33fd62c`)
- `feat(uilibs): add Alert icon, inline, bleed, Skeleton dimensions, and Table borders and cell alignment` (`131fdf9`)
- `feat(uilibs): add Tabs pills-raised and itemWidth, Toggle selectedVariant, and Accordion, Select, ScrollArea display props` (`c23bf3b`)
- `feat(uilibs): add Tooltip dark, Popover padding and radius, menu item icon and primary, Dialog size and blurred overlay` (`3eb236e`)
- `docs(uilibs): add the props reference page for Button and Badge` (`050cb09`)
- `docs(uilibs): add props reference pages for the base components` (`82fcf19`)
- `docs(uilibs): add props reference pages for the extra components` (`25a9e5e`)
- `feat(uilibs): wire the declared data grid props and cover them with stories` (`b5839ec`)
- `docs(agents): sync the Reshaped props and the component docs page convention` (`bc4130d`)
- The closing commit (this handover and the archive moves).

## State of the gates

Phase 10, run 2026-11-24 over the tree:

- Chromium gate 946 of 946 (910 at the start; +36 from the new axis stories and the two data grid stories). Docs entries are not tests, so the 65 pages do not move the count.
- Firefox 946 of 946 after two story precision fixes: accordion `IconPositions` read `-0` for a zero offset, and toggle `Variants` compared two widths to the last float bit (now `Math.abs` and `toBeCloseTo`).
- WebKit 943 of 946: only menubar `Playground` (F-12, both themes) and `select > Keyboard` (dark) fail, the known ones.
- Lint, format, typecheck clean. `just test-web` 75 of 75. E2E Chromium 184 of 184 (no `packages/webapp` file changed). `just size` 461.1 KB of 480 and 146.7 KB gzip of 152.
- `pnpm storybook:build` green. 390 px probe of 477 stories in both themes: only the two known `Contracts` stories overflow (control heights per size 426 px, ref as a prop 22 px). Two timeouts under shared load (alert `Colors` dark, kanban `Frame columns` light) were clean when rerun alone.
- 390 px probe of the 65 docs pages in both themes: no page overflow and no table past the viewport. Button at 390 px: the table scrolls inside its container (310 px visible, 455 px of content, `overflow-x: auto`), so Default and Note are reachable by scrolling; the cut-off in the earlier screenshot was the scroll edge, not a loss. `docs-container.tsx` stays. There is no visual hint that the table scrolls.

## What stayed open / the trap

- Phase 10 is done (above). The two precision fixes it needed in the accordion and toggle stories are in the tree and not committed; the closing commit takes them.
- The prop pages are kept in step with the components by convention only; the scratch script that diffed the tables against the sources was heuristic and is not committed.
- `audit-00002`: F-02, F-03, F-04, F-08, F-10, F-11, F-13, F-14, F-15 open, F-12 deferred; unchanged.
- Flaky plays hardened with `waitFor` after one full-gate failure each: Table `Borders` (dark) and Alert `Layouts` (bleed margin). The root cause is not proven; both pass alone and in later full runs.
- Dialog `size='lg'` is left out: it needs a container token wider than `container.xxlarge`, the owner's decision.

Trap: Base UI puts a focus-guard span between a modal's backdrop and its popup, so the backdrop is not the popup's previous sibling; use `backdropOf` (`contracts/control-sizes.tsx`). And never run Storybook while `pnpm --filter uilibs test` runs: both want port 6006; the docs build serves on 6007.
