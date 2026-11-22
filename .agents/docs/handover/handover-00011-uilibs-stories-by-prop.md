---
status: done
created: 2026-11-22T23:59:09+07:00
plan: plan-00008-uilibs-stories-by-prop
---

# Handover: Plan 00008 closed, uilibs props follow Reshaped, every story file grouped by prop axis

## What this session did

The owner asked for an audit of `packages/uilibs`, then for every component's stories to be grouped by the prop they exercise instead of one story per value, with the props themselves kept close to Reshaped (no backward compatibility, nothing lost). Plan 00008 (D1 to D15) settled the shape; phases 0 to 14 ran one atomic commit each, on the owner's go-ahead per batch.

- Props: `tone` became `color` and `variant` is the fill only (`solid | faded | outline | ghost` on Button and Badge); Button, Badge, text-entry controls, Checkbox, Radio, Switch, Tabs, Toggle, Avatar, Progress, Meter, Spinner, Tooltip, Separator, Breadcrumb, Card, Popover, Item, and Icon gained or renamed the Reshaped props listed in `architecture.md`. Defaults reproduce the look each component had; a scratch computed-style parity script proved it in phases 2 to 6 (never committed).
- Stories: every component folder is `Playground`, then one story per axis (`Variants`, `Colors`, `Sizes`, `States`, `Orientations`, `Sides`, `Layouts`), then behavior stories. `Axis` (`src/contracts/story-axes.tsx`) draws each axis; `src/contracts/control-sizes.tsx` holds the `play` helpers (`cellOf`, `expectControlHeights`, `expectBoxSizes`, `expectDisabledLook`, `expectDockedTo`). The canvas is fluid, so the 390 px layout shows.
- Tests: the gate went from 888 tests (444 per theme) to 910 (455 per theme); the per-batch deltas are in each commit body together with the removed story ids and the stories that now cover them.
- Defects found on the way: InputPhone's country trigger inherited the Combobox trigger's `width: 100%` and overflowed at 390 px (fixed in `input-phone.stylex.ts`); Item `sm` equals `md` (audit-00002 F-15, open); several calendars on one canvas fail axe `landmark-unique` unless each has its own `labels.labelNav` (a story concern, recorded in `frontend.md`).

Ledger moves: `plan-00008` archived; `handover-00010` archived; `audit-00002` stays live with F-09 fixed and F-15 added (15 findings, 5 fixed, 9 open, 1 deferred); `index.md` rows moved.

## Commits (this slice)

- `test(uilibs): add the story axes helper and a fluid story canvas`
- `refactor(uilibs): rename tone to color and the Button and Badge variants to solid, faded, outline, ghost`
- `feat(uilibs): add Button colors, rounded, fullWidth, icons, raised and Badge size, rounded, icon, dismiss`
- `feat(uilibs): add variant to text-entry controls and size to Checkbox, Radio, Switch`
- `refactor(uilibs): rename Tabs and Toggle variants to the Reshaped names and add solid and selectedColor`
- `feat(uilibs): add color, size, and elevation props to surface and feedback components and align Item and Icon names`
- `test(uilibs): group Button and Badge stories by prop`, then one commit per batch A to F (text and form, press and selection, overlays and menus, feedback and content, navigation and dates, scenario and charts)
- `docs(agents): sync the story convention, the color and variant model, and the new props`
- The closing commit (this handover, the archive moves).

## Final validation (phase 16)

- Chromium gate 910 of 910 (light and dark, axe, console gate), `just test-web` 75, E2E Chromium 184, `just size` 461.1 KB of 480 and 146.7 KB gzip of 152, lint, format, and typecheck clean.
- Firefox 910 of 910. WebKit: only the menubar (F-12, known) and `select > Keyboard` (WebKit-flaky since F-06) fail in a full run.
- 390 px probe of all 459 stories in both themes: clean, except two `Contracts` stories left alone (`Control heights per size` 426 px over, `Ref as a prop` 22 px over). The probe also found a fixed-width Textarea story (now `maxWidth: '100%'`).
- Flakes the final run exposed, fixed in the stories: bar-chart `Layouts` read bar width mid-animation (Firefox), resizable `Playground` read the focus glow mid-transition, and combobox `Playground` left a closing popup for axe to flag in WebKit. WebKit was not rerun in full after the combobox fix; the story passes alone in both themes.
- Every story folder has a `Playground`; calendar and description-list got theirs by renaming `Controlled` and `Default`.

## What stayed open / the trap

- `audit-00002`: F-02, F-03, F-04, F-08, F-10, F-11, F-13, F-14, F-15 open, F-12 deferred; all wait for the owner's fix decision.
- Chart stories that draw different data per story (bollinger-band, boxplot, dumbbell, and others) only got the fluid canvas and a `Playground` name: they have no prop axis. `progress-circle` and `donut-chart` have no `variant`, so the plan's axis stories for them were not written.
- The two wide `Contracts` stories above (audit-00002 F-09 note).
- The plan's permanent overflow gate (an `afterEach` check for horizontal overflow) was left out of scope; open an issue if wanted.

Trap: a story that shows one axis per row inside a flex column stretches an `Icon` (its root is a column child), so measure the `svg`, or wrap the icon in a row. And never run Storybook while `pnpm --filter uilibs test` runs: both want port 6006.
