---
status: done
created: 2026-11-26T00:58:26+07:00
plan: plan-00012-uilibs-data-grid-audit-remediation
wave: 3
---

# Handover: Plan 00012 closed, all 15 data grid audit findings resolved on fix/data-grid-audit

## What this session did

The owner asked for a branch from the merged `main`, a plan for the 15 findings of `audit-00003` with a questionnaire, then (accepting every recommendation) its execution. Plan 00012 ran 19 phases in 3 waves on `fix/data-grid-audit`: cleanup (reduced motion, tokens, 54 unit tests, story fixes), grid semantics (names, row labels, drag and loading announcements, the pager `nav`, keyboard row activation, keyboard column resizing), and the close. Result: 14 findings fixed and F-14 a false positive; the audit's two questions are answered (`getRowLabel`, and a required table name prop). Decisions are in `architecture.md` ("The data grid is named, announced, and keyboard-operable"); rules in `frontend.md` and `packages/uilibs/AGENTS.md`.

Ledger moves: `plan-00012-uilibs-data-grid-audit-remediation.md`, `audit-00003-uilibs-data-grid.md` (completed), and `handover-00014-uilibs-audit-remediation.md` moved to `archive/`; `issue-00009-uilibs-story-gate-leftovers.md` filed (2 open items).

## Commits (this slice)

- `fix(uilibs): require an accessible name on the data grid table`, `fix(uilibs): name data grid row and column controls after their row and column`, `fix(uilibs): announce data grid drags by row and column name`, `fix(uilibs): announce data grid loading and loaded states`, `fix(uilibs): make the data grid page buttons a named navigation`.
- `feat(uilibs): let data grid rows with onRowClick work from the keyboard` and `feat(uilibs): resize data grid columns from the keyboard` (each reverts alone).
- Wave 1 and the rest: see `git log main..fix/data-grid-audit`.

## What stayed open / the trap

- The branch is not pushed and has no pull request.
- `issue-00009`: the rows `Right To Left` story flaked once in WebKit under load, and every story logs Storybook 10's removed `viewport.defaultViewport` warning.
- The WAI-ARIA grid and window splitter pages could not be re-read (web access was out of credits), so the keys of phases 15 and 16 are proved by plays, not checked against the pages; a reviewer with access should compare them.
- The trap: a `cellSelection` grid keeps the grid as its one Tab stop and its own key handler, so a new key on a row or separator must stop propagation or the grid also reads it as a cell move; and a virtualized grid drops rows from the DOM, so any row-level state must not assume the row is rendered.
