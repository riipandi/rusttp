---
status: partial
created: 2026-11-22T14:10:00+07:00
plan: plan-00005-ui-leftovers-remediation
---

# Handover — 2026-11-22 14:10

## What this session did

The owner asked for an evaluation and a real validation of `issue-00003-ui-audit-leftovers.md` and of handovers 00005 to 00007 (statuses `partial`), then for a plan that fixes the parked items. Validation overturned one claim: the entry growth was blamed on `useMessages`, but building the commits in between and summing the entry with its static imports gave 422 KB (before the i18n slice), 457 KB (`useMessages`, about 35 KB), 547 KB (the root `TooltipProvider` from `e7618a0`, about 89 KB). Handovers 00005 and 00006 had no open thread left (later commits closed them), and `AGENTS.md:21` and the compose credentials were put right (the credentials are development-only by the owner's choice, in `AGENTS.md` and `rules.md`).

Plan 00005 (archived, done) fixed four of the five parked items: an entry budget check (`just size`, 480 KB / 152 KB gzip) and the tooltip provider per layout (546.6 → 458.1 KB, 177.0 → 145.9 KB gzip), one admin chrome per viewport (`useCompact()`), chart series on the `foreground*` tokens and a new `borderControl` value (3:1 on neutral surfaces), and the data grid cell and table files split (2459 → 1243 and 2491 → 465 lines, code moved unchanged). The owner also asked for a lazy language catalog: it was built and measured (one language is 6.0 KB gzip, the entry did not shrink) and dropped; plan D8 and `architecture.md` record the numbers. The decision record that reverses plan 00004 D1, D11, D12 is in `architecture.md` ("The webapp's entry load has a budget…").

Ledger moves: plan 00005 archived; handovers 00003 to 00006 (done) archived; `issue-00003` items 1 to 4 and 6 resolved, item 5 (the webapp unit test runner) still considering; the term "agent docs" (`.agents/docs/` and `AGENTS.md`) replaces "LLM docs" in the index.

## Commits (this slice)

- `docs(agents): re-measure the entry load, close stale handover threads, and note the dev-only compose credentials` (`e464701`).
- `docs(agents): add plan 00005, the UI audit leftovers` (`3aeefeb`), then the plan's revision `b15283e`.
- `chore(webapp): fail the build check when the entry load passes its budget` (`3affca4`).
- `perf(webapp): load the tooltip only in the layouts that show one` (`a9cd234`).
- `refactor(webapp): mount the sidebar or the top bar, not both` (`8bd85e9`).
- `fix(uilibs): reach 3:1 for chart series and control borders on neutral surfaces` (`045ae52`).
- `refactor(uilibs): split the data grid's cell controller into ops, editor, and controller` (`7a18377`).
- `refactor(uilibs): split the data grid's table into head, body, and shared helpers` (`f930e23`).
- `docs(agents)` records: `83bfe7c`, `be15fb6` (phase 5 cancelled), `6536a71`, the sync `a220a85`, and the closing commit.

## What stayed open / the trap

- `issue-00003-ui-audit-leftovers.md` is archived: its item 5 (the webapp unit test runner) was closed the same day by plan 00006 (`handover-00009`).
- Not verified, and not fixable in code: a real screen reader, a real forced-colors OS mode (Chromium emulation only), a physical device (from plan 00004). Chromium E2E: 184 passed; Firefox, Safari, and Mobile Safari: 159 passed, 0 failed, 393 skipped by design (the a11y sweep is Chromium-only, and the rail and sidebar specs skip on mobile), run on 2026-11-22 against a rebuilt server after plan 00006.
- `packages/uilibs/src/extra/data-grid/data-grid-table-virtual.tsx` is 1186 lines and was not split; no defect depends on it.

Traps:

- Sum the entry chunk and its static imports (`just size`), not the chunk alone; a root provider or a barrel import can add tens of KB elsewhere.
- Rebuild the server (`cargo build -p rusttp-server`) after `pnpm --filter webapp build` and before an E2E run with `E2E_BASE_URL`: an older binary served a document naming asset hashes that no longer existed, so every spec timed out on a missing `main`.
- Do not run Storybook and the uilibs Vitest run together: Storybook's dev server shares the StyleX plugin and one run reported "Invalid empty selector" that the solo run did not.
- A word-match import picker keeps names that appear only in comments (`Pin`, `memo`); lint finds them, check the imports of a split file by hand.
- An assumption in a plan is a hypothesis until measured: D8 assumed about 30 KB per language, the build said 6 KB gzip.

## Suggested skills

- `agent-docs` for any ledger change.
- `rust-verify-harden` only if Rust is touched.
