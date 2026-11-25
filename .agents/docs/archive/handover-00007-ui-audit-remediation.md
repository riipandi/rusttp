---
status: done
created: 2026-11-22T07:00:00+07:00
plan: plan-00004-ui-audit-remediation
---

# Handover: Plan 00004 closed, UI audit defects fixed

## What this session did

An audit of `packages/uilibs` and `packages/webapp` (24 routes at 390 and 1440px, light and dark, axe, the E2E and Storybook suites, two static reviews) found three defects every gate missed and about forty smaller ones. Plan 00004 (archived) fixed them in 17 phases, one commit each. The owner's decisions are D1–D12 in the plan: no token changes, no backward compatibility, `useMessages()` instead of the remount, ISO dates and `Intl`, `tone='critical'`, one `labels` object, visible field labels, `console.info` stand-ins for controls with no backend, and an axe sweep in E2E (`axe-core` the only new dependency).

Ledger moves: `plan-00004` archived, `issue-00003-ui-audit-leftovers.md` filed, this handover written, `handover-00002` archived (the live directory keeps five), `index.md` updated.

## Commits (this slice)

- `fix(uilibs): style disabled checkbox, switch, and radio through controlPress` (`93a2e41`)
- `fix(uilibs): fit the OTP field on small screens and make scrollable tables and handles keyboard-reachable` (`d8d519f`)
- `fix(uilibs): honor forced colors, reduced motion, and keyboard focus on touch devices` (`de795c2`)
- `refactor(uilibs): nest style conditions and share the focus ring and screen-reader-only recipes` (`8524d60`)
- `refactor(uilibs)!: use tone critical and a single labels prop everywhere` (`70a62dc`)
- `feat(uilibs): announce Kanban and Sortable moves by item name` (`b3a897e`)
- `chore(uilibs): fix the chart color contract, mark side effects, and drop story-only dependencies` (`ce3393d`)
- `refactor(webapp): re-render messages in place on a language change instead of remounting` (`a2e7a76`)
- `feat(webapp): whole-sentence messages, real copy, and Intl formatting for dates and numbers` (`53a6483`)
- `feat(webapp): show a label above every form field` (`3fbd2df`)
- `fix(webapp): name landmarks and controls, add a skip link, and keep focus stable` (`e7618a0`)
- `refactor(webapp): share layout constants, reuse Text and tokens, and keep unchanged store state stable` (`b9e992d`)
- `test(e2e): sweep every route for axe violations and horizontal overflow` (`1ecb6b0`)
- `docs(agents): record the UI audit remediation in rules, architecture, shape, and the component index` (`9d6943b`)
- Plus `docs(agents): add plan 00004` (`b141834`). The closing ledger commit is the owner's.

## What stayed open / the trap

- `issue-00003-ui-audit-leftovers.md` (archived, all six items resolved): the entry growth was mostly the root `TooltipProvider`, not `useMessages`; plan 00005 fixed it with the entry budget, the contrast gaps, the admin chrome, and the data grid split, and plan 00006 added the webapp unit test runner (`handover-00008`, `handover-00009`). Nothing from this plan stays open in code.
- Not verified, and not fixable in code: a real screen reader, a real forced-colors OS mode (Chromium emulation only), a physical device; `handover-00008` carries them.
- Phase 14 (`docs/`) is n/a: it has no UI content.

Traps:

- The React Compiler memoizes on the object `useMessages()` returns; it must differ per language. A message read at module load, or passed down as a string from one, keeps its old language.
- Base UI renders Checkbox, Switch, and Radio roots as `span` or `div` and focuses a hidden input inside a Slider thumb: `:disabled` and `:focus-visible` never match there (`[data-disabled]` and `:has(:focus-visible)` do).
- axe's label-in-name rule reads the visible keycaps: the sidebar search button's name is `Search ⌘ K`.
- A bare `1fr` grid column is `minmax(auto, 1fr)`: a wide child (the six-slot code) stretches the page; use `minmax(0, 1fr)`.
- The sweep needs a built server: `pnpm --filter webapp build`, restart `cargo run -p rusttp-server -- serve`, then `E2E_BASE_URL=http://127.0.0.1:3000`; a stale build tests the old UI.
