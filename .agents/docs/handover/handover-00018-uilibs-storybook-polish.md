---
status: done
created: 2026-11-28T22:34:05+07:00
plan: plan-00015-uilibs-storybook-and-ui-polish
wave: 3
---

# Handover: Plan 00015 closed, 13 Storybook and UI items fixed in 24 commits on fix/uilibs-storybook-polish (not pushed)

## What this session did

The owner listed 13 items (Docs `of` errors, ButtonGroup, Calendar, Toast, Tabs, ToggleGroup, Resizable, position stories, data grid in a Card, Arabic text, micro animations, the UIProvider story, the docs theme) and approved the plan in full. Three waves ran: wave 1 in four parallel tracks (A Storybook serving and docs guard, B Toast and Tabs, C controls, D Calendar, font, Card grid), wave 2 in three (E position stories, F and G motion), wave 3 serially (docs, ledger, validation). The decisions and rejected alternatives are in `plan-00015` and `architecture.md` (\"The Storybook defects and the uilibs polish\").

Two plan claims did not survive the tree. The docs theme bug (D5 expected no code change) reproduced on the cache-fixed build as a code defect and was fixed in the container. Meter needed no animation (it shares Progress's transition). One fallback fired: D13, the Resizable `line` handle keeps `borderControl` at rest because `borderNeutral` is 1.32:1.

Ledger moves: `plan-00015` and `handover-00017` move to the archive; `issue-00011-uilibs-storybook-polish-leftovers` is filed (4 items); no roadmap entry changed.

## Commits (this slice)

- `docs: approve plan 00015 and start the Storybook and UI polish work` (`de14ce2`).
- Wave 1: `dcb049f`, `5438812`, `a778bbe`, `992bacb`, `fb91e93` (serving, Docs name, UIProvider story, docs theme, docs guard); `1c62d4c`, `e313fac`, `8661d7b`, `b523a92` (Toast position, tint, loading, Tabs); `b6718f0`, `33164da`, `9728d06`, `c63d6e1` (ButtonGroup, concentric corners, Resizable); `1636211`, `4823823`, `f22aa60` (Calendar, Arabic, Card grid); `1891b7b` (the Arabic range per engine).
- Wave 2: `8198ba6` (position stories), `9a3bfae` (checkbox, radio, press), `a1c81dc` (avatar, image, calendar day), `6651b45` (one reduced-motion reader).
- Wave 3: `fbc0065` (agent docs), and the closing commit `docs: close plan 00015 and write the handover`.

## What stayed open / the trap

Open: `issue-00011` (SPA unhashed files cached a week; three copies of the stylesheet walk; the CI edits unproven on GitHub; three position stories skip the 390 px gate). The branch is not pushed: after the push read the `Checks` job (Chromium now installs there, timeout 20 minutes) and tell the owner whether the required-check names need re-pointing. `actionlint` is not installed here.

Validation on the last code commit (`6651b45`, nothing but docs after it): Chromium 1678 of 1678 (235 files), Firefox and WebKit over the touched areas 487 and 236, typecheck, lint, format, check-ui-docs, check:docs:test, `just verify` (28 Rust tests), storybook:build, `check:docs:render` 80 of 80, entry JS 472.6 KB / 150.9 KB gzip, CSS 64.7 KB / 17.8 KB gzip. E2E n/a (no webapp file changed). Visible side effects: a standalone Toggle is 8 px (was 10), the Basics grid stories sit 8 px lower in their Card, `ButtonGroup` text no longer sits inside a joined run.

The trap: parallel runner threads share one index and one tree. A track that runs `git commit --amend` rewrites a neighbour's commit (track C did, once: `81f87f1` became `a778bbe`); commit with `git commit -m '…' -- <paths>` and fix a late lint error in a new commit. And a StyleX value cannot come from a helper function (the Storybook import dies): put the reduced-motion branch inside each value.
