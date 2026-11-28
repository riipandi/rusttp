---
status: done
created: 2026-11-27T19:21:47+07:00
plan: plan-00014-uilibs-implementation-audit-remediation
wave: 4
---

# Handover: Plan 00014 closed, 76 of 81 uilibs audit findings fixed in 89 commits on fix/uilibs-audit-remediation

## What this session did

The owner asked for a full audit of `uilibs` (Base UI, StyleX, unit tests, Storybook and its config, Vite) and then for its remediation. The audit found 81 findings (3 high, 24 medium, 54 low), merged into 26 recommendations; plan 00014 turned them into 79 phases (73 plus the extras 21b, 25b, 25c, 61b, 61c, 69b) in four waves, run by parallel track threads on disjoint files with the coordinator closing each wave. Branch `fix/uilibs-audit-remediation`, cut from `main` at `05ccbe1`; 89 commits.

- **Wave 1** (tracks A to C): ten-second story waits by configuration, shared overlay helpers instead of sleeps with a guard test, the disabled-look check, a viewport frame that follows the dev sheet, one stylesheet wait per worker, and CI (parallel legs, failure screenshots, a WebKit workflow for story pull requests, minified StyleX in production, one dev media-const recovery).
- **Wave 2** (tracks D to G): the data grid on tested ground (real TanStack table fixtures, clipboard, paste, fill, auto size, row stops, collision-free ids), data grid row and cell geometry as dynamic styles, the Base UI scrollbar in place of a 250-line overlay, one `PopupShell`, tall dialogs and sheets that scroll, `Text` and `Stack` no longer responsive in weight, align, and justify, `fixedColors`, the unit project in three engines, and a tested docs checker. Phase 45 (one responsive stylesheet) was reverted after a bisect showed 0.9 KB gzip of entry growth.
- **Wave 3** (tracks H and I): static `ring` and shared popup recipes, `PartProps` and `StyleProp` with a guard test, stories on `screen`, a leaner Storybook config (layout keys, matchers, addons, the preview script), no `#/` alias, one `browserProject` helper, an opt-in React Compiler leg, and both open items of `issue-00010`.
- **Wave 4** (this close): `docs/` re-checked (still no page about the library: n/a, no commit), RI-6 added to the roadmap, `issue-00010`, `handover-00016`, and the plan archived, final validation run.

Extra defects the red-first tests found beyond the audit (all fixed): the auto-size floor never applied (TanStack resolves every `minSize` to 20), draggable grids drew no row separators (a visible change), an end-pinned column measured 0 in drag grids, `isBreakpoint` accepted `'toString'`, a bordered auto-resizing Textarea was 2 px short, and the TreeGrid story's memo missed its table holder.

## Visible changes

Draggable grids draw row separators; the Sortable rollback demo is off by default (`failRate` 0); the `PreviewCard` popup is centered by default; the seven `*Portal` aliases are gone; `Text` weight and align and `Stack` align and justify take plain values; `backgroundPageFaded` is gone and `fixedColors` holds the invariant colors; the data grid scrollbar is Base UI's.

## What stayed open / the trap

- The branch is not pushed and has no pull request. After the push, the required checks in GitHub must be re-pointed: `Gate (Chromium)` became `Checks`, `Tests (storybook)`, `Tests (storybook-dark)`, and `Tests (unit)`; the nightly `Stories (<browser>)` job kept its name; `Stories (React Compiler)` (nightly) and `Stories (webkit)` (a pull request that touches stories, in `uilibs-webkit.yml`, not a required check) are new. No CI leg has run on a real runner yet: the first push is the real test of the caching, the artifacts, and the path filters.
- `plugins` lists `@vitest/browser-playwright` as a devDependency through the existing catalog entry (owner approved, plan 00014 phase 68): `plugins/vitest` needs it to resolve under pnpm.
- `roadmap-00001` RI-6 holds the parked items with their unlocks; the seven files the compiler leg skips are listed there.
- The trap: a full parallel run slows Playwright's actionability waits (a drag took 17 to 29 s against the 30 s budget), so the sticky-header scrollbar play uses `force: true` and Vitest's own `userEvent` (testing-library's synthetic pointer id is refused by Firefox). A story that drags should do the same.
- The trap: counting rules before claiming a StyleX saving. Static recipes cost more rules than one dynamic rule (1710 to 1718), and the gain is no inline style; a one-file responsive stylesheet looked smaller and grew the entry.
