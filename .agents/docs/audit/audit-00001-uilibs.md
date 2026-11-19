---
title: "Audit: packages/uilibs (every UI component)"
status: in_review
created_at: 2026-11-20T02:54:53+07:00
updated_at: 2026-11-20T02:54:53+07:00
completed_at: null
scope:
    type: feature
    feature: "uilibs"
    paths: ["packages/uilibs/src", "packages/uilibs/.storybook"]
    exclusions: ["packages/uilibs/src/charts (visual only, not audited)", "extra/data-grid internals (axe + grep only, see Coverage)", "packages/webapp (consumer, read only)"]
stack:
    languages: [TypeScript, TSX]
    frameworks: [React 19.3, Base UI 1.9, StyleX 0.19, Storybook 10.6.7, vitest browser (Playwright)]
    datastores: []
repo:
    branch: "development"
    commit: "e39decb"
    working_tree_clean: true
environment:
    executed: [typecheck, lint, format-check, storybook-vitest-suite, axe-core-sweep-light, axe-core-sweep-dark, playwright-measurement, tsc-ref-probe, token-contrast-calculation]
    not_run: [dependency-scan, secret-scan, race-detector, screen-reader-manual-pass, visual-regression]
baseline:
    build: not_run
    tests: fail
    lint: pass
    dependency_scan: not_run
    secret_scan: not_run
    race_detector: not_available
findings:
    total: 26
    by_severity: { critical: 0, high: 3, medium: 15, low: 6, info: 2 }
    by_status: { open: 26, fixed: 0, deferred: 0, wont_fix: 0, false_positive: 0 }
    verified: 13
    unverified: 13
cleanup_candidates: 9
optimization_opportunities: 2
open_questions: 2
tests_added: 0
standards: [WCAG 2.2 AA (1.4.3, 1.4.11, 2.5.3, 2.5.8, 4.1.2), WAI-ARIA 1.2 / APG]
generated_by: deep-audit
---

# Audit: packages/uilibs (every UI component)

## Executive summary

- The library is structurally sound (strict StyleX discipline, one folder per component, 90 story files, typecheck and lint green) but its **composition contract is missing**: there is no shared size scale or shared control recipe, so each form control re-declares the same box and the proportions drift (F-01, F-08, F-09, F-18). That is the Input-versus-Button mismatch the owner reported.
- Accessibility is the second theme: 81 of 385 stories carry a real axe violation in light mode and 53 in dark (after removing the Storybook performance overlay and Base UI focus guards), the a11y gate is set to `todo` so CI never fails on them, and three token-level contrast problems sit under every component (F-04, F-05, F-06).
- Counts: 0 critical, 3 high, 15 medium, 6 low, 2 info (26 total). Baseline: typecheck, lint and format are green; the Storybook suite is 384/385 (one flaky layout assertion, F-24).
- Fix first: **F-01** (one control size scale plus a shared control recipe), **F-02/F-03** (`ref` support and Textarea as a Field control), **F-04/F-05/F-06** (control-border, hover and faded-text contrast tokens).

## Scope and flow inventory

Whole library, read from the owner's request ("size input dengan button kurang proporsional, cari issue lain"). Flows audited:

1. Form controls composed in a row or a Field: Button, Input, Select, Combobox, Autocomplete, NumberField, InputGroup (+ Password, Phone), Textarea, OTP, Checkbox, Radio, Switch, Slider, FileUpload, Field, Form.
2. Actions and navigation: Button, ButtonGroup, Toggle, ToggleGroup, Tabs, Menubar, NavigationMenu, DropdownMenu, ContextMenu, Pagination, Breadcrumb, AlertDialog.
3. Overlays and feedback: Dialog, Sheet, Drawer, Popover, Tooltip, PreviewCard, Toast, Alert, Badge, Spinner, Progress, Meter.
4. Content and composite widgets: Avatar, Item, Card, Table, DescriptionList, Empty, Calendar, Command, Kanban, Sortable, DataGrid.
5. Cross-cutting: tokens (`src/styles`), theme, hooks, Storybook config, the consumer (`packages/webapp`).

Trust boundaries: none in the security sense (presentational library); the relevant boundary is the public prop contract consumers type against.

## Baseline

