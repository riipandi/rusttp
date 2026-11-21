---
status: in-progress
created: 2026-11-22T04:40:00+07:00
updated: 2026-11-22T04:40:00+07:00
phases:
    - id: 1
      title: Disabled Checkbox, Switch, and Radio compose controlPress
      status: committed
      note: "93a2e41. The `Disabled` stories fail on the old roots (`expected '1' to be '0.5'`) and pass after; uilibs suite 92 files, 434 tests; lint, format, typecheck clean."
    - id: 2
      title: Mobile overflow and keyboard reach in uilibs (OTP, Table, Resizable, Combobox chip, ThemeSwitcher)
      status: pending
      note: —
    - id: 3
      title: Forced colors, coarse-pointer focus, and reduced motion in uilibs
      status: pending
      note: —
    - id: 4
      title: StyleX rule compliance in uilibs (nested conditions, shared recipes, no duplicates)
      status: pending
      note: —
    - id: 5
      title: One tone vocabulary and one labels shape in uilibs
      status: pending
      note: —
    - id: 6
      title: Kanban and Sortable announcements through labels
      status: pending
      note: —
    - id: 7
      title: uilibs housekeeping (chart contract, sideEffects, dependencies, theme read, repo ignore)
      status: pending
      note: —
    - id: 8
      title: Webapp i18n runtime without remount (useMessages)
      status: pending
      note: —
    - id: 9
      title: Webapp i18n content (whole-sentence messages, real copy, Intl formatting)
      status: pending
      note: —
    - id: 10
      title: Visible labels on the auth and settings forms
      status: pending
      note: —
    - id: 11
      title: Webapp landmarks, names, and focus (skip link, 404 h1, label in name, sidebar toggle, dummy handlers)
      status: pending
      note: —
    - id: 12
      title: Webapp reuse of tokens and components, store equality, dead code
      status: pending
      note: —
    - id: 13
      title: E2E accessibility and overflow sweep
      status: pending
      note: —
    - id: 14
      title: Docs sync (human-facing)
      status: pending
      note: —
    - id: 15
      title: LLM docs sync (.agents/docs)
      status: pending
      note: —
    - id: 16
      title: Final validation
      status: pending
      note: —
    - id: 17
      title: Ledger close and handover
      status: pending
      note: —
---

# Remediate the UI audit — fix the verified defects in `packages/uilibs` and `packages/webapp` without touching the design-system tokens

## Objective

The UI audit of 2026-11-22 (artifact "Audit UI: uilibs + webapp", thread `T-01a1ffed-844f-71b3-9a73-665b349a8e1f`) found three defects that every existing gate missed (disabled controls that look enabled, an OTP field that overflows a 390px screen, a table that a keyboard cannot scroll) and about forty smaller ones across accessibility, i18n, StyleX rules, and API consistency. After this plan the verified defects are fixed, the classes of defect they belong to are caught by tests, a language change no longer remounts the route tree, and the records say so. The plan does not change a design-system token value or add a token, and it does not touch the backend.

## Current state (verified in the tree, 2026-11-22)

