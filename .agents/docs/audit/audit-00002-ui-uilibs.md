---
title: "Audit: packages/uilibs (components, stories, Storybook gate)"
status: in_review
created_at: 2026-11-22T18:34:00+07:00
updated_at: 2026-11-22T23:31:40+07:00
completed_at: null
scope:
    type: feature
    feature: "uilibs"
    paths: ["packages/uilibs/src", "packages/uilibs/.storybook", "packages/uilibs/vite.config.ts"]
    exclusions: ["packages/webapp (consumer)", "real screen reader, real forced-colors OS mode, physical devices (roadmap-00001)", "data grid internals beyond axe, probe and one focus check"]
stack:
    languages: [TypeScript, TSX]
    frameworks: [React 19.3, Base UI 1.9, StyleX, Storybook 10.6, vitest browser (Playwright 1.65)]
    datastores: []
repo:
    branch: "ui-polish"
    commit: "cbb75a8"
    working_tree_clean: false # the owner's own edit to .storybook/manager.ts was present and left alone
environment:
    executed: [lint, typecheck, format-check, storybook-vitest-light, storybook-vitest-dark, storybook-vitest-firefox, storybook-vitest-webkit, playwright-story-probe (444 stories x 2 themes x 2 widths), reduced-motion-emulation, forced-colors-emulation, focus-visible-screenshot-diff, static-grep-of-stylex-contracts]
    not_run: [webapp-gates, entry-budget, e2e-route-sweep, screen-reader-manual-pass, real-forced-colors, dependency-scan, secret-scan]
baseline:
    build: not_run
    tests: pass # 444/444 per theme after the fixes below; 443/444 before (one flake)
    lint: pass
    dependency_scan: not_run
    secret_scan: not_run
    race_detector: not_available
findings:
    total: 15
    by_severity: { critical: 0, high: 0, medium: 3, low: 10, info: 2 }
    by_status: { open: 9, fixed: 5, deferred: 1, wont_fix: 0, false_positive: 0 }
    verified: 12
    unverified: 3
cleanup_candidates: 1
optimization_opportunities: 0
open_questions: 3
tests_added: 6 # dark project, console-error gate, 4 focus-visible stories (1 control kept in the run, 3 proofs tagged !test), 1 calendar play (tagged !test)
standards: [WCAG 2.2 AA (1.4.3, 2.4.7, 2.5.8), WAI-ARIA 1.2]
generated_by: ui-audit
---

# Audit: packages/uilibs (components, stories, Storybook gate)

## Executive summary

- The library is in good shape: every one of the 444 stories passes axe in light and dark, lint, typecheck and format are clean, nothing is unnamed, nothing animates forever under `prefers-reduced-motion`, Firefox passes all 444 stories, WebKit passes after one story fix.
- The most important finding is about the safety net, not a component: **the gate that claims "axe in light and dark" never ran dark** (F-01). The decorator's theme global is `system`, headless Chromium reports `prefers-color-scheme: light`, so every story, play and axe check ran in light only. Running dark immediately found a real contrast failure (F-05). Fixed in `vite.config.ts`.
- Real component defects, all about keyboard focus: the Tabs panel, the Sortable handle and the Kanban column handle show no focus indicator (F-02, F-03). A `ButtonGroup` with a Fragment child logs a React duplicate-key error (F-04).
- Counts: 0 critical, 0 high, 3 medium, 9 low, 2 info (14). 4 fixed (all in tests and stories), 1 deferred, 9 open.
- Fix first: **F-02 and F-03** (a keyboard user cannot see where focus is), then **F-04**.

## Scope and flow inventory

Whole library, after the owner's answers: all of `base`, `extra`, charts, theme; all dimensions with equal weight; full visual depth (light/dark, 390 and 1440 px, reduced motion, forced colors, hover and focus); report first, no component fixes; new tests allowed.

Flows audited:

1. **Gate**: `pnpm --filter uilibs test` as the safety net (themes, console, engines, flakiness).
2. **Every story**: Playwright probe over all 444 stories x light/dark x 390/1440 px: console errors, horizontal overflow, targets under 24 px, unnamed interactive elements, Tab-through focus ring, `reduced-motion` and `forced-colors` emulation.
3. **Static contract scan**: `className` and raw `style`, `forwardRef`, `base` importing `extra`, literal colors, sizes, durations and z-indexes, raw media queries.
4. **Coverage matrix**: per component, stories, `play` count, `ControlSizes`, disabled, invalid, keyboard (inventory in the chat summary; every one of 69 component folders has a story, `data-grid` has its own `stories/` folder).

## Baseline

| Gate | Result |
| --- | --- |
| `pnpm lint` | pass |
| `pnpm --filter uilibs typecheck` | pass (after typing `browser` in `vite.config.ts`) |
| `pnpm format:check` | pass |
| `pnpm --filter uilibs test`, before changes | 443/444; `select > Keyboard` failed once on the first run, then passed 8 of 8 and 4 more full runs: a flake (F-06) |
| same, light and dark projects, after changes | 888/888 (444 per theme) |
| Firefox (`STORYBOOK_TEST_BROWSER=firefox`) | 444/444 |
| WebKit | 442/444 before: `select > Keyboard` (F-06) and `menubar > Playground` (F-12); the first is fixed |

Limitation: the tests ran while the owner's Storybook dev server was up on `:6006`, which `packages/uilibs/AGENTS.md` says never to do. All runs passed, and the probe needed the server; no conflict was observed.

## Findings

| ID | Severity | Category | Location | Title | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | medium | test quality | `packages/uilibs/vite.config.ts`, `.storybook/decorator.tsx` | The a11y gate never ran in dark | verified | fixed |
| F-02 | medium | a11y (2.4.7) | `src/base/tabs/tabs.stylex.ts:81` | Tabs panel is a tab stop with no focus indicator | verified | open |
| F-03 | medium | a11y (2.4.7) | `src/extra/sortable/sortable.stylex.ts:70`, `src/extra/kanban/kanban.stylex.ts` (column handle) | Drag handles show no focus indicator | verified | open |
| F-04 | low | defect | `src/extra/button-group/button-group.component.tsx:23-29,57-77` | A Fragment child gives duplicate React keys | verified | open |
| F-05 | low | story / contrast | `src/extra/kbd/kbd.stories.tsx:36-40,74` | Kbd in a Tooltip is 1.12:1 in dark | verified | fixed |
| F-06 | low | test quality | `src/base/select/select.stories.tsx:274-306` | `Keyboard` story flaky on Chromium, failing on WebKit | verified | fixed |
| F-07 | low | story | `src/extra/sortable/sortable.stories.tsx:565` | Raw `style={styles.x}` on a div throws a React error | verified | fixed |
| F-08 | low | story | `src/extra/calendar/calendar.stories.tsx:366-444` | CustomDays loses the range fill | verified | open |
| F-09 | low | test quality | about 67 story files (`minWidth` decorator) | No story can show a 390 px layout | verified | fixed |
| F-10 | low | StyleX contract | see F-10 | Raw media queries, z-indexes, durations and one color remain | verified | open |
| F-11 | info | design decision | `src/extra/command/command.stylex.ts:77-105` | Command input has no focus ring on purpose | n/a | open |
| F-12 | info | a11y (WebKit) | `src/base/menubar/menubar.stories.tsx` | axe `aria-required-children` on the menubar in WebKit only | verified | deferred |
| F-13 | low | a11y (2.5.8) | see F-13 | Several controls are under 24 px | unverified | open |
| F-14 | low | a11y / console | `src/base/otp-field/otp-field.stories.tsx` | Eight stories log a Base UI warning about `aria-label` | unverified | open |

### F-01 The a11y gate never ran in dark