| Gate | Result |
| --- | --- |
| `just typecheck` | pass (exit 0) |
| `pnpm lint` (oxlint) | pass (exit 0) |
| `pnpm format:check` | pass (442 files) |
| `pnpm --filter uilibs test` | **384/385**: `extra/aspect-ratio` `Square` failed once in the parallel run (`expected 160 to be less than 1`, `aspect-ratio.stories.tsx:40`), passed 2/2 in isolation: flaky, F-24 |
| axe-core 4.14.1 over all 385 stories | light: 171 stories flagged, 81 after removing noise; dark: 150 flagged, 53 after removing noise |

Noise removed from the axe totals: the Storybook performance-panel overlay (an inline-styled `span` with `border-radius: 999px` and the fixed `aria-hidden` badge, present in ~100 stories) and the Base UI focus-guard spans (`aria-hidden-focus`, a known pattern). Neither is library code.

Not run: dependency and secret scans (no new dependency surface, nothing to scan), screen-reader pass (no AT in this environment), visual regression (no tooling in the repo).

## Findings

| ID | Severity | Category | Location | Title | Evidence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | high | composition | `base/button/button.stylex.ts:83-86`, `base/input/input.stylex.ts:22` | Button has four sizes, form controls have one | verified | open |
| F-02 | high | api / a11y | ~100 `React.ComponentPropsWithoutRef` sites, `extra/textarea/textarea.component.tsx:30` | Wrappers reject `ref`; Textarea drops it at runtime | verified | open |
| F-03 | high | a11y / functionality | `extra/textarea/textarea.component.tsx` | Textarea is not a Field control | verified | open |
| F-04 | medium | a11y (1.4.11) | `styles/colors.stylex.ts:54-55`, 42 stylex files | Control borders and the Switch track are 1.08:1 (light) / 2.47:1 (dark) | verified | open |
| F-05 | medium | a11y (1.4.3) | `base/button/button.stylex.ts:39,76` | Primary and destructive hover drop white text to 4.29 / 4.04 | verified | open |
| F-06 | medium | a11y (1.4.3) | `styles/colors.stylex.ts` (`foregroundNeutralFaded`) | Faded text on `backgroundNeutral` is 4.24:1 | verified | open |
| F-07 | medium | a11y (4.1.2) | `extra/pagination/pagination.component.tsx:46` | Pagination links render with `role="button"` | verified | open |
| F-08 | medium | composition / a11y | `base/{combobox,autocomplete,number-field,otp-field}`, `extra/input-phone` | Invalid and focus states are not uniform across controls | unverified | open |
| F-09 | medium | composition | `base/combobox/combobox.stylex.ts:11,120`, `base/select`, `base/number-field` | Default widths differ per control | verified | open |
| F-10 | medium | a11y (4.1.2, 2.5.8) | `base/slider/slider.component.tsx:47,64` | Slider thumbs cannot be labelled; 12px thumb; default is two thumbs | verified (axe) | open |
| F-11 | medium | a11y (4.1.2) | `base/otp-field`, `base/select`, `base/combobox` | Controls without an accessible name by default | verified (axe) | open |
| F-12 | medium | functionality | `base/alert-dialog/alert-dialog.component.tsx:104` | `AlertDialogAction` does not close the dialog | unverified | open |
| F-13 | medium | functionality | `extra/button-group/button-group.component.tsx:33-50` | ButtonGroup drops non-elements, mishandles Fragments, joins filled buttons without a divider | unverified | open |
| F-14 | medium | functionality / a11y | `extra/alert`, `extra/badge`, `base/toast` | Semantic colors are not exposed; Alert is always `role="alert"` | unverified | open |
| F-15 | medium | a11y (2.5.3) | `extra/calendar/calendar.component.tsx:91` | Day buttons fail label-in-name; `week` object leaks onto `<td>` | verified (axe) | open |
| F-16 | medium | a11y | `extra/table`, `extra/data-grid`, `extra/item`, `extra/kanban`, `extra/sortable` | Empty headers, list without items, unnamed progressbar and handles, nested interactive | verified (axe) | open |
| F-17 | medium | a11y / i18n | 20 sites (see F-17) | Hard-coded English labels with no override | unverified | open |
| F-18 | medium | composition | 25 `opacity: .5` sites, `outlineOffset` ×29 | Three focus-ring recipes and a disabled recipe that ignores its tokens | unverified | open |
| F-19 | low | functionality | `extra/file-upload/file-upload.component.tsx:75,112` | Drop ignores `accept` and `multiple`; not a Field control; overrides StyleX inline style | unverified | open |
| F-20 | low | functionality | `base/button`, `extra/spinner` | No `loading` state; Spinner announces inside a Button | unverified | open |
| F-21 | low | consistency | 35 inline `<svg>` in 17 files | Inline icons beside `@keyline-icons`; close button copied three times | unverified | open |
| F-22 | low | duplication | `base/{dropdown-menu,context-menu,menubar}` | Three parallel menu implementations | unverified | open |
| F-23 | low | hygiene | see F-23 | Stale paths, story controls, `@ts-ignore`, `console.warn`, label casing | unverified | open |
| F-24 | low | test quality | `.storybook/preview.tsx`, `aspect-ratio.stories.tsx:40` | a11y gate is `todo`, one flaky assertion, state stories missing | verified | open |
| F-25 | info | consistency | 8 stylex files | Raw `@media (min-width: 660px)` beside the `breakpoints` tokens | unverified | open |
| F-26 | info | coverage | `extra/data-grid/*` (9.4k lines) | Data grid audited by axe and grep only | n/a | open |