- **Disabled controls look enabled** — the roots of Checkbox, Switch, and Radio use `':disabled'` only (`packages/uilibs/src/base/checkbox/checkbox.stylex.ts:25,30`; same keys in `radio.stylex.ts` and `switch.stylex.ts`), while `controlPress` already styles `'[data-disabled]'` (`packages/uilibs/src/styles/control.stylex.ts:65,67,111,112`). Chromium on Storybook `Disabled` stories: checkbox and switch roots are `SPAN` with `opacity: 1`, `cursor: pointer`; radio root is `DIV` with `opacity: 1`, `cursor: auto`. The story only asserts the attribute (`checkbox.stories.tsx:106`). The comment at `control.stylex.ts:97-101` says these three compose `controlPress`; none does.
- **OTP overflow** — slot width is a fixed `unit.x9` per `md` slot (`packages/uilibs/src/base/otp-field/otp-field.stylex.ts:9-11`), six slots wider than the 342px column at 390px. Chromium at 390px: `documentElement.scrollWidth - clientWidth` is 74 on `/two-factor` and `/device?token=lumos`; the h1 and subtitle are clipped. Axe also reports `color-contrast` 2.29 (`#ababab` on `#ffffff`) on `/two-factor` mobile dark, element `.xamitd3`; the cause is not established.
- **Table cannot scroll by keyboard** — `tableStyles.container` is `overflowX: 'auto'` (`packages/uilibs/src/extra/table/table.stylex.ts:10`) on a plain `<div>` (`table.component.tsx:15`) with no `tabIndex`, role, or name. Axe `scrollable-region-focusable` (serious) on `/dashboard` at 390px.
- **Name does not contain the visible text** — axe `label-content-name-mismatch` (serious) on 28 nodes at 1440px: the account menu button (`aria-label="Account menu"`, visible initials) and the admin search button (`aria-label="Search and commands"`, visible `Search`).
- **Other axe findings** — `/nope` has no `h1` (the page renders an `h3`; `routes/-boundaries.tsx:34`); `/admin/settings/*` at 390px has content outside landmarks (the `Select` that replaces the aside). Light and dark otherwise show no contrast violation. The seed audit's per-route data is in `.amp/in/shots/report.json` (gitignored scratch).
- **Placeholder copy shown to users** — `en.json:179` "Put some description here."; `en.json:218,224` both settings pages carry the dashboard's sentence; `en.json:117` `form_captcha_badge` "Captcha placeholder" is visible on login and signup.
- **Buttons with no handler** — `(auth)/two-factor.tsx:54` (recovery code, a raw `<button>`), `(auth)/verify-email.tsx:34` (resend), `components/social-buttons.tsx:32-39` (Google, GitHub), `(app)/-header.tsx:24-27` (Loans, Members, Reports have no `to`). `.oxlintrc.json:11` has `no-console` off.
- **Hidden-label forms** — `components/form-fields.tsx:19-29` hand-rolls `srOnly`, `:117,150` render the label with it and put the text in `placeholder`; `:198,215` are raw `<label htmlFor>`. `uilibs/styles/utils.stylex` exports `visuallyHidden` (used by `components/notifications.tsx:27`).
- **Language change remounts the tree** — `routes/__root.tsx:34` `<Outlet key={locale} />`; `libraries/locale.store.ts` is the TanStack Store; `architecture.md:200,207,213` and `rules.md:131` record the remount and reject a per-consumer hook ("a memoized component would keep its old text"). 63 webapp files import `#/paraglide/messages` (292 call lines). Module-level maps reference message functions: `libraries/hotkeys.ts:41-48`, `routes/(app)/dashboard/-loans-table.tsx:18-21`, `-summary.tsx:8-11`, `routes/admin/-commandbar.tsx:375-378`. Valibot rules take `() => m.…()` (`schemas/auth.schema.ts:13-40`). `.oxlintrc.json` already loads `@inlang/paraglide-js/eslint` as a JS plugin (`:5`).
- **Pre-formatted dates and numbers** — `schemas/loans.schema.ts:11,23`, `schemas/notifications.schema.ts:9`, `fixtures/loans.ts:8,16` carry `'Nov 28'`, `'12 min ago'`, `'2,418'` "shown as written".
- **Split sentences** — `(auth)/verify-email.tsx:22-24,40-45` (a sentence in 2–3 messages plus a literal `.`), `(auth)/reset-password.tsx:48-51` (`*_first`/`*_second` joined by `<br />`).
- **Global focus rule** — `packages/uilibs/src/assets/reset.css:131-135` removes `:where(:focus-visible)` outlines under `(hover: none) and (pointer: coarse)`.
- **Forced colors** — `rg -n "forced-colors|prefers-contrast" packages` finds nothing; Slider thumb (`slider.stylex.ts:48`) and Resizable handle (`resizable.stylex.ts:42`) set `outline: 'none'` and show focus only by `box-shadow` or background.
- **Rule violations in StyleX** — top-level `:pseudo` and `@media` keys in `kanban.stylex.ts` (34, 69, 113, 151, 182, 187, 190), `file-upload.stylex.ts` (30, 38, 60, 73, 88), `description-list.stylex.ts` (33, 56, 57, 81, 82), `data-grid-table.stylex.ts` (809, 821, 849, 862, 886), `calendar.stylex.ts:41`, `loader-text.stylex.ts:41`; against `stylex-authoring.md:527`. The focus ring literal `${stroke.ring2} solid ${colors.foregroundPrimary}` appears 24 times in 17 files; `srOnly` is copied in `pagination.stylex.ts:45`, `command.stylex.ts:60`, `breadcrumb.stylex.ts:49`, `contracts/control-sizes.tsx:22`; `chart.component.tsx` merges `props.className`; `theme-switcher.tsx:28-47` uses `'2.25rem'`, `'1rem'`, `'150ms'`.
- **API vocabulary** — Button and menu item use `variant='destructive'` (`button.stylex.ts:81`, `dropdown-menu.component.tsx:94`); Alert, Badge, Toast use `tone='critical'` (`styles/tone.ts:2`). Built-in strings are `labels` in some components and `text` (`pagination.component.tsx:15,62,79`), `label` (`spinner.component.tsx:19`, `breadcrumb.component.tsx:66`), `title`/`description` (`command.component.tsx:38-39`), `showAriaLabel`/`hideAriaLabel` (`input-password.component.tsx:80-81`), or a hard-coded `'Breadcrumb'` (`breadcrumb.component.tsx:14`) in others.
- **Drag announcements** — Kanban and Sortable only pass `accessibility` to `DndContext` (`kanban.component.tsx:196,550`, `sortable.component.tsx:190,325`); no `announcements` anywhere (searched).
- **Chart contract contradiction** — `chart.component.tsx:9-11` and `ui-components.md` §3 say mark colors must be concrete strings; `chart.samples.tsx:21-24` passes `colors.*` `var()` strings.
- **Housekeeping** — `packages/uilibs/package.json` has no `"sideEffects"`; `@tanstack/react-hotkeys` and `date-fns` are `dependencies` but imported only by stories (`command.stories.tsx`, `calendar.stories.tsx`); `packages/uilibs/debug-storybook.log` is untracked and ignored only by `~/.gitignore:30`.
- **Quality baseline** — `pnpm lint`, `pnpm -r typecheck`, `pnpm format:check` green; `pnpm --filter e2e test`: 193 passed, 15 skipped (the skips are `isMobile` guards in `admin.spec.ts:19,65`); `pnpm --filter uilibs test`: 92 files, 434 tests green.
- **E2E setup** — `packages/e2e/package.json` has `@playwright/test`, `@types/node`, `tsrs` as `catalog:` devDependencies; `axe-core@4.14.1` is in the pnpm store (transitive); the audit injected it through `page.addScriptTag`.
- **Docs** — `docs/` (`index.md`, `commandline.md`, `deployment.md`) does not describe the UI (to be re-searched in phase 14). `llms.txt` does not exist in the repository (`git ls-files | rg -i llms` is empty); "LLM docs" are `.agents/docs/`.