- **Category**: test quality
- **Location**: `packages/uilibs/vite.config.ts` (one `storybook` project), `.storybook/preview.tsx` (`initialGlobals.theme = 'system'`)
- **Problem**: `frontend.md` and `AGENTS.md` say the gate runs axe "in light and dark". Nothing selected dark: the decorator resolves `system` through `prefers-color-scheme`, and the Playwright context had no `colorScheme`. A temporary story that threw `data-theme`, `color-scheme` and the media query printed `THEME=light scheme=light dark=false`.
- **Impact**: every dark-only contrast, border and state defect was invisible to CI.
- **Evidence**: verified. After adding a second project with `colorScheme: 'dark'`, the first run failed `kbd > In a tooltip` with a real axe contrast violation (F-05).
- **Fix (done)**: two projects, `storybook` and `storybook-dark`, one plugin instance each; `STORYBOOK_TEST_BROWSER=firefox|webkit` runs another engine locally. `frontend.md` ("UI library", the a11y gate bullet) is updated. A `console.error` gate was added in `preview.tsx` (`beforeEach` and `afterEach`; opt out with `parameters.consoleErrors: 'off'`).
- **Cost**: the suite now runs every story twice, 888 tests; the dark project alone took 62 s against 39 s for the old run.
- **Confidence**: high. **Status**: fixed.

### F-02 Tabs panel has no focus indicator

- **Location**: `src/base/tabs/tabs.stylex.ts:81` (`content: { outline: 'none' }`); `tabs.component.tsx:94`.
- **Problem**: Base UI makes the panel a tab stop (`tabindex=0`) so keyboard users can reach its content; the style removes the outline and draws nothing instead.
- **Scenario**: Tab to a tab, press Tab once more: focus is on the panel and nothing on screen changes. Before and after screenshots of the panel in light and dark are pixel-identical (`.amp/in/artifacts/audit/nofocus-light-base-components-tabs--playground.png`, and the dark one).
- **Impact**: WCAG 2.4.7 fails on every Tabs story; 6 stories.
- **Evidence**: verified. `src/contracts/focus-visible.stories.tsx > Tabs panel` fails on `expected outline or shadow to be true, received false`; its control (`Button`) passes, so the helper can tell. The story carries `tags: ['!test']`; remove the tag to reproduce.
- **Fix**: compose `focusRing.root` on `s.content` (the recipe in `styles/utils.stylex.ts`, set `outlineOffset` locally if the panel is clipped). Remove the tag.
- **Confidence**: high. **Status**: open.

### F-03 Drag handles show no focus indicator

- **Location**: `src/extra/sortable/sortable.stylex.ts:70` (`handle: { outline: 'none' }`); the Kanban column handle and `KanbanColumnHandle` (no outline in `kanban.stylex.ts`).
- **Problem**: the handle is the keyboard drag control (Space or Enter, arrows). Its style removes the outline; the only `:focus-visible` mention, in `handleHiddenDuringDrag`, hides it while dragging.
- **Scenario**: Tab to "Drag to reorder" or "Reorder column": no ring, no background change. Screenshot of the focused kanban handle: only the grip and the status dot, identical to unfocused. Probe: 17 stories have a Tab stop with no outline, box shadow or ancestor ring: Tabs 6 (F-02), Sortable 6 and Kanban 1 (this finding; four more Kanban stories lose the ring only under forced colors), Command 2 (F-11), the data grid 1, and the Calendar date-and-time inputs 1 (a probe false positive: a screenshot diff shows the 2px ring).
- **Impact**: a keyboard user cannot tell which item will be picked up. WCAG 2.4.7.
- **Evidence**: verified. `focus-visible.stories.tsx > Sortable handle` and `> Kanban column handle` fail the same way; both are tagged `!test`.
- **Fix**: compose `focusRing.root` in the handle (and keep `handleHiddenDuringDrag`). Remove the tags.
- **Confidence**: high. **Status**: open.
- **Hypothesis, not counted**: `data-grid-editing > Spreadsheet editing` also showed no visible change when the `table[role=grid]` took focus. The grid moves focus into cells with `aria-activedescendant`-style handling (`data-grid-cell.tsx:142`); whether the active cell draws a ring was not verified.

