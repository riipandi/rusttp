---
status: awaiting-approval
created: 2026-11-22T19:00:00+07:00
updated: 2026-11-22T19:06:40+07:00
phases:
    - id: 0
      title: Commit the audit work already in the tree
      status: pending
      note: —
    - id: 1
      title: Story axes helper, fluid canvas, convention
      status: pending
      note: —
    - id: 2
      title: Rename tone to color, rename variants (Reshaped model)
      status: pending
      note: —
    - id: 3
      title: Pilot - Button and Badge
      status: pending
      note: —
    - id: 4
      title: Batch A - text and form controls
      status: pending
      note: —
    - id: 5
      title: Batch B - press and selection controls
      status: pending
      note: —
    - id: 6
      title: Batch C - overlays and menus
      status: pending
      note: —
    - id: 7
      title: Batch D - feedback and content
      status: pending
      note: —
    - id: 8
      title: Batch E - navigation, structure, dates
      status: pending
      note: —
    - id: 9
      title: Batch F - scenario components, data grid, charts, icons
      status: pending
      note: —
    - id: 10
      title: Docs sync and agent docs sync
      status: pending
      note: —
    - id: 11
      title: Ledger close and handover
      status: pending
      note: —
    - id: 12
      title: Final validation
      status: pending
      note: —
---

# Group the uilibs stories by prop axis, and move `tone`/`variant` to Reshaped's `color`/`variant` model

## Objective

The owner wants Storybook stories grouped by the prop they exercise (`Variants`, `Sizes`, `States`, `Colors`) instead of one story per value (`Default`, `Secondary`, `Outline`, `Ghost`), for every component, and wants the component API to follow the Reshaped design system, which the library already adopts. Reshaped keeps two orthogonal props: `color` (the role: neutral, primary, positive, warning, critical) and `variant` (the fill: solid, faded, outline, ghost). This repo's `tone` is Reshaped's `color`, and its `variant` mixes the fill with the color (`primary`, `secondary`). After this plan `tone` is `color`, `variant` names only the fill, no look that exists today is lost, every component folder has stories named by axis plus its behavior stories, a shared helper draws the axis grids, and every story canvas is fluid (so a 390 px layout is visible). The plan does not change tokens, sizes, or component behavior beyond that rename.

## Current state (verified in the tree, 2026-11-22)

