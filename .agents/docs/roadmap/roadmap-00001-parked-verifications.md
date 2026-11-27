---
status: living
created: 2026-11-22T15:05:00+07:00
updated: 2026-11-27T19:21:47+07:00
references: handover-00008-ui-leftovers-remediation, plan-00004-ui-audit-remediation, plan-00013-uilibs-grid-and-gate-leftovers, plan-00014-uilibs-implementation-audit-remediation, architecture.md (the former "Parked" section)
---

# Roadmap: parked verifications and product ideas

Parked work, not work items. Each entry names the unlock that turns it into an issue or a plan.

## Manual verification (not fixable in code)

The automated gates cover what a browser can emulate: the axe sweep over every route in light and dark at three widths (`packages/e2e/screens/a11y/a11y.spec.ts`, Chromium only), the uilibs story a11y gate (`pnpm --filter uilibs test`), and the four Playwright projects (`packages/e2e/playwright.config.ts:27-30`: Chromium, Firefox, Mobile Safari, Safari; last full run 2026-11-22: Chromium 184 passed, the other three 159 passed, 0 failed, 393 skipped by design).

### RI-1: real screen reader pass

_(from handover-00008, plan-00004)_

- status: parked (unlock: a release candidate, or a person with VoiceOver or NVDA at hand) · updated 2026-11-22

axe checks names, roles, and contrast; it does not hear the reading order, live-region announcements (notifications, form errors), or focus moves after a dialog closes.

**Unlock:** the first release candidate, or the owner asks for it. **First move:** VoiceOver on macOS Safari and NVDA on Windows Firefox over sign-in, the admin sidebar, a dialog, a form with errors, and the notification panel; each defect becomes an issue item.

### RI-2: real forced-colors OS mode

_(from handover-00008, plan-00004)_

- status: parked (unlock: access to Windows High Contrast, or a defect report) · updated 2026-11-22

Forced colors were checked only through Chromium emulation; a real Windows High Contrast theme can drop borders, focus rings, and icon fills that emulation keeps.

**Unlock:** a Windows machine is at hand, or a user reports a forced-colors defect. **First move:** Windows contrast themes (dark and light) over every route in `packages/e2e/utils/routes.ts`, checking focus rings, control borders, selected states, and chart series.

### RI-3: physical device pass

_(from handover-00008, plan-00004)_

- status: parked (unlock: a release candidate, or a phone or tablet at hand) · updated 2026-11-22

The Mobile Safari project uses Playwright's iPhone 16 emulation; touch targets, safe areas, the virtual keyboard over forms, and momentum scrolling in the data grid are not exercised.

**Unlock:** the first release candidate, or the owner asks for it. **First move:** one iPhone (Safari) and one Android phone (Chrome) over sign-in, the dashboard, the admin top bar (compact layout), and the data grid.

### RI-5: data grid keyboard differences from the APG

_(from plan-00013)_

- status: parked (unlock: the screen reader pass RI-1, or the owner decides) · updated 2026-11-26

Plan 00013 compared the data grid with the APG grid, treegrid, and window splitter pages and kept or parked these: `Tab` moves between cells of a cell-selection grid instead of leaving it (the APG grid is one tab stop); the first cell is not focused when the grid is entered (the grid draws a ring and waits for an arrow); `Shift + Space` and `Control + Space` (select the row or the column) are not bound; `Enter` on a column separator resets the width instead of collapsing the pane; `Space` activates a clickable row; clickable rows are `row`s in a plain `table`, with no grid role. Each is a choice or an optional key, not a defect found by a gate.

**Unlock:** VoiceOver or NVDA on the data grid shows one of them hurts, or the owner asks for APG parity. **First move:** the screen reader pass over the editing and `Row click` stories, then one issue item per difference that hurts.

## Product

### RI-4: community and enterprise editions

_(from architecture.md "Parked", 2026-11-19)_

- status: parked (owner-deferred 2026-11-19; unlock: the owner raises it) · updated 2026-11-22

An `enterprise` Cargo feature, port overrides in the kernel, and a license gate. Modules are already crates plugged in with Cargo features (`architecture.md`, "Modules are crates, plugged in and out with Cargo features"), so an edition would be a feature set on `apps/server`, not a fork.

**Unlock:** the owner raises it. **First move:** a decision record on what the enterprise feature gates and where the license check runs.

## Component library

### RI-6: parked items of the uilibs implementation audit

_(from plan-00014, decisions D5, D13, D14, D21 to D23)_

- status: parked (unlock: per item below) · updated 2026-11-27

Plan 00014 fixed 76 of the audit's 81 findings and decided against these. Each is a deliberate "not now", with the trigger that reopens it:

- **A check of the code snippets in stories** (D13, X-05's `check:docs` half). 291 hand-written snippets stay unchecked: comparing tag and prop names with a story's render needs a parser that gives false positives. Unlock: the first snippet that drifts from its story and reaches a user. First move: a `check:docs` rule for tag names only.
- **A root `browserslist`** (D14, V-10; `issue-00007`). `build.target: 'esnext'` changes no JS byte, so nothing is lost by waiting. Unlock: the owner sets a browser policy. First move: add the file, then compare the CSS and JS bytes.
- **`FieldItem`** (D21, B-13). Nothing in the library needs it and `Label` names the group controls. Unlock: a disabled or invalid checkbox group that needs the item wiring.
- **A `renderStyled` helper** (D22, B-07). Twenty-two components spell `useRender` in six lines each and eleven carry an `as` cast (`frontend.md`). Unlock: a defect the cast hides reaches a user, or Base UI changes `useRender`. First move: migrate one component and count the lines saved.
- **A compiler `exclude`** (D23, V-05, D8). The opt-in compiler leg lists seven skipped files (`toggle`, `data-grid`, `data-grid-cell-editor`, `data-grid-table-pager`, `data-grid-table-virtual`, `button-group`, `carousel`), and the library keeps the compiler on. Unlock: a skipped file breaks at run time, or a story fails only with the compiler.
- **A node unit project** (D23, U-13). It saves an estimated 1 to 2 s of 2 s today. Unlock: the unit suite passes a few hundred tests.
- **`exports` roots** (D23, V-11). The package is private and the catch-all works with Vite and TypeScript; a list of roots breaks silently on a new folder. Unlock: a second consumer needs a restricted surface.
- **Nightly `retry`** (D5). A red nightly carries its screenshots and is read, not rerun. Unlock: a second nightly failure the screenshots do not explain.
- **A `lightColors` generator** (D9, X-11). `contrast.test.ts` already fails when the restated light theme drifts. Unlock: the drift test fails twice in review.
- **One focus-ring merge for the grid `rowFocusable` and `resizeHandleFocusable`** (D23, X-10). Their offsets differ. Unlock: a third grid part needs the same ring.
- **Constraining `style` per part** (D23, X-14). `StyleProp` stays the one shape. Unlock: a part where a consumer's style breaks its layout.

**First move for any item:** open an issue item with the evidence, then plan it.
