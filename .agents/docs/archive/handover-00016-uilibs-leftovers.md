---
status: done
created: 2026-11-26T04:20:00+07:00
plan: plan-00013-uilibs-grid-and-gate-leftovers
wave: 2
---

# Handover: Plan 00013 closed, six UI leftovers resolved and issue-00009 archived on fix/uilibs-leftovers

## What this session did

The owner listed six leftovers after plan 00012. Plan 00013 ran 11 phases serially on `fix/uilibs-leftovers` (cut from `main` at `f2e3bb9`): the story test viewport became a Storybook global with a guard, the dots component became `StepDots`, the body font is read from a token through `--font-body`, the `RightToLeft` story waits on the end state, the data grid draws a ring when it holds focus with no active cell, the resize separator is valid ARIA 1.2 (`aria-valuemax`, `aria-valuetext`, `aria-controls`), clickable rows take `PageUp` and `PageDown`, and the resize direction follows the computed `direction` of the handle. Decisions D1 to D10 and the APG comparison are in `architecture.md` ("Six leftovers closed…"); rules in `frontend.md` and `packages/uilibs/AGENTS.md`.

Ledger moves: `plan-00013-uilibs-grid-and-gate-leftovers.md` and `issue-00009-uilibs-story-gate-leftovers.md` (resolved) moved to `archive/`; `handover-00015-uilibs-data-grid-audit.md` moved to `archive/`; `roadmap-00001` gained RI-5 (parked APG differences).

## Commits (this slice)

- `fix(uilibs): set the story test viewport through a Storybook global and verify it`, `refactor(uilibs): rename the dots ProgressIndicator to StepDots`, `refactor(uilibs): read the body font from the fontFamily token`.
- `test(uilibs): give the data grid RightToLeft story a transition-sized timeout` and two follow-ups (`widen the RightToLeft story finds…`, `wait for the RightToLeft chevron transitions to end…`).
- `fix(uilibs): show a focus ring on a data grid that holds focus with no active cell`, `fix(uilibs): give the data grid resize separator a maximum, a spoken value, and aria-controls`, `feat(uilibs): let PageUp and PageDown move between clickable data grid rows`, `fix(uilibs): derive the data grid resize direction from the document direction`.
- The plan commit and the closing docs commit: see `git log main..fix/uilibs-leftovers`.

## What stayed open / the trap

- The branch is not pushed and has no pull request.
- `roadmap-00001` RI-5: the APG differences that were kept or parked (Tab inside a cell-selection grid, first cell on entry, `Shift + Space` and `Control + Space`, Enter on a separator, Space on a row, no grid role on clickable rows). Unlock: the screen reader pass RI-1 or an owner decision.
- `Right To Left` flaked in WebKit twice more during validation; the likely cause (reading the matrix `a` term after waiting on `b`, mid-transition) is fixed and the next full WebKit run was green, but a slowed transition never reproduced it, so the cause is a hypothesis. Reopen as an issue if it fails again.
- The trap: the removal warning for `viewport.defaultViewport` suggests `globals: { viewport: "phone" }`, but the Vitest addon reads `.value`, so a bare string leaves the window at 1200 px and the 390 px overflow gate passes without measuring. Use the object `{ value, isRotated }`; the preview's `afterEach` now fails a story where the window does not match.
