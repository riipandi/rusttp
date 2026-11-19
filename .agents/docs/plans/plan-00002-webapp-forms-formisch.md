---
status: awaiting-approval
created: 2026-11-20T06:26:00+07:00
updated: 2026-11-20T06:26:00+07:00
phases:
    - id: 1
      title: Port the schemas from zod to Valibot
      status: pending
      note: —
    - id: 2
      title: Move the form layer from TanStack Form to Formisch
      status: pending
      note: —
    - id: 3
      title: Pin the Formisch behavior with E2E
      status: pending
      note: —
    - id: 4
      title: Docs sync (human-facing)
      status: pending
      note: —
    - id: 5
      title: LLM docs sync (.agents/docs)
      status: pending
      note: —
    - id: 6
      title: Final validation
      status: pending
      note: —
    - id: 7
      title: Ledger close and handover
      status: pending
      note: —
---

# Move the webapp forms to Formisch and Valibot: the auth forms, their field components, and their schemas

## Objective

The owner chose Formisch with Valibot as the webapp form stack (2026-11-20) after a comparison against TanStack Form, zod, and Base UI's own Form. After this plan, the six auth forms validate with Valibot schemas through `@formisch/react`. The field components in `app/components/form-fields.tsx` read a Formisch field store and keep rendering through the `uilibs` Base UI `Field`, `Input`, `Checkbox`, and `OTPField`. `@tanstack/react-form`, `zod`, and the glue around them are gone. The plan does not touch `packages/uilibs` components, and it does not add server endpoints; the forms stay demos that navigate on a valid submit.

## Current state (verified in the tree, 2026-11-20)