### F-01 One control height scale is missing

- **Category**: composition
- **Location**: `base/button/button.stylex.ts:83-86` (xs 28, sm 32, md 36, lg 40; `lg` also sets `fontSize.body1`), `base/input/input.stylex.ts:22`, `base/select/select.stylex.ts:36`, `base/combobox/combobox.stylex.ts:22,82,110`, `base/autocomplete/autocomplete.stylex.ts:18`, `base/number-field/number-field.stylex.ts:20`, `extra/input-phone/input-phone.stylex.ts:22`, `extra/input-group/input-group.stylex.ts:62`, `base/otp-field/otp-field.stylex.ts:37` (32).
- **Problem**: Only Button, Toggle (28/32/36), Switch and Avatar take a `size`. Every text-entry control hard-codes `unit.x9` (36px) and the same 14px type. OTP slots are 32px. Tabs are 28px (default) or 36px (line). Menubar triggers measure 25px inside a 32px bar.
- **Scenario**: `packages/webapp/app/components/social-buttons.tsx:27` renders `<Button size='lg'>` (40px, 16px type) directly under the 36px inputs of the auth forms. Measured in Storybook (`/tmp/audit/measure.mjs`): Button 28/32/36/40, Input 36, Select 36, NumberField 36, Combobox 36, OTP cell 32, InputGroup 36 with a 24px inner button, Tabs 28, Toggle 28/32/36, Menubar trigger 25.
- **Impact**: Any row that mixes an input with a non-`md` button, a segmented control or an OTP slot is out of proportion, and there is no prop to fix it. This is the reported symptom.
- **Evidence**: verified, measurement table above.
- **Fix**: one `ControlSize` scale (`sm 32`, `md 36`, `lg 40`; `xs 28` for dense toolbars) in a shared `styles/control.stylex.ts` with height, inline padding, type size and radius per size; Button, every text control, Toggle, Tabs and Menubar read from it and accept `size`. Trade-off: the `lg` text controls grow to 16px type, so the auth forms pair `lg` inputs with `lg` buttons.
- **Confidence**: high
- **Status**: open

### F-02 Wrappers reject `ref`

- **Category**: api / a11y (focus management)
- **Location**: `React.ComponentPropsWithoutRef` is used at ~100 sites (`grep -c`), `ComponentPropsWithRef` once (`ComboboxChips`); `extra/textarea/textarea.component.tsx:30` (`ref={autoResize ? resize : undefined}` after `{...props}`).
- **Problem**: React 19 passes `ref` as a prop, but `ComponentPropsWithoutRef` removes it from the types, so consumers cannot focus a control, measure it or hand it to a form library. Textarea also overwrites a `ref` that was spread in `props`.
- **Scenario**: `<Input ref={r} />`, `<Button ref={b} />`, `<Textarea ref={t} />` each fail `tsrs`: `Property 'ref' does not exist on type 'IntrinsicAttributes & InputProps'` (probe kept at `/tmp/audit/probe-ref.tsx`, removed from the tree). At runtime a spread `ref` on Textarea is replaced by `undefined` or the internal callback.
- **Impact**: no programmatic focus (error summary focus, dialog initial focus), no `ref` for TanStack Form field focus on invalid submit.
- **Evidence**: verified (typecheck probe).
- **Fix**: type wrappers with `React.ComponentProps<...>` (keeps `ref`), merge the internal and external refs in Textarea. Mechanical codemod, no compatibility shim.
- **Confidence**: high
- **Status**: open

### F-03 Textarea is not a Field control

