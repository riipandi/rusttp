---
status: done
created: 2026-11-20T06:09:00+07:00
plan: plan-00001-uilibs-improvement
wave: —
---

# Handover — 2026-11-20 06:09

## What this session did

The owner started `plan-00001-uilibs-improvement` and asked for every phase in one run, one atomic commit per phase, with decisions and questions logged in the plan for later. All thirteen phases ran: `packages/uilibs` now has one control size scale (`sm 32 / md 36 / lg 40`, `xs 28` on Button, Toggle, and Tabs) with shared recipes in `styles/control.stylex.ts`, `ref` accepted by every wrapper, Textarea and FileUpload as Field controls, AA-safe tokens with a `borderControl` edge, `LinkButton` and Button `loading`, `tone` on Alert, Badge, and Toast, `labels` props for built-in strings, Keyline icons in place of inline svgs, and an axe gate that fails by default (light and dark, 433 of 433 stories, three green runs). The decisions D1 to D13 are in the plan and in the `architecture.md` decision record; the per-phase deviations are in each phase's `note`.

Ledger moves: `plan-00001-uilibs-improvement` is `done` and, with `audit-00001-uilibs` (`completed`: 25 findings fixed, F-26 deferred), moved to `.agents/docs/archive/`; the index rows moved with them. `rules.md`, `shape.md`, `architecture.md`, `ui-components.md`, `stylex-authoring.md`, and `AGENTS.md` were updated in phases 10 and 11.

## Commits (this slice)

- `refactor(uilibs): accept ref on every wrapper and add an opt-in a11y gate switch` — `48fd962`.
- `feat(uilibs): add the control size scale, shared control recipe, and AA-safe tokens` — `68d1d85`.
- `refactor(uilibs): give form controls one size scale and one state model` — `3b6aeae`.
- `fix(uilibs): wire Textarea, FileUpload, Slider, OTP, and triggers into Field and name them` — `1c6ee8b`.
- `feat(uilibs): add LinkButton and Button loading, fix link roles, ButtonGroup, and AlertDialogAction` — `6eebb6f`.
- `feat(uilibs): add tones to Alert, Badge, and Toast and unify close parts and labels` — `29d356b`.
- `fix(uilibs): fix calendar, table, item, kanban, and sortable accessibility` — `2fe9e6a`.
- `refactor(uilibs): replace inline svgs with icons and remove duplicate menu parts` — `0bcd28b`.
- `test(uilibs): enforce the a11y gate, add state stories, and align the webapp controls` — `0d90d4e`.
- `docs: record the UI library contracts, the a11y gate, and the decisions` — `0e77ae9`.
- `docs: sync the agent docs with the UI library contracts` — `56ddbd6`.
- `fix(uilibs): name a combobox chip's remove button after the chip` — `ff53548` (outside the plan: F-17 asked for it).

## What stayed open / the trap

- F-26, a dedicated review of `extra/data-grid` (about 9,400 lines): deferred until the webapp adopts the grid; open an issue then.
- Not run here: Firefox and WebKit e2e (the browsers are not installed; `just e2e-test` fails those projects, `--project Chromium` is 20 of 20), screen readers, forced colors, RTL, and a visual diff. The Select trigger glyph changed (two filled triangles to `ChevronsUpDown`) and the default Toggle and Menubar are 4 px taller: look at them once.
- Behavior of Base UI 1.9 the library works around, pinned by stories: OTP ignores `aria-label` on the first slot, the Toast close button is `aria-hidden` until the stack is focused, `Button` gives a non-native render `role="button"`, the accordion has no arrow-key navigation.

The trap: a quick Storybook check that reverts a file with `git checkout` also reverts uncommitted work in it. The dark-theme sweep needs `initialGlobals` set to `dark` temporarily; copy the file aside and restore the copy, never `git checkout` it. Another: the Storybook canvas overlay (`.storybook/decorator.tsx`) lives inside the story root, so a role query that is not scoped can match its direction button.