### F-04 `ButtonGroup` gives duplicate React keys for Fragment children

- **Location**: `src/extra/button-group/button-group.component.tsx:23-29` (`flatten`) and `:63`.
- **Problem**: `React.Children.toArray` keys its children `.0`, `.1`. `flatten` calls it again on a Fragment's children, which produces `.0`, `.1` again, so an outer child and an inner one share a key.
- **Scenario**: `<ButtonGroup><Button/><Button/><><Button/><Button/></></ButtonGroup>` (the `FilledDividers` story). React logs "Encountered two children with the same key".
- **Impact**: React may duplicate or omit children on updates; today it is a dev error that every consumer would see.
- **Evidence**: verified. With the new console gate, `button-group > Filled buttons get dividers` failed; the story now sets `parameters: { consoleErrors: 'off' }` with a comment naming F-04. Delete that line to reproduce.
- **Fix**: prefix the nested keys while flattening (carry the Fragment's key into the children). Remove the opt-out.
- **Confidence**: high. **Status**: open.

### F-05 Kbd in a Tooltip is 1.12:1 in dark

- **Problem**: the story passed a `style` that colored the key `colors.backgroundPage` on a 20 % page-colored fill: a leftover from when the tooltip was inverted (`tooltip.stylex.ts` says the inverted pair "was a white slab in dark"). On the overlay surface it is `#0d0d0d` on `#1b1b1b`.
- **Fix (done)**: the override and its import were removed; the `Kbd` default recipe passes. Story only: the production `Kbd` is unaffected.
- **Status**: fixed.

### F-06 `select > Keyboard` is flaky and fails on WebKit

- **Problem**: the play pressed one ArrowDown and expected the second item. Where Base UI starts the highlight depends on timing and engine: one cold Chromium run ended on "Phoenix feather" (the first item); WebKit opens with nothing highlighted at the moment the arrow lands.
- **Fix (done)**: `{Home}` pins the start, then each step asserts `data-highlighted`, and the final value is asserted exactly. The story passes in both themes on Chromium, and on Firefox and WebKit.
- **Status**: fixed.

### F-07 A story used a StyleX object as a raw `style`

- **Location**: `sortable.stories.tsx:565` (`<div style={styles.groupContainer}>`). React logged `Unsupported style property width-kzqmXN` (the compiled variable name).
- **Fix (done)**: `<div {...stylex.props(styles.groupContainer)}>`.
- **Status**: fixed.

### F-08 CustomDays loses the range fill

- **Location**: `src/extra/calendar/calendar.stories.tsx:366-444`.
- **Problem**: in the `CustomDays` story the days between the two range ends have no fill, and the ends are drawn half-filled (screenshot `calendar-custom-days.png`; the plain `Range` story is correct, `calendar-range.png`). The story also applies `calendarStyles.dayBtnSelected && isSelectedSingle`, which evaluates to the flag, not the style, so a single selection gets none. The price badge also touches the next day number on the 20th to 31st. The story is date-dependent (`new Date().getFullYear()`, 8 December), so it changes with the clock.
- **Impact**: the documented example of a custom day cell is wrong. The production calendar is not affected.
- **Evidence**: verified. The new `play` expects a non-transparent background on every `[data-range-middle="true"]` and fails (`expected 'rgba(0, 0, 0, 0)' not to be 'rgba(0, 0, 0, 0)'`); the story carries `!test`.
- **Fix**: swap the operands, find why `dayBtnRangeMiddle` does not paint (an own `style` after it, or the cell, not the button, carries the fill), and fix the date to a literal.
- **Status**: open.

### F-09 No story can show a 390 px layout

- **Location**: about 67 story files set `minWidth` (448 px in the accordion) in their decorator.
- **Problem**: at 390 px 68 story groups overflow horizontally by the decorator's width (`acc390.png`: accordion `scrollWidth` 448). The checklist item "a control that must fit a phone shrinks" cannot be judged from stories, and one component could overflow for real without any signal.
- **Fix**: a narrow story per component that must fit (the contracts already have `NarrowRow` for OTP) or a shared decorator with a `fluid` mode.
- **Status**: fixed (2026-11-22, plan-00008). `.storybook/preview.tsx` sets a padded, fluid canvas, every story file lost its `minWidth` decorator, and a probe at 390 px over every story of the library found no horizontal overflow (two real overflows it exposed, InputPhone's country trigger and a Text sample, were fixed).

### F-10 StyleX contract leftovers

audit-00001 F-25 is marked fixed, but a scan finds:

- 40 raw `@media (min-width|max-width)` in 7 stylex files outside `tokens.stylex.ts` (kanban 11, data-grid 11, description-list 7, alert-dialog 5, text 3, calendar 2, pagination 1). The `breakpoints` token has `small: max-width 659px` (kanban uses the raw form 5 times) but no "660 and up" query, so most of them cannot use a token today. A token addition is the owner's decision.
- 8 literal `zIndex` (`select` 1, `drawer` 1, `calendar` 10, 10, 10, 1, 0, 0); the `zIndex` token has only `relative 10`, `absolute 100`, `fixed 200`.
- Literal durations `1s`, `2s`, `2.5s`, `3s` (spinner, skeleton, loader-text) and `0s`/`40ms`.
- `extra/data-grid/data-grid-table.stylex.ts:242,245`: `boxShadow: '0 2px 0 rgba(0, 0, 0, 0.03)'` is a literal color (the scroll-area `rgb(0 0 0 / x%)` is a mask alpha, not a color, and is fine).
- Clean: no `className` or raw `style` beside `stylex.props` in components (chart and calendar forward the library's own), no `forwardRef`, no `base` import of `extra` besides Button's Spinner.
- **Status**: open; needs the token decision.

### F-11 Command input draws no ring, by design

`command.stylex.ts:77-79` says so: the field is always focused while the bar is open and a ring "kept drawing the eye". The caret is the focus indicator. WCAG 2.4.7 accepts a visible caret for a text field, but the decision is recorded only in a comment. Decision for the owner (see open questions).

### F-12 Menubar fails axe in WebKit only

In WebKit Base UI's focus guards are `<span role="button" tabindex=0>` without `aria-hidden` (Chromium gives them `aria-hidden="true"`), so axe reports `aria-required-children` on `role=menubar`, whose children are then not all menu items. The allowlist in `preview.tsx` excludes the guard node, not the parent rule. Upstream behavior, Chromium-only CI, no component change. Deferred; revisit if CI adds WebKit.

### F-13 Targets under 24 px (hypothesis)

Measured at 1440 px, light: Checkbox and Radio 16x16, Switch 36x20, NumberField steppers 24x16 and 24x17, a Tabs trigger 20 px high in two stories, Resizable separators 1 px wide. WCAG 2.5.8 passes any of them through the spacing exception, and some may have a larger hit area in a pseudo-element (the Combobox chip does, per `frontend.md`); I did not measure spacing or hit areas. Not counted as defects until that is checked.

### F-14 OTP stories log a Base UI warning (hypothesis)

Eight stories log `<OTPField.Input> ignores aria-label on the first input. Use a <label> or <Field.Label>` (warning, not error, so the console gate does not fail). `frontend.md` already says the field is named by `FieldLabel`; the stories show the other pattern, and axe still passes. Whether the root really ends up unnamed was not verified.

### F-15 Item `sm` and `md` are the same size

`item.stylex.ts:92-101`: `itemSizes.sm` and `itemSizes.md` both set `gap: unit.x3`, `paddingBlock: unit.x3`, and `paddingInline: unit.x3`; only `xs` differs. The `Sizes` story measures both rows at 70 px. Found while regrouping the stories (plan-00008, batch D). The story asserts `sm <= md` until the sizes are told apart; decision for the owner: give `md` more padding, or drop one size.

## Cleanup candidates

| Item | Type | Evidence of non-use | Confidence | Proposal | Status |
| --- | --- | --- | --- | --- | --- |
| `.amp/in/probe/` scripts (story probe, focus diff, screenshots) | scratch | not committed; under the git-excluded `.amp/in/` | high | keep for the fix phase, delete after | open |

## Not findings (checked)

- Unnamed interactive elements in any story: none. Looping animation under `reducedMotion: 'reduce'`: none. Focus ring under `forcedColors: 'active'`: no new gaps beyond F-02 and F-03.
- Static scans: no literal hex or `hsl()` colors, no `ComponentPropsWithoutRef`, no hard-coded English `aria-label` outside `labels`.
- The Range story (plain `Calendar`) renders correct fills; an image-review pass said it did not, and a direct look at the screenshot showed it does. Only CustomDays is wrong.
- `Accessing the Story Store is deprecated` (8 logs) and `Mod+J is already registered` (4) come from Storybook and the hotkeys library inside two stories; warnings only.

## Decisions log

| Date | Question | Choice |
| --- | --- | --- |
| 2026-11-22 | Scope | all of base, extra, charts, theme, in batches |
| 2026-11-22 | Dimension weight | all equal |
| 2026-11-22 | Stories and plays | complete coverage, sizes and themes |
| 2026-11-22 | Fixes | report only; the owner decides after reading |
| 2026-11-22 | Visual depth | full (light/dark, 390/768/1440, reduced motion, forced colors, hover, focus) |

## Coverage and limitations

- Done: gate (both themes, three engines), story probe at 390 and 1440 px (768 not captured; the compact breakpoint is 767), reduced-motion and forced-colors emulation (an emulation is not the OS mode; roadmap-00001 holds the manual passes), focus screenshot diffs for the suspect stops, static StyleX scans, visual inspection of the accordion at 390 and both calendar stories.
- Not done: per-component hand review of all 69 components, Indonesian-language long strings, hover and pressed captures per component, per-size captures. The coverage matrix shows 14 components with a `ControlSizes` story and 19 of 38 `base` components with a `disabled` story; filling the rest is the next batch.
- Scope request "add complete stories and play for every component, with sizes and themes": themes are now covered for all 444 stories by the dark project. Per-component state and size stories were not added; I chose to prove defects first, then add stories where a defect was found. The remainder is a decision (open question 3).

## Open questions

1. **F-02/F-03 fixes.** Unclear: whether to fix now in one change (compose `focusRing.root` in Tabs panel and both handles, remove the three `!test` tags) — wrong pick means a known 2.4.7 failure stays.
    1. Fix F-02, F-03 and F-04 in one change, remove the tags [recommended: three small edits, all proven by a test]
    2. Fix only F-02 and F-03
    3. Leave open; report only
    4. Other
2. **F-11 and F-10 tokens.** Unclear: should the Command input keep no ring (record the decision in `architecture.md`), and should `breakpoints` get a "660 and up" token and `zIndex` a lower layer — wrong pick means 40 raw queries stay or a token the owner did not want.
    1. Record F-11 as a decision; add both tokens [recommended: ends the F-10 class]
    2. Record F-11; leave tokens as is
    3. Other
3. **Per-component state and size stories.** Unclear: how many of the missing stories to write — wrong pick means a very large diff of low-signal stories.
    1. Only where a gap hides a defect class: `ControlSizes` for Checkbox, Switch, Toggle group, Pagination, Avatar; a narrow (390 px) story for each form control [recommended]
    2. Every component, every state and size
    3. None; the dark project and console gate are enough
    4. Other

## Change log

- 2026-11-22T23:31:40+07:00: F-09 fixed by plan-00008 (fluid canvas, no `minWidth`, 390 px probe clean); open question 3 (per-component state and size stories) is answered by the same plan, which gave every component `Sizes` and `States` stories.
- 2026-11-22: F-15 added (Item `sm` and `md` identical) during plan-00008 batch D.
- 2026-11-22T18:34:00+07:00: status draft -> in_review. Report written after the baseline, the story probe, the dark and engine runs and the focus checks; the test and story fixes (F-01, F-05, F-06, F-07) are in the working tree, uncommitted.