- **Category**: a11y / functionality
- **Location**: `extra/textarea/textarea.component.tsx` (a plain `<textarea>`); stories `extra/textarea/textarea.stories.tsx:79,108` work around it with a manual `htmlFor` and `id`.
- **Problem**: Base UI's Field links label, description, error and validity only to `Field.Control`. A plain `<textarea>` registers nothing.
- **Scenario**: `<Field invalid><FieldLabel/><Textarea/><FieldError/></Field>` (the `Invalid` story) renders the textarea with `aria-invalid=null`, `data-invalid=false`, `aria-describedby=false`, border `lab(0 0 0 / 0.08)`, the same as a valid one. Input in the same position gets `aria-invalid=true`, `data-invalid=true` and the critical border.
- **Impact**: invalid and described-by semantics are silently absent for multi-line input; the `[data-invalid]` style in `textarea.stylex.ts` can never fire.
- **Evidence**: verified (`/tmp/audit/invalid.mjs`).
- **Fix**: render through `Field.Control` (`render={<textarea />}`) so the Field context applies; keep `autoResize`.
- **Confidence**: high
- **Status**: open

### F-04 Control borders and the Switch track fail non-text contrast

- **Category**: a11y (WCAG 1.4.11, 3:1)
- **Location**: `styles/colors.stylex.ts:54-55` (`borderNeutral` 0.12 alpha, `borderNeutralFaded` 0.08 alpha); 42 stylex files use `borderNeutralFaded`, including Input, Select, Textarea, Checkbox (`checkbox.stylex.ts:19`), Radio, InputGroup, `switch.stylex.ts:10` (off track).
- **Problem**: computed against `backgroundPage`: `borderNeutralFaded` 1.08:1 and `borderNeutral` 1.13:1 in light; 2.47:1 and 3.03:1 in dark. The boundary of an unchecked checkbox, radio, text field and the off Switch is effectively invisible in light mode.
- **Impact**: users with low vision cannot see where a control is or whether a switch is off.
- **Evidence**: verified (`/tmp/audit/contrast.py`, OKLCH to sRGB).
- **Fix**: a dedicated `borderControl` token at ≥3:1 on `backgroundPage` and `backgroundElevation*` in both themes, used only for control edges (decorative dividers stay faded). Trade-off: inputs look firmer; the owner decides the exact value (see Open questions).
- **Confidence**: high
- **Status**: open

### F-05 Hover lowers button text contrast below AA

- **Category**: a11y (1.4.3)
- **Location**: `base/button/button.stylex.ts:39` and `:76` (`color-mix(in srgb, <bg> 90%, transparent)`).
- **Problem**: mixing the fill with transparent lightens it over the white page. White text on the hover fill: primary 4.29:1, destructive 4.04:1 (rest 5.15 and 4.57). The existing `backgroundPrimaryHighlighted` and `backgroundCriticalHighlighted` tokens (6.47 and 5.86 with the same text) have zero usages; the dark theme `backgroundCriticalHighlighted` is only 3.86 and needs a value change.
- **Evidence**: verified (sRGB-space blend in `contrast.py`).
- **Fix**: hover uses the `*Highlighted` tokens; retune the dark critical token.
- **Confidence**: high
- **Status**: open

### F-06 Faded text on the neutral surface is 4.24:1

- **Category**: a11y (1.4.3)
- **Location**: `styles/colors.stylex.ts` `foregroundNeutralFaded` (`oklch(0.54 0 89.88)`), on `backgroundNeutral` (`oklch(0.94 …)`).
- **Evidence**: verified: axe `color-contrast` (`#6f6f6f` on `#ebebeb`, 4.21) on the avatar group count (`avatar.stylex.ts`), `kbd`, and the inactive tab (`tabs.stylex.ts` list background) in 29 stories; 0 in dark. Also `foregroundPositive` on `backgroundNeutral` 4.35.
- **Fix**: lower the light `foregroundNeutralFaded` lightness until it clears 4.5 on `backgroundNeutral`; check `foregroundPositive`.
- **Confidence**: high
- **Status**: open

### F-07 Pagination links announce as buttons

- **Category**: a11y (4.1.2)
- **Location**: `extra/pagination/pagination.component.tsx:46` (`Button nativeButton={false} render={<a/>}`).
- **Problem**: Base UI Button adds `role="button"` to a non-native render. The probe shows every `nav a` with `role=button`, and the current page `role=button aria-current=page`. The webapp already worked around the same fault with `LinkButton` (`role='link'`, commit `aa48bb5`).
- **Evidence**: verified (`/tmp/audit/roles.mjs`). Also `base-components-button--as-link`.
- **Fix**: lift the `role='link'` handling into the library (a `link` render path or a `LinkButton` in uilibs) and use it in Pagination; delete the webapp copy.
- **Confidence**: high
- **Status**: open