## Decisions

- **D1 (2026-11-22, owner): scope is every audit finding except dead tokens.** The design-system tokens (`styles/colors.stylex.ts`, `tokens.stylex.ts`, `themes.ts`) keep their names and values and unused tokens stay for later use. The chart series colors and `borderControl` are tokens, so the findings that need a different value (series contrast, `borderControl` on `backgroundNeutral`) become guidance in the docs, not a change. The cost: two measured contrast gaps remain until the owner opens the palette. Rejected: retuning the palette in this plan — the owner reserved it.
- **D2 (2026-11-22, owner): shared recipes and constants may be added, token values may not.** A `focusRing` recipe in `uilibs/src/styles/utils.stylex.ts` and a reduced-motion constant in `webapp/app/styles/constants.stylex.ts` are allowed; nothing is added to the token files. The cost: `utils.stylex.ts` gains an export every control must adopt in one pass (phase 4). Rejected: leaving the 24 duplicated literals — the next ring change would miss one.
- **D3 (2026-11-22, owner): Checkbox, Switch, and Radio compose `controlPress.root`.** Disabled, `data-disabled`, cursor, and focus ring come from one place, matching the claim at `control.stylex.ts:97-101`. The cost: their root styles are rewritten, so their stories and the contrast table are rechecked. Rejected: adding `'[data-disabled]'` beside `':disabled'` in three files — it patches the symptom and leaves the doc comment false; rendering a native `<button>` through `nativeButton` — it changes the DOM and the form semantics.
- **D4 (2026-11-22, owner): the controls without a backend keep their place and print to the console.** Recovery code, resend, Google, GitHub, and the Loans, Members, and Reports items stay enabled and call a handler that logs one line with `console.info` (a literal English developer message, not UI text, so it is not a Paraglide message). The cost, accepted by the owner: a screen-reader user gets no feedback from them. Rejected: `disabled` with a "soon" hint, and removal.
- **D5 (2026-11-22, owner): schemas carry ISO timestamps and numbers, and a helper formats them with `Intl`.** `LoanResponse`, notifications, and the summary fixture hold `string` ISO datetimes and `number`s; `libraries/format.ts` exports hooks or functions over `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`, and `Intl.NumberFormat` that read the locale store. No backward compatibility: the pre-formatted strings are deleted. Rejected: keeping strings until an API exists — the contract would be wrong on arrival.
- **D6 (2026-11-22, owner): the language change stops remounting the route tree.** `libraries/messages.ts` exports `useMessages()`, which subscribes to `localeStore` and returns the messages object; direct imports of `#/paraglide/messages` outside that file are banned by an oxlint `no-restricted-imports` override, so a missed consumer is a lint error. **Trap:** the React Compiler memoizes on reference, so the hook must return a different object for each locale (one cached wrapper per locale), not the module's `m`. Module-level maps become functions of the messages object, and a form that shows errors revalidates when the locale changes. This reverses the rejected alternative at `architecture.md:213` and the remount record at `architecture.md:200,207` and `rules.md:131`; phase 15 rewrites them. The cost: every component that renders a message calls the hook; a Valibot message is read at validation time, so an error already shown changes only after the revalidation. Rejected: keeping the remount with a focus move and an announcement — it loses input and was the owner's reason to reopen the decision; a bare `useLocale()` in each consumer without the lint ban — the original objection.
- **D7 (2026-11-22, owner): form fields show a static visible label above the control.** `components/form-fields.tsx` uses uilibs `Label` for every field, the placeholder becomes an example or goes, and `srOnly` is deleted. Rejected: a floating label (new motion and states) and hidden labels with a lighter placeholder.
- **D8 (2026-11-22, owner): one tone vocabulary.** Button and menu item take `tone='critical'`; `variant='destructive'` is deleted, with every caller and story. Rejected: documenting the mapping only; `destructive` everywhere.
- **D9 (2026-11-22, owner): every built-in string is one `labels` object with English defaults.** Pagination, Breadcrumb, InputPassword, Spinner, Command, and the other components in the finding drop `text`, `label`, `title`, `showAriaLabel`, `hideAriaLabel` in favor of `labels`; the webapp's callers pass translations through it. Rejected: fixing only the hard-coded ones; documenting four shapes.
- **D10 (2026-11-22, owner): add an axe and overflow sweep to E2E, with `axe-core` as the only new dependency.** `axe-core` (the version already in the store, `^4.14.1`) goes into the pnpm `catalog:` and into `packages/e2e` `devDependencies`; no `@axe-core/playwright`. One spec visits every route at 390px and 1440px in light and dark, runs axe, and asserts no horizontal overflow. The cost: the run grows by the sweep (96 page loads in the audit took under a minute on Chromium); it runs on Chromium only. Rejected: per-bug tests only; no new tests.
- **D11 (2026-11-22): the data grid keeps its structure.** Audit finding F-26 (`data-grid-cell.tsx` 2459 lines, `data-grid-table.tsx` 2490 lines) stays deferred; this plan edits only its style conditions and literals (phase 4). Rejected: splitting the grid here — it is a refactor with its own risk and no audit defect depends on it.
- **D12 (2026-11-22): the sidebar and the top bar of the admin layout stay both mounted.** The duplicate popover and menu subscriptions are recorded, not removed. Rejected: gating on `useIsMobile` — the CSS swap keeps tab order clean and the cost is two cheap subscriptions.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| Disabled and focus come from `controlPress` | `rules.md`, "UI library"; `stylex-authoring.md`, "Controls" | Checkbox, Switch, Radio compose it; a story asserts the computed opacity |
| Shared `focusRing` recipe; no top-level conditions | `stylex-authoring.md` | Where the recipe lives, how to adopt it |
| One `tone` vocabulary; one `labels` shape | `rules.md`, "UI library"; `ui-components.md` | `destructive` and the old string props are gone; the mapping table |
| Choosing guidance (Sheet vs Drawer, Select vs Combobox vs Autocomplete vs Command) | `ui-components.md` | A short "Choosing" section |
| Forced colors, reduced motion, coarse-pointer focus | `rules.md`, "UI library"; `stylex-authoring.md` | The rule per concern |
| Chart colors contract | `ui-components.md` §3, `chart.component.tsx` | One true statement, checked in a browser |
| `useMessages()` and the lint ban, no remount | `architecture.md` "Webapp i18n"; `rules.md` "Webapp i18n"; `AGENTS.md` working rules | The reversed decision with its date; the per-locale object trap |
| ISO schemas and `Intl` helpers | `rules.md`, "Webapp i18n" and "Sample data"; `shape.md` | Where formatting lives |
| Skip link, landmarks, names | `rules.md`, "Webapp" | The a11y contract per layout |
| E2E sweep | `shape.md` (E2E), `rules.md` | The sweep, its dependency, its scope |
| This plan's findings | the plan → archive; issues for what stays out | Dated, with this plan |