- **Stories are one per value in places** — `src/base/button/button.stories.tsx` has `Default`, `Secondary`, `Outline`, `Ghost`, `Critical`, `CriticalQuiet`, one `Sizes`, one `IconSizes` (266 lines, 18 stories); `badge`, `item`, `text`, `alert` already have `Variants`/`Tones`/`Sizes`. 374 stories across `base` and `extra`; 35 `base` folders and 30 `extra` folders (`provider.tsx` is a file), 18 chart story files, 7 data-grid story files, `src/icons/icons.stories.tsx`, `src/contracts/*.stories.tsx`.
- **`Sizes` and `ControlSizes` duplicate each other** — 27 stories match `ControlSizes`/`Sizes`/`IconSizes` (grep over `base`, `extra`); `ControlSizes` renders `ControlSizesColumn` and asserts `expectControlHeights` (`src/contracts/control-sizes.tsx`, used by `input.stories.tsx:145`); `contracts/control-sizes.stories.tsx` is the cross-component contract and stays.
- **State stories are one per state** — 47 stories match `Disabled|Invalid|ReadOnly|Indeterminate|Loading|Destructive|Critical…` (grep).
- **No story can show 390 px** — about 67 story files carry a decorator with `atoms.minWidth['448px']` (`accordion.stories.tsx:17`, `button.stories.tsx:30`, `input.stories.tsx`); audit-00002 F-09 measured 68 story groups overflowing at 390 px.
- **Reshaped's model (read from its docs, 2026-11-22)** — `https://www.reshaped.so/docs/components/button`, `/badge`, `/alert`, `/avatar`, `/menu-item`: Button has `variant` `solid` (default) `| outline | ghost`, plus `faded` for colored buttons, and `color` `neutral` (default) `| primary | critical | positive | inherit`; Badge has `color` `neutral | primary | positive | warning | critical` and `variant` `solid | faded | outline`; Alert has `color` `neutral | primary | positive | warning | critical` (and no fill variant); Avatar has `color` and a `faded` variant; MenuItem has `color` `neutral | critical`. Sizes are `small | medium | large | xlarge`. Colors and fills are independent props, so `color='critical'` works with every variant. The props table of each page could not be read as a table (the pages render it client-side); the values above come from the docs' examples and prose.
- **`tone` is Reshaped's `color`, and `variant` carries a color** — `Button.tone?: 'critical'` (`button.component.tsx:23`, `buttonCriticalTone` in `button.stylex.ts`), `Badge.tone` (`badge.component.tsx:21`, four `badge*Tones` maps), `Alert.tone` (`alert.component.tsx:13`, `alertTones`), `Toast` `tone` through `data.tone` (`toast.component.tsx:50-69`, `toastTones`), `DropdownMenuItem.tone?: 'critical'` (`dropdown-menu.component.tsx:97`; `ContextMenuItem` and `MenubarItem` alias it), `AlertDialogAction`/`AlertDialogCancel` pass `tone` to Button (`alert-dialog.component.tsx:106-138`), and `src/styles/tone.ts` holds the `Tone` type used by Badge, Alert, Toast and the webapp's `announcement-bar.tsx:4`.
- **`tone` callers in the webapp** — `components/notifications.tsx:73,161,189` (two menu items, one `Badge variant='secondary' tone='primary'`), `routes/(app)/dashboard/-loans-table.tsx:11-14` (`Overdue: { tone: 'critical' }`), `routes/admin/route.tsx:93` (`AnnouncementBar tone='critical'`), `components/announcement-bar.tsx:10,24,34`, `components/status-icon.tsx:32,36` (own `tone` union), and `StatusIcon`/`AnnouncementBar` callers in `(auth)/email-verified.tsx`, `(auth)/verify-email.tsx`, `(auth)/reset-password.tsx`, `(auth)/device.tsx`, `(app)/route.tsx`, `admin/route.tsx`. `packages/e2e` has no `tone` reference (`rg -l tone e2e`). Stories using `tone`: alert 13, toast 12, badge 8, alert-dialog 5, button 3, plus single uses in menus, dialog, kanban and five data-grid files (`tone='critical'` on a Badge).
- **Docs that name `tone`** — `frontend.md:28`, `ui-components.md:22,33,36,77,79,114`, `architecture.md:150` (the decision that introduced it, plan-00001 D8, plan-00004 D8), `index.md:18`.
- **The tree is not clean** — the audit-00002 work is uncommitted: `vite.config.ts` (dark project, `STORYBOOK_TEST_BROWSER`), `.storybook/preview.tsx` (console-error gate), five fixed story files, `src/contracts/focus-visible.stories.tsx` (three `!test` proofs), `.agents/docs/audit/audit-00002-ui-uilibs.md`, `frontend.md`, `index.md`. `.storybook/manager.ts` (`panelPosition`) is the owner's own edit.
- **Gate baseline** — `pnpm --filter uilibs test` runs 888 tests (444 per theme, light and dark projects), green; `just typecheck`, `pnpm lint`, `pnpm format:check` green.
- **Docs for humans do not mention Storybook** — `rg -il "storybook|stories" docs README.md CONTRIBUTING.md` finds nothing in `docs/`; `PRODUCT.md` names `just storybook` only.

## Decisions