### F-08 Invalid and focus states differ per control

- **Category**: composition / a11y
- **Location**: state matrix over the stylex files: `data-invalid` handled by Input, Select, Textarea, Checkbox, Radio, Switch, InputGroup, InputPhone, Field; **not** by Combobox (input, trigger, chips), Autocomplete, NumberField, OTP. Focus: Input uses `:focus-visible` plus border color, Combobox input the same, Combobox chips and NumberField `:focus-within`, OTP `:focus` with a 3px halo, Select trigger an outline only (no border color change, `select.stylex.ts:36-60`). InputPhone paints `[data-invalid]` only on its own container from the `invalid` prop (`input-phone.component.tsx` `containerComponentProps`), so a Field-driven invalid state does not reach the border (InputGroup solves this with `:has([data-invalid])`).
- **Impact**: the same Field renders a red border for an Input and nothing for a Combobox or NumberField.
- **Evidence**: unverified at runtime (grep and reading); the Select and Input invalid probes confirm those two work.
- **Fix**: the shared control recipe from F-01 carries focus, invalid and disabled once.
- **Confidence**: high
- **Status**: open

### F-09 Default widths differ

- **Category**: composition
- **Location**: Input `width: 100%` (`input.stylex.ts`), Combobox input wrap and chips fixed `container.small` (`combobox.stylex.ts:11,120`), Select `inline-flex` with `minWidth: container.xxsmall`, NumberField `fit-content`, Textarea 100%.
- **Evidence**: verified: in one 320px container Input 320, Select 172, Combobox 288, NumberField 91.
- **Impact**: in a form column the controls do not align; Combobox cannot fill its Field.
- **Fix**: text controls fill their container by default; fixed widths become an explicit prop or a `style` override.
- **Confidence**: high
- **Status**: open

### F-10 Slider thumbs cannot be labelled

- **Category**: a11y (4.1.2, 2.5.8)
- **Location**: `base/slider/slider.component.tsx:64` (`BaseSlider.Thumb` created internally with no props), `:47` (`[min, max]` fallback creates two thumbs when neither `value` nor `defaultValue` is given), `slider.stylex.ts` thumb `unit.x3` (12px).
- **Evidence**: verified (axe `label` on the slider thumb input, the slider stories); two-thumb default and the 12px target are from reading.
- **Impact**: screen readers announce an unnamed slider; a range slider cannot say "minimum" and "maximum"; the 12px thumb is below the 24px target size.
- **Fix**: `getThumbLabel` or per-thumb `aria-label` passthrough, single-thumb default, enlarge the hit area as Checkbox and Switch already do with `::after`.
- **Confidence**: medium (the two-thumb default is unverified at runtime)
- **Status**: open

### F-11 Controls ship without an accessible name

- **Category**: a11y (4.1.2)
- **Location**: OTP slots (`otp-field.component.tsx` `OTPFieldSlot`), Select and Combobox triggers whose only content is the placeholder, InputGroup/InputPhone/InputPassword inputs in stories.
- **Evidence**: verified: axe `label` in 16 stories and `button-name` in 6, light and dark.
- **Fix**: OTP slots get `Character n of N` names; Select and Combobox document and accept a label (`aria-label` forwarded, or `SelectValue` + Field label wiring); stories always label. Added to the a11y gate in F-24.
- **Confidence**: high
- **Status**: open

### F-12 `AlertDialogAction` does not close the dialog

- **Location**: `base/alert-dialog/alert-dialog.component.tsx:104` is a plain `Button`; `AlertDialogCancel` (`:108`) renders as `BaseAlertDialog.Close`. The comment says "wire your own onClick" and requires controlled `open`.
- **Impact**: every confirm dialog needs controlled state for what a Close part would do; easy to ship a confirm that never closes.
- **Fix**: render the action through `BaseAlertDialog.Close` with an `onClick` that can keep the dialog open by `preventDefault`, or document and test the controlled pattern.
- **Evidence**: unverified (reading).
- **Confidence**: medium
- **Status**: open

### F-13 ButtonGroup clones children unsafely