## Execution rules

- **Atomic commit per phase** is authorized; each phase's text names its suggested commit message; the owner's per-phase go-ahead authorizes that phase's commit and nothing else. Commits during the plan's session are allowed on the owner's standing grant of 2026-11-22.
- **Execution waits for the owner's explicit "continue with phase N".** After the last phase the agent stops and recommends the closing commit message with its paths; it does not commit the closing state on its own.
- **No backward compatibility and no legacy code** (owner, 2026-11-22): renamed props, removed variants, and replaced schema shapes are deleted with every caller, story, and doc line, not kept beside the new ones.
- **Backend: none.** No migration, no ALTER, no database reset is planned; if a phase turns out to need one, it stops and asks. The owner's grants for this session (edit migration files in place, reset the development database) stay unused.
- **Design-system tokens are untouchable** (D1, D2): no edit to token names or values; no addition to the token files.
- **Ask when unsure.** A scope, design, or architecture doubt that appears during a phase stops that phase with a numbered option list (one marked recommended, plus a free-input option); the agent does not pick silently.
- **Dependencies:** only `axe-core` (D10). Anything else needs a fresh approval.
- **Per-phase validation runs before each phase's commit.**
- **E2E only when relevant:** phases 8, 9, 10, 11, 13 and 16 run it; the rest record it n/a with the reason.

