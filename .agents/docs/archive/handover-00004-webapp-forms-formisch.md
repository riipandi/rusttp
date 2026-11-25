---
status: done
created: 2026-11-20T06:39:00+07:00
plan: plan-00002-webapp-forms-formisch
wave: —
---

# Handover: Plan 00002 closed, webapp forms on Formisch and Valibot

## What this session did

The owner compared TanStack Form, zod, Valibot, and Formisch for the webapp, chose Formisch with Valibot, and asked for a complete removal of zod and TanStack Form with no compatibility layer (`plan-00002-webapp-forms-formisch`, D9). All seven phases ran with one commit each. The six auth forms now use `useForm({ schema, initialInput })`, `<Field of path>` with field-store components in `app/components/form-fields.tsx`, and `handleSubmit` on the `uilibs` `<Form noValidate>`. `app/libraries/form.ts` and `form-context.ts` are deleted. `rules.md` ("Webapp forms"), `architecture.md` ("Webapp forms are Formisch and Valibot"), and `shape.md` carry the contract, the record, and the layout.

Ledger moves: the plan is `done` and archived with its index row; this is the fourth handover.

## Commits

- `docs: plan the move of the webapp forms to Formisch and Valibot` — `f55ba8e`.
- `refactor(webapp): port the form schemas from zod to Valibot` — `b7dc7ff`.
- `docs: amend the Formisch plan with the complete-removal bar` — `6944c06`.
- `chore(webapp): add @formisch/react` — `0c15a90`.
- `refactor(webapp): move the auth forms from TanStack Form to Formisch` — `6646fa6`.
- `test(e2e): pin the focus on the first invalid field of the auth forms` — `3831b9c`.
- `docs(uilibs): drop TanStack Form from the Storybook install list` — `dd29b60`.
- `docs: record the Formisch and Valibot form layer in the agent docs` — `d8d6279`.

## What stayed open / the trap

- Not run: Firefox, Safari, and Mobile Safari E2E (the browsers are not installed; Chromium is 23 of 23), and a visual check of the auth pages after the move. The built SPA carries no zod; the main chunk grew 3.77 kB and the form chunk fell from 104.43 kB to 48.91 kB (vite's minified sizes, not gzip).
- zod stays in `pnpm-lock.yaml` only under `@tanstack/router-generator` (route-tree generation at build time); removing it would mean dropping file-based routing.
- Traps: Formisch's `field.props.name` is the JSON of the path (`["password"]`), so it is never an `id` (use `useId`) and tests find fields by label. The one-argument `handleSubmit` overload takes no event, so the routes call `preventDefault` themselves. Base UI's `Form` also focuses the first invalid control, so the focus tests do not prove the registered refs. After `pnpm remove`, Storybook's build failed on a missing `tslib`; `pnpm install --frozen-lockfile --force` relinked it.
- Formisch has no `canSubmit`, no debounce option, and no `createFormHook`; a form-level error banner waits for the first real endpoint.