- **Location**: `extra/button-group/button-group.component.tsx:33` (`Children.toArray(...).filter(isValidElement)` drops text nodes; a Fragment child receives `style` it ignores), `:50` (`cloneElement`), `button-group.stylex.ts` (`horizontal-middle` zeroes only `borderLeftWidth`).
- **Impact**: `Button` variants without a border (primary, secondary, destructive) are joined with no divider; Fragments and wrappers (Tooltip, DropdownMenuTrigger render targets) lose their joined radius.
- **Fix**: flatten Fragments, add a divider via ring/inset shadow independent of `borderWidth`, document the child contract, test with primary buttons.
- **Evidence**: unverified (reading).
- **Confidence**: medium
- **Status**: open

### F-14 Semantic colors are not exposed; Alert is always assertive

- **Location**: `extra/alert/alert.component.tsx:17` (`role='alert'`, variants `default | destructive`), `extra/badge` (`primary | secondary | outline | ghost | destructive`), `base/toast` (`success | error`). The token set defines positive and warning roles (`colors.stylex.ts`), already used 6 to 7 times each, but Alert, Badge and Toast cannot use them; Button has no positive variant either.
- **Problem**: `role='alert'` on a static, on-load notice interrupts screen readers (assertive live region); title is an `h5`, which breaks heading order (axe `heading-order` shows the same class in Text).
- **Fix**: `tone` (`neutral | primary | positive | warning | critical`) on Alert, Badge, Toast; Alert gets `role='status'` by default and `role='alert'` by prop; title level configurable.
- **Evidence**: unverified (reading).
- **Confidence**: medium
- **Status**: open

### F-15 Calendar day buttons fail label-in-name

- **Location**: `extra/calendar/calendar.component.tsx` (react-day-picker defaults), `:91` (`CalendarWeekNumber` spreads every prop onto `<td>`).
- **Evidence**: verified: axe `label-content-name-mismatch` on 35 nodes in 11 stories (`aria-label="Sunday, November 1st, 2026"` over visible text `1`); `scope-attr-valid`: `<td week="[object Object]">` in `calendar--week-numbers`.
- **Fix**: `labels.labelDayButton` that begins with the visible number; destructure `week` out of the `td` props.
- **Confidence**: high
- **Status**: open

### F-16 Structural semantics in composite components

- **Evidence**: verified, axe on stories: `empty-table-header` (data grid expander and actions columns, `table--actions`), `aria-required-children` (`ItemGroup role='list'` at `item.component.tsx:16` holds non-`listitem` divs), `aria-progressbar-name` (Progress `controlled` and the Kanban column progress, 3 stories), `aria-command-name` (Kanban column handle, `role="button"` without a name, 6 stories), `nested-interactive` (Sortable items, 2 stories).
- **Fix**: visually hidden header text for icon-only columns, `role="listitem"` on Item (or drop the role), name Progress and handles from the column title, make the Sortable item non-interactive or the handle the only interactive child.
- **Confidence**: high
- **Status**: open

### F-17 Hard-coded English labels

- **Location** (20 sites): `combobox.component.tsx:125,146,176` (`Clear value`, `Open list`, `Remove`), `input-phone.component.tsx:105` (`Select country`, `Search country…`, `No country found.`), `number-field.component.tsx:63-71` (`Increase`, `Decrease`), `dialog.component.tsx:62`, `sheet.component.tsx:39`, `toast.component.tsx:92` (`Close`), `input-password.component.tsx` (props exist, good), `pagination.component.tsx:60,77` (`Go to previous page`, lowercase `pagination`), `spinner.component.tsx:16` (`Loading`), `command.component.tsx` dialog title/description.
- **Impact**: the data grid already has `data-grid-i18n.tsx`; every other component cannot be localized, and chip removal reads `Remove` without naming the chip.
- **Fix**: a `labels` prop with English defaults per component (no global locale context: YAGNI for a starter); chip remove names the item.
- **Evidence**: unverified (grep).
- **Confidence**: high
- **Status**: open

### F-18 Focus and disabled recipes diverge

- **Location**: `outlineOffset`: `stroke.ring2` ×12 (outside ring: Button, Checkbox, Switch, Radio), `calc(-1 * ring1)` ×10 (inset: inputs), `0` ×3, `-ring1` ×2; 3px 50% halo ×3 (OTP, resizable, slider). Disabled: `opacity: 0.5` in 25 places while `backgroundDisabled`, `backgroundDisabledFaded`, `borderDisabled` have 0, 0 and 1 usages and `foregroundDisabled` 4.
- **Impact**: three focus languages in one form; a disabled control looks different per component.
- **Fix**: one focus recipe and one disabled recipe in the shared control file; delete the unused disabled tokens or use them.
- **Evidence**: unverified (grep counts).
- **Confidence**: medium
- **Status**: open