## Phases

1. **Disabled Checkbox, Switch, and Radio compose controlPress** — the three roots compose `controlPress.root`, their `':disabled'`-only keys go, and the `Disabled` stories assert the computed `opacity` and `cursor`. Validation: the `Disabled` stories fail on the old styles (confirm by running them before the change) and pass after; Chromium probe of the three story iframes shows `opacity: 0.5`, `cursor: not-allowed`; `pnpm --filter uilibs test` green. _Commit: `fix(uilibs): style disabled checkbox, switch, and radio through controlPress`._
2. **Mobile overflow and keyboard reach in uilibs** — OTP slots shrink to fit (`flex`, `minWidth: 0`, the `md` width as a cap); `Table`'s wrapper gets `tabIndex={0}`, `role='region'`, an overridable `aria-label` (a `labels.region` default), and a focus ring; the Resizable handle gets a 24px hit area and a visible resting contrast through the existing `borderControl`; the Combobox chip remove button gets an `::after` hit area; `ThemeSwitcher` renders a `Button variant='ghost'` with an icon size. Axe 2.29 contrast on `/two-factor` mobile dark is re-run after the OTP fix; if it persists, the element is traced and fixed here. Validation: Chromium at 320 and 390px, `scrollWidth - clientWidth` is 0 on `/two-factor` and `/device?token=lumos`; axe on `/dashboard` at 390px has no `scrollable-region-focusable`; axe on `/two-factor` mobile dark has no `color-contrast`; a Table story test tabs onto the region; `pnpm --filter uilibs test` green. _Commit: `fix(uilibs): fit the OTP field on small screens and make scrollable tables and handles keyboard-reachable`._
3. **Forced colors, coarse-pointer focus, and reduced motion in uilibs** — delete `reset.css:131-135`; add `forced-colors: active` rules nested in the property values for Slider thumb, Resizable handle, Switch, Progress, Meter, and Tabs (focus as `Highlight` outline, fills as a `CanvasText` border); add `prefers-reduced-motion` nested in the animation and transition values of Spinner (slowed, not stopped), Skeleton, LoaderText, Sortable, Meter, Progress, and the Resizable indicator. Validation: Chromium with `forcedColors: 'active'` renders those parts with a visible edge (screenshots inspected); with `reducedMotion: 'reduce'` the computed `transition-duration` and `animation-duration` of those parts are `0s` or the slowed value; `pnpm --filter uilibs test` green. _Commit: `fix(uilibs): honor forced colors, reduced motion, and keyboard focus on touch devices`._
4. **StyleX rule compliance in uilibs** — nest every top-level pseudo-class and `@media` in the files listed in Current state; add `focusRing` to `utils.stylex.ts` and adopt it in the 17 files; replace the four `srOnly` copies with `visuallyHidden`; replace raw `rgb` shadows and raw durations and z-indexes with existing tokens, or with a named constant local to the file where no token has the value (no token is added); `Chart` stops merging `className` and computes `stylex.props` once. Validation: `rg -n "^\s+'(:|@media)" packages/uilibs/src --glob '*.stylex.ts'` finds no top-level key; `rg -c 'solid \$\{colors.foregroundPrimary\}' packages/uilibs/src` finds only `utils.stylex.ts`; `pnpm --filter uilibs test` green (the a11y gate included); a Chromium screenshot pass over Kanban, FileUpload, DescriptionList, DataGrid, Calendar, LoaderText stories shows no visual change. _Commit: `refactor(uilibs): nest style conditions and share the focus ring and screen-reader-only recipes`._
5. **One tone vocabulary and one labels shape in uilibs** — Button and DropdownMenu item take `tone='critical'`, `destructive` is deleted with its callers (`webapp/app/components/notifications.tsx`, the stories, `button-group`, `table`, `data-grid`); Pagination, Breadcrumb, InputPassword, Spinner, Command, and any other component the `rg` sweep finds take a single `labels` object with English defaults; the webapp passes translations through it. Validation: `rg -n "destructive" packages` and `rg -n "showAriaLabel|hideAriaLabel" packages` find nothing; each changed component has a story that overrides `labels`; `pnpm --filter uilibs test` and `pnpm typecheck` green. _Commit: `refactor(uilibs)!: use tone critical and a single labels prop everywhere`._
6. **Kanban and Sortable announcements through labels** — `labels.announcements` and `labels.screenReaderInstructions` (defaults in English, naming items by `getItemValue` or the item's text) are passed to `DndContext`'s `accessibility`; the webapp's Kanban or Sortable callers, if any, pass translations. Validation: a story test drives a keyboard pick-up and asserts the live region text names the item, not its id; `pnpm --filter uilibs test` green. _Commit: `feat(uilibs): announce Kanban and Sortable moves by item name`._
7. **uilibs housekeeping** — check in Chromium whether CSS variables resolve in chart SVG attributes, then make `chart.component.tsx`, `ui-components.md` §3, and `chart.samples.tsx` say one true thing and drop the stale "brand blue" comments; add the chart-colors guidance of D1 (series under 3:1 need a label or pattern); `"sideEffects": ["*.css"]` in `uilibs/package.json`; move `@tanstack/react-hotkeys` and `date-fns` to `devDependencies`; confirm or fix the `ThemeProvider` first-render read (the app is client-rendered, so a mismatch is not expected: the probe decides); add `*.log` to the repository `.gitignore` and delete `packages/uilibs/debug-storybook.log`. Validation: the chart probe's result is quoted in the commit body; `pnpm --filter uilibs build`-equivalent (`storybook:build`) and `pnpm --filter webapp build` green; `pnpm install --frozen-lockfile` clean after the dependency move. _Commit: `chore(uilibs): fix the chart color contract, mark side effects, and drop story-only dependencies`._
8. **Webapp i18n runtime without remount** — add `libraries/messages.ts` (`useMessages()`, one cached wrapper object per locale); migrate the 63 importers; make module-level maps (`hotkeys.ts`, `-loans-table.tsx`, `-summary.tsx`, `-commandbar.tsx`, the nav files) functions of the messages object; an oxlint `no-restricted-imports` override bans `#/paraglide/messages` except in `messages.ts` and the Valibot schemas (which read at validation time); forms with errors revalidate on a locale change; delete `key={locale}` in `__root.tsx`. Validation: `pnpm lint` fails on a planted direct import (undone) and passes without it; an E2E test types in a login field, switches the language, and asserts the typed value, the focus, and the translated text all survive, and another asserts a memoized component (the sidebar) changes language; `pnpm --filter webapp typecheck` and `pnpm --filter e2e test --project Chromium` green. _Commit: `refactor(webapp): re-render messages in place on a language change instead of remounting`._
9. **Webapp i18n content** — one message per sentence with placeholders and a rich-text slot for links (verify-email, reset-password, signup), real descriptions for the two settings pages and `/admin/notifications`, `form_captcha_badge` removed from the UI, sentence-case titles, and the borrowed English terms in `id.json` translated; schemas carry ISO timestamps and numbers (D5) and `libraries/format.ts` formats them; fixtures updated to ISO; both catalogs stay sorted and in step. Validation: the key-order command in `rules.md` prints `True` for both catalogs; both catalogs have the same key set; `rg -n "'Nov |min ago|2,418" packages/webapp/app --glob '!locales/**'` finds nothing; Chromium with the stored locale `id` shows dates and numbers in Indonesian format on `/dashboard` and `/notifications` (screenshots inspected); `pnpm --filter webapp typecheck` and the E2E Chromium suite green. _Commit: `feat(webapp): whole-sentence messages, real copy, and Intl formatting for dates and numbers`._
10. **Visible labels on the auth and settings forms** — `form-fields.tsx` renders `Label` above each field, `srOnly` and the raw `<label>` elements go, placeholders become examples or are removed; `autoComplete='username'` on the login email. Validation: axe on every `(auth)` route reports no label issue; 390px screenshots of `/login`, `/signup`, `/two-factor` inspected for layout; the existing auth E2E specs are updated to the visible labels and pass on Chromium and Mobile Safari. _Commit: `feat(webapp): show a label above every form field`._
11. **Webapp landmarks, names, and focus** — a skip link in the `(app)` and `admin` layouts targeting `main`; the 404 page renders an `h1`; the account menu button, the admin search button, and any other button axe lists take an accessible name that contains the visible text; the `/admin/settings/*` `Select` sits in a labelled landmark; the nav sheet dialog is named by a "navigation" message; one stable collapse/expand sidebar button whose label does not change while `aria-expanded` does; inline auth links keep an underline; the command bar's group `section`/`h3` pair loses the duplicate landmark; one `TooltipProvider` in `__root.tsx`; the controls of D4 call a handler that logs through `console.info`. Validation: the axe sweep of phase 13 reports no violation on the audited routes (run ad hoc here with the audit script); Playwright keyboard test: Tab from the page top reaches the skip link first, Enter lands on `main`; collapsing the sidebar by keyboard keeps focus on the button; clicking each D4 control prints its message in the page console; `pnpm lint` and `pnpm --filter webapp typecheck` green. _Commit: `fix(webapp): name landmarks and controls, add a skip link, and keep focus stable`._
12. **Webapp reuse of tokens and components, store equality, dead code** — layout and page widths use the `container` tokens or one shared inset constant; page headings use `Text`; the breakpoints in `styles/constants.stylex.ts` reuse the library's values or document the difference; the `prefers-reduced-motion` string becomes one constant (D2) and the auth back-link arrow and user-menu transitions get it; `logo.tsx` takes its fills from a StyleX style instead of hex in JS; `notifications.store.ts` returns the same array when nothing changed; dead code goes (`pageDescription` in `main.tsx:25`, the unreachable branch at `-sidebar.tsx:42-50`, the always-true `'to' in item`, commented-out nav items, duplicate imports); no token is touched. Validation: `pnpm lint` (including `import/no-cycle`) and typecheck green; `rg -n "80rem|36rem|26rem|22rem" packages/webapp/app/styles` finds only the shared constant; a store test or probe shows `markAllRead` on an all-read list keeps the reference; screenshots of `/`, `/login`, `/dashboard`, `/admin` at 390 and 1440px, light and dark, inspected against the audit's. _Commit: `refactor(webapp): share layout constants, reuse Text and tokens, and keep unchanged store state stable`._
13. **E2E accessibility and overflow sweep** — add `axe-core` to the pnpm `catalog:` and to `packages/e2e` `devDependencies` (D10); a helper in `packages/e2e/utils/` injects it and returns violations; one spec (`screens/a11y/a11y.spec.ts`) visits the routes in `utils/routes.ts` plus the settings, notifications, and admin routes at 390px and 1440px in light and dark, fails on any violation and on `scrollWidth > clientWidth`, and runs on Chromium only (`test.skip` on the other projects with the reason). Validation: the spec fails against the tree before phases 1, 2, 11 (confirm on a checkout of the audit commit `3e923f2` or by reverting the OTP style locally, then restoring) and passes after; `pnpm --filter e2e typecheck` and `pnpm --filter e2e test` (all projects) green. _Commit: `test(e2e): sweep every route for axe violations and horizontal overflow`._
14. **Docs sync (human-facing)** — re-search `docs/` for UI subject matter (`rg -n -i "sidebar|admin|dashboard|locale|language|theme|accessib" docs/`); update any page the diff touches, otherwise record n/a with the search. `clarity` is read before any prose is written. Validation: `rumdl check docs`; every claim diff-checked against the landed code. _Commit: `docs: …` or none when n/a._
15. **LLM docs sync (.agents/docs)** — `rules.md` ("UI library", "Webapp i18n", "Webapp state", the a11y contract, the E2E sweep), `architecture.md` (the reversed i18n decision with its date and the rejected alternatives that now hold), `shape.md` (layout lines for `libraries/messages.ts`, `libraries/format.ts`, the sweep spec, the skip link), `ui-components.md` (tone and labels tables, Table region, the "Choosing" section, chart colors), `stylex-authoring.md` (`focusRing`, nested conditions, forced colors), `index.md` rows. The working rule in `AGENTS.md` ("Webapp words are Paraglide messages (`m.<key>()`)") changes to `useMessages()`; because `AGENTS.md` is the owner's file, the agent proposes the exact line and waits for approval before editing it. Validation: `rumdl check .agents/docs`; each doc claim re-verified against the tree with a command; no reference to `destructive`, the remount, or `srOnly` remains (`rg`). _Commit: `docs(agents): record the UI audit remediation in rules, architecture, shape, and the component index`._
16. **Final validation** — the matrix below, run over the tree as it stands. Validation: the matrix is green end to end; a final Chromium render pass repeats the audit's 96-page capture and shows zero axe violations and no overflow. _Commit: none if green._
17. **Ledger close and handover** — plan statuses set, the plan archived, `index.md` rows moved, issues filed for what stays out (see below), `handover-00007-ui-audit-remediation.md` written, and the oldest handover archived (the live directory keeps five). Validation: the index agrees with the tree (`ls .agents/docs/*`; counts match the status lines). The closing commit is the owner's; the agent recommends its message and paths.

## Test matrix

| What | How | Green |
| --- | --- | --- |
| uilibs component and a11y gate | `pnpm --filter uilibs test` (Storybook stories as Vitest browser tests, axe in `error` mode) | All files green; new stories for disabled state, Table region, `labels` overrides, announcements |
| Types | `pnpm -r typecheck` | 5 packages green |
| Lint | `pnpm lint` | 0 errors, including the new `no-restricted-imports` ban and `import/no-cycle` |
| Format | `pnpm format:check`, `rumdl check .agents/docs docs` | Clean |
| Builds | `pnpm --filter webapp build`, `pnpm --filter uilibs storybook:build` | Succeed; entry chunk size within 10% of 304 KB |
| E2E functional | `pnpm --filter e2e test` (Chromium, Firefox, Safari, Mobile Safari) | All pass; the language-change and keyboard tests added in phases 8 and 11 included |
| E2E sweep | `screens/a11y/a11y.spec.ts` (Chromium): every route × 390/1440px × light/dark | 0 axe violations, 0 overflow |
| Visual | The audit capture script over 24 routes × 4 combinations; screenshots inspected with `view_media` | Matches the audit's pages; no clipping |
| Forced colors / reduced motion | Chromium with `forcedColors: 'active'` and `reducedMotion: 'reduce'` over Slider, Switch, Progress, Resizable, Spinner | Visible edge; motion off or slowed |
| i18n | Key-order command in `rules.md`; same key set in `en` and `id`; the language-change E2E | Sorted, equal, state survives |
| Dependency | `pnpm install --frozen-lockfile`; `git diff -- pnpm-lock.yaml` names only `axe-core` and the two moved dev dependencies | Only the expected change |
| Rust gates | `just verify` | Green and untouched (no Rust file changes) |
| API specs | n/a — no endpoint changed | — |
| Backend, migrations, database reset | n/a — no backend change | — |

## Explicitly out of scope

- **Design-system tokens** — values, names, and additions, including the dead tokens (D1); the palette fix for chart series contrast and `borderControl` on `backgroundNeutral` waits for the owner.
- **Splitting the data grid** (D11) — F-26 stays deferred; a trigger is a defect that depends on the file's size.
- **Removing the double mount of the admin sidebar and top bar** (D12).
- **Real screens for the scaffold routes** (admin users, roles, settings pages, and so on) and real behavior behind the D4 controls — they need the backend.
- **Screen-reader and physical-device testing** — not available to the agent; recorded as a gap in the handover.
- **Profiling the data grid, charts, and Kanban** — the audit found no measured problem.