- **Dependencies** — `packages/webapp/package.json:17` `"@tanstack/react-form": "^1.33.5"` and `:23` `"zod": "^4.6.7"`; no other package imports either (searched `packages/` and `apps/` for `from 'zod'` and `from '@tanstack/react-form'`, excluding `node_modules`). Latest on npm today: `@formisch/react` 1.2.0 (peers `react >=16.8 <20`, `valibot >=1.4.1 <2`, `typescript >=5 <8`, no runtime dependencies) and `valibot` 1.5.0.
- **The form hook** — `app/libraries/form.ts:19` builds `useAppForm` with `createFormHook` and five field components; `:28` `revalidateLogic()` (validate on submit, then on change); `:29-32` `onSubmitInvalid` focuses the first `form [aria-invalid="true"]` through `document.querySelector`; `:37-42` `submitWith` calls `preventDefault`, `stopPropagation`, then `form.handleSubmit()`. `app/libraries/form-context.ts` exists only to split `createFormHookContexts` from the hook.
- **The field components** — `app/components/form-fields.tsx`: `messageOf` (`:87`) turns a Standard Schema issue into a string; `useMessages` (`:96`) reads `field.state.meta.errors` and keeps the first; `TextField` (`:114`), `PasswordField` (`:142`), `CheckboxField` (`:180`), `CaptchaField` (`:199`), `CodeField` (`:223`) wire value and change by hand (`onCheckedChange` `:190`, `:211`; `onValueChange` `:247`) inside a `uilibs` `Field` with `invalid` and `FieldError`.
- **The schemas** — seven files in `app/schemas/`: `fields.schema.ts` (shared `email`, `newPassword`, `captcha`), `login`, `signup`, `forgot-password`, `reset-password` (a cross-field `.refine` on `confirm` at `:10`, and `resetSearchSchema` used by the router's `validateSearch` at `routes/(auth)/reset-password.tsx:16`), `mfa`, `device`.
- **The routes** — `routes/(auth)/{login,signup,forgot-password,reset-password,mfa,device}.tsx` each call `useAppForm({ ...formDefaults, defaultValues, validators: { onDynamic: schema }, onSubmit })` and render `<Form noValidate onSubmit={submitWith(form)}>` from `uilibs/base/form` with `<form.AppField name>` children.
- **Formisch's surface (read from `@formisch/react` 1.2.0 `dist/index.d.ts` and `dist/index.js`)** — `useForm({ schema, initialInput, validate, revalidate })` defaults to validate on submit, revalidate on input, which matches `revalidateLogic()`. `handleSubmit(form, handler)` returns `(event) => Promise<void>`, calls `event.preventDefault()`, and validates with `shouldFocus: true`, focusing the first field with errors through the element its `field.props.ref` registered. `FieldStore` exposes `input`, `errors: [string, ...string[]] | null`, `isTouched`, `isDirty`, `isEdited`, `isValid`, `onChange(value)`, and `props: { name, autoFocus, ref, onFocus, onChange, onBlur }`. Formisch's own `Form` renders a plain `<form>` whose props omit `noValidate` and take no StyleX style.
- **Base UI integration** — Formisch's Base UI guide (formisch.dev/react/guides/base-ui) uses no adapter: `invalid={field.errors !== null}` on `Field.Root`, `Field.Error match`, `field.props` spread on native inputs, and manual `field.input` + `field.onChange` plus the hidden input's ref for Checkbox, Select, and RadioGroup. Base UI 1.9.0's `CheckboxRoot` takes `inputRef` (`CheckboxRoot.d.ts:92`); `OTPFieldRoot` has no `inputRef`, but each `OTPFieldSlot` renders an `<input>` and takes `ref` (`packages/uilibs/src/base/otp-field/otp-field.component.tsx:103-128`).
- **E2E coverage** — `packages/e2e/screens/auth/auth.spec.ts` (117 lines) asserts the per-field messages and the focus on the first invalid field (`:50-61`), a message clearing once fixed (`:63-71`), the signup password length (`:73-82`), the reset link without a token (`:84`), the forgot → reset flow (`:94`), the password mismatch (`:102-109`), and a wrong-length code (`:111-116`). Projects: Chromium, Firefox, Mobile Safari, Safari (`playwright.config.ts:26-30`).
- **Docs that name the stack** — `.agents/docs/shape.md:16` ("forms are TanStack Form with zod schemas … `useAppForm` in `app/libraries/form.ts` … before zod runs"); `packages/uilibs/.storybook/stories/introduction.mdx:31` lists `@tanstack/react-form` among the library's install commands although `packages/uilibs/package.json` does not depend on it. `docs/` names neither (searched for `zod` and `react-form`).

## Decisions

- **D1 (2026-11-20, owner): Formisch with Valibot replaces TanStack Form with zod.** The schema becomes the single source of the form's types, rules, and shape. `field.errors` arrives as strings, and `handleSubmit` focuses the first invalid field, so `messageOf`, `useMessages`'s issue mapping, `onSubmitInvalid`, `submitWith`, and `form-context.ts` go. The cost: the form layer depends on Valibot only (no Standard Schema choice), and on a library that reached v1 on 2026-08-20. Rejected: TanStack Form with Valibot — keeps every piece of glue and gains nothing toward Base UI. Rejected: Base UI `Form` alone with `safeParse` in `onFormSubmit` — the submitted values are `Record<string, any>`, and every rule is run by hand.
- **D2 (2026-11-20, owner): no backward compatibility, no legacy code.** The project is early stage. No shim keeps `useAppForm` or the zod schemas alive; they are deleted in the phase that replaces them.
- **D3 (2026-11-20): the forms keep the `uilibs` `Form`, submitted through Formisch's `handleSubmit`.** `<Form noValidate style={styles.form} onSubmit={handleSubmit(form, onValid)}>` keeps the StyleX style prop and the Base UI Form around the Base UI Fields. Rejected: Formisch's `Form` — a plain `<form>` with no `style` for StyleX and no Base UI Form context. The `stopPropagation` in `submitWith` goes: no form in the webapp is nested, and phase 2 confirms Base UI's `Form` does not resubmit without it.
- **D4 (2026-11-20): a field component takes the field store, rendered by Formisch's `Field`.** A route writes `<Field of={form} path={['email']}>{(field) => <TextField field={field} label='Email address' />}</Field>`. Each component types `field` by the value it handles (`FieldStore`-shaped: `input`, `errors`, `props`, `onChange` over `string` or `boolean`), so a path to the wrong type fails the typecheck. This mirrors today's `<form.AppField name>{(field) => <field.TextField />}</form.AppField>`, so the route diff stays mechanical. Rejected: `of` + `path` props with `useField` inside each component — Formisch's path generics do not let a component demand that the path's value be a string without a cast. Fallback if the structural type does not accept Formisch's `FieldStore` under `tsrs`: type the prop as `FieldStore<FormSchema, RequiredPath>` and narrow `input` at the one read, recorded in the phase note.
- **D5 (2026-11-20): wiring per control.** Text and password: spread `field.props` on the `uilibs` `Input` / `InputPassword` with `value={field.input}`; `PasswordField` wraps `onBlur` to clear the Caps Lock warning. Checkbox and captcha: `checked={field.input}`, `onCheckedChange={field.onChange}`, `inputRef={field.props.ref}`, plus `name`, `onFocus`, `onBlur`. Code: `value={field.input}`, `onValueChange={field.onChange}`, `name` on the root, `field.props.ref` on the first slot so a failed submit focuses it. Errors: `invalid={field.errors !== null}` on `Field`; `FieldError` shows `field.errors[0]`, one message at a time as now.
- **D6 (2026-11-20): validation timing stays as it is.** Formisch's default (validate on submit, revalidate on input) is today's behavior, so `useForm` takes only `schema` and `initialInput`. Nothing replaces `formDefaults`.
- **D7 (2026-11-20): Valibot first, on TanStack Form, in its own commit.** TanStack Form accepts any Standard Schema, and Valibot 1.x is one, so phase 1 ports the schemas and drops zod while the form layer stays put; the E2E suite proves the messages did not move before the form library changes. Rejected: one combined commit — a broken message would not say which change broke it.
- **D8 (2026-11-20): dependency versions.** `valibot` `^1.5.0` and `@formisch/react` `^1.2.0` go in `packages/webapp/package.json`, the `^` range the package already uses; they are not in the pnpm catalog because no other package needs them. The owner's go-ahead on 2026-11-20 ("refactor ke Valibot + Formisch") is the approval `AGENTS.md` requires.

## Shape and enforcement points

| What | Where | The record |
| --- | --- | --- |
| The form stack and its wiring | `shape.md`, the `webapp` paragraph (`:16`) | Formisch + Valibot, `<Field of path>` + field-store components, `handleSubmit` on the `uilibs` `Form`, focus on the first invalid field by Formisch |
| The contract for a new form field | `rules.md`, a "Webapp forms" subsection under Contracts | A field component takes a field store, registers `field.props.ref` on a focusable element, shows `errors[0]`, and never runs its own validation (no Base UI `validate`) |
| The reasoning | `architecture.md`, a decision record | D1, D3, D4 with the rejected alternatives |
| The Storybook install list | `packages/uilibs/.storybook/stories/introduction.mdx:31` | `@tanstack/react-form` removed: the library never imported it |
| The map | `index.md` | The plan row, then the archive and handover rows |

## Execution rules

- **A phase runs only on the owner's explicit go-ahead** ("lanjut fase N" or equivalent). The owner authorized an atomic commit per phase for this plan's whole working session (2026-11-20): each phase commits with the message its heading names once its validation is green. After the last phase, the agent stops and recommends the closing commit message with its paths instead of committing it.
- **No backward compatibility** (D2): replaced code is deleted in the phase that replaces it.
- **Dependencies:** only `valibot` and `@formisch/react` are added (D8); `zod` and `@tanstack/react-form` are removed with `pnpm --filter webapp remove`. Nothing else is added.
- **Stage explicit paths only**; never `git add -A`, `git stash`, `git checkout .`, `git reset --hard`, `--no-verify`, or a push.
- **Per-phase validation runs before each phase's commit.** A red gate stops the phase; the uncommitted work stays in the tree and the agent reports to the owner.
- **E2E is relevant here** (the forms' observable behavior is what changes) and runs in phases 1, 2, 3, and 6.

## Phases

1. **Port the schemas from zod to Valibot** — `pnpm --filter webapp add valibot@^1.5.0`; rewrite the seven files in `app/schemas/` with the same messages. Mappings: `z.string().trim().min(1, m).pipe(z.email(m2))` becomes `v.pipe(v.string(), v.trim(), v.nonEmpty(m), v.email(m2))`. The captcha `refine` becomes `v.pipe(v.boolean(), v.check((checked) => checked, m))`. The reset `refine` becomes `v.forward(v.partialCheck([['password'], ['confirm']], …, m), ['confirm'])`. `regex` becomes `v.regex`. `resetSearchSchema` stays a Standard Schema for `validateSearch`. Before editing, record the baseline: `pnpm --filter webapp build` and note the auth route chunk sizes and the entry chunk size. Then `pnpm --filter webapp remove zod`. Validation: `pnpm --filter webapp typecheck`, `pnpm lint`, `pnpm format:check`; `grep -rn "zod" packages/webapp/app packages/webapp/package.json` is empty; `just e2e-test --project Chromium` green (every message and the reset mismatch on `confirm` unchanged). _Commit: `refactor(webapp): port the form schemas from zod to Valibot`._
2. **Move the form layer from TanStack Form to Formisch** — `pnpm --filter webapp add @formisch/react@^1.2.0`. Rewrite `app/components/form-fields.tsx` per D4 and D5, and drop `messageOf` and `useMessages`. Convert the six routes to `useForm({ schema, initialInput })`, `<Field of path>`, and `<Form noValidate style onSubmit={handleSubmit(form, onValid)}>`. Delete `app/libraries/form.ts` and `app/libraries/form-context.ts`. Run `pnpm --filter webapp remove @tanstack/react-form`. Order inside the phase: convert login first and check by hand, before touching the other five. The checks are focus on the first invalid field, the captcha's `inputRef` focus, one submit per click with `stopPropagation` gone, and a message clearing on input. If one fails, stop and report; that is the riskiest step, and the undo is to leave it uncommitted for the owner. Validation: the phase 1 gates; `grep -rnE "@tanstack/react-form|useAppForm|submitWith|formDefaults" packages/webapp` is empty; `just e2e-test --project Chromium` green; `pnpm --filter webapp build` and compare chunk sizes against the phase 1 baseline (recorded in the note). _Commit: `refactor(webapp): move the auth forms from TanStack Form to Formisch`._
3. **Pin the Formisch behavior with E2E** — add to `packages/e2e/screens/auth/auth.spec.ts` (and its screen object if a locator is missing). First, sign-in with a valid email and an empty password focuses the password, which proves the focus follows the first invalid field and not the first field. Second, an empty two-factor submit focuses the first code slot (the ref on the OTP slot). Third, an unchecked captcha on its own focuses the captcha checkbox (the `inputRef`). Sample data stays Dan Brown / Harry Potter. Validation: `just e2e-test --project Chromium` green with the new tests counted; each new test fails when its ref is removed (checked once by hand, not committed). _Commit: `test(e2e): pin the focus on the first invalid field of the auth forms`._
4. **Docs sync (human-facing)** — remove `@tanstack/react-form` from `packages/uilibs/.storybook/stories/introduction.mdx:31`; re-check `docs/` with `grep -rniE "zod|tanstack form|react-form|valibot|formisch" docs` (expected empty; any hit is rewritten in the `docs/` tone). Validation: the grep result recorded in the note; `pnpm --filter uilibs storybook:build` succeeds (the MDX still compiles). _Commit: `docs(uilibs): drop TanStack Form from the Storybook install list`._
5. **LLM docs sync (`.agents/docs`)** — rewrite the forms sentence in `shape.md:16` (Formisch + Valibot, `<Field of path>` with field-store components, `handleSubmit` on the `uilibs` `Form`, focus by Formisch, email by `inputMode` because native validity would block the submit before Valibot runs). Add the "Webapp forms" contract to `rules.md` (D4, D5, no Base UI `validate`, one message at a time). Add the decision record to `architecture.md` (D1, D3, D4, the rejected alternatives, the Valibot-only cost). Check `AGENTS.md` and `ui-components.md` for a stale mention, then update the `index.md` plan row and `updated`. Validation: `grep -rnE "zod|TanStack Form|useAppForm|form-context" AGENTS.md .agents/docs --exclude-dir=archive` returns only the decision record's history lines; every path the new prose names exists. _Commit: `docs: record the Formisch and Valibot form layer in the agent docs`._
6. **Final validation** — the test matrix below over the tree as it stands. Validation: every row green or recorded n/a with its reason; the results go in this phase's note. _Commit: none if green; a fix found here commits as `fix(webapp): <what>` and the matrix reruns._
7. **Ledger close and handover** — set the phase and plan statuses with hashes, move the plan to `.agents/docs/archive/`, move the index rows, and write `.agents/docs/handover/handover-00004-webapp-forms-formisch.md` with what landed, the commits, the measured bundle delta, what was not checked, and the traps found. Archive the oldest handover if more than five are live. Validation: `grep -rn "plan-00002" .agents/docs` resolves to the archived path; the index statuses match the files. _Commit: none. Recommend `docs: close the Formisch form plan and hand it over` with its paths._

## Test matrix

| What | How | Green |
| --- | --- | --- |
| Typecheck | `pnpm --filter webapp typecheck` (route tree + `tsrs --noEmit --fast`) | 0 errors |
| Lint | `pnpm lint` (oxlint on `packages/`, type-aware) | 0 errors, 0 new warnings |
| Format | `pnpm format:check` and `rumdl fmt --check .agents/docs` | clean |
| Build | `pnpm --filter webapp build` | succeeds; auth chunk and entry sizes recorded against the phase 1 baseline |
| Stale imports | `grep -rnE "from '(zod\|@tanstack/react-form)'\|useAppForm\|submitWith" packages` (excluding `node_modules`) | empty |
| Dependencies | `packages/webapp/package.json` and `pnpm-lock.yaml` | `valibot` and `@formisch/react` present; `zod` and `@tanstack/react-form` absent from `webapp` |
| E2E | `just e2e-test --project Chromium`, then `--project Firefox`, `--project Safari`, `--project "Mobile Safari"` | Chromium required green (existing auth tests + phase 3's three); the other projects run and any failure is reported with its output, or recorded n/a if the browser is not installed |
| UI library | `pnpm --filter uilibs test` | n/a unless a phase touched `packages/uilibs/src`; then 433+ stories green |
| Storybook build | `pnpm --filter uilibs storybook:build` | succeeds (phase 4 touched its MDX) |
| Composition root | the built SPA served by the Rust server (`just e2e-test` builds it and starts `rusttp-server` on `127.0.0.1:3000`) | the auth pages render and submit through the server, covered by the E2E row |
| Rust gates | `cargo clippy`, `cargo nextest` | n/a: no Rust file changes |

## Explicitly out of scope

- **`packages/uilibs` components** — the field components live in the webapp; if a `uilibs` control turns out not to pass `inputRef` or `ref` through, that is a `uilibs` fix with its own story and a11y gate, raised to the owner rather than folded in here.
- **Server-side validation and real endpoints** — the forms stay demos; sharing the Valibot schemas with a backend contract waits until an auth endpoint exists.
- **A form-level error banner** (`form.errors` from a thrown `onSubmit`) — no submit can fail without a backend; it lands with the first real endpoint.
- **Field arrays, async validation, debounced checks** — no current form needs them.
- **Firefox and Safari fixes unrelated to forms** — a failure there that predates this plan is filed as an issue, not fixed here.