### F-19 FileUpload

- `file-upload.component.tsx:75`: `handleDrop` passes `dataTransfer.files` unfiltered, so a drop bypasses `accept` and `multiple` that `inputAttributes` enforce on the picker. Not a Field control (no `id` or label wiring, no invalid). `:112`: a literal `style` key after `...stylex.props(...)` overwrites any inline style StyleX produced and is the only raw `style` object in the library (contradicts the authoring rule).
- Evidence: unverified. Confidence: medium. Status: open.

### F-20 No loading state

- `Button` has no `loading` prop; the story composes `<Button disabled><Spinner/>…</Button>`. `Spinner` carries `role="status"` and `aria-label="Loading"` (`spinner.component.tsx:15`), so inside a labelled button it adds a second live announcement. Add `loading` (sets `aria-busy`, keeps the width, hides the Spinner from AT).
- Evidence: unverified. Confidence: medium. Status: open.

### F-21 Inline icons and a copied close button

- 35 `<svg>` in 17 files (Combobox 4, Select 3, DataGrid 3, Pagination 2, Breadcrumb 2, menus 2 each) with mixed `strokeWidth` (1.5, 2); `@keyline-icons/react` is used in 10 files. The close button (`<BaseX.Close aria-label='Close'>` + the same `m3 3 10 10M13 3 3 13` path) is copied in Dialog, Sheet and Toast.
- Evidence: unverified. Confidence: high. Status: open.

### F-22 Three menu implementations

- `dropdown-menu.component.tsx` (247 lines) and `context-menu.component.tsx` (265) implement the same item, checkbox, radio, sub-trigger and indicator set against `Menu` and `ContextMenu`; each re-declares `IndicatorCheck`; `menubar` re-exports from dropdown. Shared parts belong in one internal module.
- Evidence: unverified. Confidence: medium. Status: open.

### F-23 Hygiene

- `base/button/button.stories.tsx:21` lists sizes `icon`, `iconXs`, `iconSm`, `iconLg` that do not exist (`icon-xs`…); `InputGroupButtonSize` uses `iconXs` (camelCase) against Button's `icon-xs`.
- `hooks/use-media-query.ts:6` and `extra/text/text.stylex.ts:6` cite `#/styles/core/tokens.stylex` (the file is `styles/tokens.stylex.ts`); `BREAKPOINTS.small` equals `medium` (660).
- `extra/kanban/kanban.component.tsx:591` `@ts-ignore`; `:247` and `sortable.component.tsx:260` `console.warn` in library code; `extra/text/text.component.tsx:102` TODO; `theme/theme.tsx:116` `@ts-expect-error`.
- `pagination.component.tsx:15` `role='navigation'` on `<nav>` and `aria-label='pagination'`, `breadcrumb.component.tsx:13` `aria-label='breadcrumb'` (casing); both ellipses hide an sr-only caption inside an `aria-hidden` parent (`pagination.component.tsx:89`).
- `PaginationItem` takes `className`/`style` raw (`pagination.component.tsx`), unlike every other part.
- Evidence: unverified. Status: open.

### F-24 Test and gate quality

- `.storybook/preview.tsx` sets `a11y.test: 'todo'`: the 81/53 real axe violations never fail CI. One assertion is flaky under parallel load (`aspect-ratio.stories.tsx:40`, expects a layout box immediately after render). No invalid-state story exists for Combobox, Autocomplete, NumberField, OTP; only 1 story has a `play` for Select; `table` has none; no story asserts size alignment.
- Evidence: verified (suite run, axe sweep, coverage script). Confidence: high. Status: open.

### F-25 Raw media queries

- `@media (min-width: 660px)` literals in alert-dialog, pagination, description-list, text, kanban, calendar. `defineConsts` media keys must be declared in the same file (authoring rule), which is why `text.stylex.ts` mirrors the table; acceptable, but the mirrors need a single comment convention. Info.

### F-26 Data grid coverage

- About 9,400 lines (`data-grid*.tsx`) were audited through the axe sweep (`empty-table-header`) and the grep passes only. A dedicated review is out of this audit's depth; see the plan's out-of-scope list.

## Optimization opportunities