- **D1 (2026-11-22, owner): one story per prop axis.** Each component with prop axes has `Playground` (controls), then `Variants`, `Sizes`, and `States` (only the axes the component has), then its behavior stories (`Keyboard`, `Controlled`, `OnClick`, …) kept separate. Rejected: one `Matrix` story crossing every prop; crossing only where two axes interact.
- **D2 (2026-11-22, owner): one `States` story per component.** All statically visible states (`disabled`, `invalid`, `readOnly`, `checked`, `indeterminate`, `loading`) sit side by side and one `play` asserts each: computed `opacity` and `cursor` for disabled (`frontend.md`, Checkbox/Switch/Radio rule), `data-invalid` or `aria-invalid` for invalid, `aria-busy` for loading. A state that needs interaction to appear stays its own behavior story. Rejected: one story per state as today.
- **D3 (2026-11-22, owner): all components, scenario ones split by axis where one exists.** Components with no prop axis (kanban, sortable, data-grid, most charts) keep their scenario stories; they gain `Playground` first, the fluid canvas, and an axis story only where the component has a prop axis (Phase 9 lists them). Rejected: base only; pilot only.
- **D4 (2026-11-22, owner): the audit work lands first as its own commit** (Phase 0), so the reorganization diff stays clean and revertible.
- **D5 (2026-11-22, owner): one shared helper, `src/contracts/story-axes.tsx`.** It draws a labelled grid: rows are values of one prop, optional columns the values of a second; each cell carries `data-size`/`data-variant`/`data-state` so a `play` finds it. It absorbs `ControlSizesColumn` and `DenseControlSizesColumn` (their `data-size` cell contract is kept so `expectControlHeights` and `contracts/control-sizes.stories.tsx` keep working); `control-sizes.tsx` keeps the height constants and the assertion. Rejected: each story writes its own grid; a helper for two axes only.
- **D6 (2026-11-22, owner): `Sizes` and `ControlSizes` become one `Sizes`.** The grid is visual and its `play` calls `expectControlHeights` (or the component's own heights); per-component `ControlSizes` is deleted, the cross-component contract story stays. Rejected: keep both; rely on the contract story alone.
- **D7 (2026-11-22, owner; replaces the first D7, which folded `tone` into `variant` and lost looks): follow Reshaped, `color` plus `variant`, nothing lost.** Studied against Reshaped's docs; the owner chose, after the options were listed:
    - `tone` is renamed `color` on Button, Badge, Alert, Toast, and menu items. `variant` is the fill only.
    - Button and Badge `variant`: `solid | faded | outline | ghost`, default `solid`. Mapping of today's values: `primary` is `solid` with `color='primary'`; `secondary` is `faded` with `color='neutral'` (today's neutral soft fill); `outline` and `ghost` keep their names.
    - Button `color`: `primary | neutral | critical`, default `primary`. Badge `color`: `neutral | primary | positive | warning | critical`, default `primary`. Alert and Toast `color`: `neutral | primary | positive | warning | critical`, default `neutral` (a toast's `success` and `error` types keep implying `positive` and `critical`). Menu item (`DropdownMenuItem`, aliased by `ContextMenuItem` and `MenubarItem`) `color`: `neutral | critical`, default `neutral`. `AlertDialogAction` and `AlertDialogCancel` take `color` and `variant` as Button does.
    - Defaults stay as today's look: a bare `<Button>` or `<Badge>` is the solid primary one. Reshaped's default is neutral; the owner kept the current default so no page changes. Sizes (`xs | sm | md | lg`), `size` on every control, and every other prop are not changed (the Reshaped size names are not adopted).
    - Every look reachable today stays reachable (the parity check in the test matrix proves it): Button solid primary, faded neutral, outline neutral, ghost neutral, solid critical, outline critical, ghost critical; Badge all 20 variant × tone pairs; Alert, Toast, and menu item every tone.
    - Because color and fill are independent, Button becomes a full 4 × 3 matrix. Five of its combinations did not exist before (solid neutral, faded primary, faded critical, outline primary, ghost primary): they are new styles, built from the existing color tokens, and pass axe in light and dark before the phase lands. Badge already had the full matrix.
    - `src/styles/tone.ts` is deleted; Alert and Toast each declare their own `color` union (`base` must not import from `extra`), Badge declares its own.
    - Not adopted from Reshaped (left for the owner to ask for): `positive`/`warning` Button colors, `inherit`, Avatar `color` and `faded`, the size names, a neutral default.
    - Rejected: one merged `variant` axis (the first D7: it dropped critical `outline`/`ghost` and the faded and outlined colored Badge); keeping the name `tone`; Reshaped's neutral default.
- **D8 (2026-11-22, owner): the webapp follows, with identical looks.** `StatusIcon` and `AnnouncementBar` rename their `tone` prop to `color` with a local type each (3 files, 6 caller files; `AnnouncementBar`'s `tones` map becomes `colors`). Call sites keep their look: `Badge variant='secondary' tone='primary'` (notification count) becomes `variant='faded' color='primary'`; the loan badges become Borrowed `faded` + `neutral`, Due soon `outline` + `neutral`, Overdue `solid` + `critical`, Returned `ghost` + `neutral`; the two notification menu items `color='critical'`; `<Button variant='secondary'>` in `-boundaries.tsx` becomes `variant='faded' color='neutral'` (two calls, one a `LinkButton`); the three `Badge variant='secondary'` in `data-grid-column.tsx` become `variant='faded' color='neutral'`. A bare `<Button>` or `<Badge>` and every `variant='outline'` or `'ghost'` Button are untouched.
- **D9 (2026-11-22, owner): the fluid canvas is global.** `.storybook/preview.tsx` gets one decorator with padding and no minimum width (and a `padded` layout), and every story file's own `minWidth` decorator is deleted as the file is rewritten; the axis grids wrap to new rows. This closes audit-00002 F-09. Rejected: keep per-file `minWidth` decorators; fluid only for the new axis stories.

Derived, not asked: Button's full 4 × 3 matrix and the default color of each component follow from D7; the five new Button combinations are the only new looks, and a combination the owner does not want is a deletion from `button.stylex.ts` before Phase 2 lands.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| Story naming and axis rules (`Playground`, `Variants`, `Sizes`, `States`, behavior stories, fluid canvas, helper, `play` per axis) | `frontend.md`, "UI library"; `packages/uilibs/AGENTS.md` | the convention the next story author follows |
| `color` and `variant` vocabulary, `tone` gone | `frontend.md:28`, `ui-components.md` rows (Alert Dialog, Button, Alert, Badge, Toast, menus, Styles) | color = role, variant = fill, the Reshaped mapping |
| Decision record superseding the `tone` decision | `architecture.md:150` | D7 and D8 with rejected alternatives and the Reshaped source |
| Story helper and canvas | `ui-components.md`, "Stories" bullet | `src/contracts/story-axes.tsx`, the global decorator |
| Audit status | `audit-00002-ui-uilibs.md` | F-09 flips to fixed with the phase that closed it |
| Index rows | `index.md` | plan, audit, handover |

## Execution rules

- **Atomic commit per phase** is authorized; each phase names its commit message. The owner's go-ahead for a phase authorizes that phase's commit and nothing else. Execution waits for the owner's explicit "continue with phase N".
- **After the last phase** the agent stops and recommends the closing commit message with its paths; it does not commit the closing state.
- **No backward compatibility and no legacy code** (early-stage project): a replaced story, prop, token, or helper is removed, with no alias and no deprecation.
- **Stage explicit paths.** `packages/uilibs/.storybook/manager.ts` is the owner's own edit and is never staged by this plan.
- **A story rewrite loses no coverage.** Per batch: the story ids before (from `pnpm storybook:build`'s `index.json`, built before editing) and after are diffed; every removed id is mapped, in the commit body, to the axis story that now covers it or to a stated reason; every `expect` of a removed story moves into the axis story's `play` or is kept in a behavior story. A deleted story with no destination is a defect.
- **Per axis story:** `Variants` asserts that every variant renders and that at least one computed style distinguishes it from the default; `Sizes` asserts the heights; `States` asserts each state as in D2; `Playground` has no `play`. Stories keep passing axe in light and dark.
- **The `!test` stories and the `consoleErrors: 'off'` opt-out from audit-00002 stay as they are**; their fixes are outside this plan.
- **Never run Storybook and the test run together.** The 390 px probe serves the static build (`pnpm storybook:build`, then `pnpm exec vite preview --outDir .output/storybook --port 6007`) and stops it before the test run.
- **Sample data** stays Dan Brown and Harry Potter (`rules.md`). Component behavior, tokens, and `.storybook/manager.ts` are not changed.
- **Per-phase validation runs before each phase's commit.** E2E only when relevant (Phase 2 and Phase 12); recorded n/a otherwise.

## Phases

0. **Commit the audit work already in the tree.** Stage exactly: `.agents/docs/audit/audit-00002-ui-uilibs.md`, `.agents/docs/plans/plan-00008-uilibs-stories-by-prop.md`, `.agents/docs/frontend.md`, `.agents/docs/index.md`, `packages/uilibs/vite.config.ts`, `packages/uilibs/.storybook/preview.tsx`, and the story files `src/base/select/select.stories.tsx`, `src/extra/button-group/button-group.stories.tsx`, `src/extra/calendar/calendar.stories.tsx`, `src/extra/kbd/kbd.stories.tsx`, `src/extra/sortable/sortable.stories.tsx`, `src/contracts/focus-visible.stories.tsx`. `git status` shows `.storybook/manager.ts` left alone. Validation: `pnpm lint`, `pnpm format:check`, `just typecheck`, `pnpm --filter uilibs test` (888 green). _Commit: `test(uilibs): run the story gate in dark, fail on console errors, add focus-visible contracts`._
1. **Story axes helper, fluid canvas, convention.** Add `src/contracts/story-axes.tsx` (D5: a labelled grid, rows by one prop, optional columns by a second, `data-size`/`data-variant`/`data-state` cells, wraps at narrow widths; takes over `ControlSizesColumn` and `DenseControlSizesColumn`, whose callers move to it); add the global fluid decorator and `padded` layout to `.storybook/preview.tsx` (D9); write the convention into `frontend.md` ("UI library") and `packages/uilibs/AGENTS.md`. Existing story files keep working untouched: their own decorators still wrap the global one. Validation: `pnpm --filter uilibs test` green with the same 888 count; `contracts/control-sizes.stories.tsx` still passes; `just typecheck`; `pnpm lint`; one story rendered at 390 and 1440 px and inspected. _Commit: `test(uilibs): add the story axes helper and a fluid story canvas`._
2. **Rename `tone` to `color` and the variants to `solid | faded | outline | ghost`.** Before editing, build the current Storybook and capture, with a scratch Playwright script (not committed), the computed `backgroundColor`, `color`, `borderColor`, and hover colors of every combination reachable today, light and dark: Button 4 variants × with and without `tone`, Badge 4 × 5, Alert 5, Toast 5, menu item 2. Then: contracts first (Button: `color` and `variant` axes with a color map per variant, `buttonCriticalTone` replaced; Badge: `solid | faded | outline | ghost` replacing `primary | secondary | outline | ghost`, `tone` becomes `color`, defaults per D7; Alert and Toast `color` unions, toast `data.tone` becomes `data.color`; `DropdownMenuItem` `color`; `AlertDialogAction`/`Cancel` pass `color` and `variant`; delete `src/styles/tone.ts`); then the callers (every `variant='primary'` or `'secondary'` in `uilibs` source such as `data-grid-column.tsx` and in the 21 story hits; the webapp call sites of D8; `StatusIcon`, `AnnouncementBar`, and their six caller routes); then stories converted mechanically so they compile and pass (the badge, alert, and toast `Tones` stories become `Colors`); then the docs in the same commit (`frontend.md:28`, `ui-components.md` rows, `architecture.md` decision record, `index.md:18`). Validation: the parity script run against the new build, mapping each old combination to its new props, shows identical computed colors for all of them in both themes (any difference is named and fixed or sent to the owner); axe passes in light and dark for the five new Button combinations; `rg -n "\btone\b" packages --glob '!node_modules'` returns nothing in `uilibs` and `webapp` source or stories; `rg "uilibs/styles/tone"` returns nothing; `rg -n "variant=['\"{]+(primary|secondary)" packages --glob '!node_modules'` returns nothing; `just typecheck`; `pnpm lint`; `just test-web`; `pnpm --filter uilibs test` green in both themes; E2E relevant because webapp pages change: `just e2e-test --project Chromium` green (dashboard, notifications, auth, admin specs among them). Undo: one `git revert`; the commit holds nothing else. _Commit: `refactor(uilibs): rename tone to color and the Button and Badge variants to solid, faded, outline, ghost`._
3. **Pilot: Button and Badge.** Rewrite both story files as `Playground`, `Variants` (the four fills at the default color), `Colors` (a color × variant grid, so axe checks every pair as the Badge `Tones` story did; Button 3 × 4, Badge 5 × 4), `Sizes` (Button: `xs | sm | md | lg`, with `IconSizes` as `IconSizes` on the same grid), `States` (Button: disabled, loading), behavior stories kept (`AsLink`, `CurrentLink`, `LoadingKeepsWidth`, `OnClick`, `StyleOverride`, `Rounded`); delete the `minWidth` decorators. The owner reviews this phase before the batches (it proves the convention and the helper on the two components with the most stories). Validation: the id-manifest diff with every removed id mapped; `pnpm --filter uilibs test` green (the count falls; recorded); the 390 px probe shows no horizontal overflow on both; screenshots of `Variants`, `Colors`, `Sizes`, `States` in light and dark inspected. _Commit: `test(uilibs): group Button and Badge stories by prop`._
4. **Batch A - text and form controls (13):** input, textarea, input-group, input-password, input-phone, number-field, otp-field, select, combobox, autocomplete, field, form, file-upload. Axes per the components' props: `Sizes` (replacing `ControlSizes`, `TriggerControlSizes`, `ChipsControlSizes`, `SideControlSizes` as columns or extra rows of one grid), `States` (disabled, invalid, readOnly where the component has it), `Variants` only for file-upload (`headless | outline`) and field's legend. Validation as Phase 3. _Commit: `test(uilibs): group text and form control stories by prop`._
5. **Batch B - press and selection controls (11):** checkbox, radio, switch, slider, toggle, toggle-group, toolbar, button-group, tabs, accordion, collapsible. Axes: `Variants` (toggle, toggle-group, tabs `pill | line`), `Sizes`, `Orientations` (toggle-group, tabs, slider, button-group, `horizontal | vertical`), `States` (disabled, invalid, checked, indeterminate). Validation as Phase 3. _Commit: `test(uilibs): group press and selection control stories by prop`._
6. **Batch C - overlays and menus (13):** dialog, alert-dialog, sheet, drawer, popover, tooltip, preview-card, dropdown-menu, context-menu, menubar, navigation-menu, command, toast. Axes: `Sides` (tooltip, preview-card, sheet, drawer `Directions`, popover `Placement`), `Colors` (toast, menu items `neutral | critical`) and `Variants` plus `Colors` (alert-dialog actions, as Button), `Sizes` (alert-dialog, menubar), `States` (disabled items and triggers). Popup stories that leave the popup open for axe (the tooltip `Open` story) keep doing so. Validation as Phase 3. _Commit: `test(uilibs): group overlay and menu stories by prop`._
7. **Batch D - feedback and content (16 folders plus `icons/icons.stories.tsx`):** alert, avatar, card, item, empty, description-list, progress, meter, spinner, loader-text, skeleton, kbd, label, text, icon, and the icons gallery. Axes: `Colors` (alert), `Variants` (item, empty media, text), `Sizes` (avatar, card, item, spinner, icon), `States` (loader-text, progress where it has one). Validation as Phase 3. _Commit: `test(uilibs): group feedback and content stories by prop`._
8. **Batch E - navigation, structure, dates (8):** breadcrumb, pagination, table, separator, scroll-area, aspect-ratio, calendar, resizable. Axes: `Orientations` (separator, scroll-area, resizable), `Variants` (resizable handle), `Sizes` (pagination), calendar `Modes` (`single | multiple | range`) and `Layouts` (`numberOfMonths`, `captionLayout`), with the date-picker compositions, `BookedDates`, `CustomDays`, `WeekNumbers`, and `Direction` kept as behavior or scenario stories (the `!test` tag on `CustomDays` stays until its fix). Validation as Phase 3. _Commit: `test(uilibs): group navigation, structure, and date stories by prop`._
9. **Batch F - scenario components, data grid, charts (kanban, sortable, data-grid, 18 chart files).** No prop axis exists here, so the scope is limited: `Playground` first, the fluid canvas (delete `minWidth` decorators), names aligned with the convention, and an axis story only where a prop has several values the stories already show: sortable `Layouts` (the `strategy` values its list, grid, and nested stories use), bar-chart `Orientations` and `Layouts`, area-chart `Layouts`, line-chart `Variants`, progress-circle and donut-chart `Variants`. The seven data-grid story files keep their feature split (`Basics`, `Columns`, `Editing`, `Footers`, `Infinite`, `Rows`, `States`). Validation as Phase 3, plus the story count of the three large scenario files unchanged. _Commit: `test(uilibs): align scenario, data grid, and chart stories with the story convention`._
10. **Docs sync and agent docs sync.** Human docs: `rg -il "storybook|stories" docs` is empty, so `docs/` is n/a (recorded with that search); `PRODUCT.md` names only `just storybook`, which does not change. Agent docs (this is the LLM-docs sync; there is no `llms.txt`): `frontend.md` ("UI library": the axis convention, the helper, the fluid canvas, the gate's story rules), `ui-components.md` ("Stories" bullet and the helper), `packages/uilibs/AGENTS.md`, `architecture.md` (D7, D8, D9 as a decision record), `.agents/skills/ui-audit/references/checklist.md` (a story-convention line and the 390 px check), and `audit-00002-ui-uilibs.md` (F-09 fixed). Validation: every path named in the changed docs resolves; `rg -n "ControlSizes"` in `.agents/docs` (not `archive/`, not `audit/` history) names only the cross-component contract; `rg -n "\btone\b" .agents/docs AGENTS.md packages/*/AGENTS.md` leaves only archive and decision-record history. _Commit: `docs(agents): sync the story convention and the variant vocabulary`._
11. **Ledger close and handover.** Plan to `done` and moved to `archive/`; audit-00002 stays live (nine findings remain open) with F-09 fixed and the counts refreshed; `handover-00011-uilibs-stories-by-prop.md` written (decisions, what moved, the story-count delta, the open audit findings); `handover-00010` archived since a newer `done` handover lands; `index.md` plan, audit, and handover rows moved. Validation: `grep -c '^- status'` and the `index.md` rows agree with the tree; no dangling reference to the moved files. _Commit: `docs(agents): close plan 00008 and write handover 00011`._
12. **Final validation.** The matrix below, run over the tree as it stands. Validation: every row green. _Commit: none if green._ Then the agent stops and recommends the closing commit message.

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Lint | `pnpm lint` | 0 errors |
| Format | `pnpm format:check` | all files formatted |
| Types | `just typecheck` | all packages pass |
| Story gate | `pnpm --filter uilibs test` (light and dark projects; Storybook not running) | 0 failures; the test count recorded per phase and explained in the handover |
| Console gate | the same run | no story logs `console.error` outside its documented `consoleErrors: 'off'` opt-out (the `FilledDividers` story) |
| Story coverage | id manifest from `pnpm storybook:build` (`.output/storybook/index.json`) before and after each batch | every removed id mapped; every component folder has `Playground` and its axis stories |
| Axis plays | the stories themselves | `Variants` renders every value and distinguishes it; `Sizes` asserts the heights; `States` asserts each state (D2) |
| 390 px | Playwright probe over the static build at 390 and 1440 px, both themes | no horizontal overflow introduced; audit-00002 F-09's 68 overflowing groups drop to none, or the leftovers are named |
| Other engines | `STORYBOOK_TEST_BROWSER=firefox` and `webkit pnpm --filter uilibs test`, once in Phase 12 | Firefox 444-equivalent green; WebKit's only known failure is the deferred F-12 menubar axe rule |
| Visual | screenshots of one `Variants`, `Sizes`, `States` story per batch, light and dark, inspected | no clipped or overlapping cell; labels readable |
| `tone` removal | `rg -n "\btone\b" packages --glob '!node_modules'`, `rg "uilibs/styles/tone"`, and `rg -n "variant=['\"{]+(primary|secondary)" packages --glob '!node_modules'` | no match in `uilibs` or `webapp` source and stories |
| Look parity (Phase 2) | scratch Playwright script, run on the build before and after: computed `backgroundColor`, `color`, `borderColor`, and hover colors of every old combination against its mapped new props, light and dark | identical for every combination in the D7 list; the five new Button combinations pass axe in both themes |
| Webapp logic | `just test-web` (Phase 2, Phase 12) | green |
| E2E | `just e2e-test --project Chromium` in Phase 2 and Phase 12 (webapp pages change); n/a in the story-only phases | green |
| Entry budget | `just size` in Phase 12 | within 480 KB / 152 KB gzip; a rename moves it by bytes only |

## Explicitly out of scope

- **The audit-00002 fixes** (F-02, F-03, F-04, F-08 and the `!test` stories) — they wait for the owner's decision on that report; this plan only keeps the `!test` and opt-out markers as they are.
- **A permanent overflow gate** (an `afterEach` assertion that the document has no horizontal overflow at the test viewport) — it would keep 390 px honest, but intentional wide scroll containers need an opt-out design; open it as an issue when the batches land.
- **Further Reshaped adoption** — `positive`/`warning`/`inherit` Button colors, Avatar `color` and `faded`, the `small | medium | large | xlarge` size names, and a neutral default (D7 keeps the current defaults and sizes). Each is a new decision if the owner wants it.
- **Design tokens** (`colors`, `tokens`, `themes`, a `breakpoints` or `zIndex` addition from F-10) — the owner's decision.
- **Adding new stories for uncovered states or sizes** beyond what the old stories already showed (audit-00002 open question 3) — the grouping makes the gaps visible; filling them is a follow-up.
- **`.storybook/manager.ts`** — the owner's parallel edit.
