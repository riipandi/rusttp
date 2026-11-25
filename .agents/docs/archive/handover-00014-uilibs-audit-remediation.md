---
status: done
created: 2026-11-25T18:40:00+07:00
plan: plan-00011-uilibs-audit-remediation
wave: 8
---

# Handover: Plan 00011 closed, the uilibs audit remediation is done and its gate runs in CI

## What this session did

The owner asked for every recommendation of the uilibs audit (R-01 to R-39) plus a `Link` built on Base UI's `useRender`. Plan 00011 ran 59 phases in 8 waves on `ui-polish` (waves with parallel tracks shared one checkout, no worktrees or orbs). This slice is wave 8, the gates and the close: the overflow gate (phase 53), the docs and Playground checker (54), the rebrand script (55), the data grid audit with the OTP warning settled (56), the docs sync (57, `docs/` has no page on uilibs: n/a), the ledger close (58), and the final validation (59).

Ledger moves: `plan-00011-uilibs-audit-remediation.md`, `audit-00002-ui-uilibs.md` (16 findings: 14 fixed, F-11 won't fix, F-12 deferred), and `handover-00013-uilibs-playground-controls.md` moved to `archive/`; `audit-00003-uilibs-data-grid.md` is new and live (15 findings, all open, report only); `issue-00007` and `issue-00008` stay open. Decisions D1 to D9 and the owner's answers are in `architecture.md` ("The uilibs audit remediation"); the token vocabulary is in `stylex-authoring.md` ("Tokens and shared recipes") and the conventions in `frontend.md`.

## Commits (this slice)

- `test(uilibs): fail stories that overflow horizontally at 390 px` (`a372ef3`).
- `chore(uilibs): check component docs and Playground controls against the code` (`e84bbd0`).
- `feat(uilibs): add a rebrand script for the primary palette` (`caf0e9d`).
- `docs(agents): audit the data grid and settle the OTP warning` (`54e2786`).
- The closing commit (docs sync, ledger close, this handover).

## What stayed open / the trap

- `issue-00007`: `:dir(rtl)` compiles to a `:lang()` list, so the Calendar month arrows and the data grid chevrons ignore `dir`. `issue-00008`: Escape on a `CommandDialog` with typed text logs React `act` errors in WebKit. Neither is fixed.
- `audit-00003`: the data grid's 15 findings (2 medium: no keyboard path to resize a column, none to `onRowClick` rows) need a plan; two questions for the owner are in the report (row labels as functions of the row, a table name prop).
- `just size` is 151.0 of 152 KB gzip: nothing new fits in the webapp entry chunk.
- The trap: the Storybook Vitest addon sets the window of every story itself (default 1200x900) and ignores `browser.viewport`, so the 390 px gate comes from `parameters.viewport.defaultViewport`. The first full run of phase 53 also logged a burst of lightningcss `Invalid empty selector` server errors at startup and passed; it never repeated in the final gate. Moving only the hue of a color changes its luminance, so the rebrand script moves lightness too.