| Item | Before | Proposal | Benefit | Risk | Effort |
| --- | --- | --- | --- | --- | --- |
| Shared control recipe | 10 copies of border, radius, focus, invalid, disabled across 10 stylex files | one `control.stylex.ts`, components compose it | smaller CSS, one place to change, removes F-08/F-18 drift | StyleX conflict ordering when composing, covered by the size-alignment story | M |
| Shared close and indicator parts | Close button ×3, Check indicator ×4 | one internal part | less duplicated markup and CSS | none | S |

No runtime performance defects were found; the library is presentational and tree-shakes per component folder. No before/after numbers were claimed.

## Cleanup candidates

| Item | Type | Evidence of non-use | Confidence | Proposal | Status |
| --- | --- | --- | --- | --- | --- |
| `colors.backgroundDisabled`, `backgroundDisabledFaded` | dead token | 0 usages in `uilibs/src` and `webapp/app` | high | use in the disabled recipe, else delete | open |
| `colors.backgroundElevationRaised` | dead token | 0 usages | high | delete | open |
| `colors.borderPositive`, `borderWarning` | dead token | 0 usages | medium | keep for the tone work (F-14), else delete | open |
| `shadow['outline-intense' / 'raised-intense' / 'overlay-intense']` | dead token | 0 usages | high | delete | open |
| `colors.backgroundPrimaryHighlighted`, `backgroundCriticalHighlighted` | unused but needed | 0 usages | high | start using (F-05) | open |
| Button story `argTypes.size` options | stale | names do not exist in `buttonSizes` | high | derive from `buttonSizes` | open |
| `#/styles/core/tokens.stylex` comments | stale | path does not exist | high | fix | open |
| `kanban` `@ts-ignore` and `console.warn` ×2 | legacy | reading | medium | remove or justify | open |
| `base/dropdown-menu` vs `context-menu` duplicate parts | duplication | F-22 | medium | share | open |

## Decisions log

None yet. The plan (`plan-00001-uilibs-improvement`) records its decisions with dates and rejected alternatives.

## Coverage and limitations

- Read in full: tokens, theme, hooks, Button, Input, Field, Form, Label, Select, Combobox, Autocomplete, NumberField, InputGroup, InputPassword, InputPhone, Textarea, OTP, Checkbox, Radio, Slider, ButtonGroup, Dialog, AlertDialog, Sheet, Toast, Popover, Tooltip, DropdownMenu, Tabs, ToggleGroup, Menubar, Toolbar, Pagination, Breadcrumb, Alert, Badge, Empty, Item, Avatar, Progress, Meter, FileUpload, Spinner, LoaderText, Command, UIProvider.
- Covered by axe sweep, grep matrix and measurement only: Accordion, Collapsible, ContextMenu (as a twin of DropdownMenu), Drawer, NavigationMenu, PreviewCard, ScrollArea, Separator, Switch (styles), Toggle, Card, Table, DescriptionList, Text, Icon, Kbd, Skeleton, Resizable, Calendar (props), Kanban, Sortable, DataGrid, icons, charts.
- Not exercised: screen readers, forced-colors mode, RTL, touch, browsers other than Chromium, light-and-dark visual diffs.
- The axe sweep checks each story at one viewport; open popups were not driven (popup content is mostly not in the swept DOM).
- Reproduction scripts live in `/tmp/audit/` (not committed): `measure.mjs`, `axe.mjs`, `contrast.mjs`, `contrast.py`, `roles.mjs`, `invalid.mjs`, `probe-ref.tsx`.

## Open questions

1. **Control border contrast (F-04).** Unclear: how firm the control edge may look — wrong pick means either a failing 1.4.11 or a visible identity change.
    1. Dedicated `borderControl` token at ≥3:1, used for control edges only [recommended: passes AA, leaves dividers soft]
    2. Raise `borderNeutral` and use it everywhere — simplest, but dividers and cards also get heavier
    3. Keep the faded border and accept the AA gap — no change, documented as a known gap
    4. Other — reply with the design you want
2. **Size scale (F-01).** Unclear: whether `xs` (28px) joins the shared control scale — wrong pick means Input `xs` either missing or a cramped target.
    1. `sm 32 / md 36 / lg 40` for every control, plus `xs 28` only for Button, Toggle, Tabs [recommended: dense toolbar controls stay small, text fields stay ≥32px]
    2. `xs 28 / sm 32 / md 36 / lg 40` for every control
    3. Other — reply with the design you want

## Change log

- 2026-11-20T02:54:53+07:00: status draft -> in_review. Report written after the baseline, the axe sweep (light and dark), the measurement, the contrast calculation and the ref probe.
