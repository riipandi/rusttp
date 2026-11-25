---
status: living
created: 2026-11-22T15:05:00+07:00
updated: 2026-11-22T15:05:00+07:00
references: handover-00008-ui-leftovers-remediation, plan-00004-ui-audit-remediation, architecture.md (the former "Parked" section)
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

## Product

### RI-4: community and enterprise editions

_(from architecture.md "Parked", 2026-11-19)_

- status: parked (owner-deferred 2026-11-19; unlock: the owner raises it) · updated 2026-11-22

An `enterprise` Cargo feature, port overrides in the kernel, and a license gate. Modules are already crates plugged in with Cargo features (`architecture.md`, "Modules are crates, plugged in and out with Cargo features"), so an edition would be a feature set on `apps/server`, not a fork.

**Unlock:** the owner raises it. **First move:** a decision record on what the enterprise feature gates and where the license check runs.
